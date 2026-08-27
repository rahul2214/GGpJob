import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { encrypt, decrypt } from '@/lib/encryption';
import { requireAuth } from '@/lib/auth-server';

// Contact sanitization regex
const CONTACT_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})|(t\.me\/[a-zA-Z0-9_]+)|(wa\.me\/\d+)|(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/gi;

function sanitizeContent(content: string): string {
    return content.replace(CONTACT_REGEX, '[CONTACT INFO BLOCKED]');
}

async function getOrCreateSession(appId: string) {
    const cleanAppId = appId.startsWith('chat-') ? appId.substring(5) : appId;
    const isNumeric = /^\d+$/.test(cleanAppId);
    const targetId = isNumeric ? parseInt(cleanAppId, 10) : cleanAppId;

    // 1. Resolve Application directly (without invalid columns)
    const { data: appData, error: appError } = await supabaseAdmin
        .from('applications')
        .select('id, uuid, user_pk, job_pk, status_id')
        .eq(isNumeric ? 'id' : 'uuid', targetId)
        .maybeSingle();

    if (appError || !appData) {
        console.error('[CHAT_GET_APP_ERROR]', appError, 'cleanAppId:', cleanAppId, 'targetId:', targetId);
        return null;
    }

    const internalAppId = appData.id;

    // 2. Fetch Jobseeker and Job details in parallel
    const [jobseekerRes, jobRes] = await Promise.all([
        supabaseAdmin.from('jobseekers').select('id, uuid, plan_type').eq('id', appData.user_pk).maybeSingle(),
        appData.job_pk ? supabaseAdmin.from('jobs').select('id, title, recruiter_pk').eq('id', appData.job_pk).maybeSingle() : Promise.resolve({ data: null })
    ]);

    const jobseekerPk = jobseekerRes.data?.id || appData.user_pk;
    const jobseekerUuid = jobseekerRes.data?.uuid || '';
    const jobseekerPlan = jobseekerRes.data?.plan_type || 'free';

    const jobObj = jobRes.data || {};
    const posterPk = jobObj.recruiter_pk || 1;
    let posterUuid = '';

    if (jobObj.recruiter_pk) {
        const { data: recruiterData } = await supabaseAdmin
            .from('recruiters')
            .select('id, uuid')
            .eq('id', jobObj.recruiter_pk)
            .maybeSingle();
        if (recruiterData) {
            posterUuid = recruiterData.uuid || '';
        }
    }

    // 3. Try to find existing session
    let { data: session } = await supabaseAdmin
        .from('chat_sessions')
        .select('*')
        .eq('application_id', internalAppId)
        .maybeSingle();

    if (!session) {
        // 4. Create session if missing
        const payload: any = {
            application_id: internalAppId,
            jobseeker_id: jobseekerPk,
            is_unlocked: true
        };
        if (posterPk) {
            payload.employee_id = posterPk;
        }

        const { data: newSession, error: insertError } = await supabaseAdmin
            .from('chat_sessions')
            .insert(payload)
            .select()
            .maybeSingle();

        if (insertError) {
            console.error('[CHAT_SESSION_CREATE] Error:', insertError);
            if (payload.employee_id) {
                delete payload.employee_id;
                const { data: fallbackSession } = await supabaseAdmin
                    .from('chat_sessions')
                    .insert(payload)
                    .select()
                    .maybeSingle();
                session = fallbackSession;
            }
        } else {
            session = newSession;
        }
    }

    // 5. Fallback virtual session if DB insertion is unavailable
    if (!session) {
        session = {
            id: internalAppId,
            application_id: internalAppId,
            jobseeker_id: jobseekerPk,
            employee_id: posterPk,
            is_unlocked: true,
            msg_count_jobseeker: 0,
            msg_count_employee: 0
        };
    }

    return {
        ...session,
        application: {
            status_id: appData.status_id,
            job: {
                id: jobObj.id || appData.job_pk,
                title: jobObj.title || 'Job Application'
            }
        },
        jobseeker: {
            id: jobseekerPk,
            uuid: jobseekerUuid,
            plan_type: jobseekerPlan
        },
        poster: {
            id: posterPk,
            uuid: posterUuid
        },
        job: {
            id: jobObj.id || appData.job_pk,
            title: jobObj.title || 'Job Application',
            poster_pk: posterPk
        },
        user_pk: appData.user_pk
    };
}

export async function GET(
    request: Request,
    { params }: { params: { appId: string } }
) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { appId } = params;
        const session = await getOrCreateSession(appId);

        if (!session) {
            return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
        }

        // Verify caller is a participant or admin
        const isAdmin = authUser?.role === 'Admin' || authUser?.role === 'Super Admin';
        const isJobseeker = authUser?.uuid === session.jobseeker?.uuid || String(authUser?.id) === String(session.jobseeker?.id);
        const isPoster = authUser?.uuid === session.poster?.uuid || String(authUser?.id) === String(session.poster?.id);

        if (!isAdmin && !isJobseeker && !isPoster) {
            return NextResponse.json({ error: 'Forbidden: You are not a participant in this conversation.' }, { status: 403 });
        }

        const app = session.application as any;
        const statusId = app?.status_id;

        let isBlocked = false;
        let blockReason = '';

        if (statusId < 3) {
            isBlocked = true;
            blockReason = 'Chat will be available once the candidate is selected.';
        } else if (statusId === 12) {
            isBlocked = true;
            blockReason = 'Chat is disabled for rejected applications.';
        } else if (statusId === 9 || statusId === 10) {
            isBlocked = true;
            blockReason = 'Hiring process is complete.';
        }

        if (isBlocked) {
            return NextResponse.json({ error: blockReason }, { status: 403 });
        }

        // Fetch messages for this application from notifications table
        const internalAppId = session.application_id;
        const appTag = `[APP_ID:${internalAppId}]`;

        const { data: rawNotifs } = await supabaseAdmin
            .from('notifications')
            .select('*')
            .eq('type', 'chat_message')
            .order('created_at', { ascending: true });

        const appNotifs = (rawNotifs || []).filter((n: any) => n.message && n.message.includes(appTag));

        const mappedMessages = appNotifs.map((n: any) => {
            let rawText = n.message.replace(appTag, '').trim();
            let senderUuid = session.jobseeker.uuid;

            const senderMatch = rawText.match(/^\[SENDER_UUID:([^\]]+)\]/);
            if (senderMatch) {
                senderUuid = senderMatch[1];
                rawText = rawText.replace(/^\[SENDER_UUID:[^\]]+\]\s*/, '');
            } else if (n.user_pk === session.jobseeker.id) {
                senderUuid = session.poster.uuid;
            }

            return {
                id: n.id.toString(),
                sender_id: senderUuid,
                content: rawText,
                created_at: n.created_at,
                is_system: false
            };
        });

        return NextResponse.json({ 
            session, 
            messages: mappedMessages,
            access: {
                isFullAccess: true,
                isReferral: false,
                isPremium: true,
                statusId,
                jobPk: session.job?.id,
                jobseekerId: session.jobseeker.uuid,
                employeeId: session.poster.uuid
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { appId: string } }
) {
    try {
        const { user: authUser, errorResponse } = await requireAuth(request);
        if (errorResponse) return errorResponse;

        const { appId } = params;
        const { content } = await request.json();

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const session = await getOrCreateSession(appId);
        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Verify caller is a participant or admin
        const isAdmin = authUser?.role === 'Admin' || authUser?.role === 'Super Admin';
        const isJobseeker = authUser?.uuid === session.jobseeker?.uuid || String(authUser?.id) === String(session.jobseeker?.id);
        const isPoster = authUser?.uuid === session.poster?.uuid || String(authUser?.id) === String(session.poster?.id);

        if (!isAdmin && !isJobseeker && !isPoster) {
            return NextResponse.json({ error: 'Forbidden: You cannot post messages in this conversation.' }, { status: 403 });
        }

        const senderId = authUser?.uuid;

        const app = session.application as any;
        const statusId = app?.status_id;

        if (statusId < 3) {
            return NextResponse.json({ error: 'Chat will be available once the candidate is selected.' }, { status: 403 });
        } else if (statusId === 12) {
            return NextResponse.json({ error: 'Chat is disabled for rejected applications.' }, { status: 403 });
        } else if (statusId === 9 || statusId === 10) {
            return NextResponse.json({ error: 'Hiring process is complete.' }, { status: 403 });
        }

        const internalAppId = session.application_id;
        const isJobseekerSender = isJobseeker;
        const recipientPk = isJobseekerSender ? (session.poster?.id || session.job?.poster_pk || 1) : session.jobseeker?.id;

        const appTag = `[APP_ID:${internalAppId}]`;
        const senderTag = `[SENDER_UUID:${senderId}]`;
        const fullMessage = `${appTag}${senderTag} ${content.trim()}`;

        const { data: newNotif, error: notifErr } = await supabaseAdmin
            .from('notifications')
            .insert({
                user_pk: recipientPk,
                job_pk: session.job?.id,
                message: fullMessage,
                type: 'chat_message',
                created_at: new Date().toISOString(),
                is_read: false
            })
            .select()
            .single();

        if (notifErr) {
            console.error('[CHAT_POST_NOTIF_ERROR]', notifErr);
            return NextResponse.json({ error: notifErr.message }, { status: 500 });
        }

        const responseMessage = {
            id: newNotif.id.toString(),
            sender_id: senderId,
            content: content.trim(),
            created_at: newNotif.created_at,
            is_system: false
        };

        return NextResponse.json(responseMessage);
    } catch (e: any) {
        console.error('[CHAT_POST_EXCEPTION]', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
