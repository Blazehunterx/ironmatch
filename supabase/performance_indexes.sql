-- Optimization for feed sorting
CREATE INDEX IF NOT EXISTS idx_posts_created_at_desc ON posts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_stories_created_at_desc ON stories (created_at DESC);

-- Ensure is_founding_trainer is indexed for faster home screen story sorting
CREATE INDEX IF NOT EXISTS idx_profiles_founding_trainer ON profiles (is_founding_trainer) WHERE is_founding_trainer = true;

-- Ensure is_auto_generated is indexed for bot diagnostics
CREATE INDEX IF NOT EXISTS idx_posts_auto_gen ON posts (is_auto_generated) WHERE is_auto_generated = true;
