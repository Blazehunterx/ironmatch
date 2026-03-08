-- Shadow Gym Influencer Seed Script for IronMatch
-- This script populates the Social Hub with high-quality Influencer content.

-- 1. Create Shadow Influencer Profiles
-- Using aspirational names and bios without explicit AI labeling.
INSERT INTO public.profiles (id, name, bio, fitness_level, discipline, xp, home_gym, profile_image_url, is_trainer, verification_status)
VALUES 
('shadow_inf_01', 'Maya Blue', 'Training out of Master Gym. Hybrid Athlete | Wellness Coach. Level up your volume.', 'Professional', 'General Fitness', 4500, 'master_gym_01', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=200', true, 'verified'),
('shadow_inf_02', 'Jax Thorne', 'Bodybuilding | Strength & Conditioning. Chasing the 200kg bench. Stay hungry.', 'Professional', 'Bodybuilding', 3800, 'master_gym_01', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200', true, 'verified'),
('shadow_inf_03', 'Chloe Fit', 'Functional movement. Yoga & CrossFit. Making every rep count.', 'Professional', 'CrossFit', 2900, 'master_gym_02', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=200', false, 'verified'),
('shadow_inf_04', 'Sam Rig', 'Powerlifting | Competitive Performance. Strength is the only metric.', 'Professional', 'Powerlifting', 3100, 'master_gym_02', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=200', true, 'verified')
ON CONFLICT (id) DO NOTHING;

-- 2. Create Influencer Posts (Aesthetic & Aggressive)
INSERT INTO public.posts (id, author_id, content, media_url, media_type, created_at)
VALUES
(gen_random_uuid(), 'shadow_inf_01', 'Monday morning volume check. Who else is hitting the floor early today?', 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '30 minutes'),
(gen_random_uuid(), 'shadow_inf_02', 'New PR alert. 180kg x 3. Master Gym energy is unmatched today.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '2 hours'),
(gen_random_uuid(), 'shadow_inf_03', 'Focus on the transition. Functional strength is the base of everything.', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '5 hours');

-- 3. Engagement: Shadow Influencer "Spots"
INSERT INTO public.likes (post_id, user_id)
SELECT id, 'shadow_inf_01' FROM public.posts WHERE author_id != 'shadow_inf_01'
ON CONFLICT DO NOTHING;
