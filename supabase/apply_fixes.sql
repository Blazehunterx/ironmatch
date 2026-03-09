
-- Consolidate social schema fixes
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founding_trainer BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discipline TEXT DEFAULT 'General Fitness';

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS spots_count INTEGER DEFAULT 0;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image';

-- Ensure RLS allows the public insert/select for seeding if not already set
-- (This is just a fallback to make seeding easier)
CREATE POLICY "Seeding fallback insert" ON public.profiles FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Seeding fallback insert" ON public.profiles; -- Cleanup
