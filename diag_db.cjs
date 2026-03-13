const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- IronMatch Diagnostic ---');
    
    // 1. Check Influencers
    const { data: influencers, error: iErr } = await supabase
        .from('profiles')
        .select('id, username')
        .eq('role', 'influencer');
    
    console.log('Influencers found:', influencers ? influencers.length : 0);
    if (influencers) console.log('Usernames:', influencers.map(i => i.username).join(', '));
    if (iErr) console.error('Influencer Error:', iErr);

    // 2. Check Recent Posts
    const { data: posts, error: pErr } = await supabase
        .from('posts')
        .select('id, created_at, author_id, is_auto_generated')
        .order('created_at', { ascending: false })
        .limit(20);
    
    console.log('\nRecent Posts (last 20):');
    if (posts) {
        posts.forEach(p => console.log(`- ${p.created_at} | Bot: ${p.is_auto_generated} | Author: ${p.author_id}`));
    }
    if (pErr) console.error('Post Error:', pErr);

    process.exit(0);
}

run();
