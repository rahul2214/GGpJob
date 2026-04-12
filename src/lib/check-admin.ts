import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Checks if a user ID belongs to an admin by querying the public.admins table.
 * Now specifically checks for role_id 4 (Admin) or 5 (Super Admin).
 */
export async function checkAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    const isNumeric = /^\d+$/.test(userId);
    const { data, error } = await supabaseAdmin
        .from('admins')
        .select('id, role_id')
        .eq(isNumeric ? 'id' : 'uuid', isNumeric ? parseInt(userId) : userId)
        .single();
    
    // role_id 4 = Admin, 5 = Super Admin
    return !error && !!data && [4, 5].includes(data.role_id);
}

/**
 * Checks if a user ID belongs to a super admin.
 * Specifically checks for role_id 5.
 */
export async function checkSuperAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    const isNumeric = /^\d+$/.test(userId);
    const { data, error } = await supabaseAdmin
        .from('admins')
        .select('id, role_id')
        .eq(isNumeric ? 'id' : 'uuid', isNumeric ? parseInt(userId) : userId)
        .single();
        
    return !error && !!data && data.role_id === 5;
}
