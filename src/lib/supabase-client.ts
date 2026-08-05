import { createClient } from '@supabase/supabase-js';

let _client: any = null;

/**
 * Gets a shared Supabase client instance for client-side use.
 * Lazily initialized to prevent build-time crashes if environment variables are missing.
 */
export const getSupabase = () => {
    if (_client) return _client;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
        return null;
    }

    _client = createClient(supabaseUrl, supabaseAnonKey);
    return _client;
};

/**
 * A proxy object that lazily initializes the Supabase client on the first property access.
 * This prevents "Invalid supabaseUrl" errors during Next.js static analysis/build time.
 */
export const supabase = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getSupabase();
        if (!client) {
            // Throw only if actually accessed during build without env vars
            throw new Error(`Supabase client is not initialized. Cannot access "${String(prop)}". Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.`);
        }
        return client[prop];
    }
});

