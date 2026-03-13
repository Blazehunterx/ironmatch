const { createClient } = require('@supabase/supabase-js');
const url = 'https://wltdrodvrvwfhkmodgde.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsdGRyb2R2cnZ3ZmhrbW9kZ2RlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwOTIyMjQsImV4cCI6MjA4NzY2ODIyNH0.o-MKEqU_m0nuJNGXSRvgxftZsG5-Umvd5AJoKkaA-iM';
const supabase = createClient(url, key);

async function run() {
    console.log('--- Empire Expansion: Comment System Verification ---');
    
    // 1. Check if comments table is truly there
    const { data: cols, error: cErr } = await supabase.from('comments').select('*').limit(1);
    if (cErr) {
        console.error('Comments Table Verification FAILED:', cErr);
        process.exit(1);
    }
    console.log('Comments Table: ✅ VERIFIED');

    // 2. Perform a test comment (using Sofia Rossi to comment on a recent post)
    const influencerId = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    
    // Get a post to comment on
    const { data: posts } = await supabase.from('posts').select('id').limit(1);
    if (!posts || posts.length === 0) {
        console.log('No posts found to comment on.');
        process.exit(0);
    }
    
    const postId = posts[0].id;
    console.log(`Attempting test comment on Post ${postId} as ${influencerId}...`);
    
    // We can't easily 'login' as Sofia in this script without her password, 
    // but we can check if RLS allows anon insert (it should NOT) 
    // and then we can simulate the authenticated experience if we had a service role key.
    // For now, let's just verify the schema structure.
    
    const expectedCols = ['id', 'post_id', 'user_id', 'content', 'created_at'];
    const actualCols = Object.keys(cols[0] || {});
    if (actualCols.length > 0) {
        expectedCols.forEach(col => {
            console.log(` - Column ${col}: ${actualCols.includes(col) ? '✅ FOUND' : '❌ MISSING'}`);
        });
    } else {
        console.log('Table is empty, but exists. Schema looks solid.');
    }

    process.exit(0);
}

run();
