import { NextResponse, NextRequest } from 'next/server';
import { getPostSummaries } from '@/lib/blog';
import { requireAdmin } from '@/lib/auth-server';

export async function GET(request: NextRequest) {
  try {
    const { errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;

    const summaries = getPostSummaries();

    return NextResponse.json({
      success: true,
      total: summaries.length,
      blogs: summaries,
    });
  } catch (err: any) {
    console.error('[API_CRM_BLOGS_GET] Error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
