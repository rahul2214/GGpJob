# JobsDart — Security Architecture & Trust Boundaries

_Generated during the authorized security assessment. Phase 1 deliverable._

## 1. Stack Overview

| Layer | Technology |
|---|---|
| Frontend | Next.js 14.2.35 (App Router), React 18, Tailwind, Radix UI, SWR |
| Backend | Next.js Route Handlers (`src/app/api/**/route.ts`) — 108 route files, serverless model |
| Edge | `src/middleware.ts` — WAF, rate limiting, security headers |
| Database | Supabase (PostgreSQL). Direct `pg` client used only by local maintenance scripts |
| Query layer | `@supabase/supabase-js` PostgREST client (no ORM). No raw SQL in request paths |
| Auth | Dual provider: Supabase Auth **and** Firebase Auth. Server verifies either token |
| Object storage | Cloudflare R2 via `@aws-sdk/client-s3`, presigned URLs (`src/lib/r2.ts`) |
| Payments | Razorpay (INR) + PayPal (non-INR) |
| Email | Resend + Brevo (CRM campaigns, webhooks) |
| AI | Groq / x.ai chat-completions (ATS scoring, resume generation, career assistant), Genkit |
| Background | Inngest (`/api/inngest`), HTTP cron (`/api/subscription/cron`, `/api/account/cron-permanent-delete`) |
| Push | Firebase Cloud Messaging, `web-push`, Expo |
| Cache | In-process `MemoryCache` (`src/lib/cache.ts`). **No Redis** |
| CI/CD | None committed. Firebase App Hosting config (`apphosting.yaml`, `.firebaserc`) |

## 2. Identity & Roles

Authentication is resolved server-side by `src/lib/auth-server.ts::getAuthenticatedUser()`:

1. Extract bearer token from `Authorization` header, or from `sb-access-token` /
   `sb-*-auth-token` / `firebase-token` cookies.
2. Validate against Supabase Auth; fall back to Firebase Admin `verifyIdToken`.
3. Resolve the verified email/uid against three profile tables, in order:
   `admins` → `jobseekers` → `recruiters`.

Roles: **anonymous**, **Job Seeker** (role_id 1), **Recruiter** (2), **Admin** (4),
**Super Admin** (5). A `jobseekers`/`recruiters` row may itself carry role_id 4/5.

Guards: `requireAuth`, `requireAdmin`, `requireSuperAdmin`, `isOwnerOrAdmin`.

## 3. Trust Boundaries

```
        (T1)                    (T2)                       (T3)
Browser ─────► Next.js edge ─────► Route handlers ─────► Supabase (service role)
 /Ext          (middleware)        (Node runtime)      ─► Cloudflare R2
                                                       ─► Razorpay / PayPal
                                                       ─► Groq / x.ai
                                                       ─► Brevo / Resend / Firebase
```

- **T1 — Browser → Edge.** Fully untrusted. Middleware applies UA blocklist, URL payload
  screening, per-IP rate limiting and security headers. Client IP is derived from
  `x-forwarded-for`, which is attacker-controlled unless a trusted proxy overwrites it.
- **T2 — Edge → Route handler.** This is the **critical boundary**. Every route handler runs
  with the Supabase **service-role key**, which bypasses all Row Level Security. Therefore
  RLS provides *no* protection for data reached through the API; authorization must be
  enforced explicitly in each handler. Any handler that accepts a user identifier from the
  request body/query instead of from the verified token is an authorization bypass.
- **T3 — Server → third parties.** Server holds R2 keys, Razorpay secret, Groq key, Brevo
  key, Firebase private key, Supabase service-role key. Outbound URL fetches performed on
  behalf of user input are SSRF-relevant.

## 4. Data Classification

| Sensitivity | Data |
|---|---|
| Critical | Supabase service-role key, Razorpay secret, R2 credentials, Firebase private key, Brevo API key |
| High (PII) | jobseeker name/email/phone/city, resumes (R2), resume drafts, applications, payments |
| Medium | job postings, recruiter/company profiles, community posts, notifications |
| Public | job listings (active), skills, locations, job types, currencies, plan prices |

## 5. Attack Surface Inventory

- **108 API route files** under `src/app/api/`.
- **Resource-scoped routes** (`/api/users/[id]/**`, `/api/jobs/[id]/**`, `/api/applications/[id]/**`,
  `/api/communities/[id]/**`) — IDOR-prone; the `[id]` is client-controlled.
- **Money paths** — `/api/payments/create-order`, `/api/payments/verify`,
  `/api/payments/activate-free`, `/api/coupons/**`, `/api/referral/claim`, `/api/jobs/[id]/boost`.
- **File ingress** — `/api/users/[id]/resume/upload`, `/api/users/[id]/profile-photo/upload`,
  `/api/users/[id]/resume/presigned`, `/api/ats-score`, `/api/resume/parse`.
- **Outbound fetch on user input (SSRF)** — `/api/ats-score` (`resumeUrl`),
  `/api/linkedin/auto-apply`, `/api/career-assistant`.
- **Server-side filesystem writes** — `/api/crm/config` (writes `.env`),
  `/api/linkedin/auto-apply` (writes configs, `spawn`s Python).
- **Unauthenticated cron/webhook** — `/api/subscription/cron`,
  `/api/account/cron-permanent-delete`, `/api/webhooks/brevo`, `/api/inngest`.
- **Admin surface** — `/api/admin/**`, `/api/create-admin`, plus taxonomy CRUD
  (`/api/job-types/[id]`, `/api/experience-levels/[id]`, `/api/workplace-types/[id]`,
  `/api/notice-periods`, `/api/skills/[id]`, `/api/benefits`).

## 6. Existing Controls (pre-assessment)

- Middleware WAF: scanner user-agent blocklist, SQLi/XSS/traversal regex screening of URL+query.
- Middleware rate limiting: in-memory sliding window, tiered (auth/payments 15/min,
  AI 20/min, API 100/min, pages 300/min).
- Security headers: HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy,
  Permissions-Policy, partial CSP (`frame-ancestors`, `object-src`, `base-uri`).
- CORS pinned to `NEXT_PUBLIC_APP_URL` (not wildcard) with credentials.
- `poweredByHeader: false`.
- RLS enabled and policies defined in `migration_enable_rls.sql` (defence in depth only —
  bypassed by the service-role key used by every route).
- XSS: `isomorphic-dompurify` used at the two user-HTML sinks
  (`jobs/[id]/job-details-client.tsx`, `components/chat/CareerAssistant.tsx`).
- Razorpay HMAC signature verified with `crypto.timingSafeEqual`.
- Secrets: `.env` is git-ignored and has never been committed.

## 7. Structural Weaknesses Identified

1. **Service-role everywhere.** No request-scoped (anon-key + user JWT) Supabase client
   exists, so RLS never applies to API traffic. Authorization is per-handler and was
   inconsistently applied.
2. **Client-asserted identity.** Many handlers take `userId` / `recruiterId` / `employeeId` /
   `userUuid` from the request instead of the verified token.
3. **Rate limit keyed on spoofable `x-forwarded-for`** and stored in per-instance memory,
   so it does not hold across serverless instances.
4. **Verbose errors.** Many handlers return `details: error.message` unconditionally.
5. **Build-time checks disabled** — `typescript.ignoreBuildErrors` and
   `eslint.ignoreDuringBuilds` are both `true`.
6. **No test framework** was present in the repository before this assessment.

Findings and remediation are recorded in `SECURITY_AUDIT_REPORT.md`; per-endpoint
authorization state is in `API_SECURITY_MATRIX.md`.
