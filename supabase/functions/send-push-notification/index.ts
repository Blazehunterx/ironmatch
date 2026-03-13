import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { JWT } from "https://esm.sh/google-auth-library@9"

console.log("Imperial Pulse: Notification Engine Online");

serve(async (req) => {
    try {
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
        }

        const apexSecret = req.headers.get('Apex-Secret');
        if (apexSecret !== 'IRONMATCH_INTERNAL_PULSE_2026') {
             // We also accept Service Role Key for internal DB triggers
             const authHeader = req.headers.get('Authorization');
             if (!authHeader?.includes(Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')) {
                return new Response(JSON.stringify({ error: "Unauthorized Pulse" }), { status: 401 });
             }
        }

        const { user_id, title, body, data } = await req.json();

        if (!user_id || !title || !body) {
            throw new Error("Missing notification payload");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 1. Fetch Tokens
        const { data: tokens, error: tokenError } = await supabase
            .from('user_push_tokens')
            .select('token')
            .eq('user_id', user_id);

        if (tokenError) throw tokenError;
        if (!tokens || tokens.length === 0) {
            return new Response(JSON.stringify({ status: "skipped", message: "No tokens found for user" }), { status: 200 });
        }

        // 2. Auth with Firebase
        const fcmConfig = JSON.parse(Deno.env.get('FCM_SERVICE_ACCOUNT') || '{}');
        if (!fcmConfig.project_id) {
            throw new Error("FCM_SERVICE_ACCOUNT secret not configured");
        }

        const client = new JWT({
            email: fcmConfig.client_email,
            key: fcmConfig.private_key,
            scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
        });

        const tokenResponse = await client.authorize();
        const accessToken = tokenResponse.access_token;

        // 3. Send to each token
        const results = await Promise.all(tokens.map(async (t) => {
            try {
                const fcmRes = await fetch(`https://fcm.googleapis.com/v1/projects/${fcmConfig.project_id}/messages:send`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        message: {
                            token: t.token,
                            notification: { title, body },
                            data: data || {},
                            android: {
                                notification: {
                                    channel_id: "default",
                                    priority: "high",
                                    sound: "default"
                                }
                            }
                        }
                    })
                });
                return await fcmRes.json();
            } catch (e: any) {
                return { error: e.message };
            }
        }));

        return new Response(JSON.stringify({ status: "completed", results }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });

    } catch (err: any) {
        console.error("Pulse Engine Failure:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
})
