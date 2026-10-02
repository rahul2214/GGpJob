import { describe, it, expect, vi, beforeEach } from 'vitest';
import dns from 'dns';

const {
  mockCreateUser,
  mockSendFirebaseVerificationEmail,
} = vi.hoisted(() => ({
  mockCreateUser: vi.fn(),
  mockSendFirebaseVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
      })),
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
    auth: {
      admin: {
        createUser: mockCreateUser,
      },
    },
  },
  getSupabaseAdmin: vi.fn(),
}));

vi.mock('@/lib/auth-utils', () => ({
  sendFirebaseVerificationEmail: mockSendFirebaseVerificationEmail,
}));

import * as emailDeliverability from '@/lib/email-deliverability';
import { validateEmailDeliverability } from '@/lib/email-deliverability';
import { POST as signupPOST } from '@/app/api/auth/signup/route';

describe('Real-World Email Deliverability & DNS MX Verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateEmailDeliverability unit tests', () => {
    it('rejects invalid email formats', async () => {
      const res1 = await validateEmailDeliverability('');
      expect(res1.valid).toBe(false);
      expect(res1.reason).toBe('invalid_format');

      const res2 = await validateEmailDeliverability('not-an-email');
      expect(res2.valid).toBe(false);
      expect(res2.reason).toBe('invalid_format');

      const res3 = await validateEmailDeliverability('missingdomain@');
      expect(res3.valid).toBe(false);
      expect(res3.reason).toBe('invalid_format');
    });

    it('rejects disposable and temporary email addresses', async () => {
      const res1 = await validateEmailDeliverability('scammer@tempmail.com');
      expect(res1.valid).toBe(false);
      expect(res1.reason).toBe('disposable');
      expect(res1.error).toContain('Temporary or disposable email');

      const res2 = await validateEmailDeliverability('fakeuser@mailinator.com');
      expect(res2.valid).toBe(false);
      expect(res2.reason).toBe('disposable');

      const res3 = await validateEmailDeliverability('burner@guerrillamail.com');
      expect(res3.valid).toBe(false);
      expect(res3.reason).toBe('disposable');

      const res4 = await validateEmailDeliverability('tester@10minutemail.com');
      expect(res4.valid).toBe(false);
      expect(res4.reason).toBe('disposable');

      const res5 = await validateEmailDeliverability('tohah58332@hudzer.com');
      expect(res5.valid).toBe(false);
      expect(res5.reason).toBe('disposable');
      expect(res5.error).toContain('Temporary or disposable');
    });

    it('accepts domain when DNS resolves valid MX records', async () => {
      vi.spyOn(dns.promises, 'resolveMx').mockResolvedValueOnce([
        { exchange: 'mail.google.com', priority: 10 },
      ]);

      const res = await validateEmailDeliverability('user@customvalidcorp.com');
      expect(res.valid).toBe(true);
    });

    it('rejects domain when DNS returns ENOTFOUND (nonexistent domain)', async () => {
      const notFoundErr: any = new Error('getaddrinfo ENOTFOUND');
      notFoundErr.code = 'ENOTFOUND';
      vi.spyOn(dns.promises, 'resolveMx').mockRejectedValueOnce(notFoundErr);

      const res = await validateEmailDeliverability('test@fakecompanynonexistent99882.xyz');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('domain_not_found');
      expect(res.error).toContain('does not exist');
    });

    it('rejects domain with empty MX and no A records', async () => {
      vi.spyOn(dns.promises, 'resolveMx').mockResolvedValueOnce([]);
      const noDataErr: any = new Error('queryA ENODATA');
      noDataErr.code = 'ENODATA';
      vi.spyOn(dns.promises, 'resolve4').mockRejectedValueOnce(noDataErr);

      const res = await validateEmailDeliverability('test@domainwithnomailserver.org');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('no_mx_records');
      expect(res.error).toContain('does not have active mail servers');
    });

    it('rejects RFC 7505 null MX (".")', async () => {
      vi.spyOn(dns.promises, 'resolveMx').mockResolvedValueOnce([
        { exchange: '.', priority: 0 },
      ]);

      const res = await validateEmailDeliverability('test@nullmxdomain.org');
      expect(res.valid).toBe(false);
      expect(res.reason).toBe('no_mx_records');
      expect(res.error).toContain('does not accept incoming emails');
    });
  });

  describe('Integration with signup POST', () => {
    it('blocks signup and prevents sending verification mail when domain is disposable', async () => {
      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Burner User',
          email: 'burner@mailinator.com',
          password: 'Password123!',
          role: 'Job Seeker',
          phone: '9876543210',
        }),
      });

      const res = await signupPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('Temporary or disposable');

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockSendFirebaseVerificationEmail).not.toHaveBeenCalled();
    });

    it('blocks signup and prevents sending verification mail when domain does not exist in DNS', async () => {
      const notFoundErr: any = new Error('getaddrinfo ENOTFOUND');
      notFoundErr.code = 'ENOTFOUND';
      vi.spyOn(dns.promises, 'resolveMx').mockRejectedValueOnce(notFoundErr);

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Fake Domain User',
          email: 'user@nonexistentdomain99887711.com',
          password: 'Password123!',
          role: 'Job Seeker',
          phone: '9876543210',
        }),
      });

      const res = await signupPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('does not exist');

      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockSendFirebaseVerificationEmail).not.toHaveBeenCalled();
    });

    it('proceeds with signup and sends verification mail when email has valid MX records', async () => {
      vi.spyOn(dns.promises, 'resolveMx').mockResolvedValueOnce([
        { exchange: 'mx.legitcompany.com', priority: 10 },
      ]);
      mockCreateUser.mockResolvedValueOnce({
        data: { user: { id: 'legit-uuid-1' } },
        error: null,
      });
      mockSendFirebaseVerificationEmail.mockResolvedValueOnce({ email: 'john@legitcompany.com' });

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john@legitcompany.com',
          password: 'Password123!',
          role: 'Job Seeker',
          phone: '9876543210',
        }),
      });

      const res = await signupPOST(req);
      expect(res.status).toBe(201);
      expect(mockCreateUser).toHaveBeenCalled();
      expect(mockSendFirebaseVerificationEmail).toHaveBeenCalled();
    });

    it('returns 409 Conflict when user email is already registered in Supabase', async () => {
      vi.spyOn(dns.promises, 'resolveMx').mockResolvedValueOnce([
        { exchange: 'mx.legitcompany.com', priority: 10 },
      ]);
      const authErr: any = new Error('A user with this email address has already been registered');
      authErr.__isAuthError = true;
      authErr.status = 422;
      authErr.code = 'email_exists';
      mockCreateUser.mockRejectedValueOnce(authErr);

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Existing User',
          email: 'existing@legitcompany.com',
          password: 'Password123!',
          role: 'Job Seeker',
          phone: '9876543210',
        }),
      });

      const res = await signupPOST(req);
      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toContain('already been registered');
      expect(mockSendFirebaseVerificationEmail).not.toHaveBeenCalled();
    });

    it('blocks signup when mail server explicitly rejects nonexistent mailbox (e.g. jysiyfg8b8t@gmail.com)', async () => {
      vi.spyOn(dns.promises, 'resolveMx').mockResolvedValueOnce([
        { exchange: 'gmail-smtp-in.l.google.com', priority: 5 },
      ]);
      vi.spyOn(emailDeliverability, 'verifyMailboxSmtp').mockResolvedValueOnce({
        exists: false,
        explicitRejection: true,
        reason: '550-5.1.1 The email account that you tried to reach does not exist.',
      });

      const req = new Request('http://localhost:3000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Fake Mailbox User',
          email: 'jysiyfg8b8t@gmail.com',
          password: 'Password123!',
          role: 'Job Seeker',
          phone: '9876543210',
        }),
      });

      const res = await signupPOST(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toContain('does not exist');
      expect(mockCreateUser).not.toHaveBeenCalled();
      expect(mockSendFirebaseVerificationEmail).not.toHaveBeenCalled();
    });
  });
});

