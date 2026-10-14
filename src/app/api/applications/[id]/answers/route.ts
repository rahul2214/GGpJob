import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { safeErrorResponse } from '@/lib/security';
import {
  getApplicationAnswers,
  AuthorizationError,
  ValidationError,
} from '@/lib/screening-questions-server';

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/applications/[id]/answers
 * Protected endpoint to retrieve candidate screening answers for an application.
 * Strictly checks that caller is either the authorized recruiter for this job,
 * the candidate themselves, or an admin.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const { application, answers } = await getApplicationAnswers(id, authUser);

    return NextResponse.json(
      {
        applicationId: application.id,
        jobTitle: application.jobs?.title,
        companyName: application.jobs?.company_name,
        applicantName: application.jobseekers?.name,
        applicantEmail: application.jobseekers?.email,
        appliedAt: application.applied_at,
        answers,
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return safeErrorResponse(error, 'Failed to fetch application screening answers');
  }
}
