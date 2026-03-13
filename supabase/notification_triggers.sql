-- Trigger function to fire when a new message is received
CREATE OR REPLACE FUNCTION public.on_message_received()
RETURNS TRIGGER AS $$
DECLARE
    recipient_name TEXT;
    sender_name TEXT;
BEGIN
    -- Get sender name
    SELECT name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;
    
    -- Call the edge function
    PERFORM
      net.http_post(
        url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'),
            'Apex-Secret', 'IRONMATCH_INTERNAL_PULSE_2026'
        ),
        body := jsonb_build_object(
            'user_id', NEW.recipient_id,
            'title', 'New Message from ' || COALESCE(sender_name, 'Lifting Partner'),
            'body', NEW.content,
            'data', jsonb_build_object('type', 'message', 'conversation_id', NEW.conversation_id)
        )
      );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for messages
DROP TRIGGER IF EXISTS tr_on_message_received ON messages;
CREATE TRIGGER tr_on_message_received
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION public.on_message_received();

-- Trigger function for training invites (matches)
CREATE OR REPLACE FUNCTION public.on_match_invite()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Get sender name
    SELECT name INTO sender_name FROM public.profiles WHERE id = NEW.requester_id;
    
    PERFORM
      net.http_post(
        url := (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_URL') || '/functions/v1/send-push-notification',
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || (SELECT value FROM vault.secrets WHERE name = 'SUPABASE_SERVICE_ROLE_KEY'),
            'Apex-Secret', 'IRONMATCH_INTERNAL_PULSE_2026'
        ),
        body := jsonb_build_object(
            'user_id', NEW.recipient_id,
            'title', 'Training Invite! 🔥',
            'body', COALESCE(sender_name, 'Someone') || ' wants to hit a session with you.',
            'data', jsonb_build_object('type', 'invite', 'match_id', NEW.id)
        )
      );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for matches
DROP TRIGGER IF EXISTS tr_on_match_invite ON matches;
CREATE TRIGGER tr_on_match_invite
    AFTER INSERT ON matches
    FOR EACH ROW
    EXECUTE FUNCTION public.on_match_invite();
