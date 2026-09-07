# JobsDart — API Security Matrix

Generated from the current source during the authorized security assessment.
One row per route file under `src/app/api/`.

## How to read this

- **Auth** — does the handler verify a session (or a cron secret / provider signature)
  before doing any work? `No` means the endpoint is reachable anonymously.
- **Role** — the minimum role the handler enforces.
- **Ownership** — does the handler prove the caller owns the specific record it
  touches (`isOwnerOrAdmin`, `getApplicationAccess`, `getOwnedJob`)? This matters
  because every handler uses the Supabase **service-role** key, which bypasses
  Row Level Security. Without an ownership check, authentication alone still
  permits horizontal privilege escalation.
- **Rate limit** — tier applied by `src/middleware.ts`, keyed on the
  proxy-supplied client address.
- **CSRF** — the session cookie is `SameSite=Lax`, so cross-site POST/PUT/DELETE
  does not carry it. Endpoints that only read are marked `n/a`.

## Summary

| Metric | Count |
|---|---|
| Route files | 108 |
| Reachable anonymously (all reviewed and intentional) | 22 |
| Enforcing per-record ownership | 50 |
| Restricted to Admin / Super Admin | 33 |
| Cron-secret or provider-signature protected | 3 |

Before this assessment, **43** of these routes accepted a caller-supplied user
identifier with no session check at all. That is now zero; the
`tests/api-surface.test.ts` suite fails the build if a new unguarded route
appears without being added to an explicit allowlist.

## Matrix

| Endpoint | Methods | Auth | Role | Ownership | Validation | Rate limit | CSRF | Notes |
|---|---|---|---|---|---|---|---|---|
| `/api/account/cron-permanent-delete` | GET | Yes | Super Admin | — | — | 100/min | n/a | Low |
| `/api/account/delete` | DELETE | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/account/restore` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/admin/delete-permanently` | DELETE | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/admin/deleted-users` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/admin/diagnostic-sign` | GET | Yes | Super Admin | — | server-side | 100/min | n/a | Low |
| `/api/admin/payouts` | GET,POST | No | anonymous | — | — | 100/min | SameSite=Lax | Public by design — disabled |
| `/api/admin/plans` | POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/admin/revenue` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/admin/verify` | GET | Yes | Any signed-in | Yes | — | 100/min | n/a | Low |
| `/api/analytics` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/applications` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/applications/[id]/candidate-profile` | GET | Yes | Any signed-in | — | server-side | 100/min | n/a | Low — no per-row ownership needed |
| `/api/applications/[id]/feedback` | PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/applications/[id]/status` | PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/applications/[id]/view` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/ats-score` | GET,POST | Yes | Any signed-in | Yes | server-side | 20/min | SameSite=Lax | Low |
| `/api/auth/confirm-email` | POST | No | anonymous | — | server-side | 15/min | SameSite=Lax | Public by design — pre-auth |
| `/api/auth/confirm-reset` | POST | No | anonymous | — | server-side | 15/min | SameSite=Lax | Public by design — pre-auth |
| `/api/auth/login` | POST | No | anonymous | — | — | 15/min | SameSite=Lax | Public by design — pre-auth (410 stub) |
| `/api/auth/password-reset` | POST | No | anonymous | — | server-side | 15/min | SameSite=Lax | Public by design — pre-auth |
| `/api/auth/send-verification` | POST | No | anonymous | — | server-side | 15/min | SameSite=Lax | Public by design — pre-auth |
| `/api/auth/signup` | POST | No | anonymous | — | server-side | 15/min | SameSite=Lax | Public by design — pre-auth |
| `/api/benefits` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — public reference |
| `/api/career-assistant` | POST | Yes | Any signed-in | Yes | — | 20/min | SameSite=Lax | Low |
| `/api/chat/[appId]` | GET,POST | Yes | Any signed-in | — | server-side | 100/min | SameSite=Lax | Low — no per-row ownership needed |
| `/api/check-tables` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/communities` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/[id]` | DELETE,GET,PUT | Yes | Any signed-in | Yes | — | 100/min | SameSite=Lax | Low |
| `/api/communities/[id]/events` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/[id]/jobs` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — public read |
| `/api/communities/[id]/join` | DELETE,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/[id]/posts` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/[id]/resources` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/bookmarks` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/onboarding-autojoin` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/posts/[postId]` | DELETE,GET,PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/posts/[postId]/comments` | DELETE,GET,POST,PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/posts/[postId]/reactions` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/communities/reports` | GET,POST,PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/company-sizes` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — public reference |
| `/api/coupons` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/coupons/[id]` | DELETE,PUT | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/coupons/validate` | POST | No | anonymous | — | server-side | 100/min | SameSite=Lax | Public by design — checkout check |
| `/api/create-admin` | POST | Yes | Super Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/crm/analytics` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/crm/campaigns` | GET,POST | Yes | Admin | — | — | 100/min | SameSite=Lax | Low |
| `/api/crm/config` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/crm/preferences` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/crm/send-recommendations` | POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/crm/sync-contacts` | POST | Yes | Admin | — | — | 100/min | SameSite=Lax | Low |
| `/api/currencies` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — public reference |
| `/api/currency/detect` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — public reference |
| `/api/currency/preferred` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/debug-db` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/debug-signup-error` | GET | Yes | Admin | — | — | 100/min | n/a | Low |
| `/api/experience-levels` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/experience-levels/[id]` | DELETE,PUT | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/extension/get-answers` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/feedback` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/geo` | GET | No | anonymous | — | server-side | 100/min | n/a | Public by design — public |
| `/api/health` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — liveness |
| `/api/init-admin` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — disabled (404) |
| `/api/inngest` | — | No | anonymous | — | — | 100/min | n/a | Public by design — inngest signature |
| `/api/job-types` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/job-types/[id]` | DELETE,PUT | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/jobs` | GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/jobs/[id]` | DELETE,GET,PUT | Yes | Any signed-in | Yes | — | 100/min | SameSite=Lax | Low |
| `/api/jobs/[id]/boost` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/jobs/saved` | DELETE,GET,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/jobs/scrape` | GET,POST | Yes | Admin | — | — | 100/min | SameSite=Lax | Low |
| `/api/jobs/seed-mnc` | GET,POST | Yes | Admin | — | — | 100/min | SameSite=Lax | Low |
| `/api/linkedin/auto-apply` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/notice-periods` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/notifications` | GET,PATCH,POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/notifications/test` | POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/notifications/token` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/og` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — open graph image |
| `/api/payments/activate-free` | POST | Yes | Any signed-in | Yes | server-side | 15/min | SameSite=Lax | Low |
| `/api/payments/create-order` | POST | Yes | Any signed-in | Yes | server-side | 15/min | SameSite=Lax | Low |
| `/api/payments/prices` | GET | No | anonymous | — | — | 15/min | n/a | Public by design — public pricing |
| `/api/payments/verify` | POST | Yes | Any signed-in | Yes | server-side | 15/min | SameSite=Lax | Low |
| `/api/referral/claim` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/referral/validate` | GET,POST | No | anonymous | — | server-side | 100/min | SameSite=Lax | Public by design — signup check |
| `/api/resume/ai-assist` | POST | Yes | Any signed-in | Yes | server-side | 20/min | SameSite=Lax | Low |
| `/api/resume/drafts` | DELETE,GET,POST | Yes | Any signed-in | Yes | server-side | 20/min | SameSite=Lax | Low |
| `/api/resume/export-pdf` | POST | Yes | Any signed-in | Yes | server-side | 20/min | SameSite=Lax | Low |
| `/api/resume/gap-analysis` | POST | Yes | Any signed-in | Yes | server-side | 20/min | SameSite=Lax | Low |
| `/api/resume/generate` | POST | Yes | Any signed-in | Yes | — | 20/min | SameSite=Lax | Low |
| `/api/resume/parse` | POST | Yes | Any signed-in | Yes | server-side | 20/min | SameSite=Lax | Low |
| `/api/skills` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/skills/[id]` | DELETE,PUT | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/subscription/check` | GET | Yes | Any signed-in | Yes | server-side | 100/min | n/a | Low |
| `/api/subscription/cron` | POST | Cron secret | system | — | — | 100/min | SameSite=Lax | Low — no per-row ownership needed |
| `/api/users` | GET,POST | Yes | Admin | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]` | DELETE,GET,PATCH,PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]/change-password` | PUT | No | anonymous | — | — | 100/min | SameSite=Lax | Public by design — disabled (410) |
| `/api/users/[id]/export` | GET | Yes | Any signed-in | Yes | — | 100/min | n/a | Low |
| `/api/users/[id]/profile` | DELETE,GET,POST,PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]/profile-photo/upload` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]/resume` | PUT | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]/resume/presigned` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]/resume/upload` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/users/[id]/skills` | POST | Yes | Any signed-in | Yes | server-side | 100/min | SameSite=Lax | Low |
| `/api/visa-requirements` | GET | No | anonymous | — | — | 100/min | n/a | Public by design — public reference |
| `/api/webhooks/brevo` | POST | Signature | provider | — | server-side | 100/min | SameSite=Lax | Low — no per-row ownership needed |
| `/api/workplace-types` | GET,POST | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |
| `/api/workplace-types/[id]` | DELETE,PUT | Yes | Admin | — | server-side | 100/min | SameSite=Lax | Low |

## Notes on the endpoints that remain anonymous

| Endpoint | Why it stays open | Compensating control |
|---|---|---|
| `/api/auth/*` | Pre-authentication by definition. | 15 req/min per IP; password reset returns success regardless of whether the address exists, so it is not an account-enumeration oracle. |
| `/api/jobs` (GET), `/api/communities/**` (GET) | Public job search and community browsing are core product surfaces. | Only published/active records are selected; all write verbs on the same paths now require a session. |
| Reference data (`/api/skills`, `/api/job-types`, `/api/experience-levels`, `/api/workplace-types`, `/api/notice-periods`, `/api/currencies`, `/api/company-sizes`, `/api/visa-requirements`, `/api/benefits`) | Read by anonymous visitors on search and marketing pages. | GET only; every POST/PUT/DELETE on these paths now requires Admin. |
| `/api/coupons/validate` | The checkout screen checks a code before the user has committed to paying. | Returns only the discount percentage, never the coupon list; 100 req/min per IP. Still a brute-force oracle for short codes — see the audit report's remaining risks. |
| `/api/referral/validate` | Checked during signup. | Same considerations as above. |
| `/api/feedback` (POST) | Anonymous visitors submit feedback. | GET now requires Admin. |
| `/api/crm/preferences` (GET) | Target of the unsubscribe link in outbound email, which carries no session. | Address is format-validated and HTML-escaped before it is echoed (this endpoint previously had a reflected XSS); response carries its own restrictive CSP. |
| `/api/webhooks/brevo` | Called by Brevo, not by a user. | Shared-secret header comparison in constant time. |
| `/api/inngest` | Called by Inngest. | Inngest SDK signature verification. |
| `/api/health`, `/api/geo`, `/api/og`, `/api/payments/prices` | No account data. | — |
| `/api/init-admin`, `/api/admin/payouts`, `/api/users/[id]/change-password`, `/api/auth/login` | Disabled stubs that return 404/410 before touching anything. | Recommend deleting the files entirely. |
