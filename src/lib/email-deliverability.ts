import dns from 'dns';
import net from 'net';
import { createRequire } from 'module';

let disposableDomainsList: string[] = [];
try {
  const require = createRequire(import.meta.url);
  disposableDomainsList = require('disposable-email-domains');
} catch (e) {
  // Fallback if dynamic require is unavailable
}

export interface EmailDeliverabilityResult {
  valid: boolean;
  error?: string;
  reason?: 'invalid_format' | 'disposable' | 'domain_not_found' | 'no_mx_records' | 'mailbox_not_found' | 'timeout';
}

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * High-priority disposable email domains and services.
 * Specifically includes rotating domains like hudzer.com from temp-mail.org and 10minemail.
 */
const EXTRA_DISPOSABLE_DOMAINS = [
  'hudzer.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmail.com',
  'mailinator.com',
  'guerrillamail.com',
  'guerrillamailblock.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'guerrillamail.info',
  'grr.la',
  'sharklasers.com',
  '10minutemail.com',
  '10minutemail.net',
  '10minemail.com',
  'yopmail.com',
  'yopmail.fr',
  'yopmail.net',
  'trashmail.com',
  'trashmail.net',
  'trashmail.me',
  'dispostable.com',
  'fakeinbox.com',
  'getairmail.com',
  'mohmal.com',
  'mytemp.email',
  'crazymailing.com',
  'throwawaymail.com',
  'burnermail.io',
  'maildrop.cc',
  'inboxkitten.com',
  'nada.ltd',
  'getnada.com',
  'generator.email',
  'dropmail.me',
  'emailondeck.com',
  'tempr.email',
  'discard.email',
  'mintemail.com',
  'harakirimail.com',
  'mailcatch.com',
  'fakemailgenerator.com',
  'armyspy.com',
  'cuvox.de',
  'dayrep.com',
  'fleckens.hu',
  'gustr.com',
  'jourrapide.com',
  'rhyta.com',
  'superrito.com',
  'teleworm.us',
  'einrot.com',
];

// Initialize comprehensive in-memory Set (120,000+ domains) for O(1) instant lookups
const DISPOSABLE_DOMAINS_SET = new Set<string>([
  ...(Array.isArray(disposableDomainsList) ? disposableDomainsList : []),
  ...EXTRA_DISPOSABLE_DOMAINS,
]);

/**
 * Helper to race a promise against a timeout in milliseconds.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg = 'Operation timed out'): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      const err: any = new Error(errorMsg);
      err.code = 'ETIMEDOUT';
      reject(err);
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Online real-time check against continuously updated disposable email registries.
 * Catches newly created/rotated disposable domains registered within the last few days.
 */
async function checkOnlineDisposable(email: string, domain: string): Promise<boolean> {
  // 1. Check debounce.io free real-time disposable lookup (2s timeout)
  try {
    const res = await withTimeout(
      fetch(`https://disposable.debounce.io/?email=${encodeURIComponent(email)}`).then((r) => r.json()),
      2000,
      'Debounce timeout'
    );
    if (res?.disposable === 'true' || res?.disposable === true) {
      return true;
    }
    if (res?.disposable === 'false' || res?.disposable === false) {
      return false;
    }
  } catch {
    // Fall through to secondary check if first is unreachable
  }

  // 2. Secondary check via mailcheck.ai
  try {
    const res = await withTimeout(
      fetch(`https://api.mailcheck.ai/domain/${encodeURIComponent(domain)}`).then((r) => r.json()),
      2000,
      'Mailcheck timeout'
    );
    if (res?.disposable === true || res?.spam === true) {
      return true;
    }
  } catch {
    // Ignore online check failure; local list & DNS will still protect
  }

  return false;
}

const SMTP_PROBE_EXCLUDED_HOSTS = [
  'protection.outlook.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoodns.net',
  'yahoo.com',
  'icloud.com',
  'apple.com',
];

/**
 * Probes the target mail exchange server directly via SMTP (RCPT TO) to verify if the individual mailbox exists.
 * If the mail server explicitly rejects the mailbox with 550 / NoSuchUser / User Unknown / DisabledUser,
 * we flag it as nonexistent.
 * If the connection times out, is blocked, or the server uses catch-all/greylisting/anti-spam policies,
 * it returns exists: true (indeterminate) so legitimate users are never blocked.
 */
export async function verifyMailboxSmtp(
  email: string,
  exchangeHost: string,
  timeoutMs = 2000
): Promise<{ exists: boolean; explicitRejection?: boolean; reason?: string }> {
  return new Promise((resolve) => {
    let resolved = false;
    let socket: net.Socket;

    const cleanup = (res: { exists: boolean; explicitRejection?: boolean; reason?: string }) => {
      if (resolved) return;
      resolved = true;
      try {
        if (socket && !socket.destroyed) {
          socket.write('QUIT\r\n');
          socket.end();
          socket.destroy();
        }
      } catch (_) {}
      resolve(res);
    };

    try {
      socket = net.createConnection(25, exchangeHost);
    } catch {
      return resolve({ exists: true });
    }

    let step = 0;
    socket.setTimeout(timeoutMs);

    socket.on('data', (chunk) => {
      const text = chunk.toString();

      if (step === 0) {
        if (text.startsWith('220')) {
          step = 1;
          socket.write('EHLO mail.jobsdart.com\r\n');
        } else {
          return cleanup({ exists: true });
        }
      } else if (step === 1) {
        if (text.startsWith('250') || text.includes('250 ')) {
          step = 2;
          socket.write('MAIL FROM:<noreply@jobsdart.com>\r\n');
        } else {
          return cleanup({ exists: true });
        }
      } else if (step === 2) {
        if (text.startsWith('250')) {
          step = 3;
          socket.write(`RCPT TO:<${email}>\r\n`);
        } else {
          return cleanup({ exists: true });
        }
      } else if (step === 3) {
        const lower = text.toLowerCase();

        // Check for definitive non-existent / disabled mailbox rejection
        const isNoSuchUser =
          lower.includes('does not exist') ||
          lower.includes('nosuchuser') ||
          lower.includes('disableduser') ||
          lower.includes('user unknown') ||
          lower.includes('user not found') ||
          lower.includes('mailbox unavailable') ||
          lower.includes('invalid recipient') ||
          lower.includes('recipient rejected') ||
          (text.startsWith('550 5.1.1') || text.startsWith('550-5.1.1') || text.startsWith('550 5.2.1'));

        // Guard against server IP blocks or reverse DNS policy rejections
        const isIpOrPolicyBlock =
          lower.includes('spamhaus') ||
          lower.includes('reverse dns') ||
          lower.includes('client host') ||
          lower.includes('service unavailable') ||
          lower.includes('access denied');

        if (isNoSuchUser && !isIpOrPolicyBlock) {
          cleanup({ exists: false, explicitRejection: true, reason: text.trim() });
        } else {
          cleanup({ exists: true });
        }
      }
    });

    socket.on('error', () => cleanup({ exists: true }));
    socket.on('timeout', () => cleanup({ exists: true }));
  });
}

/**
 * Validates whether an email exists in the real world:
 * 1. Checks RFC-compliant email syntax.
 * 2. Checks local blocklist (120,000+ disposable domains).
 * 3. Checks online real-time disposable registries (catches rotating temp domains like hudzer.com).
 * 4. Resolves DNS MX (Mail Exchange) records to confirm active mail servers.
 * 5. Probes the mail exchange server directly via SMTP to verify the individual mailbox exists.
 *
 * @param email - The email address to inspect.
 * @param timeoutMs - Maximum milliseconds to wait for DNS lookup (default: 3500ms).
 */
export async function validateEmailDeliverability(
  email: string,
  timeoutMs = 3500
): Promise<EmailDeliverabilityResult> {
  const trimmed = (email || '').trim().toLowerCase();

  // 1. Syntax check
  if (!trimmed || !EMAIL_REGEX.test(trimmed)) {
    return {
      valid: false,
      reason: 'invalid_format',
      error: 'Please enter a valid email address format (e.g. name@company.com).',
    };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return {
      valid: false,
      reason: 'invalid_format',
      error: 'Invalid email address structure.',
    };
  }

  const domain = parts[1];

  // 2. Fast local disposable email check (120,000+ domains)
  if (DISPOSABLE_DOMAINS_SET.has(domain)) {
    return {
      valid: false,
      reason: 'disposable',
      error: 'Temporary or disposable email addresses are not permitted. Please use a valid personal or company email.',
    };
  }

  // 3. Online real-time disposable check (catches newly registered ephemeral domains)
  try {
    const isOnlineDisposable = await checkOnlineDisposable(trimmed, domain);
    if (isOnlineDisposable) {
      // Add to local cache so subsequent checks for this domain are instant
      DISPOSABLE_DOMAINS_SET.add(domain);
      return {
        valid: false,
        reason: 'disposable',
        error: 'Temporary or disposable email addresses are not permitted. Please use a valid personal or company email.',
      };
    }
  } catch {
    // Ignore online check error to avoid blocking users if external API is unreachable
  }

  // 4. Real-world DNS MX lookup
  try {
    const mxRecords = await withTimeout(
      dns.promises.resolveMx(domain),
      timeoutMs,
      `DNS resolution timed out after ${timeoutMs}ms`
    );

    if (mxRecords && mxRecords.length > 0) {
      // Null MX check (RFC 7505: an exchange of "." denotes domain does NOT accept email)
      const validExchanges = mxRecords
        .filter((r) => r && r.exchange && r.exchange.trim().length > 0 && r.exchange.trim() !== '.')
        .sort((a, b) => a.priority - b.priority);

      if (validExchanges.length === 0) {
        return {
          valid: false,
          reason: 'no_mx_records',
          error: `The email domain "${domain}" explicitly does not accept incoming emails.`,
        };
      }

      // 5. Active SMTP Mailbox Existence Verification
      try {
        const primaryHost = validExchanges[0].exchange.trim().toLowerCase();
        const shouldSkipSmtp = SMTP_PROBE_EXCLUDED_HOSTS.some((h) => primaryHost.includes(h));

        if (!shouldSkipSmtp) {
          const mailboxCheck = await withTimeout(
            verifyMailboxSmtp(trimmed, primaryHost, 1800),
            2000,
            'SMTP probe timed out'
          );
          if (!mailboxCheck.exists && mailboxCheck.explicitRejection) {
            return {
              valid: false,
              reason: 'mailbox_not_found',
              error: `The email account "${trimmed}" does not exist. Please check for typos and enter a valid email address.`,
            };
          }
        }
      } catch {
        // Fall back gracefully if SMTP probe fails or is restricted by environment
      }

      return { valid: true };
    }

    // RFC 5321 fallback: if no MX is returned, check for an A/IPv4 record
    try {
      const aRecords = await withTimeout(dns.promises.resolve4(domain), 1500);
      if (aRecords && aRecords.length > 0) {
        return { valid: true };
      }
    } catch {
      // Ignore A record error; fall through to no_mx_records
    }

    return {
      valid: false,
      reason: 'no_mx_records',
      error: `The email domain "${domain}" does not have active mail servers configured to receive emails.`,
    };
  } catch (err: any) {
    if (err?.code === 'ENOTFOUND') {
      return {
        valid: false,
        reason: 'domain_not_found',
        error: `The domain "${domain}" does not exist. Please check for typos and enter a valid email address.`,
      };
    }

    if (err?.code === 'ENODATA') {
      // Domain exists in DNS but has no MX records
      try {
        const aRecords = await withTimeout(dns.promises.resolve4(domain), 1500);
        if (aRecords && aRecords.length > 0) {
          return { valid: true };
        }
      } catch {
        // ignore
      }

      return {
        valid: false,
        reason: 'no_mx_records',
        error: `The email domain "${domain}" does not have mail exchange (MX) servers configured to receive emails.`,
      };
    }

    if (err?.code === 'ETIMEDOUT') {
      console.warn(`[email-deliverability] DNS check timed out for ${domain}. Allowing to avoid blocking user.`);
      return { valid: true, reason: 'timeout' };
    }

    // For transient network errors or DNS server issues, log warning and allow
    console.warn(`[email-deliverability] Transient error resolving MX for ${domain}:`, err?.message || err);
    return { valid: true };
  }
}
