
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load env from .env.local manually since we are running in node
const envPath = path.resolve(process.cwd(), '.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.VITE_SUPABASE_URL;
const supabaseKey = envConfig.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const candidates = [
    { email: 'admin@solinvestti.com.br', pass: 'admin123456' },
    { email: 'admin@solinvestti.com.br', pass: 'R@phael1' },
    { email: 'raphael@solinvestti.com.br', pass: 'R@phael1' },
    { email: 'raphael@solinvestti.com.br', pass: 'admin123456' }
];

async function checkData() {
    console.log('--- STARTING ACCOUNT DISCOVERY ---');

    for (const cred of candidates) {
        console.log(`Trying ${cred.email} with password ending in ...${cred.pass.slice(-3)}`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email: cred.email,
            password: cred.pass
        });

        if (data?.session) {
            console.log(`✅ LOGIN SUCCESS: ${cred.email}`);

            // Now check if this user can see data
            const { count, error: countErr } = await supabase.from('generators').select('*', { count: 'exact', head: true });

            if (count !== null && count > 0) {
                console.log(`🎉 DATA FOUND! matches: ${count} generators.`);
                console.log('THIS IS THE CORRECT ACCOUNT.');
                process.exit(0);
            } else {
                console.log(`❌ Logged in, but NO DATA visible (count: ${count}). Wrong account?`);
            }

            await supabase.auth.signOut();
        } else {
            console.log(`Login failed: ${error?.message}`);
        }
    }
    console.log('--- DONE ---');
}

checkData();
