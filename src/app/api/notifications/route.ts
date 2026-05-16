import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Resolve user_pk from userId (can be UUID or numeric string)
    const isNumericId = /^\d+$/.test(userId);
    const allPks = [];
    if (isNumericId) {
        allPks.push(parseInt(userId));
    } else {
        const [
            { data: js },
            { data: emp },
            { data: rec }
        ] = await Promise.all([
            supabaseAdmin.from('jobseekers').select('id').eq('uuid', userId).maybeSingle(),
            supabaseAdmin.from('employees').select('id').eq('uuid', userId).maybeSingle(),
            supabaseAdmin.from('recruiters').select('id').eq('uuid', userId).maybeSingle()
        ]);
        if (js) allPks.push(js.id);
        if (emp) allPks.push(emp.id);
        if (rec) allPks.push(rec.id);
    }

    if (allPks.length === 0) return NextResponse.json([]);

    // Fetch notifications: Support numeric user_pk or UUID user_id
    // Explicitly select columns to avoid schema cache issues (e.g., phantom 'viewerId')
    const { data: notifications, error } = await supabaseAdmin
        .from('notifications')
        .select(`
            id, 
            user_pk, message, type, job_pk, 
            created_at, 
            is_read,
            jobs (uuid, title)
        `)
        .in('user_pk', allPks) 
        .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map to frontend structure
    const formattedNotifications = (notifications || []).map((n: any) => ({
        id: n.id,
        userId: n.user_id || n.user_pk, // Return UUID if available, fallback to PK
        userPk: n.user_pk,
        message: n.message,
        type: n.type,
        jobId: n.jobs?.uuid,
        jobPk: n.job_pk,
        jobTitle: n.jobs?.title,
        statusName: n.type === 'application_status' ? 'Updated' : undefined,
        timestamp: n.created_at,
        isRead: n.is_read
    }));

    return NextResponse.json(formattedNotifications);

  } catch (e: any) {
    console.error('[API_NOTIFICATIONS_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch notifications', details: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, message, type, jobId, ...rest } = body;

        if (!userId || !message) {
            return NextResponse.json({ error: 'User ID and message are required' }, { status: 400 });
        }

        // 1. Resolve internal numeric PKs
        const isNumericUser = /^\d+$/.test(userId);
        const isNumericJob = jobId && /^\d+$/.test(jobId);

        let jobPk = null;
        if (jobId) {
            const { data: jobData } = await (isNumericJob 
                ? supabaseAdmin.from('jobs').select('id').eq('id', parseInt(jobId))
                : supabaseAdmin.from('jobs').select('id').eq('uuid', jobId)
            ).maybeSingle();
            if (jobData) jobPk = jobData.id;
        }

        // Try to find user in any role table
        let userProfileId = null;
        const tables = ['jobseekers', 'recruiters', 'employees'];
        
        for (const table of tables) {
            const { data: profile } = await (isNumericUser
                ? supabaseAdmin.from(table).select('id').eq('id', parseInt(userId))
                : supabaseAdmin.from(table).select('id').eq('uuid', userId)
            ).maybeSingle();
            
            if (profile) {
                userProfileId = profile.id;
                break;
            }
        }
        
        if (!userProfileId) {
            return NextResponse.json({ error: 'User not found to send notification' }, { status: 404 });
        }
        
        const notificationData: any = {
            user_pk: userProfileId, // Internal BIGINT
            job_pk: jobPk,         // Internal BIGINT
            message: message,
            type: type || 'generic',
            created_at: new Date().toISOString(),
            is_read: body.isRead || false
        };

        const { data: createdNotif, error } = await supabaseAdmin
            .from('notifications')
            .insert([notificationData])
            .select('id,  message, type,  created_at, is_read')
            .single();
        
        if (error) throw error;

        return NextResponse.json(createdNotif, { status: 201 });
    } catch (e: any) {
        console.error('[API_NOTIFICATIONS_POST] Error:', e);
        return NextResponse.json({ error: 'Failed to create notification', details: e.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { notificationId, jobPk, userId, type, applicationId } = body;

        let query = supabaseAdmin.from('notifications').update({ is_read: true });

        if (notificationId) {
            query = query.eq('id', notificationId);
        } else if (userId) {
            const [
                { data: js },
                { data: emp },
                { data: rec }
            ] = await Promise.all([
                supabaseAdmin.from('jobseekers').select('id').eq('uuid', userId).maybeSingle(),
                supabaseAdmin.from('employees').select('id').eq('uuid', userId).maybeSingle(),
                supabaseAdmin.from('recruiters').select('id').eq('uuid', userId).maybeSingle()
            ]);
            
            const allPks = [js?.id, emp?.id, rec?.id].filter(Boolean) as number[];
            if (allPks.length === 0) return NextResponse.json({ success: true });

            if (applicationId) {
                // Resolve applicationId to internal ID if it's a UUID
                let internalAppId = applicationId;
                const isUuidApp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(applicationId);
                if (isUuidApp) {
                    const { data: app } = await supabaseAdmin.from('applications').select('id').eq('uuid', applicationId).maybeSingle();
                    if (app) internalAppId = app.id.toString();
                }

                // Mark chat notifications for this app as read
                query = query.in('user_pk', allPks)
                             .eq('type', 'chat_message')
                             .ilike('message', `%[APP_ID:${internalAppId}]%`);
            } else if (jobPk) {
                // Mark all notifications for a user/job as read
                query = query.eq('job_pk', jobPk).in('user_pk', allPks);
                if (type) {
                    query = query.eq('type', type);
                }
            } else {
                return NextResponse.json({ error: 'Missing jobPk or applicationId' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: 'Missing parameters to mark as read' }, { status: 400 });
        }

        const { error } = await query;
        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error('[API_NOTIFICATIONS_PATCH] Error:', e);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
