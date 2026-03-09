import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Apex Engagement Bot: Deployment Finalized");

serve(async (req) => {
    try {
        // 1. Initial Checks
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase environment not ready.');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // 2. Fetch Elite Influencer
        const { data: influencers, error: infError } = await supabase
            .from('profiles')
            .select('id, name, home_gym')
            .eq('is_founding_trainer', true);

        if (infError) throw infError;
        if (!influencers || influencers.length === 0) {
            return new Response(JSON.stringify({ status: "idle", message: "No trainers found" }), { status: 200 });
        }

        const influencer = influencers[Math.floor(Math.random() * influencers.length)];

        // 3. Post Content
        const templates = [
            "No secrets, just iron. 🛡️",
            "Morning session done. Your turn. 🔥",
            "Empty gym, full focus. #IronMatch",
            "Late night grinds hit different. 🌙",
            "One rep at a time. Stay consistent. 📈"
        ];

        const content = templates[Math.floor(Math.random() * templates.length)];

        // 4. Record Pulse
        const { error: postError } = await supabase
            .from('posts')
            .insert({
                author_id: influencer.id,
                gym_id: influencer.home_gym || 'gym_1',
                content: content,
                media_type: 'image',
                is_auto_generated: true,
                spots_count: Math.floor(Math.random() * 50) + 10
            });

        if (postError) throw postError;

        return new Response(JSON.stringify({
            status: "success",
            influencer: influencer.name,
            post: content
        }), {
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        })

    } catch (err: any) {
        console.error("Bot Failure:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
        })
    }
})
