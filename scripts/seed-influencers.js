
import { createClient } from '@supabase/supabase-js';

// Environment variables should be passed via CLI/Process
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
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
        profile_image_url: '/influencers/sofia.png',
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
        profile_image_url: '/influencers/bella.png',
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
        profile_image_url: '/influencers/marco.png',
        home_gym: 'gym_2',
        home_gym_name: 'Muscle Beach Venice'
    },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', email: 'li_wei@ironmatch.ai', name: 'Li Wei', bio: 'Calisthenics master. Gravity is just a suggestion.', fitness_level: 'Professional', discipline: 'Calisthenics', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/liwi.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', email: 'chloe@ironmatch.ai', name: 'Chloe', bio: 'Pilates and mobility expert. Movement is medicine.', fitness_level: 'Professional', discipline: 'Pilates', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/chloe.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', email: 'yara@ironmatch.ai', name: 'Yara', bio: 'Boxing and HIIT. Speed, power, and precision.', fitness_level: 'Professional', discipline: 'Boxing', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/yara.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a17', email: 'da_silva@ironmatch.ai', name: 'Mateo Da Silva', bio: 'Strength coach. Power to the people.', fitness_level: 'Professional', discipline: 'Strength', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/da_silva.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a18', email: 'sara@ironmatch.ai', name: 'Sara Lind', bio: 'Endurance athlete. Run forever.', fitness_level: 'Professional', discipline: 'Running', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/sara.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a19', email: 'priya@ironmatch.ai', name: 'Priya Sharma', bio: 'Yoga and mindfulness. Balance is key.', fitness_level: 'Professional', discipline: 'Yoga', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/priya.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a20', email: 'kenji@ironmatch.ai', name: 'Kenji Sato', bio: 'Martial arts and conditioning.', fitness_level: 'Professional', discipline: 'Martial Arts', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/kenji.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a21', email: 'lucia@ironmatch.ai', name: 'Lucia Mendes', bio: 'CrossFit specialist. Ready for any challenge.', fitness_level: 'Professional', discipline: 'Functional', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/lucia.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', email: 'imani@ironmatch.ai', name: 'Aaliyah Jones', bio: 'Sprint and agility coach.', fitness_level: 'Professional', discipline: 'Sprints', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/aaliyah.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a23', email: 'omar@ironmatch.ai', name: 'Omar Haddad', bio: 'Kettlebell expert. Old school strength.', fitness_level: 'Professional', discipline: 'Kettlebell', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/omar.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a24', email: 'zara@ironmatch.ai', name: 'Zara Chen', bio: 'Dance and fitness fusion.', fitness_level: 'Professional', discipline: 'Dance', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/zara.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a25', email: 'fiona@ironmatch.ai', name: 'Elena Moretti', bio: 'Mediterranean lifestyle and fitness.', fitness_level: 'Professional', discipline: 'Lifestyle', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/elena.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a26', email: 'mei_lin@ironmatch.ai', name: 'Mei Lin', bio: 'Tech-driven fitness performance.', fitness_level: 'Professional', discipline: 'Tech-Fit', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/mei_lin.png' },
    { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a27', email: 'amina@ironmatch.ai', name: 'Kimberly Styles', bio: 'Fashion and fitness influencer.', fitness_level: 'Professional', discipline: 'Fashion-Fit', is_trainer: true, verification_status: 'verified', profile_image_url: '/influencers/kimberly.png' }
];

async function seed() {
    console.log("Seeding influencers...");
    let hasError = false;

    for (const influencer of influencers) {
        const { error } = await supabase.from('profiles').upsert(influencer);
        if (error) {
            console.error(`Error seeding ${influencer.name}: ${error.message}`);
            hasError = true;
        } else {
            console.log(`Seeded ${influencer.name}`);
        }
    }

    if (hasError) {
        console.error("Influencer seeding encountered errors. Aborting post seeding.");
        process.exit(1);
    }

    console.log("Seeding initial posts...");
    const posts = [
        {
            author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
            gym_id: 'gym_1',
            content: 'Leg day volume check: 12,000lbs moved today. Consistency is the only secret.',
            media_type: 'image',
            spots_count: 145,
            created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
            author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
            gym_id: 'gym_1',
            content: 'New PR! 405lb Squat for triples. The energy at Iron Temple is insane today.',
            media_type: 'image',
            spots_count: 230,
            created_at: new Date(Date.now() - 14400000).toISOString()
        },
        {
            author_id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
            gym_id: 'gym_2',
            content: 'Beach workout completed. Hybrid training is about being ready for anything.',
            media_type: 'image',
            spots_count: 95,
            created_at: new Date(Date.now() - 21600000).toISOString()
        }
    ];

    const { error: postError } = await supabase.from('posts').insert(posts);
    if (postError) {
        console.error(`Error seeding posts: ${postError.message}`);
        process.exit(1);
    } else {
        console.log("Seeded initial posts.");
    }

    console.log("Seeding complete!");
}

seed();
