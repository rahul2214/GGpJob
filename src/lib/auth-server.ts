import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { firebaseAdminAuth } from '@/lib/firebase-admin';

export interface AuthenticatedUser {
  id: number | string;
  uuid: string;
  email: string;
  role: 'Job Seeker' | 'Recruiter' | 'Employee' | 'Admin' | 'Super Admin' | string;
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

  return cookies['sb-access-token'] || cookies['sb:token'] || cookies['firebase-token'] || null;
}

/**
 * Validates request token and resolves the authenticated database user.
 */
export async function getAuthenticatedUser(request: Request): Promise<AuthenticatedUser | null> {
  const token = extractAuthToken(request);
  if (!token) return null;

  let email: string | null = null;
  let uid: string | null = null;

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

  if (!uid && !email) {
    return null;
  }

  // 3. Resolve user profile from database tables
  // Check admins table
  const { data: adminUser } = await supabaseAdmin
    .from('admins')
    .select('*')
    .or(`uuid.eq.${uid}${email ? `,email.eq.${email}` : ''}`)
    .maybeSingle();

  if (adminUser) {
    const isSuper = adminUser.role === 'Super Admin' || adminUser.role_id === 5;
    return {
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

  // Check jobseekers
  const { data: jobseeker } = await supabaseAdmin
    .from('jobseekers')
    .select('*')
    .or(`uuid.eq.${uid}${email ? `,email.eq.${email}` : ''}`)
    .maybeSingle();

  if (jobseeker) {
    return {
      id: jobseeker.id,
      uuid: jobseeker.uuid || uid!,
      email: jobseeker.email,
      name: jobseeker.name,
      role: 'Job Seeker',
      roleId: 1,
      table: 'jobseekers'
    };
  }

  // Check recruiters
  const { data: recruiter } = await supabaseAdmin
    .from('recruiters')
    .select('*')
    .or(`uuid.eq.${uid}${email ? `,email.eq.${email}` : ''}`)
    .maybeSingle();

  if (recruiter) {
    return {
      id: recruiter.id,
      uuid: recruiter.uuid || uid!,
      email: recruiter.email,
      name: recruiter.name,
      role: 'Recruiter',
      roleId: 2,
      table: 'recruiters'
    };
  }

  // Check employees
  const { data: employee } = await supabaseAdmin
    .from('employees')
    .select('*')
    .or(`uuid.eq.${uid}${email ? `,email.eq.${email}` : ''}`)
    .maybeSingle();

  if (employee) {
    return {
      id: employee.id,
      uuid: employee.uuid || uid!,
      email: employee.email,
      name: employee.name,
      role: 'Employee',
      roleId: 3,
      table: 'employees'
    };
  }

  // User exists in auth but has no specific role table yet
  return {
    id: uid!,
    uuid: uid!,
    email: email || '',
    role: 'Job Seeker',
    roleId: 1
  };
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
