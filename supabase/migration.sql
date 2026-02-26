-- IronMatch Database Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ═══ PROFILES TABLE ═══
-- Linked to Supabase Auth users via id
CREATE TABLE IF NOT EXISTS profiles (
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
    availability JSONB DEFAULT '[]',
    big4 JSONB DEFAULT '{"bench": 0, "squat": 0, "deadlift": 0, "ohp": 0}',
    friends TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles (for discovery)
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- Updated_at auto-update
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();
