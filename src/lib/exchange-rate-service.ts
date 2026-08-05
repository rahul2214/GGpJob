import { supabaseAdmin } from './supabase-admin';

export interface ExchangeRates {
  [currency: string]: number;
}

// Memory fallback cache in case DB isn't migrated or fails
let memoryCache: { rates: ExchangeRates; fetchedAt: number } | null = null;

const DEFAULT_RATES: ExchangeRates = {
  USD: 1.0,
  INR: 86.0,
  EUR: 0.92,
  GBP: 0.78,
  CAD: 1.38,
  AUD: 1.52,
  JPY: 155.0,
  SGD: 1.34,
  AED: 3.67
};

const EXCHANGE_RATE_API = 'https://open.er-api.com/v6/latest/USD';

export async function getExchangeRates(): Promise<ExchangeRates> {
  const now = Date.now();
  const cacheDuration = 24 * 60 * 60 * 1000; // 24 hours

  // 1. Check memory cache first
  if (memoryCache && (now - memoryCache.fetchedAt < cacheDuration)) {
    return memoryCache.rates;
  }

  // 2. Try fetching from database cache table
  try {
    const { data, error } = await supabaseAdmin
      .from('exchange_rates')
      .select('rates, fetched_at')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data && data.rates) {
      const fetchedTime = new Date(data.fetched_at).getTime();
      
      // If cached DB rate is less than 24 hours old, return it & update memory cache
      if (now - fetchedTime < cacheDuration) {
        memoryCache = { rates: data.rates, fetchedAt: fetchedTime };
        return data.rates;
      }
    }
  } catch (dbErr) {
    console.warn('[EXCHANGE_RATE_SERVICE] Database lookup failed (table might not exist yet):', dbErr);
  }

  // 3. Try fetching from external API
  try {
    console.log('[EXCHANGE_RATE_SERVICE] Fetching fresh rates from API...');
    const res = await fetch(EXCHANGE_RATE_API, { next: { revalidate: 3600 } });
    if (res.ok) {
      const json = await res.json();
      if (json && json.rates) {
        const freshRates: ExchangeRates = json.rates;
        
        // Save to database cache table asynchronously
        try {
          await supabaseAdmin
            .from('exchange_rates')
            .insert([{ base_currency: 'USD', rates: freshRates, fetched_at: new Date().toISOString() }]);
        } catch (saveErr) {
          console.warn('[EXCHANGE_RATE_SERVICE] Failed to save fresh rates to database:', saveErr);
        }

        // Update memory cache
        memoryCache = { rates: freshRates, fetchedAt: now };
        return freshRates;
      }
    }
  } catch (apiErr) {
    console.error('[EXCHANGE_RATE_SERVICE] External API fetch failed:', apiErr);
  }

  // 4. Fallback to latest memory cache if external API failed
  if (memoryCache) {
    console.log('[EXCHANGE_RATE_SERVICE] Using stale memory cached rates.');
    return memoryCache.rates;
  }

  // 5. Try to fetch any record from DB as absolute fallback (even if older than 24h)
  try {
    const { data } = await supabaseAdmin
      .from('exchange_rates')
      .select('rates')
      .order('fetched_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data && data.rates) {
      return data.rates;
    }
  } catch (dbFallbackErr) {}

  // 6. Absolute hardcoded fallback
  console.log('[EXCHANGE_RATE_SERVICE] Using hardcoded default rates.');
  return DEFAULT_RATES;
}

export function convertUSD(amountUSD: number, targetCurrency: string, rates: ExchangeRates): number {
  const rate = rates[targetCurrency.toUpperCase()];
  if (!rate) return amountUSD;
  return amountUSD * rate;
}
