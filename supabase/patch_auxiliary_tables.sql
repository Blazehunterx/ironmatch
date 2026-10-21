-- ============================================================================
-- 🛠️ IRONMATCH AUXILIARY & SOCIAL TABLES COMPATIBILITY PATCH
-- ============================================================================

-- 1. Profiles Table Adjustments
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT DEFAULT '';
ALTER TABLE public.profiles ALTER COLUMN display_name DROP NOT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS friends UUID[] NOT NULL DEFAULT '{}';

-- 2. Duels Table Schema Enhancements
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'weight';
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS challenger_progress REAL DEFAULT 0.0;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS opponent_progress REAL DEFAULT 0.0;
ALTER TABLE public.duels ADD COLUMN IF NOT EXISTS xp_reward INTEGER DEFAULT 150;
ALTER TABLE public.duels ALTER COLUMN target_value TYPE TEXT USING target_value::text;

-- 3. Friend Requests Table
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(sender_id, receiver_id)
);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id, status);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Users can insert own friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Participants can update friend requests" ON public.friend_requests;
DROP POLICY IF EXISTS "Participants can delete friend requests" ON public.friend_requests;
CREATE POLICY "Users can view own friend requests" ON public.friend_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can insert own friend requests" ON public.friend_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Participants can update friend requests" ON public.friend_requests FOR UPDATE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "Participants can delete friend requests" ON public.friend_requests FOR DELETE USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- 4. Gym Shoutbox Messages Table
CREATE TABLE IF NOT EXISTS public.gym_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id TEXT NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_avatar TEXT DEFAULT '',
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_messages_gym ON public.gym_messages(gym_id, created_at DESC);

ALTER TABLE public.gym_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gym messages viewable by everyone" ON public.gym_messages;
DROP POLICY IF EXISTS "Users can insert gym messages" ON public.gym_messages;
CREATE POLICY "Gym messages viewable by everyone" ON public.gym_messages FOR SELECT USING (true);
CREATE POLICY "Users can insert gym messages" ON public.gym_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Matches Table (Workout Buddy & Sparring Requests)
CREATE TABLE IF NOT EXISTS public.matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending',
    message TEXT DEFAULT 'Wants to hit a workout together!',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_matches_recipient ON public.matches(recipient_id, status);
CREATE INDEX IF NOT EXISTS idx_matches_requester ON public.matches(requester_id, status);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Matches viewable by participants" ON public.matches;
DROP POLICY IF EXISTS "Requester can insert match" ON public.matches;
DROP POLICY IF EXISTS "Participants can update match" ON public.matches;
CREATE POLICY "Matches viewable by participants" ON public.matches FOR SELECT USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
CREATE POLICY "Requester can insert match" ON public.matches FOR INSERT WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Participants can update match" ON public.matches FOR UPDATE USING (auth.uid() = requester_id OR auth.uid() = recipient_id);
