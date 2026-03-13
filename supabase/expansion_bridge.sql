-- Imperial Expansion: Duels, Universal Tracking & Real-time Alerts
-- Run this in Supabase SQL Editor

-- ═══ DUELS TABLE ═══
CREATE TABLE IF NOT EXISTS public.duels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenger_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    opponent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    target_value REAL NOT NULL,
    target_unit TEXT DEFAULT 'lbs',
    status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'declined', 'expired'
    challenger_proof_url TEXT,
    opponent_proof_url TEXT,
    challenger_value REAL DEFAULT 0,
    opponent_value REAL DEFAULT 0,
    winner_id UUID REFERENCES public.profiles(id),
    xp_reward INTEGER DEFAULT 150,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '48 hours'),
    completed_at TIMESTAMPTZ
);

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Duels are viewable by everyone" ON public.duels FOR SELECT USING (true);
CREATE POLICY "Users can create duels" ON public.duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Participants can update duels" ON public.duels FOR UPDATE USING (auth.uid() IN (challenger_id, opponent_id));

-- ═══ LIFT HISTORY TABLE (Universal Tracking) ═══
CREATE TABLE IF NOT EXISTS public.lift_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    weight REAL NOT NULL,
    reps INTEGER NOT NULL,
    estimated_1rm REAL NOT NULL,
    log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lift_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only see their own lift history" ON public.lift_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own lift history" ON public.lift_history FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_lift_history_user_exercise ON public.lift_history(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_lift_history_created_at ON public.lift_history(created_at DESC);

-- ═══ NOTIFICATION TRIGGERS (War & Duels) ═══

-- Trigger for Gym War Invitations
CREATE OR REPLACE FUNCTION public.notify_gym_war_invite() RETURNS TRIGGER AS $$
DECLARE
    opp_owner_id UUID;
    challenger_gym_name TEXT;
BEGIN
    -- Get the owner of the opponent gym
    SELECT owner_id INTO opp_owner_id FROM public.gyms WHERE id = NEW.gym_2_id;
    -- Get the name of the challenger gym
    SELECT name INTO challenger_gym_name FROM public.gyms WHERE id = NEW.gym_1_id;

    IF opp_owner_id IS NOT NULL THEN
        PERFORM net.http_post(
            url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-push-notification',
            headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'), 'Apex-Secret', 'IRONMATCH_INTERNAL_PULSE_2026'),
            body := jsonb_build_object(
                'user_id', opp_owner_id,
                'title', 'Gym War Challenge! ⚔️',
                'body', challenger_gym_name || ' has challenged your gym to a battle!',
                'data', jsonb_build_object('type', 'gym_war', 'war_id', NEW.id)
            )
        );
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_notify_gym_war_invite ON public.gym_wars;
CREATE TRIGGER tr_notify_gym_war_invite AFTER INSERT ON public.gym_wars FOR EACH ROW EXECUTE FUNCTION public.notify_gym_war_invite();

-- Trigger for Duel Challenges
CREATE OR REPLACE FUNCTION public.notify_duel_challenge() RETURNS TRIGGER AS $$
DECLARE
    challenger_name TEXT;
BEGIN
    SELECT name INTO challenger_name FROM public.profiles WHERE id = NEW.challenger_id;

    PERFORM net.http_post(
        url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-push-notification',
        headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'), 'Apex-Secret', 'IRONMATCH_INTERNAL_PULSE_2026'),
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

-- ═══ AUTO-SYNC WORKOUT TO LIFT HISTORY ═══
-- This function extracts PRs from the JSON workout log and saves them to lift_history
CREATE OR REPLACE FUNCTION public.sync_workout_to_lift_history() RETURNS TRIGGER AS $$
DECLARE
    exercise RECORD;
    best_set RECORD;
    estimated_1rm_val REAL;
BEGIN
    -- exercises is a JSONB array of { name: '...', sets: [{ weight: 100, reps: 10 }, ...] }
    FOR exercise IN SELECT * FROM jsonb_to_recordset(NEW.exercises) AS x(name TEXT, sets JSONB)
    LOOP
        -- Find the best set for this exercise based on 1RM calculation: weight * (1 + reps/30.0)
        SELECT * INTO best_set FROM jsonb_to_recordset(exercise.sets) AS s(weight REAL, reps INTEGER)
        ORDER BY (weight * (1 + reps/30.0)) DESC LIMIT 1;

        IF best_set IS NOT NULL THEN
            estimated_1rm_val := best_set.weight * (1 + best_set.reps / 30.0);
            
            -- Insert as a historical record
            INSERT INTO public.lift_history (user_id, exercise_name, weight, reps, estimated_1rm, log_id, created_at)
            VALUES (NEW.user_id, exercise.name, best_set.weight, best_set.reps, estimated_1rm_val, NEW.id, NEW.created_at);
        END IF;
    END LOOP;
    RETURN NEW;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS tr_sync_workout_to_lift_history ON public.workout_logs;
CREATE TRIGGER tr_sync_workout_to_lift_history AFTER INSERT ON public.workout_logs FOR EACH ROW EXECUTE FUNCTION public.sync_workout_to_lift_history();
