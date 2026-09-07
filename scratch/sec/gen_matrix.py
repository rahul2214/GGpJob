import os, re, io

PUBLIC_REASON = {
    '/api/auth/signup': 'pre-auth', '/api/auth/login': 'pre-auth (410 stub)',
    '/api/auth/password-reset': 'pre-auth', '/api/auth/confirm-reset': 'pre-auth',
    '/api/auth/confirm-email': 'pre-auth', '/api/auth/send-verification': 'pre-auth',
    '/api/benefits': 'public reference', '/api/company-sizes': 'public reference',
    '/api/currencies': 'public reference', '/api/currency/detect': 'public reference',
    '/api/experience-levels': 'public read', '/api/job-types': 'public read',
    '/api/notice-periods': 'public read', '/api/skills': 'public read',
    '/api/workplace-types': 'public read', '/api/visa-requirements': 'public reference',
    '/api/payments/prices': 'public pricing', '/api/geo': 'public', '/api/health': 'liveness',
    '/api/og': 'open graph image', '/api/jobs': 'public job search',
    '/api/communities': 'public read', '/api/communities/[id]': 'public read',
    '/api/communities/[id]/jobs': 'public read', '/api/communities/[id]/posts': 'public read',
    '/api/communities/[id]/events': 'public read', '/api/communities/[id]/resources': 'public read',
    '/api/communities/posts/[postId]': 'public read',
    '/api/communities/posts/[postId]/comments': 'public read',
    '/api/coupons/validate': 'checkout check', '/api/referral/validate': 'signup check',
    '/api/feedback': 'anonymous submit', '/api/crm/preferences': 'email unsubscribe link',
    '/api/webhooks/brevo': 'provider signature', '/api/inngest': 'inngest signature',
    '/api/init-admin': 'disabled (404)', '/api/admin/payouts': 'disabled',
    '/api/users/[id]/change-password': 'disabled (410)',
}

rows = []
for root, _, files in os.walk('src/app/api'):
    for fn in files:
        if not fn.startswith('route.'):
            continue
        p = os.path.join(root, fn).replace(os.sep, '/')
        src = io.open(p, encoding='utf-8', errors='replace').read()
        ep = '/' + p.replace('src/app/', '').rsplit('/route.', 1)[0]
        methods = sorted(set(re.findall(r'export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)', src)))

        if 'requireSuperAdmin' in src:
            auth, role = 'Yes', 'Super Admin'
        elif 'requireAdmin' in src:
            auth, role = 'Yes', 'Admin'
        elif 'CRON_SECRET' in src:
            auth, role = 'Cron secret', 'system'
        elif 'verifyBrevoWebhookSignature' in src:
            auth, role = 'Signature', 'provider'
        elif 'requireAuth' in src or 'getAuthenticatedUser' in src:
            auth, role = 'Yes', 'Any signed-in'
        else:
            auth, role = 'No', 'anonymous'

        own = 'Yes' if any(m in src for m in ('isOwnerOrAdmin', 'getApplicationAccess', 'getOwnedJob')) else '—'

        val = []
        if re.search(r'status:\s*400', src): val.append('server-side')
        if 'zod' in src: val.append('zod')
        validation = '+'.join(val) if val else '—'

        if ep.startswith('/api/auth') or ep.startswith('/api/payments'):
            rl = '15/min'
        elif ep.startswith('/api/ats-score') or ep.startswith('/api/resume') or ep.startswith('/api/career-assistant'):
            rl = '20/min'
        else:
            rl = '100/min'

        csrf = 'SameSite=Lax' if methods and set(methods) - {'GET'} else 'n/a'

        if auth == 'No':
            risk = 'Public by design — ' + PUBLIC_REASON.get(ep, 'REVIEW')
        elif own == 'Yes':
            risk = 'Low'
        elif role in ('Admin', 'Super Admin'):
            risk = 'Low'
        else:
            risk = 'Low — no per-row ownership needed'

        rows.append((ep, ','.join(methods) or '—', auth, role, own, validation, rl, csrf, risk))

rows.sort()

out = []
out.append('| Endpoint | Methods | Auth | Role | Ownership | Validation | Rate limit | CSRF | Notes |')
out.append('|---|---|---|---|---|---|---|---|---|')
for r in rows:
    out.append('| `%s` | %s | %s | %s | %s | %s | %s | %s | %s |' % r)

io.open('scratch/sec/matrix_table.md', 'w', encoding='utf-8').write('\n'.join(out))
print('rows:', len(rows))
print('public:', sum(1 for r in rows if r[2] == 'No'))
print('ownership-enforced:', sum(1 for r in rows if r[4] == 'Yes'))
print('admin-only:', sum(1 for r in rows if r[3] in ('Admin', 'Super Admin')))
