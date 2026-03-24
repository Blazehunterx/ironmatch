-- ═══ APEX BOT PULSE FIX (Robust Version) ═══
-- Run this in your Supabase SQL Editor to enable the Influencer Bot.

-- NOTE: After running this logic, you MUST DEPLOY the function via CLI:
-- npx supabase functions deploy engagement-bot --project-ref wltdrodvrvwfhkmodgde

DO $$
BEGIN
    -- 1. Unschedule old broken jobs if they exist, ignore errors if they don't
    BEGIN
        PERFORM cron.unschedule('apex-engagement-heartbeat');
    EXCEPTION WHEN OTHERS THEN 
        RAISE NOTICE 'Job apex-engagement-heartbeat not found, skipping...';
    END;

    BEGIN
        PERFORM cron.unschedule('apex-engagement-heartbeat-v2');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Job apex-engagement-heartbeat-v2 not found, skipping...';
    END;

    BEGIN
        PERFORM cron.unschedule('apex-engagement-heartbeat-v3');
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Job apex-engagement-heartbeat-v3 not found, skipping...';
    END;

    -- 2. Schedule the new corrected task
    -- IMPORTANT: Replace 'YOUR_SERVICE_ROLE_KEY_HERE' with your real service_role key
    -- You can find it in: Settings -> API -> service_role (secret)
    PERFORM cron.schedule(
        'apex-engagement-heartbeat-v3',
        '0 0,3,6,8,10,12,15,18,21,23 * * *', -- 10 specific times (peak engagement)
        $cron$
        SELECT
          net.http_post(
            url:='https://wltdrodvrvwfhkmodgde.supabase.co/functions/v1/engagement-bot',
            headers:='{
                "Content-Type": "application/json", 
                "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY_HERE",
                "Apex-Secret": "IRONMATCH_INTERNAL_PULSE_2026"
            }'::jsonb,
            body:='{}'::jsonb
          );
        $cron$
    );

    RAISE NOTICE 'Bot heartbeat v3 successfully scheduled.';
END $$;
