const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- IronMatch Schema Audit ---');
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
    
    if (error) {
        console.error('Error fetching profiles:', error);
    } else if (data && data.length > 0) {
        console.log('Columns found in profiles:', Object.keys(data[0]).join(', '));
    } else {
        console.log('No data found in profiles table.');
    }

    process.exit(0);
}

run();
