-- LARGE SCALE ELITE INFLUENCER SEED
-- This script creates 20 high-quality influencers and 200 initial posts to drive discovery.

-- 1. Create 20 Elite Influencers
INSERT INTO public.profiles (id, name, bio, fitness_level, discipline, xp, home_gym, profile_image_url, is_trainer, verification_status)
VALUES 
('elite_01', 'Sofia V', 'Hybrid Athlete | Wellness & Mobility. Training out of Master Gym.', 'Professional', 'General Fitness', 5200, 'master_gym_01', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_02', 'Marco Silva', 'Bodybuilding Pro. Chasing the pump. Iron Match OG.', 'Professional', 'Bodybuilding', 4800, 'master_gym_01', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_03', 'Bella Rossi', 'Functional Movement | CrossFit Enthusiast. High intensity only.', 'Professional', 'CrossFit', 3900, 'master_gym_02', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_04', 'Leo Thorne', 'Powerlifting Coach. Strength is the only metric of success.', 'Professional', 'Powerlifting', 6100, 'master_gym_02', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_05', 'Zara Fit', 'Yoga & Calisthenics. Master your bodyweight.', 'Professional', 'General Fitness', 2800, 'master_gym_01', 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_06', 'Dante Volt', 'High Performance Coach. Science-based training.', 'Professional', 'Hyrox', 3500, 'master_gym_01', 'https://images.unsplash.com/photo-1517836357463-d25dfeac00ad?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_07', 'Elena Ray', 'Competitive Wellness. Peak conditioning every day.', 'Professional', 'Bodybuilding', 4200, 'master_gym_02', 'https://images.unsplash.com/photo-1583454110331-30cc0090885e?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_08', 'Kai Jin', 'BJJ & Conditioning. Movement is life.', 'Professional', 'General Fitness', 2900, 'master_gym_02', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_09', 'Nora Storm', 'Marathon runner turned Lifter. Chasing the hybrid dream.', 'Intermediate', 'Hyrox', 1500, 'master_gym_01', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_10', 'Vince Power', 'Strongman training. Moving mountains.', 'Professional', 'Powerlifting', 5500, 'master_gym_01', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_11', 'Lila Voss', 'Aesthetic focus. Diet & Training expert.', 'Professional', 'Bodybuilding', 3700, 'master_gym_02', 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_12', 'Rex Steele', 'Military Style Conditioning. No excuses.', 'Professional', 'CrossFit', 4400, 'master_gym_02', 'https://images.unsplash.com/photo-1517836357463-d25dfeac00ad?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_13', 'Maya Sun', 'Bali Training. Beach body all year round.', 'Professional', 'General Fitness', 3100, 'master_gym_01', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_14', 'Hugo Wolf', 'Hypertrophy specialist. Science of the pump.', 'Professional', 'Bodybuilding', 3900, 'master_gym_02', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_15', 'Taya Frost', 'Cold exposure & Strength. Resilience coach.', 'Intermediate', 'General Fitness', 1800, 'master_gym_01', 'https://images.unsplash.com/photo-1583454110331-30cc0090885e?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_16', 'Axel Rod', 'Custom Motorcycle Builder & Lifter. Heavy metal.', 'Intermediate', 'Powerlifting', 1200, 'master_gym_02', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_17', 'Jade Lux', 'Luxury Fitness. High end performance.', 'Professional', 'General Fitness', 5000, 'master_gym_01', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_18', 'Kane Volt', 'Electricity in the gym. Fast twitch focus.', 'Professional', 'CrossFit', 3300, 'master_gym_02', 'https://images.unsplash.com/photo-1517836357463-d25dfeac00ad?auto=format&fit=crop&q=80&w=400', false, 'verified'),
('elite_19', 'Ria Gem', 'Holistic health through heavy lifting.', 'Intermediate', 'General Fitness', 2100, 'master_gym_01', 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?auto=format&fit=crop&q=80&w=400', true, 'verified'),
('elite_20', 'Zion Peak', 'Chasing the top of the leaderboard.', 'Professional', 'Hyrox', 4600, 'master_gym_02', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=400', false, 'verified')
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    bio = EXCLUDED.bio,
    profile_image_url = EXCLUDED.profile_image_url,
    verification_status = 'verified';

-- 2. Create 100 Initial Posts (5 per influencer)
-- Note: In a real environment, we'd use random dates over 10 days.
INSERT INTO public.posts (id, author_id, content, media_url, media_type, created_at, gym_id)
SELECT 
    gen_random_uuid(),
    author_id,
    'Daily grind at Master Gym. Volume is the only variable that doesn''t lie. #' || floor(random()*999),
    'https://images.unsplash.com/photo-' || floor(random()*100000) || '?auto=format&fit=crop&q=80&w=800',
    'image',
    now() - (random() * interval '10 days'),
    CASE WHEN random() > 0.5 THEN 'master_gym_01' ELSE 'master_gym_02' END
FROM (
    SELECT id as author_id FROM public.profiles WHERE id LIKE 'elite_%'
    CROSS JOIN (SELECT generate_series(1, 5)) as series
) as sub;

-- 3. Engagement (Simulate 500 Spots)
INSERT INTO public.likes (post_id, user_id)
SELECT 
    p.id,
    u.id
FROM public.posts p
CROSS JOIN (SELECT id FROM public.profiles WHERE id LIKE 'elite_%' LIMIT 5) u
WHERE random() > 0.7
ON CONFLICT DO NOTHING;
