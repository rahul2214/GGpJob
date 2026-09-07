import re, io, sys
sys.path.insert(0, 'scratch/sec')
from patchlib import read, write

AUTH_IMPORT = {
    'admin': "import { requireAdmin } from '@/lib/auth-server';",
    'auth': "import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';",
}


def inject(path, methods, kind='admin'):
    """Insert an auth guard immediately after the `try {` of each named handler."""
    text, crlf = read(path)
    changed = 0

    for method in methods:
        # Locate the handler signature and capture the request parameter name.
        sig = re.search(
            r'export\s+async\s+function\s+' + method + r'\s*\(\s*(?:(\w+)\s*:)?[^)]*\)\s*\{',
            text)
        if not sig:
            print('  [skip] %s: no %s handler' % (path, method))
            continue

        reqvar = sig.group(1)
        start = sig.end()

        # Find the first `try {` after the signature.
        m = re.compile(r'([ \t]*)try\s*\{[ \t]*\n').search(text, start)
        if not m or m.start() - start > 400:
            print('  [skip] %s %s: no try block found' % (path, method))
            continue

        indent = m.group(1) + '  '

        if kind == 'admin':
            guard = (indent + 'const { errorResponse } = await requireAdmin(%s);\n' % reqvar
                     + indent + 'if (errorResponse) return errorResponse;\n\n')
        else:
            guard = (indent + 'const { user: authUser, errorResponse } = await requireAuth(%s);\n' % reqvar
                     + indent + 'if (errorResponse) return errorResponse;\n\n')

        # Already guarded?
        following = text[m.end():m.end() + 260]
        if 'requireAdmin(' in following or 'requireAuth(' in following:
            print('  [ok] %s %s already guarded' % (path, method))
            continue

        text = text[:m.end()] + guard + text[m.end():]
        changed += 1

    if changed:
        imp = AUTH_IMPORT[kind]
        if 'auth-server' not in text:
            lines = text.split('\n')
            last_import = max(i for i, l in enumerate(lines) if l.startswith('import '))
            lines.insert(last_import + 1, imp)
            text = '\n'.join(lines)
        elif kind == 'auth' and 'requireAuth' not in text.split('\n')[0:40][0]:
            # auth-server already imported but maybe without requireAuth
            if not re.search(r'import\s*\{[^}]*requireAuth', text):
                text = re.sub(r'(import\s*\{)([^}]*)(\}\s*from\s*[\'"]@/lib/auth-server[\'"])',
                              r'\1\2, requireAuth, isOwnerOrAdmin\3', text, count=1)
        write(path, text, crlf)
        print('[OK] %s: guarded %d handler(s) (%s)' % (path, changed, kind))
    else:
        print('[--] %s: nothing to do' % path)


if __name__ == '__main__':
    # ---- Administrative surfaces -------------------------------------------
    inject('src/app/api/coupons/route.ts', ['GET', 'POST'], 'admin')
    inject('src/app/api/coupons/[id]/route.ts', ['PUT', 'DELETE'], 'admin')

    inject('src/app/api/crm/analytics/route.ts', ['GET'], 'admin')
    inject('src/app/api/crm/campaigns/route.ts', ['POST'], 'admin')
    inject('src/app/api/crm/preferences/route.ts', ['GET', 'POST'], 'admin')
    inject('src/app/api/crm/send-recommendations/route.ts', ['POST'], 'admin')
    inject('src/app/api/crm/sync-contacts/route.ts', ['POST'], 'admin')

    inject('src/app/api/skills/route.ts', ['POST'], 'admin')
    inject('src/app/api/skills/[id]/route.ts', ['PUT', 'DELETE'], 'admin')
    inject('src/app/api/job-types/route.ts', ['POST'], 'admin')
    inject('src/app/api/experience-levels/route.ts', ['POST'], 'admin')
    inject('src/app/api/workplace-types/route.ts', ['POST'], 'admin')

    # ---- Authenticated, account-scoped surfaces ----------------------------
    inject('src/app/api/notifications/route.ts', ['GET', 'POST', 'PATCH'], 'auth')
    inject('src/app/api/notifications/token/route.ts', ['POST'], 'auth')
    inject('src/app/api/jobs/saved/route.ts', ['GET', 'POST', 'DELETE'], 'auth')
    inject('src/app/api/subscription/check/route.ts', ['GET'], 'auth')
    inject('src/app/api/currency/preferred/route.ts', ['POST'], 'auth')
    inject('src/app/api/resume/ai-assist/route.ts', ['POST'], 'auth')
    inject('src/app/api/resume/gap-analysis/route.ts', ['POST'], 'auth')
    inject('src/app/api/resume/parse/route.ts', ['POST'], 'auth')
    inject('src/app/api/resume/export-pdf/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/[id]/route.ts', ['PUT', 'DELETE'], 'auth')
    inject('src/app/api/communities/[id]/posts/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/[id]/events/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/[id]/resources/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/[id]/join/route.ts', ['POST', 'DELETE'], 'auth')
    inject('src/app/api/communities/posts/[postId]/route.ts', ['PUT', 'DELETE'], 'auth')
    inject('src/app/api/communities/posts/[postId]/comments/route.ts', ['POST', 'PUT', 'DELETE'], 'auth')
    inject('src/app/api/communities/posts/[postId]/reactions/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/bookmarks/route.ts', ['GET', 'POST'], 'auth')
    inject('src/app/api/communities/onboarding-autojoin/route.ts', ['POST'], 'auth')
    inject('src/app/api/communities/reports/route.ts', ['GET', 'POST', 'PUT'], 'auth')
    inject('src/app/api/feedback/route.ts', ['GET'], 'admin')
