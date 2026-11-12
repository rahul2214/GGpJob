/**
 * Job salary units.
 *
 * `jobs.salary_min_usd_cents` / `salary_max_usd_cents` hold WHOLE units of the
 * job's own currency (`currency_id`), e.g. 198000 for $198,000 or 5100000 for
 * ₹51,00,000 — despite the legacy column names, which promise neither USD nor
 * cents. The job form, jobs API, job pages and Google JobPosting markup all
 * read them that way.
 *
 * A batch of imported jobs was once written in cents, which showed
 * "$19,800,000" on job pages and in Google Jobs. `salaryUnitError` rejects
 * that shape at write time so it cannot happen again.
 */

/**
 * Currencies in which an annual salary of 1,000,000 or more is not a realistic
 * job listing, so such a value is almost certainly cents. High-denomination
 * currencies (INR, JPY, KRW, IDR, ...) are deliberately absent.
 */
const CENTS_SUSPECT_CURRENCIES = new Set(['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'NZD', 'SGD', 'CHF']);
const MAX_PLAUSIBLE_ANNUAL = 1_000_000;

export function toSalaryNumber(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}

/** Returns a user-facing error when the amounts look wrong, else null. */
export function salaryUnitError(min: unknown, max: unknown, currencyCode?: string | null): string | null {
  const lo = toSalaryNumber(min);
  const hi = toSalaryNumber(max);
  if ((lo !== null && lo < 0) || (hi !== null && hi < 0)) return 'Salary cannot be negative.';
  if (lo !== null && hi !== null && hi > 0 && hi < lo) return 'Maximum salary must be greater than or equal to minimum salary.';

  const code = (currencyCode || '').toUpperCase();
  if (CENTS_SUSPECT_CURRENCIES.has(code) && Math.max(lo ?? 0, hi ?? 0) >= MAX_PLAUSIBLE_ANNUAL) {
    return `Salary looks too large for an annual ${code} amount. Enter whole ${code} per year (e.g. 120000), not cents.`;
  }
  return null;
}

/** "USD 120,000 – 150,000"-style range for emails and plain text. */
export function formatSalaryRange(min: unknown, max: unknown, currencyCode?: string | null): string | null {
  const lo = toSalaryNumber(min);
  const hi = toSalaryNumber(max);
  if (!lo && !hi) return null;
  const code = (currencyCode || 'USD').toUpperCase();
  const fmt = (n: number) => {
    try {
      return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: code,
        maximumFractionDigits: 0,
      }).format(n);
    } catch {
      return `${code} ${Math.round(n).toLocaleString('en-US')}`;
    }
  };
  if (lo && hi && hi > lo) return `${fmt(lo)} – ${fmt(hi)}`;
  if (lo) return `From ${fmt(lo)}`;
  return `Up to ${fmt(hi as number)}`;
}
