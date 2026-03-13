const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- IronMatch Persistence Verification (Authenticated) ---');
    
    const email = `test_empire_${Date.now()}@ironmatch.app`;
    const password = 'StrongPassword123!';
    
    // 1. Sign Up
    console.log(`Signing up test user: ${email}...`);
    const { data: authData, error: aErr } = await supabase.auth.signUp({ email, password });
    if (aErr) {
        console.error('Sign up failed:', aErr);
        process.exit(1);
    }
    const userId = authData.user.id;

    // Wait for profile trigger to fire
    await new Promise(r => setTimeout(r, 2000));

    // 2. Test Persistence
    const testPayload = {
        big4: { bench: 225, squat: 315, deadlift: 405, ohp: 135 },
        unit_preference: 'kg',
        training_status: 'Testing Empire Foundations ⚔️',
        xp: 100
    };

    console.log(`Updating profile for ${userId}...`);
    const { error: uErr } = await supabase
        .from('profiles')
        .update(testPayload)
        .eq('id', userId);

    if (uErr) {
        console.error('Update failed:', uErr);
    } else {
        console.log('Retrieving updated profile...');
        const { data: profile, error: rErr } = await supabase
            .from('profiles')
            .select('big4, unit_preference, training_status, xp')
            .eq('id', userId)
            .single();

        if (profile) {
            const results = {
                big4: JSON.stringify(profile.big4) === JSON.stringify(testPayload.big4),
                unit: profile.unit_preference === testPayload.unit_preference,
                status: profile.training_status === testPayload.training_status,
                xp: profile.xp === testPayload.xp
            };
            
            console.log('Verification Results:');
            console.log(` - Big 4 Persistence: ${results.big4 ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(` - Unit Preference: ${results.unit ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(` - Training Status: ${results.status ? '✅ PASSED' : '❌ FAILED'}`);
            console.log(` - XP Persistence: ${results.xp ? '✅ PASSED' : '❌ FAILED'}`);
        } else {
            console.error('Retrieval failed:', rErr);
        }
    }

    process.exit(0);
}

run();
