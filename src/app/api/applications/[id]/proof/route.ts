import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { uploadToR2, deleteFromR2 } from '@/lib/r2';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id: applicationId } = params;
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 1. Validation (Same as resume)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size exceeds 2MB limit' }, { status: 400 });
    }

    // 2. Resolve application internal PK
    const { data: application, error: appError } = await supabaseAdmin
        .from('applications')
        .select('id, proof_url')
        .eq('id', applicationId)
        .single();

    if (appError || !application) {
        return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // 3. Prepare R2 Key
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `proof-${Date.now()}.${fileExt}`;
    const key = `proofs/${applicationId}/${fileName}`;

    // 4. Convert File to Buffer for Upload
    const buffer = Buffer.from(await file.arrayBuffer());
    const contentType = file.type || 'image/png';

    // 5. Upload to R2
    const { r2Uri } = await uploadToR2(key, buffer, contentType);
    
    // 6. Database Cleanup & Update
    const oldProofUrl = application.proof_url;

    // Cleanup old R2 file if it exists
    if (oldProofUrl && oldProofUrl.startsWith('r2://') && oldProofUrl !== r2Uri) {
      await deleteFromR2(oldProofUrl);
    }

    // Update application
    const { error: dbError } = await supabaseAdmin
      .from('applications')
      .update({ proof_url: r2Uri, updated_at: new Date().toISOString() })
      .eq('id', application.id);

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      proofUrl: r2Uri
    });

  } catch (error: any) {
    console.error('[API_PROOF_UPLOAD_ERROR]:', error);
    return NextResponse.json(
      { error: 'Failed to upload proof', details: error.message },
      { status: 500 }
    );
  }
}
