import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Contact sanitization regex
const CONTACT_REGEX = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)|(\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9})|(t\.me\/[a-zA-Z0-9_]+)|(wa\.me\/\d+)|(linkedin\.com\/in\/[a-zA-Z0-9_-]+)/gi;

function sanitizeContent(content: string): string {
    return content.replace(CONTACT_REGEX, '[CONTACT INFO BLOCKED]');
}

async function getOrCreateSession(appId: string) {
    const isNumeric = /^\d+$/.test(appId);

    // 1. Resolve Application first (robustly)
    const { data: appData, error: appError } = await supabaseAdmin
        .from('applications')
        .select(`
            id, 
            uuid,
            user_pk,
            status_id,
            is_unlocked,
            jobseekers!user_pk(id, uuid, plan_type),
            job:jobs(
                id, 
                title,
                is_referral,
                employees!employee_pk(id, uuid),
                recruiters!recruiter_pk(id, uuid)
            )
        `)
        .eq(isNumeric ? 'id' : 'uuid', appId)
        .single();

    if (appError || !appData) return null;

    const internalAppId = appData.id;
    const jobseekerPk = (appData.jobseekers as any)?.id;
    const posterPk = (appData.job as any)?.employees?.id || (appData.job as any)?.recruiters?.id;

    // 2. Try to find existing session
    let { data: session, error: sessionError } = await supabaseAdmin
        .from('chat_sessions')
        .select('*')
        .eq('application_id', internalAppId)
        .maybeSingle();

    if (session && session.is_unlocked !== !!appData.is_unlocked) {
        const { data: updatedSession } = await supabaseAdmin
            .from('chat_sessions')
            .update({ is_unlocked: !!appData.is_unlocked })
            .eq('id', session.id)
            .select()
            .maybeSingle();
        if (updatedSession) {
            session = updatedSession;
        }
    }

    if (!session && !sessionError) {
        // 3. Create session if missing
        const jobseekerUuid = (appData.jobseekers as any)?.uuid;
        const posterUuid = (appData.job as any)?.employees?.uuid || (appData.job as any)?.recruiters?.uuid;

        if (jobseekerUuid && posterUuid) {
            const { data: newSession, error: insertError } = await supabaseAdmin
                .from('chat_sessions')
                .insert({
                    application_id: internalAppId,
                    jobseeker_id: jobseekerUuid,
                    employee_id: posterUuid,
                    is_unlocked: !!appData.is_unlocked
                })
                .select()
                .maybeSingle();
            
            if (insertError) {
                console.error('[CHAT_SESSION_CREATE] Error:', insertError);
            }
            session = newSession;
        }
    }

    // 4. Attach necessary virtual fields for the response
    if (session) {
        return {
            ...session,
            application: {
                status_id: appData.status_id,
                job: {
                    id: (appData.job as any).id,
                    is_referral: (appData.job as any).is_referral
                }
            },
            jobseeker: {
                id: jobseekerPk,
                uuid: (appData.jobseekers as any).uuid,
                plan_type: (appData.jobseekers as any).plan_type
            },
            poster: {
                id: posterPk,
                uuid: (appData.job as any)?.employees?.uuid || (appData.job as any)?.recruiters?.uuid
            },
            job: {
                id: (appData.job as any).id,
                title: (appData.job as any).title,
                poster_pk: posterPk
            },
            user_pk: appData.user_pk
        };
    }
    return null;
}

export async function GET(
    request: Request,
    { params }: { params: { appId: string } }
) {
    try {
        const { appId } = params;
        const session = await getOrCreateSession(appId);

        if (!session) {
            return NextResponse.json({ error: 'Chat session not found' }, { status: 404 });
        }

        // 2. Calculate access levels and "Selection" gate
        const app = session.application as any;
        const job = app?.job as any;
        const jobseeker = session.jobseeker as any;
        const isReferral = job?.is_referral;
        const isPremium = jobseeker?.plan_type === 'premium' || jobseeker?.plan_type === 'pro';
        const statusId = app?.status_id;

        let isFullAccess = session.is_unlocked;
        let isBlocked = false;
        let blockReason = '';

        // Global gate: No chat until status >= 3 (Shortlisted/Accepted)
        if (statusId < 3) {
            isBlocked = true;
            blockReason = 'Chat will be available once the recruiter/referrer selects your application.';
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

        if (!isReferral && isPremium) isFullAccess = true;

        // 3. Fetch messages
        const { data: messages } = await supabaseAdmin
            .from('messages')
            .select('*')
            .eq('session_id', session.id)
            .order('created_at', { ascending: true });

        // 4. Map integer sender_id back to UUID for frontend
        const mappedMessages = (messages || []).map((m: any) => ({
            ...m,
            sender_id: m.sender_id === session.jobseeker.id ? session.jobseeker.uuid : session.poster.uuid
        }));

        return NextResponse.json({ 
            session, 
            messages: mappedMessages,
            access: {
                isFullAccess,
                isReferral,
                isPremium,
                statusId,
                jobPk: (session.application as any)?.job?.id || (session as any).application?.job_pk,
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
        const { appId } = params;
        const { senderId, content } = await request.json();

        // 1. Get or create session
        const session = await getOrCreateSession(appId);
        if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

        const app = session.application as any;
        const job = app?.job as any;
        const jobseeker = session.jobseeker as any;
        const isReferral = job?.is_referral;
        const isPremium = jobseeker?.plan_type === 'premium' || jobseeker?.plan_type === 'pro';
        const statusId = app?.status_id;

        // 2. Check permissions and "Selection" gate
        let isFullAccess = session.is_unlocked;
        let isBlocked = false;
        let blockReason = '';

        // Universal gate: No chat until status >= 3 (Shortlisted/Accepted)
        if (statusId < 3) {
            isBlocked = true;
            blockReason = 'Chat will be available once the recruiter/referrer selects your application.';
        } else if (statusId === 12) {
            isBlocked = true;
            blockReason = 'Chat is disabled for rejected applications.';
        } else if (statusId === 9 || statusId === 10) {
            isBlocked = true;
            blockReason = 'Hiring process is complete.';
        }

        if (!isBlocked) {
            if (isReferral) {
                // Referral logic: Check expiration if not unlocked
                if (!session.is_unlocked && new Date(session.expires_at) < new Date()) {
                    isBlocked = true;
                    blockReason = 'Chat has expired. Unlock referral to continue.';
                }
            } else {
                // Normal job logic
                if (isPremium) {
                    isFullAccess = true;
                } else if (statusId === 3) {
                    // Shortlisted free user - Limited Access
                    isFullAccess = false;
                }
            }
        }

        if (isBlocked) {
            return NextResponse.json({ error: blockReason }, { status: 403 });
        }

        // 3. Check message limits for limited access
        if (!isFullAccess) {
            const isJobseeker = senderId === session.jobseeker_id;
            const currentCount = isJobseeker ? session.msg_count_jobseeker : session.msg_count_employee;

            if (currentCount >= 3) {
                const limitMsg = isReferral 
                    ? 'Pre-unlock message limit reached. Please unlock the referral to continue.'
                    : 'Free message limit reached. Upgrade to Premium for unlimited chat.';
                
                return NextResponse.json({ 
                    error: limitMsg,
                    limitReached: true 
                }, { status: 403 });
            }
        }

        // 4. Sanitize content if not full access
        let finalContent = content;
        if (!isFullAccess) {
            finalContent = sanitizeContent(content);
            
            // Block file links
            if (content.match(/drive\.google\.com|dropbox\.com|wetransfer\.com|resume|portfolio/i)) {
                return NextResponse.json({ error: 'File sharing is restricted in limited chat mode.' }, { status: 403 });
            }
        }

        // 5. Save message (Convert sender UUID to integer PK)
        const senderPk = senderId === session.jobseeker.uuid ? session.jobseeker.id : session.poster.id;

        const { data: message, error: msgError } = await supabaseAdmin
            .from('messages')
            .insert({
                session_id: session.id,
                sender_id: senderPk, // Internal BIGINT
                content: finalContent
            })
            .select()
            .single();

        if (msgError) throw msgError;

        // Map back to UUID for response
        const responseMessage = { ...message, sender_id: senderId };

        // 6. Update session counts
        const countField = senderId === session.jobseeker.uuid ? 'msg_count_jobseeker' : 'msg_count_employee';
        await supabaseAdmin
            .from('chat_sessions')
            .update({ [countField]: (session[countField] || 0) + 1 })
            .eq('id', session.id);

        // 7. Send Notification to Recipient
        try {
            const internalAppId = session.application_id; // Always integer
            const isJobseekerSender = senderId === session.jobseeker.uuid;
            const senderName = isJobseekerSender ? 'Candidate' : 'Recruiter';
            const jobTitle = session.job.title;
            const messageText = `New message from ${senderName} for ${jobTitle} [APP_ID:${internalAppId}]`;

            console.log(`[CHAT_NOTIF] Sender: ${senderId}, IsJobseeker: ${isJobseekerSender}, App: ${internalAppId}`);

            if (isJobseekerSender) {
                // Notify the poster (Recruiter or Employee)
                const recipientPk = session.job.poster_pk;
                console.log(`[CHAT_NOTIF] Recipient (Poster): ${recipientPk}`);
                if (recipientPk) {
                    const { error: notifError } = await supabaseAdmin
                        .from('notifications')
                        .insert({
                            user_pk: recipientPk,
                            job_pk: session.job.id,
                            message: messageText,
                            type: 'chat_message',
                            created_at: new Date().toISOString(),
                            is_read: false
                        });
                    if (notifError) console.error('[CHAT_NOTIF] Insert Error:', notifError);
                    else console.log(`[CHAT_NOTIF] Notification created for PK ${recipientPk}`);
                }
            } else {
                // Notify Job Seeker
                await supabaseAdmin
                    .from('notifications')
                    .insert({
                        user_pk: session.user_pk,
                        job_pk: session.job.id,
                        message: messageText,
                        type: 'chat_message',
                        created_at: new Date().toISOString(),
                        is_read: false
                    });
            }
        } catch (notificationError) {
            console.error('Failed to send chat notification:', notificationError);
            // Don't fail the message send if notification fails
        }

        return NextResponse.json(responseMessage);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
