-- ============================================================================
-- 🏛️ IRONMATCH FINAL COMPLETE SCHEMA COMPATIBILITY PATCH
-- Creates all remaining application tables: stories, comments, gym_milestones,
-- group_sessions, session_participants
-- ============================================================================

-- 1. STORIES TABLE (Ephemeral 24h stories)
CREATE TABLE IF NOT EXISTS public.stories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL,
    media_url TEXT NOT NULL,
    media_type TEXT NOT NULL DEFAULT 'image',
    content TEXT DEFAULT '',
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT stories_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_author ON public.stories(author_id);

ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Stories are viewable by everyone" ON public.stories;
DROP POLICY IF EXISTS "Users can insert own stories" ON public.stories;
CREATE POLICY "Stories are viewable by everyone" ON public.stories FOR SELECT USING (true);
CREATE POLICY "Users can insert own stories" ON public.stories FOR INSERT WITH CHECK (auth.uid() = author_id);

-- 2. COMMENTS TABLE (Direct PostDetail.tsx comments alias & storage)
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id, created_at ASC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to increment comments_count on posts when comments table is inserted
CREATE OR REPLACE FUNCTION public.sync_comments_alias_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_comments_alias ON public.comments;
CREATE TRIGGER tr_sync_comments_alias
    AFTER INSERT OR DELETE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.sync_comments_alias_count();

-- 3. GYM MILESTONES TABLE (Gym collective volume / quest ledger)
CREATE TABLE IF NOT EXISTS public.gym_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id TEXT NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    target_value REAL NOT NULL DEFAULT 1000.0,
    current_value REAL NOT NULL DEFAULT 0.0,
    unit TEXT NOT NULL DEFAULT 'kg',
    deadline TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
    type TEXT NOT NULL DEFAULT 'volume',
    reward_badge TEXT DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gym_milestones_gym ON public.gym_milestones(gym_id);

ALTER TABLE public.gym_milestones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gym milestones are viewable by everyone" ON public.gym_milestones;
CREATE POLICY "Gym milestones are viewable by everyone" ON public.gym_milestones FOR SELECT USING (true);

-- 4. GROUP SESSIONS & PARTICIPANTS (Live group trainer workouts)
CREATE TABLE IF NOT EXISTS public.group_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id TEXT REFERENCES public.gyms(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    workout_plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active',
    join_code TEXT NOT NULL DEFAULT upper(substring(md5(random()::text) from 1 for 6)),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_group_sessions_code ON public.group_sessions(join_code);

ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Group sessions viewable by everyone" ON public.group_sessions;
DROP POLICY IF EXISTS "Trainers can manage group sessions" ON public.group_sessions;
CREATE POLICY "Group sessions viewable by everyone" ON public.group_sessions FOR SELECT USING (true);
CREATE POLICY "Trainers can manage group sessions" ON public.group_sessions FOR ALL USING (auth.uid() = trainer_id);

CREATE TABLE IF NOT EXISTS public.session_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.group_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(session_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_session_participants_session ON public.session_participants(session_id);

ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Session participants viewable by everyone" ON public.session_participants;
DROP POLICY IF EXISTS "Users can join sessions" ON public.session_participants;
CREATE POLICY "Session participants viewable by everyone" ON public.session_participants FOR SELECT USING (true);
CREATE POLICY "Users can join sessions" ON public.session_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
