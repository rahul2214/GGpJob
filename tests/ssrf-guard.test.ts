import { describe, it, expect } from 'vitest';
import { assertUrlIsPublic, isBlockedAddress, SsrfBlockedError } from '@/lib/ssrf-guard';

/**
 * Regression tests for VULN-002 (unauthenticated SSRF via /api/ats-score
 * `resumeUrl`). The guard must refuse any address that could reach the loopback
 * interface, the private network, or a cloud metadata service.
 */
describe('SSRF guard — blocked address ranges', () => {
  const blocked = [
    ['loopback IPv4', '127.0.0.1'],
    ['loopback alternate', '127.127.127.127'],
    ['cloud metadata', '169.254.169.254'],
    ['link-local', '169.254.1.1'],
    ['RFC1918 10/8', '10.0.0.1'],
    ['RFC1918 172.16/12', '172.16.5.4'],
    ['RFC1918 192.168/16', '192.168.1.1'],
    ['CGNAT 100.64/10', '100.64.0.1'],
    ['this-network 0/8', '0.0.0.0'],
    ['IPv6 loopback', '::1'],
    ['IPv6 unique local', 'fd00::1'],
    ['IPv6 link-local', 'fe80::1'],
    ['IPv4-mapped metadata', '::ffff:169.254.169.254'],
  ] as const;

  for (const [label, ip] of blocked) {
    it(`rejects ${label} (${ip})`, () => {
      expect(isBlockedAddress(ip)).toBe(true);
    });
  }

  it('allows a public address', () => {
    expect(isBlockedAddress('1.1.1.1')).toBe(false);
    expect(isBlockedAddress('93.184.216.34')).toBe(false);
  });

  it('rejects anything that is not a parsable IP', () => {
    expect(isBlockedAddress('not-an-ip')).toBe(true);
    expect(isBlockedAddress('')).toBe(true);
  });
});

describe('SSRF guard — assertUrlIsPublic', () => {
  it('rejects the AWS/GCP metadata endpoint', async () => {
    await expect(assertUrlIsPublic('http://169.254.169.254/latest/meta-data/')).rejects.toBeInstanceOf(
      SsrfBlockedError,
    );
  });

  it('rejects loopback by IP', async () => {
    await expect(assertUrlIsPublic('http://127.0.0.1:9500/api/health')).rejects.toBeInstanceOf(
      SsrfBlockedError,
    );
  });

  it('rejects the literal hostname localhost', async () => {
    await expect(assertUrlIsPublic('http://localhost:9500/')).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it('rejects GCP metadata by hostname', async () => {
    await expect(assertUrlIsPublic('http://metadata.google.internal/')).rejects.toBeInstanceOf(
      SsrfBlockedError,
    );
  });

  it('rejects a private RFC1918 target', async () => {
    await expect(assertUrlIsPublic('http://192.168.0.1/admin')).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it('rejects non-http schemes', async () => {
    await expect(assertUrlIsPublic('file:///etc/passwd')).rejects.toBeInstanceOf(SsrfBlockedError);
    await expect(assertUrlIsPublic('gopher://127.0.0.1:11211/')).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it('rejects a malformed URL', async () => {
    await expect(assertUrlIsPublic('http://')).rejects.toBeInstanceOf(SsrfBlockedError);
  });

  it('accepts a public literal address', async () => {
    await expect(assertUrlIsPublic('https://1.1.1.1/resource.pdf')).resolves.toBeInstanceOf(URL);
  });
});
