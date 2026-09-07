import os, re, io

rows = []
for root, _, files in os.walk('src/app/api'):
    for fn in files:
        if not fn.startswith('route.'):
            continue
        p = os.path.join(root, fn).replace(os.sep, '/')
        src = io.open(p, encoding='utf-8', errors='replace').read()
        ep = '/' + p.replace('src/app/', '').rsplit('/route.', 1)[0]
        methods = re.findall(r'export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)', src)
        auth = []
        if 'requireSuperAdmin' in src: auth.append('SuperAdmin')
        if 'requireAdmin' in src: auth.append('Admin')
        if 'requireAuth' in src: auth.append('Auth')
        if 'getAuthenticatedUser' in src and 'requireAuth' not in src: auth.append('Auth*')
        if 'CRON_SECRET' in src: auth.append('CronSecret')
        if 'verifyBrevoWebhookSignature' in src: auth.append('WebhookSig')
        if 'deprecated' in src.lower() or 'status: 410' in src or 'feature disabled' in src.lower():
            auth.append('DISABLED')
        own = ('isOwnerOrAdmin' in src) or ('getApplicationAccess' in src) or ('getOwnedJob' in src)
        rows.append((ep, ','.join(sorted(set(methods))) or '-', '+'.join(sorted(set(auth))) or 'PUBLIC', 'yes' if own else '-'))

rows.sort()
pub = [r for r in rows if r[2] == 'PUBLIC']
print('TOTAL ROUTES:', len(rows))
print('STILL PUBLIC:', len(pub))
for r in pub:
    print('  PUBLIC:', r[0], '[' + r[1] + ']')
io.open('scratch/sec/matrix.tsv', 'w', encoding='utf-8').write('\n'.join('\t'.join(r) for r in rows))
