
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const influencers = [
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        email: 'sofia@ironmatch.ai',
        name: 'Sofia Rodriguez',
        bio: 'Elite Bodybuilder | Nutrition Coach | Building the next generation of athletes.',
        fitness_level: 'Professional',
        discipline: 'Bodybuilding',
        is_trainer: true,
        verification_status: 'verified',
        is_founding_trainer: true,
        profile_image_url: 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/sofia.png',
        home_gym: 'gym_1',
        home_gym_name: 'Iron Temple London'
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
        email: 'bella@ironmatch.ai',
        name: 'Bella "Big" Barnes',
        bio: 'Powerlifting World Record Holder. No excuses, just volume.',
        fitness_level: 'Professional',
        discipline: 'Powerlifting',
        is_trainer: true,
        verification_status: 'verified',
        is_founding_trainer: true,
        profile_image_url: 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/bella.png',
        home_gym: 'gym_1',
        home_gym_name: 'Iron Temple London'
    },
    {
        id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
        email: 'marco@ironmatch.ai',
        name: 'Marco Rossi',
        bio: 'Hybrid Athlete | Surf & Strength. Training for life.',
        fitness_level: 'Professional',
        discipline: 'General Fitness',
        is_trainer: true,
        verification_status: 'verified',
        is_founding_trainer: true,
        profile_image_url: 'https://raw.githubusercontent.com/Stackblitz/blazing-planetary/main/public/influencers/marco.png',
        home_gym: 'gym_2',
        home_gym_name: 'Muscle Beach Venice'
    }
];

async function seed() {
    console.log("Seeding influencers...");
    for (const influencer of influencers) {
        const { error } = await supabase.from('profiles').upsert(influencer);
        if (error) console.error(`Error seeding ${influencer.name}:`, error.message);
        else console.log(`Seeded ${influencer.name}`);
    }

    console.log("Seeding initial posts...");
    const posts = [
        {
            author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            gym_id: 'gym_1',
            content: 'Leg day volume check: 12,000lbs moved today. Consistency is the only secret.',
            spots_count: 145,
            created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            gym_id: 'gym_1',
            content: 'New PR! 405lb Squat for triples. The energy at Iron Temple is insane today.',
            spots_count: 230,
            created_at: new Date(Date.now() - 14400000).toISOString()
        },
        {
            author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            gym_id: 'gym_2',
            content: 'Beach workout completed. Hybrid training is about being ready for anything.',
            spots_count: 95,
            created_at: new Date(Date.now() - 21600000).toISOString()
        }
    ];

    const { error: postError } = await supabase.from('posts').insert(posts);
    if (postError) console.error("Error seeding posts:", postError.message);
    else console.log("Seeded initial posts.");

    console.log("Seeding follows...");
    const follows = [
        { follower_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', following_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' },
        { follower_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', following_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11' }
    ];

    for (const follow of follows) {
        const { error } = await supabase.from('follows').upsert(follow);
        if (error) console.error("Error seeding follow:", error.message);
    }
    console.log("Seeding complete!");
}

seed();
