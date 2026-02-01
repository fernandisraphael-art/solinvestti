
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyData() {
    console.log('Verifying Generators...');

    const { data: generators, error } = await supabase
        .from('generators')
        .select('id, name, status, region, type');

    if (error) {
        console.error('Error fetching generators:', error);
        return;
    }

    console.log(`Found ${generators.length} generators.`);
    if (generators.length > 0) {
        console.table(generators);
    } else {
        console.log('No generators found.');
    }
}

verifyData();
