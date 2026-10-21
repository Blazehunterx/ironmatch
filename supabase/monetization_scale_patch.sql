-- ============================================================================
-- 💰 IRONMATCH MONETIZATION & 1M-USER SCALE ARCHITECTURE PATCH
-- ============================================================================

-- 1. PRO TIERS & SUBSCRIPTIONS ON PROFILES
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_pro BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_tier TEXT DEFAULT 'free'; -- 'free', 'pro_monthly', 'pro_annual', 'lifetime'
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_expires_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pending_balance REAL NOT NULL DEFAULT 0.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS revolut_tag TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payout_iban TEXT DEFAULT '';

-- 2. PURCHASES & ENTITLEMENTS LEDGER
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    item_name TEXT NOT NULL,
    item_type TEXT NOT NULL, -- 'plan', 'subscription', 'cosmetic'
    price_usd REAL NOT NULL DEFAULT 0.0,
    payment_method TEXT NOT NULL DEFAULT 'card', -- 'card', 'xp', 'google_play', 'apple_pay'
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    trainer_cut_usd REAL NOT NULL DEFAULT 0.0,
    platform_fee_usd REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Scale Indexes for 1,000,000 Lifters
CREATE INDEX IF NOT EXISTS idx_purchases_user ON public.purchases(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchases_trainer ON public.purchases(trainer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_gym_feed ON public.posts(gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, created_at DESC);

-- Row-Level Security for Purchases
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Users can insert own purchases" ON public.purchases;
CREATE POLICY "Users can view own purchases" ON public.purchases FOR SELECT USING (auth.uid() = user_id OR auth.uid() = trainer_id);
CREATE POLICY "Users can insert own purchases" ON public.purchases FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Automatic Trainer Payout Split Trigger (80% Trainer / 20% Platform)
CREATE OR REPLACE FUNCTION public.sync_purchase_payout()
RETURNS TRIGGER AS $$
BEGIN
    -- If purchase has a trainer, credit 80% to trainer's pending balance
    IF NEW.trainer_id IS NOT NULL AND NEW.trainer_cut_usd > 0 THEN
        UPDATE public.profiles
        SET pending_balance = pending_balance + NEW.trainer_cut_usd
        WHERE id = NEW.trainer_id;
    END IF;

    -- If purchase is a Pro Subscription or Lifetime Founding Pass, activate is_pro on buyer's profile
    IF NEW.item_type IN ('subscription', 'lifetime') THEN
        UPDATE public.profiles
        SET is_pro = true,
            pro_tier = NEW.item_id,
            pro_expires_at = CASE 
                WHEN NEW.item_id = 'lifetime' THEN now() + interval '100 years'
                WHEN NEW.item_id = 'pro_annual' THEN now() + interval '365 days'
                ELSE now() + interval '30 days'
            END
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_purchase_payout ON public.purchases;
CREATE TRIGGER tr_sync_purchase_payout
    AFTER INSERT ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.sync_purchase_payout();

-- 3. CHAT & MESSAGING SCHEMA REPAIR
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages ALTER COLUMN conversation_id DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_direct ON public.messages(sender_id, receiver_id, created_at DESC);
