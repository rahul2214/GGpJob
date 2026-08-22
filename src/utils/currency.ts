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

// Supported Currencies List (matching public.currencies table)
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: '🇺🇸 USD ($)', flag: '🇺🇸' },
  { code: 'INR', symbol: '₹', label: '🇮🇳 INR (₹)', flag: '🇮🇳' },
  { code: 'EUR', symbol: '€', label: '🇪🇺 EUR (€)', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', label: '🇬🇧 GBP (£)', flag: '🇬🇧' },
  { code: 'CAD', symbol: 'C$', label: '🇨🇦 CAD (C$)', flag: '🇨🇦' },
  { code: 'AUD', symbol: 'A$', label: '🇦🇺 AUD (A$)', flag: '🇦🇺' },
  { code: 'JPY', symbol: '¥', label: '🇯🇵 JPY (¥)', flag: '🇯🇵' },
  { code: 'SGD', symbol: 'S$', label: '🇸🇬 SGD (S$)', flag: '🇸🇬' },
  { code: 'AED', symbol: 'د.إ', label: '🇦🇪 AED (د.إ)', flag: '🇦🇪' },
  { code: 'CNY', symbol: '¥', label: '🇨🇳 CNY (¥)', flag: '🇨🇳' },
  { code: 'CHF', symbol: 'Fr', label: '🇨🇭 CHF (Fr)', flag: '🇨🇭' },
  { code: 'SAR', symbol: '﷼', label: '🇸🇦 SAR (﷼)', flag: '🇸🇦' },
  { code: 'HKD', symbol: '$', label: '🇭🇰 HKD ($)', flag: '🇭🇰' },
  { code: 'NZD', symbol: '$', label: '🇳🇿 NZD ($)', flag: '🇳🇿' },
  { code: 'SEK', symbol: 'kr', label: '🇸🇪 SEK (kr)', flag: '🇸🇪' },
  { code: 'NOK', symbol: 'kr', label: '🇳🇴 NOK (kr)', flag: '🇳🇴' },
  { code: 'DKK', symbol: 'kr', label: '🇩🇰 DKK (kr)', flag: '🇩🇰' },
  { code: 'ZAR', symbol: 'R', label: '🇿🇦 ZAR (R)', flag: '🇿🇦' },
  { code: 'BRL', symbol: 'R$', label: '🇧🇷 BRL (R$)', flag: '🇧🇷' },
  { code: 'MXN', symbol: '$', label: '🇲🇽 MXN ($)', flag: '🇲🇽' },
  { code: 'KRW', symbol: '₩', label: '🇰🇷 KRW (₩)', flag: '🇰🇷' },
  { code: 'MYR', symbol: 'RM', label: '🇲🇾 MYR (RM)', flag: '🇲🇾' },
  { code: 'THB', symbol: '฿', label: '🇹🇭 THB (฿)', flag: '🇹🇭' },
  { code: 'PHP', symbol: '₱', label: '🇵🇭 PHP (₱)', flag: '🇵🇭' },
  { code: 'VND', symbol: '₫', label: '🇻🇳 VND (₫)', flag: '🇻🇳' },
  { code: 'PKR', symbol: '₨', label: '🇵🇰 PKR (₨)', flag: '🇵🇰' },
  { code: 'BDT', symbol: '৳', label: '🇧🇩 BDT (৳)', flag: '🇧🇩' },
  { code: 'LKR', symbol: 'Rs', label: '🇱🇰 LKR (Rs)', flag: '🇱🇰' },
  { code: 'EGP', symbol: 'E£', label: '🇪🇬 EGP (E£)', flag: '🇪🇬' },
  { code: 'NGN', symbol: '₦', label: '🇳🇬 NGN (₦)', flag: '🇳🇬' },
  { code: 'KES', symbol: 'KSh', label: '🇰🇪 KES (KSh)', flag: '🇰🇪' },
  { code: 'ILS', symbol: '₪', label: '🇮🇱 ILS (₪)', flag: '🇮🇱' },
  { code: 'TRY', symbol: '₺', label: '🇹🇷 TRY (₺)', flag: '🇹🇷' },
  { code: 'RUB', symbol: '₽', label: '🇷🇺 RUB (₽)', flag: '🇷🇺' },
  { code: 'PLN', symbol: 'zł', label: '🇵🇱 PLN (zł)', flag: '🇵🇱' },
  { code: 'KWD', symbol: 'د.ك', label: '🇰🇼 KWD (د.ك)', flag: '🇰🇼' },
  { code: 'QAR', symbol: '﷼', label: '🇶🇦 QAR (﷼)', flag: '🇶🇦' },
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
