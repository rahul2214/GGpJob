import { NextRequest, NextResponse } from 'next/server';
import { getExchangeRates } from '@/lib/exchange-rate-service';
import { getCurrencyForCountry } from '@/utils/currency';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Get geo header from Vercel
    const vercelCountry = request.headers.get('x-vercel-ip-country') || request.headers.get('x-country-code') || 'US';
    
    // 2. Fetch exchange rates
    const rates = await getExchangeRates();

    // 3. Resolve currency for detected country
    const detectedCurrency = getCurrencyForCountry(vercelCountry);

    return NextResponse.json({
      country: vercelCountry,
      currency: detectedCurrency,
      rates
    });
  } catch (error: any) {
    console.error('[API_CURRENCY_DETECT] Error:', error);
    return NextResponse.json({ error: 'Failed to detect currency' }, { status: 500 });
  }
}
