const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- Influencer & Post Audit ---');
    
    // 1. Check all profiles that might be influencers
    const { data: influencers, error: iErr } = await supabase
        .from('profiles')
        .select('id, name, email');
    
    console.log('Total profiles:', influencers ? influencers.length : 0);
    
    // 2. Check posts and their authors
    const { data: posts, error: pErr } = await supabase
        .from('posts')
        .select('author_id, is_auto_generated')
        .order('created_at', { ascending: false })
        .limit(50);
        
    if (posts) {
        const uniqueAuthors = [...new Set(posts.map(p => p.author_id))];
        console.log('Unique authors in last 50 posts:', uniqueAuthors.length);
        
        const botPosts = posts.filter(p => p.is_auto_generated);
        const botAuthors = [...new Set(botPosts.map(p => p.author_id))];
        console.log('Unique bot authors:', botAuthors.length);
        console.log('Bot Author IDs:', botAuthors);
    }

    process.exit(0);
}

run();
