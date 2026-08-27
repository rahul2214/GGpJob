import { NextResponse } from 'next/server';
import { getSignedResumeUrl } from '@/lib/r2';
import { requireSuperAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { user, errorResponse } = await requireSuperAdmin(request);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(request.url);
    const uri = searchParams.get('uri');

    if (!uri) return NextResponse.json({ error: 'Missing uri param' }, { status: 400 });

    try {
        const signedUrl = await getSignedResumeUrl(uri);
        return NextResponse.json({ 
            original: uri,
            signed: signedUrl,
            success: signedUrl.startsWith('https://')
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message || 'Diagnostic signing failed' }, { status: 500 });
    }
}
