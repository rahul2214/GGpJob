import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { firebaseAdminAuth } from '@/lib/firebase-admin';

export interface AuthenticatedUser {
  id: number | string;
  uuid: string;
  email: string;
  role: 'Job Seeker' | 'Recruiter' | 'Admin' | 'Super Admin' | string;
  roleId?: number;
  name?: string;
  table?: string;
  isSuperAdmin?: boolean;
}

/**
 * Extracts bearer token from Authorization header or cookie.
 */
export function extractAuthToken(request: Request): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check cookie headers
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, decodeURIComponent(v.join('='))];
    })
  );

  if (cookies['sb-access-token']) return cookies['sb-access-token'];
  if (cookies['sb:token']) return cookies['sb:token'];
  if (cookies['firebase-token']) return cookies['firebase-token'];

  // Check all cookie keys for Supabase pattern (e.g. sb-project-auth-token)
  for (const [key, val] of Object.entries(cookies)) {
    if ((key.startsWith('sb-') && key.endsWith('-auth-token')) || key === 'supabase-auth-token') {
      try {
        let raw = val;
        if (raw.startsWith('base64-')) {
          raw = Buffer.from(raw.slice(7), 'base64').toString('utf-8');
        }
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (parsed.access_token) return parsed.access_token;
      } catch {}
    }
  }

  return null;
}

interface CachedAuthUser {
  user: AuthenticatedUser;
  cachedAt: number;
}
const authUserCache = new Map<string, CachedAuthUser>();
const AUTH_CACHE_TTL_MS = 60 * 1000; // 60 seconds

export function invalidateAuthCache(token?: string) {
  if (token) {
    authUserCache.delete(token);
  } else {
    authUserCache.clear();
  }
}

/**
 * Validates request token and resolves the authenticated database user.
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const token = extractAuthToken(request);

  if (token) {
    const cached = authUserCache.get(token);
    if (cached && (Date.now() - cached.cachedAt < AUTH_CACHE_TTL_MS)) {
      return cached.user;
    }
  }

  let email: string | null = null;
  let uid: string | null = null;

  if (token) {
    // 1. Try Supabase Token validation
    try {
      const { data: { user: supaUser }, error } = await supabaseAdmin.auth.getUser(token);
      if (supaUser && !error) {
        email = supaUser.email || null;
        uid = supaUser.id;
      }
    } catch (e) {
      // Ignore and fallback to Firebase
    }

    // 2. Try Firebase Token validation if Supabase didn't resolve
    if (!uid && firebaseAdminAuth) {
      try {
        const decoded = await firebaseAdminAuth.verifyIdToken(token);
        if (decoded) {
          email = decoded.email || null;
          uid = decoded.uid;
        }
      } catch (e) {
        // Token invalid for both
      }
    }
  }

  // If neither Supabase nor Firebase token resolved to a valid user, authentication fails
  if (!uid && !email) {
    return null;
  }

  const isNumeric = uid ? /^\d+$/.test(String(uid)) : false;
  const isUuid = uid ? /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(uid)) : false;

  let resolvedUser: AuthenticatedUser | null = null;

  // 3. Resolve user profile from database tables
  // Check admins table
  let adminQuery = supabaseAdmin.from('admins').select('*');
  if (isNumeric) {
    adminQuery = email ? adminQuery.or(`id.eq.${uid},email.eq.${email}`) : adminQuery.eq('id', Number(uid));
  } else if (isUuid) {
    adminQuery = email ? adminQuery.or(`uuid.eq.${uid},email.eq.${email}`) : adminQuery.eq('uuid', uid);
  } else if (email) {
    adminQuery = adminQuery.eq('email', email);
  } else {
    adminQuery = adminQuery.eq('uuid', uid!);
  }
  const { data: adminUser } = await adminQuery.maybeSingle();

  if (adminUser) {
    const isSuper = adminUser.role === 'Super Admin' || adminUser.role_id === 5 || Boolean(adminUser.is_super_admin);
    resolvedUser = {
      id: adminUser.id,
      uuid: adminUser.uuid || uid!,
      email: adminUser.email,
      name: adminUser.name,
      role: isSuper ? 'Super Admin' : 'Admin',
      roleId: adminUser.role_id || (isSuper ? 5 : 4),
      table: 'admins',
      isSuperAdmin: isSuper
    };
  }

  if (!resolvedUser) {
    // Check jobseekers
    let seekerQuery = supabaseAdmin.from('jobseekers').select('*');
    if (isNumeric) {
      seekerQuery = email ? seekerQuery.or(`id.eq.${uid},email.eq.${email}`) : seekerQuery.eq('id', Number(uid));
    } else if (isUuid) {
      seekerQuery = email ? seekerQuery.or(`uuid.eq.${uid},email.eq.${email}`) : seekerQuery.eq('uuid', uid);
    } else if (email) {
      seekerQuery = seekerQuery.eq('email', email);
    } else {
      seekerQuery = seekerQuery.eq('uuid', uid!);
    }
    const { data: jobseeker } = await seekerQuery.maybeSingle();

    if (jobseeker) {
      const isJobseekerAdmin = jobseeker.role_id === 4 || jobseeker.role_id === 5 || jobseeker.role === 'Admin' || jobseeker.role === 'Super Admin' || Boolean(jobseeker.is_super_admin);
      const isSuper = jobseeker.role_id === 5 || jobseeker.role === 'Super Admin' || Boolean(jobseeker.is_super_admin);
      resolvedUser = {
        id: jobseeker.id,
        uuid: jobseeker.uuid || uid!,
        email: jobseeker.email,
        name: jobseeker.name,
        role: isJobseekerAdmin ? (isSuper ? 'Super Admin' : 'Admin') : 'Job Seeker',
        roleId: jobseeker.role_id || (isJobseekerAdmin ? (isSuper ? 5 : 4) : 1),
        table: 'jobseekers',
        isSuperAdmin: Boolean(isSuper)
      };
    }
  }

  if (!resolvedUser) {
    // Check recruiters
    let recruiterQuery = supabaseAdmin.from('recruiters').select('*');
    if (isNumeric) {
      recruiterQuery = email ? recruiterQuery.or(`id.eq.${uid},email.eq.${email}`) : recruiterQuery.eq('id', Number(uid));
    } else if (isUuid) {
      recruiterQuery = email ? recruiterQuery.or(`uuid.eq.${uid},email.eq.${email}`) : recruiterQuery.eq('uuid', uid);
    } else if (email) {
      recruiterQuery = recruiterQuery.eq('email', email);
    } else {
      recruiterQuery = recruiterQuery.eq('uuid', uid!);
    }
    const { data: recruiter } = await recruiterQuery.maybeSingle();

    if (recruiter) {
      const isRecruiterAdmin = recruiter.role_id === 4 || recruiter.role_id === 5 || recruiter.role === 'Admin' || recruiter.role === 'Super Admin' || Boolean(recruiter.is_super_admin);
      const isSuper = recruiter.role_id === 5 || recruiter.role === 'Super Admin' || Boolean(recruiter.is_super_admin);
      resolvedUser = {
        id: recruiter.id,
        uuid: recruiter.uuid || uid!,
        email: recruiter.email,
        name: recruiter.name,
        role: isRecruiterAdmin ? (isSuper ? 'Super Admin' : 'Admin') : 'Recruiter',
        roleId: recruiter.role_id || (isRecruiterAdmin ? (isSuper ? 5 : 4) : 2),
        table: 'recruiters',
        isSuperAdmin: Boolean(isSuper)
      };
    }
  }

  if (!resolvedUser) {
    // User exists in auth but has no specific role table yet
    resolvedUser = {
      id: uid!,
      uuid: uid!,
      email: email || '',
      role: 'Job Seeker',
      roleId: 1
    };
  }

  // Cache resolved user for 60s
  if (token && resolvedUser) {
    if (authUserCache.size > 500) {
      const now = Date.now();
      for (const [k, v] of authUserCache.entries()) {
        if (now - v.cachedAt > AUTH_CACHE_TTL_MS) authUserCache.delete(k);
      }
    }
    authUserCache.set(token, { user: resolvedUser, cachedAt: Date.now() });
  }

  return resolvedUser;
}

/**
 * Checks if the caller is the owner of a resource or an admin.
 */
export function isOwnerOrAdmin(authUser: AuthenticatedUser, targetIdOrUuid: string | number): boolean {
  if (authUser.role === 'Admin' || authUser.role === 'Super Admin' || authUser.isSuperAdmin) {
    return true;
  }
  return (
    String(authUser.id) === String(targetIdOrUuid) ||
    String(authUser.uuid) === String(targetIdOrUuid)
  );
}

/**
 * Require valid authenticated user.
 */
export async function requireAuth(request: Request): Promise<{ user?: AuthenticatedUser; errorResponse?: NextResponse }> {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Valid authentication token is required.' },
        { status: 401 }
      )
    };
  }
  return { user };
}

/**
 * Require Admin or Super Admin role.
 */
export async function requireAdmin(request: Request): Promise<{ user?: AuthenticatedUser; errorResponse?: NextResponse }> {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse) return { errorResponse };

  if (user?.role !== 'Admin' && user?.role !== 'Super Admin' && !user?.isSuperAdmin) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Administrator privileges required.' },
        { status: 403 }
      )
    };
  }

  return { user };
}

/**
 * Require Super Admin role.
 */
export async function requireSuperAdmin(request: Request): Promise<{ user?: AuthenticatedUser; errorResponse?: NextResponse }> {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse) return { errorResponse };

  if (user?.role !== 'Super Admin' && !user?.isSuperAdmin) {
    return {
      errorResponse: NextResponse.json(
        { error: 'Forbidden: Super Administrator privileges required.' },
        { status: 403 }
      )
    };
  }

  return { user };
}
