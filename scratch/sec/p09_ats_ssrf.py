import sys; sys.path.insert(0, 'scratch/sec')
from patchlib import patch

patch('src/app/api/ats-score/route.ts', [
(
r"""import { supabaseAdmin } from "@/lib/supabase-admin"

// Force nodejs runtime for parser compatibility""",
r"""import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAuth, isOwnerOrAdmin } from "@/lib/auth-server"
import { safeFetch, SsrfBlockedError } from "@/lib/ssrf-guard"
import { validateFileContent, RESUME_FILE_RULES } from "@/lib/upload-validation"

// Force nodejs runtime for parser compatibility"""
),
(
r"""export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const resumeUrl = formData.get("resumeUrl") as string | null
    const jobDescription = formData.get("jobDescription") as string | null
    const userId = formData.get("userId") as string | null

    if (!file && !resumeUrl) {
      return NextResponse.json({ error: "No file or resume URL provided" }, { status: 400 })
    }

    if (file && file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 413 })
    }""",
r"""export async function POST(req: NextRequest) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(req)
    if (errorResponse) return errorResponse

    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const resumeUrl = formData.get("resumeUrl") as string | null
    const jobDescription = formData.get("jobDescription") as string | null
    const userId = formData.get("userId") as string | null

    if (!file && !resumeUrl) {
      return NextResponse.json({ error: "No file or resume URL provided" }, { status: 400 })
    }

    if (file && file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size exceeds 5MB limit." }, { status: 413 })
    }

    if (userId && !isOwnerOrAdmin(authUser!, userId)) {
      return NextResponse.json({ error: "Forbidden: Cannot analyse another user's resume." }, { status: 403 })
    }

    if (jobDescription && jobDescription.length > 20000) {
      return NextResponse.json({ error: "Job description is too long." }, { status: 400 })
    }"""
),
(
r"""    } else {
      const resolved = await resolveResumeUrl(resumeUrl)
      if (!resolved) {
        return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
      }
      const downloadResponse = await fetch(resolved)
      if (!downloadResponse.ok) {
        return NextResponse.json({ error: "Failed to download resume from storage" }, { status: 400 })
      }
      const bytes = await downloadResponse.arrayBuffer()
      buffer = Buffer.from(bytes)
      fileName = resumeUrl || ""
    }""",
r"""    } else {
      // `resumeUrl` arrives from the client, so it is never fetched directly.
      // It must be a storage URI that this account actually owns; anything else
      // would let a caller aim the server at an arbitrary address.
      if (!resumeUrl!.startsWith("r2://")) {
        return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
      }

      const { data: ownerRow } = await supabaseAdmin
        .from('jobseekers')
        .select('id, resume_url')
        .eq(String(authUser!.uuid).includes('-') ? 'uuid' : 'id', String(authUser!.uuid).includes('-') ? authUser!.uuid : authUser!.id)
        .maybeSingle()

      if (!ownerRow || ownerRow.resume_url !== resumeUrl) {
        return NextResponse.json({ error: "Forbidden: That resume does not belong to this account." }, { status: 403 })
      }

      const resolved = await resolveResumeUrl(resumeUrl)
      if (!resolved) {
        return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
      }

      let downloadResponse: Response
      try {
        // Signed storage URLs are still fetched through the SSRF guard so a
        // redirect cannot walk the request into the internal network.
        downloadResponse = await safeFetch(resolved, { maxBytes: 5 * 1024 * 1024 })
      } catch (err) {
        if (err instanceof SsrfBlockedError) {
          return NextResponse.json({ error: "Invalid resume URL" }, { status: 400 })
        }
        throw err
      }

      if (!downloadResponse.ok) {
        return NextResponse.json({ error: "Failed to download resume from storage" }, { status: 400 })
      }
      const bytes = await downloadResponse.arrayBuffer()
      buffer = Buffer.from(bytes)
      fileName = resumeUrl || ""
    }"""
),
(
r"""    if (file) {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
    } else {""",
r"""    if (file) {
      const bytes = await file.arrayBuffer()
      buffer = Buffer.from(bytes)
      const fileCheck = validateFileContent(buffer, file.name, file.type, RESUME_FILE_RULES)
      if (!fileCheck.ok) {
        return NextResponse.json({ error: fileCheck.error }, { status: 400 })
      }
      mimeType = fileCheck.contentType
    } else {"""
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
      return NextResponse.json({ error: "Forbidden: Cannot read another user's analysis." }, { status: 403 })
    }"""
),
])
