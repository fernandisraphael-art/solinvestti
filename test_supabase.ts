
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase credentials.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    console.log('Testing Supabase connection...');
    try {
        const { data, error } = await supabase.from('generators').select('*');
        if (error) {
            console.error('Error fetching generators:', error.message);
        } else {
            console.log(`Success! Found ${data.length} generators.`);
            console.log('First generator:', data[0]);
        }
    } catch (err: any) {
        console.error('Unexpected error:', err.message);
    }
}

testConnection();
