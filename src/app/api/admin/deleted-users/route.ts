import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAdmin } from '@/lib/auth-server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { user: adminUser, errorResponse } = await requireAdmin(request);
    if (errorResponse) return errorResponse;
    const [
      { data: seekers, error: seekerErr },
      { data: recruiters, error: recruiterErr },
      { data: employees, error: employeeErr },
      { data: admins, error: adminErr }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('id, uuid, name, email, phone, role, created_at, deleted_at, scheduled_delete_at, is_deleted').eq('is_deleted', true),
      supabaseAdmin.from('recruiters').select('id, uuid, name, email, phone, role, company_name, created_at, deleted_at, scheduled_delete_at, is_deleted').eq('is_deleted', true),
      supabaseAdmin.from('employees').select('id, uuid, name, email, phone, role, company_name, created_at, deleted_at, scheduled_delete_at, is_deleted').eq('is_deleted', true),
      supabaseAdmin.from('admins').select('id, uuid, name, email, phone, role, created_at, deleted_at, scheduled_delete_at, is_deleted').eq('is_deleted', true)
    ]);

    if (seekerErr) console.error('[GET_DELETED_USERS] Seekers error:', seekerErr);
    if (recruiterErr) console.error('[GET_DELETED_USERS] Recruiters error:', recruiterErr);
    if (employeeErr) console.error('[GET_DELETED_USERS] Employees error:', employeeErr);
    if (adminErr) console.error('[GET_DELETED_USERS] Admins error:', adminErr);

    const deletedUsers = [
      ...(seekers || []).map((u: any) => ({ ...u, role: u.role || 'Job Seeker', companyName: undefined })),
      ...(recruiters || []).map((u: any) => ({ ...u, role: u.role || 'Recruiter', companyName: u.company_name })),
      ...(employees || []).map((u: any) => ({ ...u, role: u.role || 'Employee', companyName: u.company_name })),
      ...(admins || []).map((u: any) => ({ ...u, role: u.role || 'Admin', companyName: undefined }))
    ];

    deletedUsers.sort((a, b) => {
      const dateA = a.deleted_at ? new Date(a.deleted_at).getTime() : 0;
      const dateB = b.deleted_at ? new Date(b.deleted_at).getTime() : 0;
      return dateB - dateA;
    });

    const formatted = deletedUsers.map(u => ({
      id: u.id,
      uuid: u.uuid,
      name: u.name || 'Deleted User',
      email: u.email || 'N/A',
      phone: u.phone || '',
      role: u.role,
      companyName: u.companyName,
      deletedAt: u.deleted_at,
      scheduledDeleteAt: u.scheduled_delete_at,
      createdAt: u.created_at
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    console.error('[GET_DELETED_USERS] Exception:', error);
    return NextResponse.json({ error: 'Failed to fetch deleted users', details: error.message }, { status: 500 });
  }
}
