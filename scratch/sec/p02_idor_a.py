import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

# --- /api/extension/get-answers : unauthenticated PII disclosure by uuid ---
patch('src/app/api/extension/get-answers/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const { userId, questions } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';
import path from 'path';
import fs from 'fs';

export async function POST(request: Request) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { userId, questions } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // This route returns the profile's personal details, so the caller must
        // be the profile owner (or an administrator).
        if (!isOwnerOrAdmin(authUser!, userId)) {
            return NextResponse.json({ error: 'Forbidden: Cannot read another user profile.' }, { status: 403 });
        }"""
),
])

# --- /api/resume/drafts : unauthenticated read/write of any user's resume ---
patch('src/app/api/resume/drafts/route.ts', [
(
r"""import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = 'force-dynamic';""",
r"""import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAuth, isOwnerOrAdmin } from "@/lib/auth-server"

export const dynamic = 'force-dynamic';"""
),
(
r"""export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }""",
r"""export async function GET(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req)
    if (errorResponse) return errorResponse

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot read another user's drafts." }, { status: 403 })
    }"""
),
(
r"""export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, title, templateType, resumeData } = body

    if (!userId || !resumeData) {
      return NextResponse.json({ error: "Missing required fields: userId and resumeData" }, { status: 400 })
    }""",
r"""export async function POST(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req)
    if (errorResponse) return errorResponse

    const body = await req.json()
    const { userId, title, templateType, resumeData } = body

    if (!userId || !resumeData) {
      return NextResponse.json({ error: "Missing required fields: userId and resumeData" }, { status: 400 })
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot modify another user's drafts." }, { status: 403 })
    }"""
),
(
r"""export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId parameters" }, { status: 400 })
    }""",
r"""export async function DELETE(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req)
    if (errorResponse) return errorResponse

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId parameters" }, { status: 400 })
    }

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot delete another user's drafts." }, { status: 403 })
    }"""
),
])

# --- /api/users/[id]/skills : unauthenticated overwrite of any user's skills ---
patch('src/app/api/users/[id]/skills/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';"""
),
(
r"""  try {
    const { id: userId } = params;
    const body = await request.json();
    const skills: { id: string; name: string }[] = body.skills || [];

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills array is required.' }, { status: 400 });
    }""",
r"""  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id: userId } = params;

    if (!isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot modify another user profile.' }, { status: 403 });
    }

    const body = await request.json();
    const skills: { id: string; name: string }[] = body.skills || [];

    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: 'Skills array is required.' }, { status: 400 });
    }

    // Bound the payload so a single request cannot create unlimited skill rows.
    if (skills.length > 100) {
      return NextResponse.json({ error: 'A maximum of 100 skills may be saved.' }, { status: 400 });
    }
    if (skills.some(s => typeof s?.name === 'string' && s.name.length > 120)) {
      return NextResponse.json({ error: 'Skill names must be 120 characters or fewer.' }, { status: 400 });
    }"""
),
])

# --- /api/users/[id]/resume (PUT) : unauth resume pointer overwrite + file deletion ---
patch('src/app/api/users/[id]/resume/route.ts', [
(
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';""",
r"""import { resolveResumeUrl } from '@/lib/resolve-resume';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';"""
),
(
r"""    try {
        const { id: userId } = params;
        let { resumeUrl } = await request.json();

        if (!resumeUrl) {
            return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });
        }""",
r"""    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { id: userId } = params;

        if (!isOwnerOrAdmin(authUser!, userId)) {
            return NextResponse.json({ error: 'Forbidden: Cannot modify another user profile.' }, { status: 403 });
        }

        let { resumeUrl } = await request.json();

        if (!resumeUrl || typeof resumeUrl !== 'string') {
            return NextResponse.json({ error: 'Resume URL is required' }, { status: 400 });
        }

        // Only storage URIs this application issues, or https links, may be stored.
        // This stops a caller pointing the profile at javascript:/data: URLs.
        if (!resumeUrl.startsWith('r2://') && !resumeUrl.startsWith('https://')) {
            return NextResponse.json({ error: 'Resume URL must be an https:// or r2:// location.' }, { status: 400 });
        }"""
),
])

# --- /api/account/restore : unauthenticated un-deletion of any account ---
patch('src/app/api/account/restore/route.ts', [
(
r"""import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId, uuid, id } = await request.json();
    const targetId = userId || uuid || id;

    if (!targetId) {
      return NextResponse.json({ error: 'Missing required userId/uuid parameter' }, { status: 400 });
    }""",
r"""import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { userId, uuid, id } = await request.json();
    const targetId = userId || uuid || id;

    if (!targetId) {
      return NextResponse.json({ error: 'Missing required userId/uuid parameter' }, { status: 400 });
    }

    // Restoring an account reactivates all of its access, so only the account
    // holder (who can still authenticate during the grace period) or an
    // administrator may do it.
    if (!isOwnerOrAdmin(authUser!, targetId)) {
      return NextResponse.json({ error: 'Forbidden: Cannot restore another user account.' }, { status: 403 });
    }"""
),
])
