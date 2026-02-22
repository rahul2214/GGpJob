
import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }
    
    const applicationRef = db.collection('applications').doc(id);

    // Update status to 'Profile Viewed' (statusId: 2)
    await applicationRef.update({ 
      statusId: 2,
      viewedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true, message: 'Application status updated to "Profile Viewed"' }, { status: 200 });

  } catch (e: any) {
    console.error('[API_APP_VIEW] Error:', e);
    return NextResponse.json({ error: 'Failed to update application status', details: e.message }, { status: 500 });
  }
}
