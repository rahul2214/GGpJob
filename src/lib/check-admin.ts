import { supabaseAdmin } from '@/lib/supabase-admin';

/**
 * Checks if a user ID belongs to an admin by querying the public.admins table.
 * All user IDs (Job Seekers, Recruiters, Admins) are now standard UUIDs matching auth.users(id).
 */
export async function checkAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;
    
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const lookupId = isUUID ? userId : parseInt(userId, 10);
    const lookupField = isUUID ? 'uuid' : 'id';

    const { data, error } = await supabaseAdmin
        .from('admins')
        .select('id, uuid, role_id, is_super_admin')
        .eq(lookupField, lookupId)
        .maybeSingle();
    
    if (error) {
        console.error('[checkAdmin] Error:', error);
        return false;
    }

    if (!data) return false;

    // Check by role_id (4=Admin, 5=Super Admin) OR the is_super_admin flag
    const isAdmin = data.role_id === 4 || data.role_id === 5 || data.is_super_admin === true;
    
    return isAdmin;
}

/**
 * Checks if a user ID belongs to a super admin.
 */
export async function checkSuperAdmin(userId: string): Promise<boolean> {
    if (!userId) return false;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const lookupId = isUUID ? userId : parseInt(userId, 10);
    const lookupField = isUUID ? 'uuid' : 'id';

    const { data, error } = await supabaseAdmin
        .from('admins')
        .select('id, uuid, role_id, is_super_admin')
        .eq(lookupField, lookupId)
        .maybeSingle();
        
    if (error || !data) return false;

    // Super Admin is role_id 5 OR is_super_admin flag
    return data.role_id === 5 || data.is_super_admin === true;
}
