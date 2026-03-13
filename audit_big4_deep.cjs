const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- Deep Persistence Audit: Big 4 Serialization ---');
    
    const userId = 'e150e521-8058-42f9-aead-0a16a5c3f0ef'; // The test user from last run
    
    // 1. Get raw current state
    const { data: current, error: cErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (current) {
        console.log('Current Big 4 in DB:', current.big4);
        console.log('Type of Big 4:', typeof current.big4);
    }

    // 2. Try updating with explicit JSON string vs Object
    const testPayload = {
        big4: { bench: 250, squat: 350, deadlift: 450, ohp: 150 }
    };

    console.log('\nRetrying update with object payload...');
    const { error: uErr } = await supabase
        .from('profiles')
        .update(testPayload)
        .eq('id', userId);

    if (uErr) {
        console.error('Update failed:', uErr);
    } else {
        const { data: retrieved } = await supabase
            .from('profiles')
            .select('big4')
            .eq('id', userId)
            .single();
        console.log('Retrieved Big 4 (Object Payload):', retrieved.big4);
    }

    process.exit(0);
}

run();
