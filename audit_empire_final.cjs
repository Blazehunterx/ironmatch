const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- Empire Inspection: Definitive Audit ---');
    
    // 1. Column Verification
    const { data: profile, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .limit(1)
        .single();
    
    if (pErr) {
        console.error('Error fetching profile schema:', pErr);
    } else {
        const columns = Object.keys(profile);
        const required = ['big4', 'xp', 'unit_preference', 'is_training', 'training_status', 'last_active_at', 'is_founding_trainer'];
        console.log('Required Columns Audit:');
        required.forEach(col => {
            console.log(` - ${col}: ${columns.includes(col) ? '✅ FOUND' : '❌ MISSING'}`);
        });
    }

    // 2. Influencer Heartbeat Check
    const { data: influencers, error: iErr } = await supabase
        .from('profiles')
        .select('name')
        .eq('is_founding_trainer', true);
    
    console.log(`\nInfluencer Registry: ${influencers ? influencers.length : 0} / 14`);
    
    // 3. Persistence Simulation Test
    const testId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'; // Sofia Rossi
    const testPayload = {
        big4: { bench: 325, squat: 415, deadlift: 505, ohp: 195 },
        unit_preference: 'kg',
        training_status: 'Building the Empire 🏛️',
        is_training: true
    };
    
    console.log(`\nRunning Persistence Simulation for ${testId}...`);
    const { error: uErr } = await supabase
        .from('profiles')
        .update(testPayload)
        .eq('id', testId);
        
    if (uErr) {
        console.error('Persistence Update FAILED:', uErr);
    } else {
        const { data: retrieved, error: rErr } = await supabase
            .from('profiles')
            .select('big4, unit_preference, training_status, is_training')
            .eq('id', testId)
            .single();
            
        if (retrieved) {
            console.log('Persistence Retrieval Success:');
            console.log(' - Big 4:', JSON.stringify(retrieved.big4) === JSON.stringify(testPayload.big4) ? '✅ MATCH' : '❌ MISMATCH');
            console.log(' - Unit Pref:', retrieved.unit_preference === testPayload.unit_preference ? '✅ MATCH' : '❌ MISMATCH');
            console.log(' - Status:', retrieved.training_status === testPayload.training_status ? '✅ MATCH' : '❌ MISMATCH');
        } else {
            console.error('Persistence Retrieval FAILED:', rErr);
        }
    }

    process.exit(0);
}

run();
