import { NextResponse } from 'next/server';
import { getSignedResumeUrl } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const uri = searchParams.get('uri');

    if (!uri) return NextResponse.json({ error: 'Missing uri param' }, { status: 400 });

    try {
        console.log(`[DIAGNOSTIC] Signing URI: ${uri}`);
        const signedUrl = await getSignedResumeUrl(uri);
        return NextResponse.json({ 
            original: uri,
            signed: signedUrl,
            success: signedUrl.startsWith('https://'),
            details: {
                endpoint: process.env.R2_ENDPOINT,
                bucket: process.env.R2_BUCKET_NAME,
                accountId: process.env.R2_ACCOUNT_ID
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
