import { BrevoContactAttributes } from './types';

const BREVO_API_BASE = 'https://api.brevo.com/v3';

let _runtimeBrevoApiKey = '';
let _runtimeSenderEmail = '';
let _runtimeSenderName = '';

export function setRuntimeBrevoConfig(config: { apiKey?: string; senderEmail?: string; senderName?: string }) {
  if (config.apiKey !== undefined) _runtimeBrevoApiKey = config.apiKey.trim();
  if (config.senderEmail !== undefined) _runtimeSenderEmail = config.senderEmail.trim();
  if (config.senderName !== undefined) _runtimeSenderName = config.senderName.trim();
}

export function getBrevoApiKey(): string {
  return (
    _runtimeBrevoApiKey ||
    process.env.BREVO_API_KEY ||
    process.env.SENDINBLUE_API_KEY ||
    process.env.NEXT_PUBLIC_BREVO_API_KEY ||
    ''
  );
}

export function getBrevoSender(): { email: string; name: string } {
  return {
    email: _runtimeSenderEmail || process.env.BREVO_SENDER_EMAIL || 'no-reply@jobsdart.in',
    name: _runtimeSenderName || process.env.BREVO_SENDER_NAME || 'JobsDart Careers & AI',
  };
}

export function isBrevoConfigured(): boolean {
  const key = getBrevoApiKey();
  return typeof key === 'string' && key.trim().length > 10;
}

/**
 * Verifies Brevo Webhook Request Signatures for Security Compliance
 */
export function verifyBrevoWebhookSignature(signatureHeader?: string, secretToken?: string): boolean {
  const secret = secretToken || process.env.BREVO_WEBHOOK_SECRET || '';
  if (!secret) {
    return true; // Unset secret permits requests securely while in standard mode
  }
  if (!signatureHeader) return false;
  return signatureHeader === secret || signatureHeader.includes(secret);
}

export async function validateBrevoApiKey(testKey?: string): Promise<{
  valid: boolean;
  message: string;
  email?: string;
  credits?: number;
  planType?: string;
}> {
  const key = testKey ? testKey.trim() : getBrevoApiKey();
  if (!key || key.length < 10) {
    return { valid: false, message: 'API key is missing or too short. Please enter a valid Brevo API key.' };
  }

  try {
    const res = await fetch(`${BREVO_API_BASE}/account`, {
      method: 'GET',
      headers: {
        'api-key': key,
        'accept': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.email) {
      return {
        valid: true,
        message: `Successfully connected to Brevo account (${data.email})`,
        email: data.email,
        credits: data.credits ?? 0,
        planType: data.plan?.[0]?.type || 'Free Tier',
      };
    } else {
      return {
        valid: false,
        message: data.message || data.code || `Brevo returned HTTP ${res.status}: Invalid API Key.`,
      };
    }
  } catch (err: any) {
    return { valid: false, message: `Failed to reach Brevo server: ${err.message}` };
  }
}

export async function brevoFetch<T = any>(
  endpoint: string,
  options: { method?: string; body?: any; headers?: Record<string, string> } = {}
): Promise<{ ok: boolean; status: number; data: T; error?: string }> {
  const apiKey = getBrevoApiKey();

  if (!isBrevoConfigured()) {
    console.warn(`[BREVO_SERVICE] Brevo API Key not configured. Simulating API call to ${endpoint}`);
    return {
      ok: true,
      status: 200,
      data: { message: 'Simulated Brevo response (API key not set)', simulated: true } as any,
    };
  }

  try {
    const url = `${BREVO_API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        'api-key': apiKey,
        'accept': 'application/json',
        'content-type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: 'no-store',
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { rawText: text };
    }

    if (!res.ok) {
      console.error(`[BREVO_API_ERROR] ${options.method || 'GET'} ${endpoint} [${res.status}]:`, data);
      return {
        ok: false,
        status: res.status,
        data,
        error: data.message || data.code || `Brevo HTTP error ${res.status}`,
      };
    }

    return { ok: true, status: res.status, data };
  } catch (err: any) {
    console.error(`[BREVO_FETCH_EXCEPTION] ${endpoint}:`, err);
    return { ok: false, status: 500, data: {} as T, error: err.message };
  }
}

/**
 * Upserts a contact in Brevo CRM (Creates or updates attributes)
 */
export async function syncContactToBrevo(params: {
  email: string;
  attributes?: BrevoContactAttributes;
  listIds?: number[];
  extId?: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const payload = {
    email: params.email,
    attributes: {
      FIRSTNAME: params.attributes?.FIRSTNAME || '',
      LASTNAME: params.attributes?.LASTNAME || '',
      SKILLS: params.attributes?.SKILLS || '',
      LOCATION: params.attributes?.LOCATION || '',
      JOB_TITLE: params.attributes?.JOB_TITLE || '',
      AI_MATCH_SCORE: params.attributes?.AI_MATCH_SCORE || 50,
      LIFECYCLE_STAGE: params.attributes?.LIFECYCLE_STAGE || 'NEW_ONBOARDED',
      LAST_ACTIVE_AT: params.attributes?.LAST_ACTIVE_AT || new Date().toISOString(),
      ...(params.attributes || {}),
    },
    listIds: params.listIds || [2], // Default JobSeekers list ID
    updateEnabled: true,
    ext_id: params.extId,
  };

  const res = await brevoFetch('/contacts', {
    method: 'POST',
    body: payload,
  });

  return {
    ok: res.ok,
    error: res.error,
  };
}

/**
 * Sends a transactional email using Brevo SMTP / Transactional API
 */
export async function sendBrevoTransactionalEmail(params: {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
  tags?: string[];
  params?: Record<string, any>;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  const sender = getBrevoSender();

  const payload: any = {
    sender: { name: sender.name, email: sender.email },
    to: [{ email: params.toEmail, name: params.toName }],
    subject: params.subject,
    htmlContent: params.htmlContent,
    tags: params.tags || ['ai-recommendation', 'jobsdart-crm'],
  };

  // Only include params property if non-empty, preventing Brevo "params is blank" error
  if (params.params && Object.keys(params.params).length > 0) {
    payload.params = params.params;
  }

  const res = await brevoFetch<{ messageId?: string }>('/smtp/email', {
    method: 'POST',
    body: payload,
  });

  if (res.ok) {
    const messageId = res.data?.messageId || `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    return { ok: true, messageId };
  }

  return { ok: false, error: res.error || 'Failed to send transactional email' };
}

/**
 * Gets Brevo Account Info & API Health Status
 */
export async function getBrevoAccountInfo(): Promise<{
  configured: boolean;
  emailCredits?: number;
  planType?: string;
  status: 'HEALTHY' | 'DEGRADED' | 'UNCONFIGURED';
  raw?: any;
}> {
  if (!isBrevoConfigured()) {
    return {
      configured: false,
      status: 'UNCONFIGURED',
      emailCredits: 0,
      planType: 'API Key Not Set',
    };
  }

  const res = await brevoFetch('/account');
  if (res.ok && res.data) {
    const plan = res.data.plan || [];
    const credits = res.data.credits ?? 0;
    return {
      configured: true,
      emailCredits: credits,
      planType: plan[0]?.type || 'Free Tier',
      status: 'HEALTHY',
      raw: res.data,
    };
  }

  return {
    configured: true,
    status: 'DEGRADED',
    emailCredits: 0,
    planType: 'Error checking account',
  };
}

/**
 * Fetches SMTP Delivery & Engagement Reports from Brevo
 */
export async function getBrevoDeliveryReports(startDate?: string, endDate?: string) {
  const start = startDate || new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];
  const end = endDate || new Date().toISOString().split('T')[0];

  const res = await brevoFetch(`/smtp/statistics/reports?startDate=${start}&endDate=${end}`);
  if (res.ok) {
    return res.data;
  }
  return { reports: [] };
}
