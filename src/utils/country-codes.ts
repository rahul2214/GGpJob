export interface CountryCodeOption {
  code: string;
  dial_code: string;
  flag: string;
  name: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: "IN", dial_code: "+91", flag: "🇮🇳", name: "India" },
  { code: "US", dial_code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "GB", dial_code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "CA", dial_code: "+1", flag: "🇨🇦", name: "Canada" },
  { code: "AU", dial_code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "SG", dial_code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "AE", dial_code: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "DE", dial_code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "FR", dial_code: "+33", flag: "🇫🇷", name: "France" },
  { code: "NL", dial_code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "IE", dial_code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "NZ", dial_code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "ZA", dial_code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "JP", dial_code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "KR", dial_code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "BR", dial_code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "MX", dial_code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "ES", dial_code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "IT", dial_code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "CH", dial_code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "SE", dial_code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "NO", dial_code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "DK", dial_code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "FI", dial_code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "PL", dial_code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "IL", dial_code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "SA", dial_code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
];

export function parsePhoneNumber(fullPhone?: string | null): { countryCode: string; phoneDigits: string } {
  if (!fullPhone) return { countryCode: "+91", phoneDigits: "" };

  const cleanPhone = fullPhone.trim();
  
  // Sort dial codes by length descending so longer ones match first
  const sortedCodes = [...COUNTRY_CODES].sort((a, b) => b.dial_code.length - a.dial_code.length);
  const matched = sortedCodes.find(c => cleanPhone.startsWith(c.dial_code));

  if (matched) {
    return {
      countryCode: matched.dial_code,
      phoneDigits: cleanPhone.slice(matched.dial_code.length).replace(/\D/g, "")
    };
  }

  if (cleanPhone.startsWith("+")) {
    const match = cleanPhone.match(/^(\+\d{1,4})(\d+)$/);
    if (match) {
      return { countryCode: match[1], phoneDigits: match[2] };
    }
  }

  return { countryCode: "+91", phoneDigits: cleanPhone.replace(/\D/g, "") };
}
