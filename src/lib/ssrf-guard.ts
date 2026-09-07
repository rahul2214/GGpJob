import dns from 'dns';
import net from 'net';

/**
 * SSRF protection.
 *
 * Any server-side fetch whose URL is influenced by user input must go through
 * `safeFetch`. It enforces a scheme allowlist, resolves the hostname and rejects
 * addresses that fall inside loopback / private / link-local / cloud-metadata
 * ranges, and re-validates every hop of a redirect chain.
 */

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);
const MAX_REDIRECTS = 3;

/** Hostnames that must never be resolved, regardless of what DNS says. */
const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
  'instance-data',
]);

function ipv4ToInt(ip: string): number {
  const parts = ip.split('.').map(Number);
  return ((parts[0] << 24) >>> 0) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
}

/** True when an IPv4 literal is outside the public routable space. */
function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip);
  const inRange = (cidrBase: string, bits: number) => {
    const base = ipv4ToInt(cidrBase);
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (n & mask) === (base & mask);
  };
  return (
    inRange('0.0.0.0', 8) ||        // "this" network
    inRange('10.0.0.0', 8) ||       // RFC1918
    inRange('100.64.0.0', 10) ||    // CGNAT
    inRange('127.0.0.0', 8) ||      // loopback
    inRange('169.254.0.0', 16) ||   // link-local + cloud metadata (169.254.169.254)
    inRange('172.16.0.0', 12) ||    // RFC1918
    inRange('192.0.0.0', 24) ||     // IETF protocol assignments
    inRange('192.0.2.0', 24) ||     // TEST-NET-1
    inRange('192.168.0.0', 16) ||   // RFC1918
    inRange('198.18.0.0', 15) ||    // benchmarking
    inRange('198.51.100.0', 24) ||  // TEST-NET-2
    inRange('203.0.113.0', 24) ||   // TEST-NET-3
    inRange('224.0.0.0', 4) ||      // multicast
    inRange('240.0.0.0', 4)         // reserved / broadcast
  );
}

function isPrivateIPv6(ip: string): boolean {
  const addr = ip.toLowerCase().split('%')[0];
  if (addr === '::' || addr === '::1') return true;           // unspecified / loopback
  if (addr.startsWith('fe80')) return true;                    // link-local
  if (addr.startsWith('fc') || addr.startsWith('fd')) return true; // unique local
  if (addr.startsWith('ff')) return true;                      // multicast
  // IPv4-mapped (::ffff:a.b.c.d) and IPv4-compatible forms
  const mapped = addr.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

export function isBlockedAddress(ip: string): boolean {
  const version = net.isIP(ip);
  if (version === 4) return isPrivateIPv4(ip);
  if (version === 6) return isPrivateIPv6(ip);
  return true; // not a parsable IP -> refuse
}

export class SsrfBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SsrfBlockedError';
  }
}

/**
 * Validates a single URL: scheme allowlist, hostname blocklist, and DNS
 * resolution with private-range rejection. Throws SsrfBlockedError on failure.
 */
export async function assertUrlIsPublic(rawUrl: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new SsrfBlockedError('Malformed URL.');
  }

  if (!ALLOWED_PROTOCOLS.has(url.protocol)) {
    throw new SsrfBlockedError(`Blocked URL scheme: ${url.protocol}`);
  }

  const hostname = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');

  if (BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.internal')) {
    throw new SsrfBlockedError('Blocked hostname.');
  }

  // Literal IP in the URL: check directly, no DNS needed.
  if (net.isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new SsrfBlockedError('Blocked address range.');
    }
    return url;
  }

  let records: dns.LookupAddress[];
  try {
    records = await dns.promises.lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw new SsrfBlockedError('Host could not be resolved.');
  }

  if (!records.length) throw new SsrfBlockedError('Host could not be resolved.');

  // Every resolved address must be public — a single private answer is fatal,
  // otherwise a DNS-rebinding record could slip through.
  for (const record of records) {
    if (isBlockedAddress(record.address)) {
      throw new SsrfBlockedError('Blocked address range.');
    }
  }

  return url;
}

export interface SafeFetchOptions extends RequestInit {
  /** Cap on the response body, in bytes. Defaults to 10 MB. */
  maxBytes?: number;
  /** Abort the request after this many milliseconds. Defaults to 15000. */
  timeoutMs?: number;
}

/**
 * Drop-in replacement for `fetch` for any URL derived from user input.
 * Follows redirects manually so each hop is revalidated.
 */
export async function safeFetch(rawUrl: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { maxBytes = 10 * 1024 * 1024, timeoutMs = 15000, ...init } = options;

  let currentUrl = rawUrl;

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertUrlIsPublic(currentUrl);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        ...init,
        redirect: 'manual',
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    // Revalidate redirect targets instead of letting fetch follow them blindly.
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      if (!location) return response;
      currentUrl = new URL(location, url).toString();
      continue;
    }

    const declaredLength = Number(response.headers.get('content-length') || 0);
    if (declaredLength && declaredLength > maxBytes) {
      throw new SsrfBlockedError('Remote response exceeds the permitted size.');
    }

    return response;
  }

  throw new SsrfBlockedError('Too many redirects.');
}
