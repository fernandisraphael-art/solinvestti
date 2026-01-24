import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing! Check your .env.local file.');
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
        },
        global: {
            headers: {
                'x-client-info': 'solinvestti-web'
            },
        },
        db: {
            schema: 'public'
        },
        realtime: {
            params: {
                eventsPerSecond: 10
            }
        }
    })
    : null as any;
