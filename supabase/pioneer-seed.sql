-- Pioneer Seed Script for IronMatch
-- This script populates the Social Hub with high-quality content.

-- 1. Create Pioneer Profiles
-- Note: These are 'Shadow Profiles' that look real in the UI.
INSERT INTO public.profiles (id, name, bio, fitness_level, discipline, xp, home_gym, profile_image_url, is_trainer)
VALUES 
('d1111111-1111-1111-1111-111111111111', 'Alex "The Engine" Chen', 'Professional Hybrid Athlete | IronMatch Pioneer. Here to push the limits.', 'Professional', 'Hyrox', 2500, 'master_gym_01', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=200', true),
('d2222222-2222-2222-2222-222222222222', 'Sarah Power', 'Bodybuilding Coach & Nutritionist. Consistency is the only secret.', 'Professional', 'Bodybuilding', 3200, 'master_gym_01', 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?auto=format&fit=crop&q=80&w=200', true),
('d3333333-3333-3333-3333-333333333333', 'Marcus Volt', 'Chasing the 700lb Deadlift. Heavy weight only.', 'Professional', 'Powerlifting', 1800, 'master_gym_02', 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?auto=format&fit=crop&q=80&w=200', false),
('d4444444-4444-4444-4444-444444444444', 'Elena Fit', 'CrossFit specialist. Functional strength and high intensity.', 'Intermediate', 'CrossFit', 1200, 'master_gym_02', 'https://images.unsplash.com/photo-1518310323272-619463c94bb2?auto=format&fit=crop&q=80&w=200', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Create Global Posts
INSERT INTO public.posts (id, author_id, content, media_url, media_type, created_at)
VALUES
(gen_random_uuid(), 'd1111111-1111-1111-1111-111111111111', 'Just smashed a new PR on the 5k row. 16:45! The engine is feeling primed for the next Hyrox battle.', 'https://images.unsplash.com/photo-1517836357463-d25dfeac00ad?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '2 hours'),
(gen_random_uuid(), 'd2222222-2222-2222-2222-222222222222', 'Late night sessions are where the real work happens. Focus on the squeeze, not just the weight.', 'https://images.unsplash.com/photo-1583454110331-30cc0090885e?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '5 hours'),
(gen_random_uuid(), 'd3333333-3333-3333-3333-333333333333', '600lb x 3. We are getting close to the goal. Master Gym feels like an arena today!', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '10 hours'),
(gen_random_uuid(), 'd4444444-4444-4444-4444-444444444444', 'New "Form Check" video library is looking sick! Just used the AI generator to build a mobility flow.', 'https://images.unsplash.com/photo-1541534741688-6078c64b52d3?auto=format&fit=crop&q=80&w=800', 'image', now() - interval '1 day');

-- 3. Simulate Engagement (Spots)
INSERT INTO public.likes (post_id, user_id)
SELECT id, 'd1111111-1111-1111-1111-111111111111' FROM public.posts WHERE author_id != 'd1111111-1111-1111-1111-111111111111'
ON CONFLICT DO NOTHING;
