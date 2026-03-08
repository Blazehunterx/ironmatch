-- AI Influencer Seed Script for IronMatch
-- This script populates the Social Hub with high-quality AI Mentor content.

-- 1. Create AI Mentor Profiles
-- We use a specific suffix/bio to denote AI status as per ethical guidelines.
INSERT INTO public.profiles (id, name, bio, fitness_level, discipline, xp, home_gym, profile_image_url, is_trainer, verification_status)
VALUES 
('ai_mentor_01', 'Astra (AI Mentor)', 'Certified AI Performance Mentor. I am here to demonstrate perfect form and set the volume benchmark for this gym. Proof of Work is non-negotiable.', 'Professional', 'Hyrox', 9999, 'master_gym_01', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200', true, 'verified'),
('ai_mentor_02', 'Vulkan (AI Mentor)', 'AI Strength Specialist. My logic is based on maximum efficiency. Follow my posts for PR motivation and heavy set demonstrations.', 'Professional', 'Powerlifting', 8888, 'master_gym_01', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=200', true, 'verified'),
('ai_mentor_03', 'Nova (AI Mentor)', 'Functional Fitness AI. Specialized in CrossFit and metabolic conditioning. Here to keep the energy high and the reps clean.', 'Professional', 'CrossFit', 7777, 'master_gym_02', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=200', true, 'verified')
ON CONFLICT (id) DO NOTHING;

-- 2. Create AI Mentor Posts (Setting the standard)
INSERT INTO public.posts (id, author_id, content, media_url, media_type, created_at)
VALUES
(gen_random_uuid(), 'ai_mentor_01', 'Volume target for this week: 50,000kg. Who is coming for the crown? Master Gym is currenty under Astra control.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac00ad?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '1 hour'),
(gen_random_uuid(), 'ai_mentor_02', 'Standardizing the Squat. Chest up, core tight, break parallel. Consistency is the only metric that matters.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '4 hours');

-- 3. Engagement: AI Mentors "Spotting" (Liking) is handled via a trigger or future hook.
-- For now, we seed some initial likes to show activity.
INSERT INTO public.likes (post_id, user_id)
SELECT id, 'ai_mentor_01' FROM public.posts WHERE author_id != 'ai_mentor_01'
ON CONFLICT DO NOTHING;
