import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET all approved events for a community (Admins get unapproved as well)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Fetch community events
    const { data: events, error } = await supabaseAdmin
      .from('community_events')
      .select('*')
      .eq('community_id', id)
      .order('start_time', { ascending: true });

    if (error) throw error;

    if (!events || events.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch event registrations
    const eventIds = events.map((e: any) => e.id);
    const [
      { data: registrations },
      { data: userMember }
    ] = await Promise.all([
      supabaseAdmin.from('community_event_registrations').select('*').in('event_id', eventIds),
      userId ? supabaseAdmin.from('community_members').select('role').eq('community_id', id).eq('user_uuid', userId).maybeSingle() : { data: null }
    ]);

    const regMap = new Map<number, any[]>();
    registrations?.forEach((r: any) => {
      const list = regMap.get(r.event_id) || [];
      list.push(r);
      regMap.set(r.event_id, list);
    });

    const isModeratorOrAdmin = userMember?.role === 'moderator' || userMember?.role === 'admin';

    const mapped = events
      .filter((e: any) => e.is_approved || isModeratorOrAdmin)
      .map((e: any) => {
        const regs = regMap.get(e.id) || [];
        const isRegistered = userId ? regs.some((r: any) => r.user_uuid === userId) : false;

        return {
          id: e.id,
          uuid: e.uuid,
          communityId: e.community_id,
          title: e.title,
          description: e.description,
          eventType: e.event_type,
          startTime: e.start_time,
          timezone: e.timezone,
          meetingLink: isRegistered || isModeratorOrAdmin ? e.meeting_link : null,
          speakers: e.speakers || [],
          isApproved: e.is_approved,
          registrationCount: regs.length,
          isRegistered
        };
      });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error('[EVENTS_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create a community event (Moderator/Admin can create directly, others are pending approval)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { title, description, eventType, startTime, timezone, meetingLink, speakers, creatorUuid } = body;

    if (!title || !eventType || !startTime || !creatorUuid) {
      return NextResponse.json({ error: 'Title, Event Type, Start Time, and Creator are required' }, { status: 400 });
    }

    // Check user membership role
    const { data: member } = await supabaseAdmin
      .from('community_members')
      .select('role')
      .eq('community_id', id)
      .eq('user_uuid', creatorUuid)
      .maybeSingle();

    const { data: seeker } = await supabaseAdmin
      .from('jobseekers')
      .select('role')
      .eq('uuid', creatorUuid)
      .maybeSingle();

    const isAuthorizedDirectly = member?.role === 'moderator' || member?.role === 'admin' || seeker?.role === 'Admin' || seeker?.role === 'Super Admin';

    const { data: newEvent, error } = await supabaseAdmin
      .from('community_events')
      .insert({
        community_id: id,
        creator_uuid: creatorUuid,
        title,
        description,
        event_type: eventType,
        start_time: startTime,
        timezone: timezone || 'UTC',
        meeting_link: meetingLink || '',
        speakers: speakers || [],
        is_approved: isAuthorizedDirectly // Auto approved for mods/admins
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(newEvent);
  } catch (err: any) {
    console.error('[EVENTS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
