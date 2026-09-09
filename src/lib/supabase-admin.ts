import { createClient } from '@supabase/supabase-js';

let _adminClient: any = null;

async function resilientFetch(input: any, init?: any, maxRetries = 2): Promise<Response> {
    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            return await fetch(input, {
                ...init,
                cache: 'no-store',
                keepalive: true,
            });
        } catch (err: any) {
            attempt++;
            const isTimeout =
                err?.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
                err?.code === 'UND_ERR_CONNECT_TIMEOUT' ||
                err?.code === 'ETIMEDOUT' ||
                err?.name === 'ConnectTimeoutError' ||
                err?.message?.includes('fetch failed');

            if (isTimeout && attempt <= maxRetries) {
                const targetUrl = typeof input === 'string' ? input : (input?.url || 'endpoint');
                console.warn(`[SUPABASE_FETCH_RETRY] Connection timeout on attempt ${attempt}/${maxRetries} to ${targetUrl}. Retrying...`);
                await new Promise((r) => setTimeout(r, 300 * attempt));
                continue;
            }
            throw err;
        }
    }
    throw new Error(`Supabase request failed after ${maxRetries} retries`);
}

/**
 * Gets a shared Supabase Admin client instance.
 * Lazily initialized to prevent build-time crashes if environment variables are missing.
 */
export const getSupabaseAdmin = () => {
    if (_adminClient) return _adminClient;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey || !supabaseUrl.startsWith('http')) {
        return null;
    }

    _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        },
        global: {
            fetch: resilientFetch
        }
    });

    return _adminClient;
};

/**
 * A proxy object that lazily initializes the Supabase Admin client on the first property access.
 * This prevents "Invalid supabaseUrl" errors during Next.js static analysis/build time.
 */
export const supabaseAdmin = new Proxy({} as any, {
    get: (target, prop) => {
        const client = getSupabaseAdmin();
        if (!client) {
            // During build/static analysis, this might be called. 
            // We throw a descriptive error only if it's actually used.
            throw new Error(`Supabase Admin client is not initialized. Cannot access "${String(prop)}". Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.`);
        }
        return client[prop];
    }
});

