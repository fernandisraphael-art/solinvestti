
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAuth() {
    console.log('Testing Supabase Connection...');
    const start = Date.now();

    try {
        // 1. Simple Read
        const { count, error: readError } = await supabase.from('generators').select('*', { count: 'exact', head: true });
        console.log(`Read Time: ${Date.now() - start}ms`);
        if (readError) console.error('Read Error:', readError.message);
        else console.log('Read Success. Count:', count);

        // 2. Auth Login
        console.log('\nTesting Auth Login (admin@solinvestti.com.br)...');
        const authStart = Date.now();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@solinvestti.com.br',
            password: 'admin123456'
        });
        console.log(`Auth Time: ${Date.now() - authStart}ms`);

        if (error) {
            console.error('Login Error:', error.message);
            if (error.message.includes('Invalid login credentials')) {
                console.log('Credentials invalid (User exists but wrong password, or user missing).');
            }
        } else {
            console.log('Login Success! Session Token:', data.session?.access_token?.substring(0, 15) + '...');
        }

    } catch (e: any) {
        console.error('Unexpected Error:', e.message);
    }
}

testAuth();
