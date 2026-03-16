import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

console.log("Apex Engagement Bot: Deployment Finalized");

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, apex-secret',
}

serve(async (req) => {
    try {
        // 1. Initial Checks
        if (req.method === 'OPTIONS') {
            return new Response('ok', { headers: corsHeaders })
        }

        const apexSecret = req.headers.get('Apex-Secret');
        if (apexSecret !== 'IRONMATCH_INTERNAL_PULSE_2026') {
            return new Response(JSON.stringify({ error: "Unauthorized Pulse" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

        if (!supabaseUrl || !supabaseServiceKey) {
            throw new Error('Supabase environment not ready.');
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const geminiKey = Deno.env.get('GEMINI_API_KEY');

        // 2. Fetch Elite Influencer with context
        const { data: influencers, error: infError } = await supabase
            .from('profiles')
            .select('id, name, home_gym, bio, discipline')
            .eq('is_founding_trainer', true);

        if (infError) throw infError;
        if (!influencers || influencers.length === 0) {
            return new Response(JSON.stringify({ status: "idle", message: "No trainers found" }), { status: 200 });
        }

        const influencer = influencers[Math.floor(Math.random() * influencers.length)];

        // 3. Generate Content (Gemini or Fallback)
        let content = "";
        
        if (geminiKey) {
            try {
                const prompt = `You are ${influencer.name}, a founding trainer for the IronMatch social media app (Instagram for gym). 
                Your discipline is: ${influencer.discipline || 'General Fitness'}. 
                Your bio says: "${influencer.bio || 'Hardcore training only.'}".
                Write a short, high-energy, motivational social media post (max 2 sentences) about your current workout. 
                Use relevant emojis. Do not use hashtags. Be raw and authentic.`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });

                const data = await response.json();
                content = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
            } catch (err) {
                console.error("Gemini Error, falling back:", err);
            }
        }

        if (!content) {
            const templates = [
                "No secrets, just iron. 🛡️",
                "Morning session done. Your turn. 🔥",
                "Empty gym, full focus. #IronMatch",
                "Late night grinds hit different. 🌙",
                "One rep at a time. Stay consistent. 📈"
            ];
            content = templates[Math.floor(Math.random() * templates.length)];
        }

        // 4. Record Pulse
        const { error: postError } = await supabase
            .from('posts')
            .insert({
                author_id: influencer.id,
                gym_id: influencer.home_gym || 'gym_1',
                content: content,
                media_type: 'image',
                is_auto_generated: true,
                spots_count: Math.floor(Math.random() * 50) + 20
            });

        if (postError) throw postError;

        return new Response(JSON.stringify({
            status: "success",
            influencer: influencer.name,
            post: content,
            ai_generated: !!geminiKey
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (err: any) {
        console.error("Bot Failure:", err.message);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
