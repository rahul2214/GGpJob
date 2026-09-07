import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

IMPORT_OLD = """import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';"""

IMPORT_NEW = """import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';"""


def guard(indent):
    return (indent + "const { errorResponse } = await requireAdmin(request);\n"
            + indent + "if (errorResponse) return errorResponse;\n\n")


def handler_edit(name, indent):
    head = ("export async function %s(request: Request, { params }: { params: { id: string } }) {\n"
            "%stry {\n" % (name, indent[:-2]))
    return (head, head + guard(indent))


# Reference-data CRUD is administrative; it was reachable anonymously.
for f in [
    'src/app/api/job-types/[id]/route.ts',
    'src/app/api/experience-levels/[id]/route.ts',
    'src/app/api/workplace-types/[id]/route.ts',
]:
    patch(f, [
        (IMPORT_OLD, IMPORT_NEW),
        handler_edit('PUT', '    '),
        handler_edit('DELETE', '      '),
    ])

patch('src/app/api/notice-periods/route.ts', [
    (IMPORT_OLD, IMPORT_NEW),
    ("export async function POST(request: Request) {\n  try {\n",
     "export async function POST(request: Request) {\n  try {\n" + guard('    ')),
])

# ---------- POST /api/jobs: unauthenticated job creation as any recruiter ----------
patch('src/app/api/jobs/route.ts', [
(
r"""import { matchesCountry } from '@/lib/recommendation-engine';""",
r"""import { matchesCountry } from '@/lib/recommendation-engine';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';"""
),
(
r"""export async function POST(request: Request) {
    try {
        const data = await request.json();
        const { recruiterId, adminId } = data;
        const userId = recruiterId || adminId;

        if (!userId) {
            return NextResponse.json({ error: 'Recruiter ID is required' }, { status: 400 });
        }""",
r"""export async function POST(request: Request) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const data = await request.json();
        const { recruiterId, adminId } = data;
        const userId = recruiterId || adminId;

        if (!userId) {
            return NextResponse.json({ error: 'Recruiter ID is required' }, { status: 400 });
        }

        // The posting identity comes from the request body, so bind it to the
        // verified session. Otherwise anyone could publish listings under any
        // recruiter's name.
        if (!isOwnerOrAdmin(authUser!, userId)) {
            return NextResponse.json({ error: 'Forbidden: Cannot post a job on behalf of another account.' }, { status: 403 });
        }"""
),
])
