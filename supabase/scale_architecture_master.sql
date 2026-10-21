-- ============================================================================
-- 🏛️ IRONMATCH SCALE ARCHITECTURE MASTER (POSTGRESQL / SUPABASE)
-- Designed for 1,000,000+ Lifters & Social Fitness Scalability
-- Compatible with fresh Supabase projects & starter template databases
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 2. GYMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.gyms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT 'Gym',
    location TEXT DEFAULT 'Nearby',
    lat REAL NOT NULL DEFAULT 0.0,
    lng REAL NOT NULL DEFAULT 0.0,
    member_count INTEGER NOT NULL DEFAULT 0,
    war_score REAL NOT NULL DEFAULT 0.0,
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_verified_gym BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS lat REAL NOT NULL DEFAULT 0.0;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS lng REAL NOT NULL DEFAULT 0.0;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS member_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS war_score REAL NOT NULL DEFAULT 0.0;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.gyms ADD COLUMN IF NOT EXISTS is_verified_gym BOOLEAN NOT NULL DEFAULT false;

-- ============================================================================
-- 3. PROFILES TABLE (Guaranteed Columns whether table pre-existed or not)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Ensure all IronMatch columns exist on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_level TEXT NOT NULL DEFAULT 'Beginner';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank_tier TEXT NOT NULL DEFAULT 'Bronze';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS training_status TEXT NOT NULL DEFAULT 'Unranked';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_gym TEXT REFERENCES public.gyms(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_gym_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_trainer BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founding_trainer BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'none';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight_kg REAL DEFAULT 75.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height_cm REAL DEFAULT 175.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unit_preference TEXT NOT NULL DEFAULT 'kg';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'General Fitness';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reliability_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS relative_strength_score REAL NOT NULL DEFAULT 0.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS big4 JSONB NOT NULL DEFAULT '{"bench": 0, "squat": 0, "deadlift": 0, "ohp": 0}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS goals TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sub_goals TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS availability JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS unlocked_cosmetics TEXT[] DEFAULT '{}';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_cosmetic_frame TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_cosmetic_color TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS active_graph_skin TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS followers_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS following_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS workouts_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS trainer_license_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Auto-provision Profile on Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, username)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        LOWER(COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1) || '_' || substr(NEW.id::text, 1, 4)))
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        name = CASE WHEN profiles.name = '' THEN EXCLUDED.name ELSE profiles.name END;
    RETURN NEW;
EXCEPTION WHEN others THEN
    RAISE LOG 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 4. SOCIAL GRAPH (Followers & Activity Syndicate)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Counter Cache Trigger for Follows
CREATE OR REPLACE FUNCTION public.sync_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
        UPDATE public.profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.profiles SET following_count = GREATEST(0, following_count - 1) WHERE id = OLD.follower_id;
        UPDATE public.profiles SET followers_count = GREATEST(0, followers_count - 1) WHERE id = OLD.following_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_follow_counts ON public.follows;
CREATE TRIGGER tr_sync_follow_counts
    AFTER INSERT OR DELETE ON public.follows
    FOR EACH ROW EXECUTE FUNCTION public.sync_follow_counts();

-- ============================================================================
-- 5. POSTS, PROOFS, & FEED (Denormalized Counter Caches)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id TEXT REFERENCES public.gyms(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    media_url TEXT,
    media_type TEXT DEFAULT 'image',
    workout_proof JSONB DEFAULT NULL,
    likes_count INTEGER NOT NULL DEFAULT 0,
    comments_count INTEGER NOT NULL DEFAULT 0,
    is_story BOOLEAN NOT NULL DEFAULT false,
    story_expires_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS comments_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_story BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS story_expires_at TIMESTAMPTZ DEFAULT NULL;

-- Post Likes
CREATE TABLE IF NOT EXISTS public.post_likes (
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

-- Likes Counter Cache Trigger
CREATE OR REPLACE FUNCTION public.sync_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.posts SET likes_count = GREATEST(0, likes_count - 1) WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_post_likes ON public.post_likes;
CREATE TRIGGER tr_sync_post_likes
    AFTER INSERT OR DELETE ON public.post_likes
    FOR EACH ROW EXECUTE FUNCTION public.sync_post_likes_count();

-- Post Comments
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments Counter Cache Trigger
CREATE OR REPLACE FUNCTION public.sync_post_comments_count()
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

DROP TRIGGER IF EXISTS tr_sync_post_comments ON public.post_comments;
CREATE TRIGGER tr_sync_post_comments
    AFTER INSERT OR DELETE ON public.post_comments
    FOR EACH ROW EXECUTE FUNCTION public.sync_post_comments_count();

-- ============================================================================
-- 6. WORKOUT PLANS, LOGS, & AUTOMATED LIFT HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    shared BOOLEAN NOT NULL DEFAULT false,
    is_premium BOOLEAN NOT NULL DEFAULT false,
    price_display TEXT DEFAULT '$14.99',
    intensity TEXT DEFAULT 'Intermediate',
    description TEXT DEFAULT '',
    image_url TEXT DEFAULT '',
    sales_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_min INTEGER DEFAULT 0,
    total_volume REAL DEFAULT 0,
    gym_id TEXT REFERENCES public.gyms(id) ON DELETE SET NULL,
    geofenced BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lift_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    estimated_1rm REAL NOT NULL,
    log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-Sync Workout Log to Lift History & Update Lifter Stats
CREATE OR REPLACE FUNCTION public.sync_workout_completion()
RETURNS TRIGGER AS $$
DECLARE
    ex_record RECORD;
    best_set RECORD;
    e1rm_val REAL;
BEGIN
    -- Increment user workout count and XP
    UPDATE public.profiles
    SET workouts_count = workouts_count + 1,
        xp = xp + 150
    WHERE id = NEW.user_id;

    -- Extract personal records for each exercise
    IF NEW.exercises IS NOT NULL THEN
        FOR ex_record IN SELECT * FROM jsonb_to_recordset(NEW.exercises) AS x(name TEXT, sets JSONB, weight REAL, reps INTEGER) LOOP
            IF ex_record.sets IS NOT NULL THEN
                SELECT * INTO best_set FROM jsonb_to_recordset(ex_record.sets) AS s(weight REAL, reps INTEGER, completed BOOLEAN)
                ORDER BY (COALESCE(s.weight, 0) * (1 + COALESCE(s.reps, 1) / 30.0)) DESC LIMIT 1;
                
                IF best_set IS NOT NULL AND best_set.weight > 0 THEN
                    e1rm_val := ROUND((best_set.weight * (1 + best_set.reps / 30.0))::numeric, 1);
                    INSERT INTO public.lift_history (user_id, exercise_name, weight, reps, estimated_1rm, log_id, created_at)
                    VALUES (NEW.user_id, ex_record.name, best_set.weight, best_set.reps, e1rm_val, NEW.id, NEW.created_at);
                END IF;
            ELSIF ex_record.weight IS NOT NULL AND ex_record.weight > 0 THEN
                e1rm_val := ROUND((ex_record.weight * (1 + COALESCE(ex_record.reps, 1) / 30.0))::numeric, 1);
                INSERT INTO public.lift_history (user_id, exercise_name, weight, reps, estimated_1rm, log_id, created_at)
                VALUES (NEW.user_id, ex_record.name, ex_record.weight, COALESCE(ex_record.reps, 1), e1rm_val, NEW.id, NEW.created_at);
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_workout_completion ON public.workout_logs;
CREATE TRIGGER tr_sync_workout_completion
    AFTER INSERT ON public.workout_logs
    FOR EACH ROW EXECUTE FUNCTION public.sync_workout_completion();

-- ============================================================================
-- 7. ARENA (DUELS, GYM WARS, & ACTIVITY LEDGER)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.duels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opponent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    target_value REAL NOT NULL,
    target_unit TEXT NOT NULL DEFAULT 'kg',
    challenger_score REAL DEFAULT NULL,
    opponent_score REAL DEFAULT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    winner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '48 hours'),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.gym_wars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_1_id TEXT NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    gym_2_id TEXT NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    gym_1_score REAL NOT NULL DEFAULT 0.0,
    gym_2_score REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'pending',
    start_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_date TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '7 days'),
    winner_id TEXT REFERENCES public.gyms(id) ON DELETE SET NULL,
    battle_type TEXT NOT NULL DEFAULT 'volume',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id TEXT NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    value REAL NOT NULL DEFAULT 0.0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 8. MESSAGING & NOTIFICATIONS (Real-Time Communication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id TEXT NOT NULL,
    sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_voice BOOLEAN NOT NULL DEFAULT false,
    read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type TEXT DEFAULT 'android',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, token)
);

-- ============================================================================
-- 9. PERFORMANCE INDEXES (FOR 1M+ USERS SCALABILITY)
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_xp ON public.profiles(xp DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_gym ON public.profiles(home_gym);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_founding ON public.profiles(is_founding_trainer) WHERE is_founding_trainer = true;

CREATE INDEX IF NOT EXISTS idx_posts_feed_cursor ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author ON public.posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_gym ON public.posts(gym_id, created_at DESC) WHERE gym_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_stories ON public.posts(is_story, story_expires_at) WHERE is_story = true;

CREATE INDEX IF NOT EXISTS idx_follows_pair ON public.follows(follower_id, following_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON public.workout_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_plans_shared ON public.workout_plans(shared, sales_count DESC) WHERE shared = true;
CREATE INDEX IF NOT EXISTS idx_lift_history_e1rm ON public.lift_history(user_id, exercise_name, estimated_1rm DESC);

CREATE INDEX IF NOT EXISTS idx_activity_logs_war ON public.activity_logs(gym_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_duels_participants ON public.duels(challenger_id, opponent_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_convo ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user ON public.user_push_tokens(user_id);

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) - BULLETPROOF POLICIES
-- ============================================================================
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lift_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_wars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Idempotent RLS Policies
DROP POLICY IF EXISTS "Gyms are viewable by everyone" ON public.gyms;
DROP POLICY IF EXISTS "Authenticated users can create gyms" ON public.gyms;
DROP POLICY IF EXISTS "Gym owners can update own gyms" ON public.gyms;
CREATE POLICY "Gyms are viewable by everyone" ON public.gyms FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create gyms" ON public.gyms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Gym owners can update own gyms" ON public.gyms FOR UPDATE USING (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
DROP POLICY IF EXISTS "Users can manage own follows" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
DROP POLICY IF EXISTS "Users can manage own likes" ON public.post_likes;
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON public.post_likes FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
DROP POLICY IF EXISTS "Users can manage own comments" ON public.post_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON public.post_comments FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Workout plans are viewable if shared or author" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can manage own plans" ON public.workout_plans;
CREATE POLICY "Workout plans are viewable if shared or author" ON public.workout_plans FOR SELECT USING (shared = true OR auth.uid() = author_id);
CREATE POLICY "Users can manage own plans" ON public.workout_plans FOR ALL USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can view own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can manage own workout logs" ON public.workout_logs;
CREATE POLICY "Users can view own workout logs" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Lift history viewable by everyone" ON public.lift_history;
CREATE POLICY "Lift history viewable by everyone" ON public.lift_history FOR SELECT USING (true);

DROP POLICY IF EXISTS "Duels viewable by participants" ON public.duels;
DROP POLICY IF EXISTS "Challenger can insert duel" ON public.duels;
DROP POLICY IF EXISTS "Participants can update duel" ON public.duels;
CREATE POLICY "Duels viewable by participants" ON public.duels FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Challenger can insert duel" ON public.duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Participants can update duel" ON public.duels FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

DROP POLICY IF EXISTS "Gym wars are viewable by everyone" ON public.gym_wars;
CREATE POLICY "Gym wars are viewable by everyone" ON public.gym_wars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Activity logs viewable by everyone" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can insert own activity" ON public.activity_logs;
CREATE POLICY "Activity logs viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own activity" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Messages viewable by participants" ON public.messages;
DROP POLICY IF EXISTS "Sender can insert message" ON public.messages;
CREATE POLICY "Messages viewable by participants" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Sender can insert message" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users manage own push tokens" ON public.user_push_tokens;
CREATE POLICY "Users manage own push tokens" ON public.user_push_tokens FOR ALL USING (auth.uid() = user_id);
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

    -- If purchase is a Pro Subscription, activate is_pro on buyer's profile
    IF NEW.item_type = 'subscription' THEN
        UPDATE public.profiles
        SET is_pro = true,
            pro_tier = NEW.item_id,
            pro_expires_at = now() + interval '30 days'
        WHERE id = NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_purchase_payout ON public.purchases;
CREATE TRIGGER tr_sync_purchase_payout
    AFTER INSERT ON public.purchases
    FOR EACH ROW EXECUTE FUNCTION public.sync_purchase_payout();

