import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"

export const dynamic = 'force-dynamic';

// GET: Fetch all resume drafts for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 })
    }

    // Resolve UUID to bigint jobseeker id
    const { data: jobseeker, error: jsError } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', userId)
      .maybeSingle()

    if (jsError) {
      console.error("Database fetch error for jobseeker:", jsError)
      return NextResponse.json({ error: "Failed to fetch jobseeker" }, { status: 500 })
    }

    if (!jobseeker) {
      return NextResponse.json([])
    }

    const { data, error } = await supabaseAdmin
      .from('resume_drafts')
      .select('user_id, title, template_type, updated_at, resume_data')
      .eq('user_id', jobseeker.id)
      .maybeSingle()

    if (error) {
      console.error("Failed to fetch resume drafts:", error)
      return NextResponse.json({ error: "Failed to fetch drafts" }, { status: 500 })
    }

    const mappedDrafts = data ? [{
      id: data.user_id.toString(),
      title: data.title,
      template_type: data.template_type,
      updated_at: data.updated_at,
      resume_data: data.resume_data
    }] : []

    return NextResponse.json(mappedDrafts)
  } catch (error: any) {
    console.error("Resume drafts GET error:", error)
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
  }
}

// POST: Upsert (Create or Update) a resume draft
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { userId, title, templateType, resumeData } = body

    if (!userId || !resumeData) {
      return NextResponse.json({ error: "Missing required fields: userId and resumeData" }, { status: 400 })
    }

    // Resolve UUID to bigint jobseeker id
    const { data: jobseeker, error: jsError } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', userId)
      .maybeSingle()

    if (jsError || !jobseeker) {
      console.error("Failed to resolve jobseeker for draft save:", jsError)
      return NextResponse.json({ error: "Failed to resolve jobseeker" }, { status: 400 })
    }

    const payload: any = {
      user_id: jobseeker.id,
      title: title || 'Untitled Resume',
      template_type: templateType || 'Software Engineer',
      resume_data: resumeData,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabaseAdmin
      .from('resume_drafts')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) {
      console.error("Failed to save resume draft:", error)
      return NextResponse.json({ error: "Failed to save draft" }, { status: 500 })
    }

    const responseData = {
      id: data.user_id.toString(),
      user_id: data.user_id,
      title: data.title,
      template_type: data.template_type,
      resume_data: data.resume_data,
      updated_at: data.updated_at
    }

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error("Resume drafts POST error:", error)
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
  }
}

// DELETE: Delete a resume draft
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const userId = searchParams.get("userId")

    if (!id || !userId) {
      return NextResponse.json({ error: "Missing id or userId parameters" }, { status: 400 })
    }

    // Resolve UUID to bigint jobseeker id to verify ownership
    const { data: jobseeker, error: jsError } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', userId)
      .maybeSingle()

    if (jsError || !jobseeker || jobseeker.id.toString() !== id) {
      console.error("Unauthorized or invalid jobseeker ID for delete")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabaseAdmin
      .from('resume_drafts')
      .delete()
      .eq('user_id', jobseeker.id)

    if (error) {
      console.error("Failed to delete resume draft:", error)
      return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Resume drafts DELETE error:", error)
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 })
  }
}
