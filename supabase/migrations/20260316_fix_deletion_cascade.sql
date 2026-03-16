-- ═══ DATABASE FIX: CASCADE DELETION ENGINE ═══
-- Date: 2026-03-16
-- Description: Fixes "Database error deleting user" by ensuring all profile-related data is purged automatically.

BEGIN;

-- 1. POSTS
ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS posts_author_id_fkey;
ALTER TABLE public.posts ADD CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 2. MESSAGES (Direct Messages)
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;
ALTER TABLE public.messages ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 3. GYM MESSAGES (Shoutbox)
ALTER TABLE public.gym_messages DROP CONSTRAINT IF EXISTS gym_messages_user_id_fkey;
ALTER TABLE public.gym_messages ADD CONSTRAINT gym_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 4. WORKOUT LOGS
ALTER TABLE public.workout_logs DROP CONSTRAINT IF EXISTS workout_logs_user_id_fkey;
ALTER TABLE public.workout_logs ADD CONSTRAINT workout_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 5. GYM MILESTONES / ACHIEVEMENTS
ALTER TABLE public.gym_milestones DROP CONSTRAINT IF EXISTS gym_milestones_user_id_fkey;
ALTER TABLE public.gym_milestones ADD CONSTRAINT gym_milestones_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. FOLLOWERS / FOLLOWING (Already handled in social_core but re-affirming)
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_follower_id_fkey;
ALTER TABLE public.follows ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.follows DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE public.follows ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 7. SPOTS (Likes)
ALTER TABLE public.spots DROP CONSTRAINT IF EXISTS spots_user_id_fkey;
ALTER TABLE public.spots ADD CONSTRAINT spots_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 8. FRIEND REQUESTS
ALTER TABLE public.friend_requests DROP CONSTRAINT IF EXISTS friend_requests_sender_id_fkey;
ALTER TABLE public.friend_requests ADD CONSTRAINT friend_requests_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.friend_requests DROP CONSTRAINT IF EXISTS friend_requests_receiver_id_fkey;
ALTER TABLE public.friend_requests ADD CONSTRAINT friend_requests_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 9. NOTIFICATIONS
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 10. SESSION PARTICIPANTS (Group Workouts)
ALTER TABLE public.session_participants DROP CONSTRAINT IF EXISTS session_participants_user_id_fkey;
ALTER TABLE public.session_participants ADD CONSTRAINT session_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 11. BOUNTIES (If user initiated/won)
ALTER TABLE public.bounties DROP CONSTRAINT IF EXISTS bounties_creator_id_fkey;
ALTER TABLE public.bounties ADD CONSTRAINT bounties_creator_id_fkey FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

COMMIT;
