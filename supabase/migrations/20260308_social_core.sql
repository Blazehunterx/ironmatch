-- ═══ MASTER MIGRATION: SOCIAL REVOLUTION ENGINE ═══
-- Date: 2026-03-08
-- Description: Consolidates Follows, Friend Requests, Spots, and Profile enhancements.

-- 1. PROFILES ENHANCEMENTS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founding_trainer BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'General Fitness';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_gym_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;

-- 2. POSTS ENHANCEMENTS
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS spots_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image'; -- 'image' or 'video'

-- 3. FOLLOWS TABLE (Core)
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Index for feed performance
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- 4. FRIEND REQUESTS TABLE (Buddies)
CREATE TABLE IF NOT EXISTS public.friend_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(sender_id, receiver_id)
);

-- 5. SPOTS TABLE (Likes/Validation)
CREATE TABLE IF NOT EXISTS public.spots (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- 6. SECURITY (RLS)
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spots ENABLE ROW LEVEL SECURITY;

-- Follows Policies
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own follows" ON public.follows;
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- Friend Requests Policies
DROP POLICY IF EXISTS "Friend requests are viewable by participants" ON public.friend_requests;
CREATE POLICY "Friend requests are viewable by participants" ON public.friend_requests 
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
DROP POLICY IF EXISTS "Users can manage own friend requests" ON public.friend_requests;
CREATE POLICY "Users can manage own friend requests" ON public.friend_requests 
    FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Spots Policies
DROP POLICY IF EXISTS "Spots are viewable by everyone" ON public.spots;
CREATE POLICY "Spots are viewable by everyone" ON public.spots FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can toggle own spots" ON public.spots;
CREATE POLICY "Users can toggle own spots" ON public.spots FOR ALL USING (auth.uid() = user_id);

-- 7. TRIGGERS (Auto-counters)
-- Function to update follow counts
CREATE OR REPLACE FUNCTION public.handle_follow_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
        UPDATE public.profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_stat_change ON public.follows;
CREATE TRIGGER on_follow_stat_change
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.handle_follow_stats();

-- Function to update post spot counts
CREATE OR REPLACE FUNCTION public.handle_post_spot_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.posts SET spots_count = spots_count + 1 WHERE id = NEW.post_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.posts SET spots_count = spots_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_spot_stat_change ON public.spots;
CREATE TRIGGER on_spot_stat_change
    AFTER INSERT OR DELETE ON public.spots
    FOR EACH ROW EXECUTE FUNCTION public.handle_post_spot_stats();
