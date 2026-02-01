
import { createClient } from '@supabase/supabase-js';

// Keys from .env.local (copied manually since process.env might fail in some environments without dotenv)
const SUPABASE_URL = "https://fsmbeutvsxjlctthvmas.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzbWJldXR2c3hqbGN0dGh2bWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjExNDYsImV4cCI6MjA4MzUzNzE0Nn0.nNHz81E8AXAFKr_e-I8FaABTM12R3E6OutlxmgqbM5k";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function diagnose() {
    console.log("--- DIAGNOSTIC START ---");

    // 1. Test Connection / Public Read
    console.log("1. Testing Connection (Read admin_secrets)...");
    const start = Date.now();
    try {
        const { data, error } = await supabase.from('admin_secrets').select('*').limit(1);
        const duration = Date.now() - start;
        if (error) {
            console.error("   [FAIL] Read Error:", error.message);
        } else {
            console.log(`   [PASS] Connection OK (${duration}ms). Rows found:`, data?.length);
            if (data && data.length > 0) console.log("   Data sample:", data[0]);
        }
    } catch (e) {
        console.error("   [FAIL] Exception:", e);
    }

    // 2. Test Auth (Login as Admin)
    console.log("\n2. Testing Admin Login (admin@solinvestti.com.br)...");
    try {
        // Try the backup credentials first as they are most likely to work if primary is bricked
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'admin@solinvestti.com.br',
            password: 'admin123456'
        });

        if (error) {
            console.error("   [FAIL] Login Error:", error.message);

            // Try Backup
            console.log("   -> Trying Backup (suporte@solinvestti.com.br)...");
            const { data: backupData, error: backupError } = await supabase.auth.signInWithPassword({
                email: 'suporte@solinvestti.com.br',
                password: 'admin123456'
            });

            if (backupError) {
                console.error("   [FAIL] Backup Login Error:", backupError.message);
            } else {
                console.log("   [PASS] Backup Login Success!");
            }
        } else {
            console.log("   [PASS] Admin Login Success!");
        }
    } catch (e) {
        console.error("   [FAIL] Auth Exception:", e);
    }

    console.log("\n--- DIAGNOSTIC END ---");
}

diagnose();
