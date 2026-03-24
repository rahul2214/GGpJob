import { NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const data = await request.json();

    if (!data.name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const cleanedData = {
      name: data.name,
      updatedAt: new Date().toISOString()
    };

    const docRef = db.collection('skills').doc(id);
    await docRef.update(cleanedData);

    return NextResponse.json({ id, ...cleanedData });
  } catch (e: any) {
    console.error("Error updating skill:", e);
    return NextResponse.json({ error: e.message || 'Failed to update skill' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await db.collection('skills').doc(id).delete();
    return NextResponse.json({ message: 'Skill successfully deleted' });
  } catch (e: any) {
    console.error("Error deleting skill:", e);
    return NextResponse.json({ error: e.message || 'Failed to delete skill' }, { status: 500 });
  }
}
