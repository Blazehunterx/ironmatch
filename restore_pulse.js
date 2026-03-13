import { createClient } from '@supabase/supabase-js';

async function restorePulse() {
    console.log('--- RESTORING SOCIAL PULSE ---');
    const s = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

    const influencers = [
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', name: 'Sofia Rodriguez', gym: 'gym_1' },
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', name: 'Bella "Big" Barnes', gym: 'gym_1' },
        { id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', name: 'Marco Rossi', gym: 'gym_1' }
    ];

    const templates = [
        "Sweat today, smile tomorrow. ⚔️🔥",
        "The only bad workout is the one that didn't happen. #IronMatch",
        "Pushing limits at the IronMatch Arena. Who's with me? 🛡️",
        "Consistency is key. 100 days streak and counting. 📈",
        "Fueling up for a heavy leg day. Let's go! 🍖🏃‍♂️"
    ];

    for (const inf of influencers) {
        const content = templates[Math.floor(Math.random() * templates.length)];
        const { error } = await s.from('posts').insert({
            author_id: inf.id,
            gym_id: inf.gym,
            content: content,
            media_type: 'image',
            is_auto_generated: true,
            spots_count: Math.floor(Math.random() * 50) + 10
        });

        if (error) console.error(`Error for ${inf.name}:`, error.message);
        else console.log(`SUCCESS: Post created for ${inf.name}`);
    }
}

restorePulse();
