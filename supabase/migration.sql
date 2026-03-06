-- IronMatch Database Schema (idempotent - safe to re-run)
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ═══ PROFILES TABLE ═══
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT '',
    email TEXT,
    bio TEXT DEFAULT '',
    fitness_level TEXT DEFAULT 'Beginner',
    home_gym TEXT DEFAULT '',
    home_gym_name TEXT DEFAULT '',
    is_trainer BOOLEAN DEFAULT false,
    profile_image_url TEXT DEFAULT '',
    weight_kg REAL,
    height_cm REAL,
    unit_preference TEXT DEFAULT 'lbs',
    discipline TEXT DEFAULT 'General Fitness',
    xp INTEGER DEFAULT 0,
    reliability_streak INTEGER DEFAULT 0,
    goals TEXT[] DEFAULT '{}',
    sub_goals TEXT[] DEFAULT '{}',
    availability JSONB DEFAULT '[]'::jsonb,
    big4 JSONB DEFAULT '{"bench": 0, "squat": 0, "deadlift": 0, "ohp": 0}'::jsonb,
    friends TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_admin BOOLEAN DEFAULT false,
    verification_status TEXT DEFAULT 'none', -- 'none', 'pending', 'verified'
    trainer_license_url TEXT
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (safe to re-run)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Recreate policies
CREATE POLICY "Profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- If insert fails, log but don't prevent user signup
        RAISE LOG 'Error creating profile: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ═══ GYMS TABLE ═══
CREATE TABLE IF NOT EXISTS public.gyms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT DEFAULT 'Nearby',
    member_count INTEGER DEFAULT 1,
    lat REAL,
    lng REAL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    owner_id UUID REFERENCES auth.users(id),
    is_verified_gym BOOLEAN DEFAULT false
);

ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gyms are viewable by everyone" ON public.gyms;
DROP POLICY IF EXISTS "Users can insert gyms" ON public.gyms;

CREATE POLICY "Gyms are viewable by everyone" ON public.gyms FOR SELECT USING (true);
CREATE POLICY "Users can insert gyms" ON public.gyms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ═══ POSTS TABLE ═══
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id TEXT, -- Can be OSM ID or custom ID
    content TEXT NOT NULL,
    media_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;

CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = author_id);

-- ═══ LIKES TABLE ═══
CREATE TABLE IF NOT EXISTS public.likes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;
DROP POLICY IF EXISTS "Users can toggle own likes" ON public.likes;

CREATE POLICY "Likes are viewable by everyone" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Users can toggle own likes" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- Updated_at auto-update
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Add Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_profiles_home_gym ON public.profiles(home_gym);
CREATE INDEX IF NOT EXISTS idx_posts_gym_id ON public.posts(gym_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON public.posts(created_at DESC);

-- ═══ GYM WARS TABLE ═══
CREATE TABLE IF NOT EXISTS public.gym_wars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_1_id TEXT NOT NULL,
    gym_2_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'declined'
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    winner_id TEXT,
    battle_type TEXT DEFAULT 'volume',
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.gym_wars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Gym wars are viewable by everyone" ON public.gym_wars FOR SELECT USING (true);
CREATE POLICY "Owners can manage own gym wars" ON public.gym_wars FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.gyms 
        WHERE (id = gym_1_id OR id = gym_2_id) AND owner_id = auth.uid()
    )
);

-- ═══ ACTIVITY LOGS TABLE ═══
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'workout', 'pr', 'attendance'
    value REAL DEFAULT 0, -- weight moved, or just 1 for attendance
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Activity logs are viewable by everyone" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own activity" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_activity_gym_date ON public.activity_logs(gym_id, created_at);

-- ═══ GROUP SESSIONS TABLE ═══
CREATE TABLE IF NOT EXISTS public.group_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    workout_plan_id TEXT, -- References a plan ID
    start_time TIMESTAMPTZ DEFAULT now(),
    status TEXT DEFAULT 'active', -- 'active', 'completed'
    join_code TEXT UNIQUE DEFAULT substring(upper(md5(random()::text)) from 1 for 6),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.session_participants (
    session_id UUID REFERENCES public.group_sessions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (session_id, user_id)
);

ALTER TABLE public.group_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Group sessions are viewable by everyone" ON public.group_sessions FOR SELECT USING (true);
CREATE POLICY "Trainers can manage own sessions" ON public.group_sessions FOR ALL USING (auth.uid() = trainer_id);

CREATE POLICY "Participants are viewable by everyone" ON public.session_participants FOR SELECT USING (true);
CREATE POLICY "Users can join sessions" ON public.session_participants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave sessions" ON public.session_participants FOR DELETE USING (auth.uid() = user_id);

-- ═══ WORKOUT PLANS TABLE ═══
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Plans are viewable by everyone if shared or own" ON public.workout_plans 
    FOR SELECT USING (shared = true OR auth.uid() = author_id);
CREATE POLICY "Users can manage own plans" ON public.workout_plans 
    FOR ALL USING (auth.uid() = author_id);

-- ═══ WORKOUT LOGS TABLE ═══
CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_min INTEGER,
    gym_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own logs" ON public.workout_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_author ON public.workout_plans(author_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user ON public.workout_logs(user_id);
