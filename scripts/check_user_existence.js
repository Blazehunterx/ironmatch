import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const brotherEmail = 'eric.sluis.1998@gmail.com';

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing ENV variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUser() {
    console.log('--- IronMatch Diagnostic: User Search ---');
    console.log('Searching for:', brotherEmail);
    
    // Check in profiles table
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, name, created_at')
        .ilike('email', brotherEmail.trim())
        .maybeSingle();
        
    if (profileError) {
        console.error('Database Error:', profileError.message);
    } else if (!profile) {
        console.error('❌ NOT FOUND: This email does not exist in the "profiles" table.');
        console.log('This suggests the account might have been created while the app was in MOCK mode (local browser only).');
    } else {
        console.log('✅ FOUND: User exists in database.');
        console.log('Details:', profile);
    }

    // List recent real users to verify connection
    const { data: recent, error: recentError } = await supabase
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (!recentError && recent) {
        console.log('\nRecent Successful Signups in DB:');
        recent.forEach(u => console.log(`- ${u.email} (${new Date(u.created_at).toLocaleDateString()})`));
    }
}

checkUser();
