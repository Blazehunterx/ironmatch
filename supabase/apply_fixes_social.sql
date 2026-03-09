
-- ═══ UPDATE POSTS TABLE ═══
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image'; -- 'image', 'video'
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_auto_generated BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS is_event BOOLEAN DEFAULT false;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS event_title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS spots_count INTEGER DEFAULT 0;

-- ═══ COMMENTS TABLE ═══
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for comments
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;
DROP POLICY IF EXISTS "Users can insert own comments" ON public.comments;

CREATE POLICY "Comments are viewable by everyone" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ═══ RPC FOR SPOTTING (LIKING) ═══
CREATE OR REPLACE FUNCTION public.increment_spots(post_id_param UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE public.posts
    SET spots_count = COALESCE(spots_count, 0) + 1
    WHERE id = post_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
