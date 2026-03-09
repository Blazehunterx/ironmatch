
-- ═══ 1. SCHEMA FIXES (Adding Missing Social Columns) ═══
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founding_trainer BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'General Fitness';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS home_gym_name TEXT DEFAULT '';

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS spots_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- ═══ 2. TABLE CREATION (Ensuring relations exist) ═══
CREATE TABLE IF NOT EXISTS public.follows (
    follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

-- Enable RLS for follows if not set
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can manage own follows" ON public.follows;
CREATE POLICY "Users can manage own follows" ON public.follows FOR ALL USING (auth.uid() = follower_id);

-- ═══ 3. CREATE SHADOW AUTH ACCOUNTS ═══
-- We must insert into auth.users first because profiles has a Foreign Key to it.
-- This ensures the influencers "exist" in the system.
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, instance_id, aud)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sofia@ironmatch.ai', 'shadow_influencer_no_pass', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bella@ironmatch.ai', 'shadow_influencer_no_pass', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'marco@ironmatch.ai', 'shadow_influencer_no_pass', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'aiko@ironmatch.ai', 'shadow_influencer_no_pass', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'malik@ironmatch.ai', 'shadow_influencer_no_pass', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- ═══ 3. SEED INFLUENCER PROFILES ═══
-- The handle_new_user trigger might have already created basic profiles. 
-- We use UPSERT to fill in the premium details.
INSERT INTO public.profiles (id, email, name, bio, fitness_level, discipline, is_trainer, verification_status, is_founding_trainer, profile_image_url, home_gym, home_gym_name)
VALUES
-- Sofia Rodriguez
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sofia@ironmatch.ai', 'Sofia Rodriguez', 'Elite Bodybuilder | Nutrition Coach | Building the next generation of athletes.', 'Professional', 'Bodybuilding', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/sofia.png', 'gym_1', 'Iron Temple London'),
-- Bella Barnes
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bella@ironmatch.ai', 'Bella "Big" Barnes', 'Powerlifting World Record Holder. No excuses, just volume.', 'Professional', 'Powerlifting', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/bella.png', 'gym_1', 'Iron Temple London'),
-- Marco Rossi
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'marco@ironmatch.ai', 'Marco Rossi', 'Hybrid Athlete | Surf & Strength. Training for life.', 'Professional', 'General Fitness', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/marco.png', 'gym_2', 'Muscle Beach Venice'),
-- Aiko Tanaka
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'aiko@ironmatch.ai', 'Aiko Tanaka', 'Flexibility & Strength. Mastering the art of movement.', 'Intermediate', 'General Fitness', true, 'verified', false, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop', 'gym_3', 'The Dojo Tokyo'),
-- Malik Johnson
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'malik@ironmatch.ai', 'Malik Johnson', 'Speed & Explosiveness. Track & Field background. Let''s get shredded.', 'Professional', 'Hyrox', true, 'verified', false, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', 'gym_4', 'Elite Athletics NYC')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    fitness_level = EXCLUDED.fitness_level,
    discipline = EXCLUDED.discipline,
    is_trainer = EXCLUDED.is_trainer,
    profile_image_url = EXCLUDED.profile_image_url,
    verification_status = EXCLUDED.verification_status,
    is_founding_trainer = EXCLUDED.is_founding_trainer,
    home_gym_name = EXCLUDED.home_gym_name;

-- ═══ 4. SEED INITIAL POSTS ═══
INSERT INTO public.posts (author_id, gym_id, content, media_url, media_type, spots_count, created_at)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'gym_1', 'Leg day volume check: 12,000lbs moved today. Consistency is the only secret.', NULL, 'image', 145, now() - interval '2 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'gym_1', 'New PR! 405lb Squat for triples. The energy at Iron Temple is insane today.', NULL, 'image', 230, now() - interval '4 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'gym_2', 'Beach workout completed. Hybrid training is about being ready for anything.', NULL, 'image', 95, now() - interval '6 hours');

-- ═══ 5. SEED INITIAL FOLLOWS ═══
INSERT INTO public.follows (follower_id, following_id)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;
