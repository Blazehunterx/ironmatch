-- Table for storing user push tokens
CREATE TABLE IF NOT EXISTS user_push_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    device_type TEXT, -- 'android' or 'ios'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, token)
);

-- Enable RLS
ALTER TABLE user_push_tokens ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can only see their own tokens" ON user_push_tokens
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own tokens" ON user_push_tokens
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own tokens" ON user_push_tokens
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own tokens" ON user_push_tokens
    FOR DELETE USING (auth.uid() = user_id);

-- Index for fast lookup by user_id
CREATE INDEX IF NOT EXISTS idx_user_push_tokens_user_id ON user_push_tokens(user_id);
