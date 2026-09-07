import { supabaseAdmin } from '@/lib/supabase-admin';
import { AuthenticatedUser, isOwnerOrAdmin } from '@/lib/auth-server';

/**
 * Resource-ownership checks.
 *
 * Every API route runs with the Supabase service-role key, which bypasses Row
 * Level Security. Ownership therefore has to be proven in the route itself, and
 * these helpers keep that logic in one place so it stays consistent.
 */

export interface ApplicationAccess {
  /** Numeric primary key of the application, resolved from an id or uuid. */
  applicationPk: string;
  application: any;
  /** The caller is the job seeker who submitted this application. */
  isApplicant: boolean;
  /** The caller posted the job this application targets. */
  isJobOwner: boolean;
  isAdmin: boolean;
}

/**
 * Resolves an application by numeric id or uuid and works out how the caller
 * relates to it. Returns null when no such application exists.
 */
export async function getApplicationAccess(
  authUser: AuthenticatedUser,
  idOrUuid: string,
): Promise<ApplicationAccess | null> {
  let applicationPk = String(idOrUuid);

  // The route parameter may be either the bigint PK or the public uuid.
  if (applicationPk.includes('-')) {
    const { data: resolved } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('uuid', applicationPk)
      .maybeSingle();
    if (!resolved) return null;
    applicationPk = String(resolved.id);
  } else if (!/^\d+$/.test(applicationPk)) {
    return null;
  }

  const { data: application } = await supabaseAdmin
    .from('applications')
    .select('id, uuid, user_pk, job_pk, status_id, jobs(id, recruiter_pk, admin_pk, title)')
    .eq('id', applicationPk)
    .maybeSingle();

  if (!application) return null;

  const isAdmin =
    authUser.role === 'Admin' || authUser.role === 'Super Admin' || Boolean(authUser.isSuperAdmin);

  const job: any = Array.isArray((application as any).jobs)
    ? (application as any).jobs[0]
    : (application as any).jobs;

  const isApplicant =
    authUser.table === 'jobseekers' &&
    application.user_pk != null &&
    String(application.user_pk) === String(authUser.id);

  const isJobOwner = Boolean(
    job &&
      ((job.recruiter_pk != null &&
        authUser.table === 'recruiters' &&
        String(job.recruiter_pk) === String(authUser.id)) ||
        (job.admin_pk != null &&
          authUser.table === 'admins' &&
          String(job.admin_pk) === String(authUser.id))),
  );

  return { applicationPk, application, isApplicant, isJobOwner, isAdmin };
}

/**
 * Confirms the caller posted the given job (by numeric id or uuid).
 * Returns the job row when authorised, otherwise null.
 */
export async function getOwnedJob(
  authUser: AuthenticatedUser,
  idOrUuid: string,
  columns = 'id, uuid, recruiter_pk, admin_pk',
): Promise<any | null> {
  const isNumeric = /^\d+$/.test(String(idOrUuid));

  const { data: job } = await supabaseAdmin
    .from('jobs')
    .select(columns)
    .eq(isNumeric ? 'id' : 'uuid', idOrUuid)
    .maybeSingle();

  if (!job) return null;

  const isAdmin =
    authUser.role === 'Admin' || authUser.role === 'Super Admin' || Boolean(authUser.isSuperAdmin);
  if (isAdmin) return job;

  if (job.recruiter_pk != null && isOwnerOrAdmin(authUser, job.recruiter_pk)) return job;
  if (job.admin_pk != null && isOwnerOrAdmin(authUser, job.admin_pk)) return job;

  return null;
}
