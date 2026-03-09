
-- ═══ PIONEER HYDRATION: THE ELITE 17 ═══
-- Date: 2026-03-08
-- Description: Seeds the platform with 12 Women and 5 Men (Elite Influencers).

-- 1. SHADOW AUTH ACCOUNTS
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, role, instance_id, aud)
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sofia@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bella@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'marco@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'yara@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'li_wei@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'chloe@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'da_silva@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'sara@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'priya@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'kenji@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'lucia@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'aaliyah@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'omar@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'zara@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'elena@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'mei_lin@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'kimberly@ironmatch.ai', 'shadow_elite', now(), 'authenticated', '00000000-0000-0000-0000-000000000000', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. ELITE PROFILES
INSERT INTO public.profiles (id, email, name, bio, fitness_level, discipline, is_trainer, verification_status, is_founding_trainer, profile_image_url, home_gym, home_gym_name)
VALUES
-- Sofia (Latina Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'sofia@ironmatch.ai', 'Sofia Rodriguez', 'Elite Bodybuilder | Nutrition Coach. Building the next generation.', 'Professional', 'Bodybuilding', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/sofia.png', 'gym_1', 'Iron Temple London'),
-- Bella (Caucasian Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'bella@ironmatch.ai', 'Bella Barnes', 'Powerlifting World Record Holder. No excuses, only volume.', 'Professional', 'Powerlifting', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/bella.png', 'gym_1', 'Iron Temple London'),
-- Marco (Caucasian Man)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'marco@ironmatch.ai', 'Marco Rossi', 'Hybrid Athlete | Surf & Strength. Training for life.', 'Professional', 'General Fitness', true, 'verified', true, 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/marco.png', 'gym_2', 'Muscle Beach Venice'),
-- Yara (Middle Eastern Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'yara@ironmatch.ai', 'Yara Mansour', 'Strength & Grace. Mastering movement and mindset.', 'Professional', 'General Fitness', true, 'verified', true, '/influencers/aaliyah_v2.png', 'gym_3', 'The Oasis Dubai'),
-- Li Wei (Asian Man)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'li_wei@ironmatch.ai', 'Li Wei', 'Focus. Discipline. Results. Shredded for the mission.', 'Professional', 'Bodybuilding', true, 'verified', true, '/influencers/li_wei.png', 'gym_4', 'Steel Valley Tokyo'),
-- Chloe (Black Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'chloe@ironmatch.ai', 'Chloe Williams', 'Fitness Model & Lifestyle Coach. Elegant, Strong, Unstoppable.', 'Intermediate', 'General Fitness', true, 'verified', true, '/influencers/chloe.png', 'gym_5', 'Vogue Fitness LA'),
-- Da Silva (Latino Man)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', 'da_silva@ironmatch.ai', 'Mateo Da Silva', 'Power through struggle. Brazilian Strength.', 'Professional', 'Powerlifting', true, 'verified', true, '/influencers/da_silva.png', 'gym_6', 'Rio Strength Club'),
-- Sara (Scandinavian Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', 'sara@ironmatch.ai', 'Sara Lind', 'Scandinavian Steel. High-performance athlete.', 'Professional', 'General Fitness', true, 'verified', true, '/influencers/sara_v2.png', 'gym_7', 'Stockholm Iron'),
-- Priya (Indian Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', 'priya@ironmatch.ai', 'Priya Sharma', 'Inner Peace, Outer Strength. Yoga and Wellness.', 'Intermediate', 'Yoga', true, 'verified', true, '/influencers/priya.png', 'gym_8', 'Lotus Studio Mumbai'),
-- Kenji (Asian Man)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', 'kenji@ironmatch.ai', 'Kenji Sato', 'Mastering the Gravity. Calisthenics Legend.', 'Professional', 'Calisthenics', true, 'verified', true, '/influencers/kenji.png', 'gym_9', 'Zenith Park Osaka'),
-- Lucia (Latina Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', 'lucia@ironmatch.ai', 'Claire Anderson', 'Sunshine and Squats. Keeping it positive and powerful.', 'Professional', 'General Fitness', true, 'verified', true, '/influencers/claire_v2.png', 'gym_10', 'Amazonas Athletics'),
-- Aaliyah (Mixed Lifestyle)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'aaliyah@ironmatch.ai', 'Aaliyah Jones', 'Luxury Fitness & Lifestyle. Balance is the key to everything.', 'Intermediate', 'General Fitness', true, 'verified', true, '/influencers/elena_v2.png', 'gym_11', 'Equinox Heritage'),
-- Omar (Middle Eastern Man)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', 'omar@ironmatch.ai', 'Omar Haddad', 'Mind of a Warrior. Krav Maga & Combat Fitness.', 'Professional', 'General Fitness', true, 'verified', true, '/influencers/omar.png', 'gym_12', 'The Citadel Amman'),
-- Zara (Mixed Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', 'zara@ironmatch.ai', 'Zara Chen', 'Urban Athlete. Speed, Agility, Aesthetics.', 'Intermediate', 'General Fitness', true, 'verified', true, '/influencers/zara.png', 'gym_13', 'City Heat London'),
-- Elena (Mediterranean Aesthetic)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', 'elena@ironmatch.ai', 'Elena Moretti', 'Bubbly, Fit, and Loving life. Join my journey to the top.', 'Beginner', 'General Fitness', true, 'verified', true, '/influencers/kimberly_v2.png', 'gym_14', 'Milan Fitness Lounge'),
-- Mei Lin (Asian Woman)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', 'mei_lin@ironmatch.ai', 'Mei Lin', 'Precision and Balance. Pilates specialist.', 'Intermediate', 'General Fitness', true, 'verified', true, '/influencers/mei_lin.png', 'gym_15', 'Silk Road Pilates Shanghai'),
-- Kimberly (Cute Pink Fit)
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', 'kimberly@ironmatch.ai', 'Kimberly Styles', 'Training in style. Making fitness fun and feminine.', 'Intermediate', 'General Fitness', true, 'verified', true, '/influencers/kimberly.png', 'gym_16', 'Pink Iron Gym')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    fitness_level = EXCLUDED.fitness_level,
    discipline = EXCLUDED.discipline,
    profile_image_url = EXCLUDED.profile_image_url,
    is_founding_trainer = true;

-- 3. FOUNDING ACTIVITY (Opening Posts)
INSERT INTO public.posts (author_id, gym_id, content, media_type, spots_count, created_at)
VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'gym_1', 'The journey of a thousand reps begins with a single prayer to the Iron Gods. Welcome to IronMatch.', 'image', 120, now() - interval '1 day'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'gym_1', 'Iron Temple is officially live on IronMatch. Let''s move some weight together.', 'image', 342, now() - interval '2 days'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'gym_2', 'Connecting the beach to the barbell. The revolution starts here.', 'image', 156, now() - interval '18 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'gym_3', 'The Oasis is now connected. Follow for strength and mindset tips.', 'image', 89, now() - interval '12 hours'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'gym_4', 'Steel Valley is ready for war. Who''s training today?', 'image', 210, now() - interval '4 hours');
