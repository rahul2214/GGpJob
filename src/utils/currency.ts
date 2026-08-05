// Reusable Country to Currency mapping
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  IN: 'INR',
  US: 'USD',
  GB: 'GBP',
  CA: 'CAD',
  AU: 'AUD',
  DE: 'EUR',
  FR: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  JP: 'JPY',
  SG: 'SGD',
  AE: 'AED',
  NZ: 'NZD',
  CH: 'CHF',
  HK: 'HKD',
  CN: 'CNY',
  BR: 'BRL',
  ZA: 'ZAR',
  MX: 'MXN'
};

// Map Currency to Locale for Intl.NumberFormat
export const CURRENCY_LOCALE_MAP: Record<string, string> = {
  INR: 'en-IN',
  USD: 'en-US',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  EUR: 'de-DE',
  JPY: 'ja-JP',
  SGD: 'en-SG',
  AED: 'ar-AE',
  NZD: 'en-NZ',
  CHF: 'de-CH',
  HKD: 'zh-HK',
  CNY: 'zh-CN',
  BRL: 'pt-BR',
  ZAR: 'en-ZA',
  MXN: 'es-MX'
};

// Supported Currencies List
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: '🇺🇸 USD ($)', flag: '🇺🇸' },
  { code: 'INR', symbol: '₹', label: '🇮🇳 INR (₹)', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', label: '🇪🇺 EUR (€)', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', label: '🇬🇧 GBP (£)', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', label: '🇨🇦 CAD (C$)', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', label: '🇦🇺 AUD (A$)', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', label: '🇯🇵 JPY (¥)', flag: '🇯🇵' },
  { code: 'AED', symbol: 'د.إ', label: '🇦🇪 AED (د.إ)', flag: '🇦🇪' },
];

export function getCurrencyForCountry(countryCode?: string): string {
  if (!countryCode) return 'USD';
  return COUNTRY_TO_CURRENCY[countryCode.toUpperCase()] || 'USD';
}

export function formatPrice(amount: number, currency: string): string {
  const code = currency.toUpperCase();
  const locale = CURRENCY_LOCALE_MAP[code] || 'en-US';

  // Ceiling round up to nearest whole number as requested (e.g. 0.3 -> 1, 0.54 -> 1)
  const roundedAmount = Math.ceil(amount);

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(roundedAmount);
}

export function convertPrice(amountUSD: number, targetCurrency: string, rates: Record<string, number>): number {
  const rate = rates[targetCurrency.toUpperCase()];
  if (!rate) return amountUSD;
  return amountUSD * rate;
}
