
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

// 1. Client for Anon Access
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey);

async function testRLS() {
    console.log('--- Testing RLS Access ---');

    // Test 1: Anonymous Read
    console.log('\n1. Testing Anonymous Read...');
    const { data: anonData, error: anonError } = await supabaseAnon
        .from('generators')
        .select('count', { count: 'exact', head: true });

    if (anonError) console.log('   [FAIL] Anon Read Error:', anonError.message);
    else console.log('   [SUCCESS] Anon Count:', anonData?.length === 0 ? 'Accessible (Count query might return null for head)' : 'Accessible');

    // Better count check
    const { count: anonCount, error: countErr } = await supabaseAnon
        .from('generators')
        .select('*', { count: 'exact', head: true });
    console.log('   [INFO] Anon Actual Count:', anonCount);


    // Test 2: Authenticated Admin Read
    console.log('\n2. Testing Admin Read (admin@solinvestti.com.br)...');

    // Sign in as admin
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: 'admin@solinvestti.com.br',
        password: 'admin123456'
    });

    if (authError || !authData.session) {
        console.log('   [FAIL] Admin Login Failed:', authError?.message);
    } else {
        const token = authData.session.access_token;
        console.log('   [INFO] Admin Logged In. Token snippet:', token.substring(0, 10));

        // Create Authenticated Client
        const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { count: authCount, error: authReadErr } = await supabaseAuth
            .from('generators')
            .select('*', { count: 'exact', head: true });

        if (authReadErr) console.log('   [FAIL] Admin Read Error:', authReadErr.message);
        else console.log('   [SUCCESS] Admin Actual Count:', authCount);
    }
}

testRLS();
