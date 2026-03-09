-- Diverse Shadow Influencer Seed v2
-- This script populates the app with 17 diverse influencers and their initial activity.

-- 1. Create Influencer Profiles
-- Using the 3 existing Elite images + high-quality placeholders for the rest.

-- Clear previous seeds if any (Optional - be careful)
-- DELETE FROM public.profiles WHERE email LIKE '%@ironmatch.ai';

INSERT INTO public.profiles (id, email, name, bio, fitness_level, discipline, is_trainer, verification_status, is_founding_trainer, profile_image_url, home_gym, home_gym_name)
VALUES
-- THE ELITE 3 (Highest Quality)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sofia@ironmatch.ai', 'Sofia Rodriguez', 'Elite Bodybuilder | Nutrition Coach | Building the next generation of athletes.', 'Professional', 'Bodybuilding', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/sofia.png', 'gym_1', 'Iron Temple London'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bella@ironmatch.ai', 'Bella "Big" Barnes', 'Powerlifting World Record Holder. No excuses, just volume.', 'Professional', 'Powerlifting', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/bella.png', 'gym_1', 'Iron Temple London'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'marco@ironmatch.ai', 'Marco Rossi', 'Hybrid Athlete | Surf & Strength. Training for life.', 'Professional', 'General Fitness', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/marco.png', 'gym_2', 'Muscle Beach Venice'),

-- DIVERSE PERSONAS (Placeholders for now)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'aiko@ironmatch.ai', 'Aiko Tanaka', 'Flexibility & Strength. Mastering the art of movement.', 'Intermediate', 'General Fitness', true, 'verified', false, 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop', 'gym_3', 'The Dojo Tokyo'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'malik@ironmatch.ai', 'Malik Johnson', 'Speed & Explosiveness. Track & Field background. Let''s get shredded.', 'Professional', 'Hyrox', true, 'verified', false, 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop', 'gym_4', 'Elite Athletics NYC'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'elena@ironmatch.ai', 'Elena Santos', 'High Intensity. High Energy. I build engines.', 'Intermediate', 'CrossFit', true, 'verified', false, 'https://images.unsplash.com/photo-1548690312-e3b507d17a12?w=400&h=400&fit=crop', 'gym_5', 'CrossFit Manaus')
ON CONFLICT (id) DO UPDATE SET
    profile_image_url = EXCLUDED.profile_image_url,
    verification_status = EXCLUDED.verification_status,
    is_founding_trainer = EXCLUDED.is_founding_trainer;

-- 2. Seed Initial Posts (History)
INSERT INTO public.posts (author_id, gym_id, content, media_url, media_type, spots_count, created_at)
VALUES
-- Sofia's Posts
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'gym_1', 'Leg day volume check: 12,000lbs moved today. Consistency is the only secret.', NULL, 'image', 145, now() - interval '2 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'gym_1', 'Early morning cardio session. The gym is where I find my peace.', NULL, 'image', 82, now() - interval '1 day'),

-- Bella's Posts
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'gym_1', 'New PR! 405lb Squat for triples. The energy at Iron Temple is insane today.', NULL, 'image', 230, now() - interval '4 hours'),

-- Marco's Posts
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'gym_2', 'Beach workout completed. Hybrid training is about being ready for anything.', NULL, 'image', 95, now() - interval '6 hours');

-- 3. Simulate Initial Social Graph
INSERT INTO public.follows (follower_id, following_id)
VALUES
-- Influencers follow each other
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11')
ON CONFLICT DO NOTHING;
