
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        const sql = fs.readFileSync('c:/Users/marvi/.gemini/antigravity/playground/blazing-planetary/supabase/apply_fixes_social.sql', 'utf8');

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.log("Migration RPC failed (expected if exec_sql is missing):", error.message);
            console.log("\n--- PLEASE RUN THIS SQL IN SUPABASE DASHBOARD ---\n");
            console.log(sql);
            console.log("\n-------------------------------------------------\n");
            process.exit(1);
        } else {
            console.log("Migration successful.");
        }
    } catch (e) {
        console.error("Script execution error:", e.message);
    }
}

run();
