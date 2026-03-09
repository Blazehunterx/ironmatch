-- ═══ APEX BOT SCHEDULER: THE HEARTBEAT ═══
-- Description: Sets up pg_cron to trigger the engagement bot every 2.4 hours (10x per day).

-- 1. Enable pg_cron (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Schedule the bot
-- Note: Replace 'YOUR_PROJECT_REF' and 'YOUR_ANON_KEY' with your actual values if running manually.
-- However, inside Supabase, we can use net/http to trigger the function.

SELECT cron.schedule(
    'apex-engagement-heartbeat', -- unique name
    '0 */2 * * *',               -- every 2 hours (approx 12x day)
    $$
    SELECT
      net.http_post(
        url:='https://wltdrodvrvwfhkmodgde.supabase.co/functions/v1/engagement-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
      );
    $$
);

-- 3. Adjust the timing to exactly 10x per day if needed
-- '0 */2 * * *' provides 12 runs. To get exactly 10, we'd use a more complex cron like:
-- '0 0,2,5,8,10,13,16,18,21,23 * * *' (roughly spaced for peak times)

SELECT cron.unschedule('apex-engagement-heartbeat');

SELECT cron.schedule(
    'apex-engagement-heartbeat-v2',
    '0 0,3,6,8,10,12,15,18,21,23 * * *', -- 10 specific times (optimized for humans)
    $$
    SELECT
      net.http_post(
        url:='https://wltdrodvrvwfhkmodgde.supabase.co/functions/v1/engagement-bot',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
        body:='{}'::jsonb
      );
    $$
);
