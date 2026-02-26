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
    updated_at TIMESTAMPTZ DEFAULT now()
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
