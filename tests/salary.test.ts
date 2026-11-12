import { describe, it, expect } from 'vitest';
import { salaryUnitError, formatSalaryRange } from '@/lib/salary';

describe('salaryUnitError', () => {
  it('accepts realistic whole-unit salaries', () => {
    expect(salaryUnitError(120000, 150000, 'USD')).toBeNull();
    expect(salaryUnitError(5100000, 7800000, 'INR')).toBeNull();
    expect(salaryUnitError(null, null, 'USD')).toBeNull();
  });

  it('rejects USD/CAD amounts that are clearly cents', () => {
    expect(salaryUnitError(19800000, 27500000, 'USD')).toMatch(/not cents/);
    expect(salaryUnitError(10846000, 15950000, 'cad')).toMatch(/not cents/);
  });

  it('rejects an inverted or negative range', () => {
    expect(salaryUnitError(150000, 120000, 'USD')).toMatch(/greater than or equal/);
    expect(salaryUnitError(-1, null, 'USD')).toMatch(/negative/);
  });
});

describe('formatSalaryRange', () => {
  it('formats in the job currency instead of assuming dollars', () => {
    expect(formatSalaryRange(198000, 275000, 'USD')).toBe('$198,000 – $275,000');
    expect(formatSalaryRange(5100000, 7800000, 'INR')).toBe('₹51,00,000 – ₹78,00,000');
    expect(formatSalaryRange(null, null, 'USD')).toBeNull();
  });
});
