const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

const brotherEmail = 'eric.sluis.1998@gmail.com';

async function run() {
    console.log('--- IronMatch Diagnostic: Account Check ---');
    console.log('Target Email:', brotherEmail);
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', brotherEmail);
    
    if (error) {
        console.error('Error searching profiles:', error);
    } else if (data && data.length > 0) {
        console.log('✅ SUCCESS: User found in profiles table!');
        console.log('Account Details:', {
            id: data[0].id,
            email: data[0].email,
            name: data[0].name,
            created_at: data[0].created_at
        });
    } else {
        console.log('❌ NOT FOUND: This account does not exist in the "profiles" table.');
        
        // List recent users to see who IS in there
        const { data: recent } = await supabase
            .from('profiles')
            .select('email')
            .limit(5);
        console.log('\nSample of actual users in DB:', recent.map(u => u.email));
    }

    process.exit(0);
}

run();
