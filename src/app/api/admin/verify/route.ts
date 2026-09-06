import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { requireAuth, isOwnerOrAdmin } from '@/lib/auth-server';
import { safeErrorResponse } from '@/lib/security';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/verify?uid=<userId>
 * 
 * Verifies that the given user ID exists in the public.admins table.
 * Called immediately after Supabase Auth sign-in on the admin login page.
 * Also updates last_login_at on successful verification.
 */
export async function GET(request: Request) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { searchParams } = new URL(request.url);
        const uid = searchParams.get('uid') || authUser!.uuid;

        if (!isOwnerOrAdmin(authUser!, uid)) {
            return NextResponse.json(
                { isAdmin: false, error: 'Forbidden: Access denied.' },
                { status: 403 }
            );
        }

        // Look up the user in the admins table
        const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('id, name, email, is_super_admin, can_manage_jobs, can_manage_users, can_manage_coupons, can_view_analytics, can_manage_admins')
            .eq('uuid', uid)
            .single();

        if (error || !admin) {
            return NextResponse.json(
                { isAdmin: false, error: 'Administrator profile not found. Access denied.' },
                { status: 403 }
            );
        }

        // Update last_login_at timestamp
        await supabaseAdmin
            .from('admins')
            .update({ last_login_at: new Date().toISOString() })
            .eq('uuid', uid);

        return NextResponse.json({
            isAdmin: true,
            isSuperAdmin: admin.is_super_admin,
            permissions: {
                canManageJobs: admin.can_manage_jobs,
                canManageUsers: admin.can_manage_users,
                canManageCoupons: admin.can_manage_coupons,
                canViewAnalytics: admin.can_view_analytics,
                canManageAdmins: admin.can_manage_admins,
            },
            name: admin.name,
            email: admin.email,
        });

    } catch (e: any) {
        return safeErrorResponse(e, 'Verification failed. Please try again.');
    }
}
