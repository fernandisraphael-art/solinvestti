// Quick script to check if clients exist in Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fsmbeutvsxjlctthvmas.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWJldXR2c3hqbGN0dGh2bWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjExNDYsImV4cCI6MjA4MzUzNzE0Nn0.nNHz81E8AXAFKr_e-I8FaABTM12R3E6OutlxmgqbM5k';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkClients() {
    console.log('Checking clients in Supabase...');

    const { data, error } = await supabase
        .from('clients')
        .select('*');

    if (error) {
        console.error('Error fetching clients:', error);
        return;
    }

    console.log(`Found ${data?.length || 0} clients:`);
    console.log(data);
}

checkClients();
