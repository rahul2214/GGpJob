import { describe, it, expect } from 'vitest';
import { addressDetails, buildJobPostingSchema } from '@/lib/job-posting-schema';

const blr = { city: 'Bengaluru', state: 'Karnataka', country: 'India' };

describe('addressDetails', () => {
  it('adds nothing when the address only repeats the locality', () => {
    expect(addressDetails('Bengaluru, Karnataka, India', blr)).toEqual({});
    expect(
      addressDetails('San Francisco, CA, United States', { city: 'San Francisco', state: 'California', country: 'United States' })
    ).toEqual({});
  });

  it('extracts a street part and an Indian PIN when present', () => {
    expect(addressDetails('12 MG Road, Indiranagar, Bengaluru, Karnataka 560038', blr)).toEqual({
      streetAddress: '12 MG Road, Indiranagar',
      postalCode: '560038',
    });
  });

  it('extracts a US ZIP', () => {
    expect(
      addressDetails('500 Howard St, San Francisco, CA 94105', { city: 'San Francisco', state: 'California', country: 'United States' })
    ).toEqual({ streetAddress: '500 Howard St', postalCode: '94105' });
  });

  it('keeps a free-text area name as the street address', () => {
    expect(addressDetails('old alwal', { city: 'Hyderabad', state: 'Telangana', country: 'India' })).toEqual({
      streetAddress: 'old alwal',
    });
  });
});

describe('buildJobPostingSchema baseSalary', () => {
  const base = { title: 'Engineer', company_name: 'Acme', posted_at: '2026-11-01', currencies: { code: 'INR' } };

  it('accepts salaries that arrive as numeric strings', () => {
    const schema = buildJobPostingSchema({ ...base, salary_min_usd_cents: '5100000', salary_max_usd_cents: '7800000' }, 'https://x/j', [blr]);
    expect(schema.baseSalary.value).toMatchObject({ minValue: 5100000, maxValue: 7800000 });
  });

  it('omits baseSalary when no salary is set rather than guessing', () => {
    const schema = buildJobPostingSchema({ ...base, salary_min_usd_cents: null }, 'https://x/j', [blr]);
    expect(schema.baseSalary).toBeUndefined();
  });
});
