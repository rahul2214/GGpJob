import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-server';
import { safeErrorResponse } from '@/lib/security';
import {
  getJobScreeningQuestions,
  saveJobScreeningQuestions,
  AuthorizationError,
  ValidationError,
} from '@/lib/screening-questions-server';

interface RouteContext {
  params: { id: string };
}

/**
 * GET /api/jobs/[id]/questions
 * Public endpoint to fetch published screening questions for a job.
 */
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const questions = await getJobScreeningQuestions(id);
    return NextResponse.json(questions, { status: 200 });
  } catch (error: any) {
    return safeErrorResponse(error, 'Failed to fetch job screening questions');
  }
}

/**
 * PUT /api/jobs/[id]/questions
 * Protected endpoint for recruiters/admins to configure screening questions for a job.
 */
export async function PUT(request: Request, context: RouteContext) {
  try {
    const { user: authUser, errorResponse } = await requireAuth(request);
    if (errorResponse) return errorResponse;

    const { id } = context.params;
    if (!id) {
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const questions = Array.isArray(body) ? body : body.questions;

    if (!Array.isArray(questions)) {
      return NextResponse.json({ error: 'Payload must be an array of questions or contain a questions array.' }, { status: 400 });
    }

    const result = await saveJobScreeningQuestions(id, questions, authUser);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    if (error instanceof ValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return safeErrorResponse(error, 'Failed to save job screening questions');
  }
}

/**
 * POST /api/jobs/[id]/questions
 * Alias for PUT to support both REST conventions.
 */
export async function POST(request: Request, context: RouteContext) {
  return PUT(request, context);
}
