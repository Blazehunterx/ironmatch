const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- Empire Inspection: Final Verification ---');
    
    // 1. Verify Influencer Fleet
    const { data: influencers, error: iErr } = await supabase
        .from('profiles')
        .select('name, is_founding_trainer, verification_status')
        .eq('is_founding_trainer', true);
    
    console.log(`Influencer Count (Founding Trainers): ${influencers ? influencers.length : 0} / 14`);
    if (influencers) {
        influencers.forEach(i => console.log(` - ${i.name} [${i.verification_status}]`));
    }

    // 2. Test Persistence Simulation (Using a dummy influencer ID for testing)
    const testId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Sofia Rossi
    const testData = { bench: 315, squat: 405, deadlift: 500, ohp: 185 };
    
    console.log(`\nTesting Big 4 Persistence for ${testId}...`);
    const { error: uErr } = await supabase
        .from('profiles')
        .update({ big4: testData })
        .eq('id', testId);
        
    if (uErr) {
        console.error('Persistence Test FAILED:', uErr);
    } else {
        const { data: updated, error: rErr } = await supabase
            .from('profiles')
            .select('big4')
            .eq('id', testId)
            .single();
            
        if (updated && JSON.stringify(updated.big4) === JSON.stringify(testData)) {
            console.log('Persistence Test PASSED: Data saved and retrieved correctly.');
        } else {
            console.error('Persistence Test FAILED: Data mismatch or read error.', rErr);
        }
    }

    // 3. Verify Feed Activity
    const { data: posts, error: pErr } = await supabase
        .from('posts')
        .select('author_id, is_auto_generated')
        .eq('is_auto_generated', true);
        
    console.log(`\nTotal Auto-Generated Posts: ${posts ? posts.length : 0}`);
    if (posts) {
        const uniqueAuthors = [...new Set(posts.map(p => p.author_id))];
        console.log(`Unique Influencer Authors Posting: ${uniqueAuthors.length}`);
    }

    process.exit(0);
}

run();
