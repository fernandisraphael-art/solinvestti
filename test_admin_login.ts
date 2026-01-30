
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAdmin() {
    const email = 'admin@solinvestti.com.br';
    const password = 'admin'; // Testing the hardcoded password

    console.log(`Attempting login for ${email}...`);

    // 1. Try Login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
    });

    if (loginData.session) {
        console.log('Login SUCCESS! User exists.');
        console.log('Token:', loginData.session.access_token.substring(0, 20) + '...');
        return;
    }

    console.log('Login failed:', loginError?.message);

    // 2. If User not found, Try Signup
    if (loginError?.message.includes('Invalid login credentials')) {
        console.log('User might not exist or wrong password. Trying SignUp...');

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    role: 'admin', // Metadata to identify admin
                    full_name: 'Administrador'
                }
            }
        });

        if (signUpData.user) {
            console.log('SignUp SUCCESS! User created.');
            if (signUpData.session) {
                console.log('Session active immediately.');
            } else {
                console.log('Confirmation email sent (likely).');
            }
        } else {
            console.error('SignUp failed:', signUpError?.message);
        }
    }
}

testAdmin();
