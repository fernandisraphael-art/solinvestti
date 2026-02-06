import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase credentials missing! Check your .env.local file.');
}

// Custom fetch with retry logic and optimized timeout
const customFetch = async (url: RequestInfo | URL, options?: RequestInit, retries = 2): Promise<Response> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout (reduced from 60s)

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error: any) {
        clearTimeout(timeoutId);

        // Retry logic for network errors (reduced to 2 retries)
        if (retries > 0 && (error.name === 'AbortError' || error.message?.includes('fetch'))) {
            console.warn(`[Supabase] Fetch failed, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 500 * (3 - retries))); // Faster backoff
            return customFetch(url, options, retries - 1);
        }
        throw error;
    }
};

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
            flowType: 'pkce',
        },
        global: {
            headers: {
                'x-client-info': 'solinvestti-web'
            },
            fetch: customFetch as any,
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
