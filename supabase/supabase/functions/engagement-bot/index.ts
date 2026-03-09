
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const BUTTON_SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const BUTTON_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(BUTTON_SUPABASE_URL, BUTTON_SERVICE_ROLE_KEY);

const INFLUENCERS = [
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Sofia Rodriguez' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Bella Barnes' },
  { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Marco Rossi' },
  // Add other IDs here if known, or fetch them dynamically
];

const TEMPLATES = [
  "Just finished a massive session at Iron Temple. Volume is the name of the game today! 🏋️‍♀️",
  "Consistency over everything. Don't look at the scale, look at the effort. #IronMatch",
  "New PR on the deadlift today! 405lbs for reps. The community here keeps me going.",
  "Morning mobility is the secret to longevity. Don't skip your warm-ups!",
  "Who's joining me for the weekend HIIT showdown? Let's burn some calories together.",
  "Progress isn't linear. Some days you're the hammer, some days the nail. Stay the course."
];

Deno.serve(async (req) => {
  try {
    // Randomly select an influencer
    const influencer = INFLUENCERS[Math.floor(Math.random() * INFLUENCERS.length)];
    const content = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)];

    console.log(`Generating post for ${influencer.name}...`);

    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: influencer.id,
        content: content,
        gym_id: 'gym_1', // Default to a common gym for global visibility
        media_type: 'image',
        spots_count: Math.floor(Math.random() * 50) + 10,
        created_at: new Date().toISOString()
      })
      .select();

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: "Post generated successfully", post: data[0] }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
