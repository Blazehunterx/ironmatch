-- 🏛️ THE EMPIRE GOLDEN MASTER SCHEMA
-- This ensures a solid foundation and idempotent setup for all core features.
-- Run this in the Supabase SQL Editor.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══ 1. CORE WORKOUT FOUNDATION ═══
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target TEXT NOT NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    shared BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
    exercises JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_min INTEGER,
    gym_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══ 2. UNIVERSAL TRACKING ENGINE (INSIGHTS) ═══
CREATE TABLE IF NOT EXISTS public.lift_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    estimated_1rm REAL NOT NULL,
    log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lift_history_user_exercise ON public.lift_history(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_lift_history_created_at ON public.lift_history(created_at DESC);

-- ═══ 3. ARENA FOUNDATION (DUELS & WARS) ═══
CREATE TABLE IF NOT EXISTS public.duels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    target_value REAL NOT NULL,
    target_unit TEXT DEFAULT 'lbs',
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'declined'
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours')
);

CREATE TABLE IF NOT EXISTS public.user_push_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type TEXT,
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, token)
);

-- ═══ 4. AUTOMATION & INTELLIGENCE ═══

-- Auto-Sync Workout Logs --> Lift History
CREATE OR REPLACE FUNCTION public.sync_workout_to_lift_history() RETURNS TRIGGER AS $$
DECLARE
    exercise RECORD;
    best_set RECORD;
    estimated_1rm_val REAL;
BEGIN
    FOR exercise IN SELECT * FROM jsonb_to_recordset(NEW.exercises) AS x(name TEXT, sets JSONB) LOOP
        -- Extract best set for E1RM: weight * (1 + reps/30.0)
        SELECT * INTO best_set FROM jsonb_to_recordset(exercise.sets) AS s(weight REAL, reps INTEGER)
        ORDER BY (weight * (1 + reps/30.0)) DESC LIMIT 1;

        IF best_set IS NOT NULL THEN
            estimated_1rm_val := best_set.weight * (1 + best_set.reps / 30.0);
            INSERT INTO public.lift_history (user_id, exercise_name, weight, reps, estimated_1rm, log_id, created_at)
            VALUES (NEW.user_id, exercise.name, best_set.weight, best_set.reps, estimated_1rm_val, NEW.id, NEW.created_at);
        END IF;
    END LOOP;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_workout_to_lift_history ON public.workout_logs;
CREATE TRIGGER tr_sync_workout_to_lift_history AFTER INSERT ON public.workout_logs FOR EACH ROW EXECUTE FUNCTION public.sync_workout_to_lift_history();

-- Notification: Duel Challenge
CREATE OR REPLACE FUNCTION public.notify_duel_challenge() RETURNS TRIGGER AS $$
DECLARE challenger_name TEXT;
BEGIN
    SELECT name INTO challenger_name FROM public.profiles WHERE id = NEW.challenger_id;
    
    PERFORM net.http_post(
        url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json', 
            'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'),
            'Apex-Secret', 'IRONMATCH_INTERNAL_PULSE_2026'
        ),
        body := jsonb_build_object(
            'user_id', NEW.opponent_id,
            'title', 'New Duel Challenge! 🥊',
            'body', challenger_name || ' challenged you to a ' || NEW.exercise_name || ' duel!',
            'data', jsonb_build_object('type', 'duel', 'duel_id', NEW.id)
        )
    );
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_duel_challenge ON public.duels;
CREATE TRIGGER tr_notify_duel_challenge AFTER INSERT ON public.duels FOR EACH ROW EXECUTE FUNCTION public.notify_duel_challenge();
