const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const INFLUENCER_POSTS = [
    { content: "Morning cardio done! 🏃‍♀️ Who's hitting the gym today?", type: 'image' },
    { content: "New PB on Bench Press! 225lbs feeling light. 💎 #FoundingTrainer", type: 'image' },
    { content: "Form check on these squats. What do you think? 🏋️‍♀️", type: 'video' },
    { content: "Fueling up for a heavy leg day. Discipline > Motivation. 🥗", type: 'image' },
    { content: "Iron Harvest volume record today: 4,500lbs. Who's challenging my gym? ⚔️", type: 'image' }
];

async function postAsInfluencer() {
    // 1. Get all AI influencers
    const { data: influencers } = await supabase
        .from('profiles')
        .select('id, home_gym')
        .eq('verification_status', 'verified')
        .eq('is_trainer', true);

    if (!influencers || influencers.length === 0) return;

    // 2. Pick a random influencer
    const influencer = influencers[Math.floor(Math.random() * influencers.length)];

    // 3. Pick a random post template
    const template = INFLUENCER_POSTS[Math.floor(Math.random() * INFLUENCER_POSTS.length)];

    // 4. Create the post
    const { data, error } = await supabase
        .from('posts')
        .insert([{
            author_id: influencer.id,
            gym_id: influencer.home_gym,
            content: template.content,
            media_type: template.type,
            spots_count: Math.floor(Math.random() * 50) + 10 // Start with some "social proof"
        }]);

    if (error) console.error('Error posting:', error);
    else console.log(`Post created for influencer ${influencer.id}`);
}

// In production, this would be a Cron job or Supabase Edge Function
postAsInfluencer();
