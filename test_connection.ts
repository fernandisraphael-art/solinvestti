// Quick test to check Supabase connection
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || '';
const key = process.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Testing Supabase Connection...');
console.log('URL exists:', !!url);
console.log('Key exists:', !!key);

if (!url || !key) {
    console.error('❌ Missing environment variables!');
    console.log('VITE_SUPABASE_URL:', url ? 'SET' : 'MISSING');
    console.log('VITE_SUPABASE_ANON_KEY:', key ? 'SET' : 'MISSING');
    process.exit(1);
}

const supabase = createClient(url, key);

async function testConnection() {
    try {
        console.log('\n🔍 Testing generators table...');
        const { data: generators, error: genError } = await supabase
            .from('generators')
            .select('count');

        if (genError) {
            console.error('❌ Generators error:', genError.message);
        } else {
            console.log('✅ Generators count:', generators);
        }

        console.log('\n🔍 Testing clients table...');
        const { data: clients, error: clientError } = await supabase
            .from('clients')
            .select('count');

        if (clientError) {
            console.error('❌ Clients error:', clientError.message);
        } else {
            console.log('✅ Clients count:', clients);
        }

        console.log('\n🔍 Testing concessionaires table...');
        const { data: conc, error: concError } = await supabase
            .from('concessionaires')
            .select('count');

        if (concError) {
            console.error('❌ Concessionaires error:', concError.message);
        } else {
            console.log('✅ Concessionaires count:', conc);
        }

        console.log('\n✅ Connection test complete!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

testConnection();
