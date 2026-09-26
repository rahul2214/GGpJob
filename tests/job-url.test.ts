import { describe, it, expect } from 'vitest';
import { jobTitleToSlug, getJobUrl } from '@/lib/job-url';

describe('Job URL generation and SEO slugs', () => {
  it('converts clean titles to hyphenated lowercase slugs', () => {
    expect(jobTitleToSlug('Senior Software Engineer')).toBe('senior-software-engineer');
    expect(jobTitleToSlug('Product Manager')).toBe('product-manager');
  });

  it('handles special characters and symbols cleanly', () => {
    expect(jobTitleToSlug('Senior Full Stack Engineer (React / Node.js)')).toBe('senior-full-stack-engineer-react-node-js');
    expect(jobTitleToSlug('C++ / C# Developer & Cloud Architect')).toBe('c-c-developer-cloud-architect');
  });

  it('handles null, undefined, or empty titles with safe fallback', () => {
    expect(jobTitleToSlug('')).toBe('job');
    expect(jobTitleToSlug(null)).toBe('job');
    expect(jobTitleToSlug(undefined)).toBe('job');
    expect(jobTitleToSlug('   ')).toBe('job');
    expect(jobTitleToSlug('---')).toBe('job');
  });

  it('generates the expected SEO-friendly URL pattern: /jobs/{job-title}/{job-uuid}', () => {
    const job = {
      uuid: 'eacf0e2a-1007-410c-a7f1-6dd9d48a23e9',
      title: 'Senior Software Engineer',
    };
    expect(getJobUrl(job)).toBe('/jobs/senior-software-engineer/eacf0e2a-1007-410c-a7f1-6dd9d48a23e9');
  });

  it('supports jobs having numeric id if uuid is not present', () => {
    const job = {
      id: 1042,
      title: 'Data Analyst',
    };
    expect(getJobUrl(job)).toBe('/jobs/data-analyst/1042');
  });

  it('rejects dot placeholders and arbitrary strings from matching real job slugs', () => {
    const canonical = jobTitleToSlug('Product Data Analyst II');
    expect(canonical).toBe('product-data-analyst-ii');
    expect('...').not.toBe(canonical);
    expect('..').not.toBe(canonical);
    expect('random-slug').not.toBe(canonical);
  });
});
