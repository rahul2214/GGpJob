import sys, re, io
sys.path.insert(0, 'scratch/sec')
from patchlib import read, write

OWNERSHIP = """{indent}if ({var} && !isOwnerOrAdmin(authUser!, {var})) {{
{indent}  return NextResponse.json({{ error: 'Forbidden: Cannot access another user account.' }}, {{ status: 403 }});
{indent}}}
"""


def add_after(path, anchor, var, indent='    '):
    text, crlf = read(path)
    if text.count(anchor) != 1:
        print('[MISS] %s: anchor count=%d for %r' % (path, text.count(anchor), anchor[:80]))
        return
    guard = OWNERSHIP.format(indent=indent, var=var)
    text = text.replace(anchor, anchor + '\n' + guard, 1)
    write(path, text, crlf)
    print('[OK] %s: ownership check added for %s' % (path, var))


# GET /api/notifications?userId= — reading another account's notifications.
add_after('src/app/api/notifications/route.ts',
          "    const userId = searchParams.get('userId');", 'userId')

# GET /api/jobs/saved?userId=
add_after('src/app/api/jobs/saved/route.ts',
          "        const userId = searchParams.get('userId'); // auth UUID", 'userId', indent='        ')

# POST /api/jobs/saved
add_after('src/app/api/jobs/saved/route.ts',
          "        const { userId, jobId } = await request.json(); // userId = user.uuid, jobId = job.uuid",
          'userId', indent='        ')

# POST /api/currency/preferred
add_after('src/app/api/currency/preferred/route.ts',
          "    const { userId, preferredCurrency, preferredCurrencyId, country } = body;", 'userId')

# POST /api/notifications/token — registering a push token against an account.
add_after('src/app/api/notifications/token/route.ts',
          "    const { userId, token, platform } = await request.json();", 'userId')
