
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { checkSuperAdmin } from '@/lib/check-admin';

export async function POST(request: Request) {
    try {
        const { name, email, phone, password, requestedBy } = await request.json();

        if (!name || !email || !phone || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Only super admins can create new admins
        if (requestedBy && !(await checkSuperAdmin(requestedBy))) {
            return NextResponse.json({ error: 'Only Super Admins can create admin accounts.' }, { status: 403 });
        }

        // 1. Create user in Supabase Auth
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { name, role: 'Admin' }
        });

        if (authError) throw authError;

        // 2. Insert into the admins table
        const { error: adminError } = await supabaseAdmin
            .from('admins')
            .insert([{
                id: authUser.user.id,
                name,
                email,
                phone,
                designation: 'Administrator',
                is_super_admin: false,
                can_manage_jobs: true,
                can_manage_users: true,
                can_manage_coupons: true,
                can_view_analytics: true,
                can_manage_admins: false,
                role_id: 4,
            }]);

        if (adminError) throw adminError;

        return NextResponse.json({ uid: authUser.user.id, name, email, role: 'Admin' }, { status: 201 });

    } catch (error: any) {
        console.error('Admin Creation Error:', error);
        let errorMessage = error.message || 'Failed to create admin user.';
        if (error.status === 422 && error.message?.includes('already registered')) {
            errorMessage = 'An account with this email address already exists.';
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
