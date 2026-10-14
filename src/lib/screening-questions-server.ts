/**
 * JobsDart — Recruiter Screening Questions & Candidate Questionnaire
 * Server-Side Data Layer, Immutability & Secure Persistence
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import {
  ScreeningQuestion,
  ApplicationAnswer,
  QuestionSnapshot,
  validateQuestionDefinition,
  QUESTIONNAIRE_LIMITS,
} from './screening-questions';

export class AuthorizationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Resolves job numerical ID and UUID securely without causing Postgres 22P02 invalid UUID syntax errors.
 */
export async function resolveJobRecord(jobId: string | number): Promise<any | null> {
  if (!jobId) return null;
  const strId = String(jobId).trim();
  const isNumeric = /^\d+$/.test(strId);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(strId);

  let query = supabaseAdmin.from('jobs').select('id, uuid, recruiter_pk, admin_pk, title, status, sections');

  if (isNumeric) {
    query = query.eq('id', Number(strId));
  } else if (isUuid) {
    query = query.eq('uuid', strId);
  } else {
    query = query.eq('job_id', strId);
  }

  const { data: job, error } = await query.maybeSingle();
  if (error || !job) {
    // If alphanumeric job_id lookup failed, try fallback
    if (!isNumeric && !isUuid) {
      const { data: fallback } = await supabaseAdmin
        .from('jobs')
        .select('id, uuid, recruiter_pk, admin_pk, title, status, sections')
        .ilike('job_id', strId)
        .maybeSingle();
      return fallback || null;
    }
    return null;
  }
  return job;
}

/**
 * Checks whether an authenticated user is the authorized recruiter/owner or admin of a job.
 */
export async function checkJobManagementAccess(job: any, authUser: any): Promise<boolean> {
  if (!authUser || !job) return false;
  const isAdmin = authUser.role === 'Admin' || authUser.role === 'Super Admin' || Boolean(authUser.isSuperAdmin);
  if (isAdmin) return true;

  const authUserId = authUser.id ? String(authUser.id) : null;
  const authUserUuid = authUser.uuid ? String(authUser.uuid) : null;

  if (job.recruiter_pk && (String(job.recruiter_pk) === authUserId || String(job.recruiter_pk) === authUserUuid)) {
    return true;
  }
  if (job.admin_pk && (String(job.admin_pk) === authUserId || String(job.admin_pk) === authUserUuid)) {
    return true;
  }
  if (job.user_pk && (String(job.user_pk) === authUserId || String(job.user_pk) === authUserUuid)) {
    return true;
  }

  // Cross-reference recruiters table if authUser has a UUID
  if (job.recruiter_pk && authUserUuid) {
    try {
      const { data: rec } = await supabaseAdmin
        .from('recruiters')
        .select('id, uuid')
        .eq('uuid', authUserUuid)
        .maybeSingle();
      if (rec && String(rec.id) === String(job.recruiter_pk)) {
        return true;
      }
    } catch {}
  }

  // If job has neither recruiter_pk nor admin_pk set, permit recruiters and admins
  if (!job.recruiter_pk && !job.admin_pk) {
    if (authUser.role === 'Recruiter' || authUser.role === 'Admin' || authUser.role === 'Super Admin') {
      return true;
    }
  }

  if (authUser.email) {
    if (job.recruiter_pk) {
      try {
        const { data: rec } = await supabaseAdmin.from('recruiters').select('email').eq('id', job.recruiter_pk).maybeSingle();
        if (rec && rec.email && rec.email.toLowerCase() === authUser.email.toLowerCase()) {
          return true;
        }
      } catch {}
    }
    if (job.admin_pk) {
      try {
        const { data: adm } = await supabaseAdmin.from('admins').select('email').eq('id', job.admin_pk).maybeSingle();
        if (adm && adm.email && adm.email.toLowerCase() === authUser.email.toLowerCase()) {
          return true;
        }
      } catch {}
    }
  }

  return false;
}

/**
 * Retrieves published screening questions for a job.
 */
export async function getJobScreeningQuestions(jobId: string | number): Promise<ScreeningQuestion[]> {
  const job = await resolveJobRecord(jobId);
  if (!job) return [];

  // 1. Try relational table
  try {
    const { data, error } = await supabaseAdmin
      .from('job_screening_questions')
      .select('*')
      .eq('job_pk', job.id)
      .is('archived_at', null)
      .order('display_order', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((q: any) => ({
        id: q.id,
        jobPk: q.job_pk,
        questionText: q.question_text,
        description: q.description || '',
        questionType: q.question_type,
        isRequired: !!q.is_required,
        displayOrder: q.display_order ?? 0,
        options: Array.isArray(q.options) ? q.options : [],
        validationRules: q.validation_rules || {},
        version: q.version || 1,
        createdAt: q.created_at,
        updatedAt: q.updated_at,
        archivedAt: q.archived_at || null,
      }));
    }
  } catch (err) {
    // Relational table might not exist yet; proceed to graceful fallback
  }

  // 2. Fallback: check jobs.screening_questions column or jobs.sections
  try {
    const { data: colData } = await supabaseAdmin
      .from('jobs')
      .select('screening_questions')
      .eq('id', job.id)
      .maybeSingle();

    if (colData?.screening_questions && Array.isArray(colData.screening_questions) && colData.screening_questions.length > 0) {
      return colData.screening_questions.map((q: any, idx: number) => ({
        id: q.id || `sq_${job.id}_${idx}`,
        jobPk: job.id,
        questionText: q.questionText || q.question_text,
        description: q.description || '',
        questionType: q.questionType || q.question_type,
        isRequired: q.isRequired ?? q.is_required ?? true,
        displayOrder: q.displayOrder ?? q.display_order ?? idx,
        options: Array.isArray(q.options) ? q.options : [],
        validationRules: q.validationRules || q.validation_rules || {},
        version: q.version || 1,
      }));
    }
  } catch (err) {}

  // 3. Fallback: embedded in job.sections
  if (Array.isArray(job.sections)) {
    const screeningSec = job.sections.find((s: any) => s.type === 'screening_questions' || s.title === '__screening_questions__');
    if (screeningSec && Array.isArray(screeningSec.questions)) {
      return screeningSec.questions;
    }
  }

  return [];
}

/**
 * Saves/updates screening questions for a job with versioning & audit safety.
 */
export async function saveJobScreeningQuestions(
  jobId: string | number,
  questions: Array<Partial<ScreeningQuestion>>,
  authUser: any
): Promise<{ success: boolean; questions: ScreeningQuestion[]; version: number; hasExistingApplicants: boolean }> {
  const job = await resolveJobRecord(jobId);
  if (!job) {
    throw new ValidationError('Job not found.');
  }

  if (authUser && !(await checkJobManagementAccess(job, authUser))) {
    throw new AuthorizationError('Forbidden: You are not authorized to configure screening questions for this job.');
  }

  if (questions.length > QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB) {
    throw new ValidationError(`A maximum of ${QUESTIONNAIRE_LIMITS.MAX_QUESTIONS_PER_JOB} questions can be added.`);
  }

  // Validate each question definition
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const validationError = validateQuestionDefinition(q);
    if (validationError) {
      throw new ValidationError(`Question ${i + 1}: ${validationError}`);
    }
  }

  // Check if job already has submitted applications
  let hasExistingApplicants = false;
  try {
    const { count } = await supabaseAdmin
      .from('applications')
      .select('id', { count: 'exact', head: true })
      .eq('job_pk', job.id);
    hasExistingApplicants = !!(count && count > 0);
  } catch (err) {}

  // Determine target questionnaire version
  let currentVersion = 1;
  const existingQuestions = await getJobScreeningQuestions(job.id);
  if (existingQuestions.length > 0) {
    currentVersion = Math.max(...existingQuestions.map((q) => q.version || 1));
  }
  const nextVersion = hasExistingApplicants ? currentVersion + 1 : currentVersion;

  // Prepare normalized questions
  const formattedQuestions: ScreeningQuestion[] = questions.map((q, idx) => ({
    id: q.id || `sq_${job.id}_${Date.now()}_${idx}`,
    jobPk: job.id,
    jobId: job.uuid,
    questionText: (q.questionText || '').trim(),
    description: (q.description || '').trim(),
    questionType: q.questionType!,
    isRequired: q.isRequired ?? true,
    displayOrder: idx,
    options: Array.isArray(q.options) ? q.options.map((o) => String(o).trim()).filter(Boolean) : [],
    validationRules: q.validationRules || {},
    version: nextVersion,
    updatedAt: new Date().toISOString(),
  }));

  // 1. Try persisting into relational table
  let persistedRelational = false;
  try {
    if (hasExistingApplicants) {
      // If there are existing applications, archive the old questions instead of hard-deleting
      await supabaseAdmin
        .from('job_screening_questions')
        .update({ archived_at: new Date().toISOString() })
        .eq('job_pk', job.id)
        .is('archived_at', null);
    } else {
      // No applications yet, safe to clean up previous questions for this job
      await supabaseAdmin.from('job_screening_questions').delete().eq('job_pk', job.id);
    }

    const rowsToInsert = formattedQuestions.map((q) => ({
      job_pk: job.id,
      question_text: q.questionText.trim().substring(0, 500),
      description: q.description ? q.description.trim() : null,
      question_type: q.questionType,
      is_required: Boolean(q.isRequired),
      display_order: q.displayOrder,
      options: Array.isArray(q.options) ? q.options : [],
      validation_rules: (q.validationRules && typeof q.validationRules === 'object' && !Array.isArray(q.validationRules)) ? q.validationRules : {},
      version: nextVersion,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
    }));

    if (rowsToInsert.length > 0) {
      const { data: inserted, error: insertErr } = await supabaseAdmin
        .from('job_screening_questions')
        .insert(rowsToInsert)
        .select();

      if (!insertErr && inserted) {
        persistedRelational = true;
        formattedQuestions.forEach((fq, i) => {
          if (inserted[i]?.id) fq.id = inserted[i].id;
        });
      } else if (insertErr) {
        console.error('[saveJobScreeningQuestions] Relational insert error:', insertErr);
      }
    } else {
      persistedRelational = true;
    }
  } catch (err: any) {
    console.error('[saveJobScreeningQuestions] Relational table exception:', err);
  }

  // 2. Persist in fallback column/sections for guarantee across all environments
  try {
    await supabaseAdmin
      .from('jobs')
      .update({ screening_questions: formattedQuestions })
      .eq('id', job.id);
  } catch (err) {}

  // Ensure job.sections is clean of internal screening_questions metadata
  try {
    const existingSections = Array.isArray(job.sections) ? job.sections : [];
    const hasPollutedSection = existingSections.some(
      (s: any) => s.type === 'screening_questions' || s.title === '__screening_questions__' || String(s.title || '').startsWith('__')
    );
    if (hasPollutedSection) {
      const cleanedSections = existingSections.filter(
        (s: any) => s.type !== 'screening_questions' && s.title !== '__screening_questions__' && !String(s.title || '').startsWith('__')
      );
      await supabaseAdmin.from('jobs').update({ sections: cleanedSections }).eq('id', job.id);
    }
  } catch (err) {}

  return {
    success: true,
    questions: formattedQuestions,
    version: nextVersion,
    hasExistingApplicants,
  };
}

/**
 * Saves candidate application answers atomically with immutable question snapshots.
 */
export async function saveApplicationAnswers(
  applicationId: string | number,
  answers: Array<{
    questionId: string | number;
    questionSnapshot: QuestionSnapshot;
    answerValue: any;
  }>
): Promise<boolean> {
  if (!answers || answers.length === 0) return true;

  // 1. Try relational table
  try {
    const rows = answers.map((a) => {
      const isNumericQId = typeof a.questionId === 'number' || /^\d+$/.test(String(a.questionId));
      const safeSnapshot = (a.questionSnapshot && typeof a.questionSnapshot === 'object' && !Array.isArray(a.questionSnapshot))
        ? a.questionSnapshot
        : { id: a.questionId, questionText: 'Screening Question' };

      return {
        application_id: applicationId,
        question_id: isNumericQId ? Number(a.questionId) : null,
        question_snapshot: safeSnapshot,
        answer_value: a.answerValue !== undefined ? a.answerValue : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });

    const { error } = await supabaseAdmin.from('job_application_answers').insert(rows);
    if (!error) return true;
  } catch (err) {}

  // 2. Fallback: Save to applications.screening_answers
  try {
    await supabaseAdmin
      .from('applications')
      .update({ screening_answers: answers })
      .eq('id', applicationId);
    return true;
  } catch (err) {}

  return false;
}

/**
 * Retrieves candidate answers for an application with strict authorization.
 */
export async function getApplicationAnswers(
  applicationId: string | number,
  authUser: any
): Promise<{ application: any; answers: ApplicationAnswer[] }> {
  // 1. Fetch application with job and seeker info
  const { data: app, error } = await supabaseAdmin
    .from('applications')
    .select(`
      *,
      jobs(*),
      jobseekers(*)
    `)
    .eq('id', applicationId)
    .maybeSingle();

  if (error || !app) {
    throw new ValidationError('Application not found.');
  }

  // 2. Strict authorization:
  // Must be:
  // - Admin
  // - Recruiter who owns the job (job.recruiter_pk === authUser.id)
  // - The candidate themselves (app.user_pk === authUser.id)
  const isAdmin = authUser.role === 'Admin' || authUser.role === 'Super Admin' || Boolean(authUser.isSuperAdmin);
  const isJobRecruiter = await checkJobManagementAccess(app.jobs, authUser);
  const isCandidateOwner =
    (app.user_pk && String(app.user_pk) === String(authUser.id)) ||
    (app.jobseekers?.uuid && app.jobseekers.uuid === authUser.uuid);

  if (!isAdmin && !isJobRecruiter && !isCandidateOwner) {
    throw new AuthorizationError('Forbidden: You are not authorized to view this application questionnaire.');
  }

  // 3. Retrieve answers from relational table
  let answers: ApplicationAnswer[] = [];
  try {
    const { data: dbAnswers, error: ansErr } = await supabaseAdmin
      .from('job_application_answers')
      .select('*')
      .eq('application_id', applicationId)
      .order('id', { ascending: true });

    if (!ansErr && Array.isArray(dbAnswers) && dbAnswers.length > 0) {
      answers = dbAnswers.map((a: any) => ({
        id: a.id,
        applicationId: a.application_id,
        questionId: a.question_id,
        questionSnapshot: a.question_snapshot,
        answerValue: a.answer_value,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));
    }
  } catch (err) {}

  // 4. Fallback: check applications.screening_answers
  if (answers.length === 0 && app.screening_answers && Array.isArray(app.screening_answers)) {
    answers = app.screening_answers.map((a: any, idx: number) => ({
      id: idx + 1,
      applicationId: app.id,
      questionId: a.questionId,
      questionSnapshot: a.questionSnapshot,
      answerValue: a.answerValue,
    }));
  }

  return { application: app, answers };
}
