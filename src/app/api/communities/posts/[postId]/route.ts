import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET single post details
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    // Fetch the post
    const { data: post, error } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('id', postId)
      .maybeSingle();

    if (error) throw error;
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Resolve Author, Comments count, Reactions, and Bookmarks
    const [
      { data: seeker },
      { data: employee },
      { data: recruiter },
      { data: adminUser },
      { data: comments },
      { data: reactions },
      { data: bookmark }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('uuid, name, email').eq('uuid', post.author_uuid).maybeSingle(),
      supabaseAdmin.from('employees').select('uuid, name, email').eq('uuid', post.author_uuid).maybeSingle(),
      supabaseAdmin.from('recruiters').select('uuid, name, email, company_name').eq('uuid', post.author_uuid).maybeSingle(),
      supabaseAdmin.from('admins').select('uuid, name, email').eq('uuid', post.author_uuid).maybeSingle(),
      supabaseAdmin.from('community_comments').select('id, parent_id, is_accepted').eq('post_id', post.id),
      supabaseAdmin.from('community_reactions').select('*').eq('post_id', post.id).is('comment_id', null),
      userId ? supabaseAdmin.from('community_bookmarks').select('id').eq('user_uuid', userId).eq('post_id', post.id).maybeSingle() : { data: null }
    ]);

    const author = seeker
      ? { name: seeker.name, role: 'Job Seeker', type: 'seeker' }
      : employee
      ? { name: employee.name, role: 'Employee', type: 'employee' }
      : recruiter
      ? { name: recruiter.name, role: recruiter.company_name || 'Recruiter', type: 'recruiter' }
      : adminUser
      ? { name: adminUser.name, role: 'Admin', type: 'admin' }
      : { name: 'Anonymous', role: 'Member', type: 'member' };

    const result = {
      id: post.id,
      uuid: post.uuid,
      communityId: post.community_id,
      authorUuid: post.author_uuid,
      author: {
        name: author.name,
        role: author.role,
        type: author.type
      },
      title: post.title,
      content: post.content,
      postType: post.post_type,
      metadata: post.metadata || {},
      isPinned: post.is_pinned,
      isLocked: post.is_locked,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      commentCount: comments?.length || 0,
      reactions: reactions || [],
      isBookmarked: !!bookmark,
      isSolved: comments?.some((c: any) => c.is_accepted) || false
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[POST_DETAIL_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT edit post (Author or Moderator only)
export async function PUT(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const body = await request.json();
    const { title, content, userUuid, metadata, isPinned, isLocked } = body;

    // Fetch existing post to check authorship
    const { data: existingPost } = await supabaseAdmin
      .from('community_posts')
      .select('author_uuid, community_id')
      .eq('id', postId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let isAuthorized = existingPost.author_uuid === userUuid;

    // Check if user is moderator/admin
    if (!isAuthorized && userUuid) {
      const { data: jsUser } = await supabaseAdmin
        .from('jobseekers')
        .select('id, role')
        .eq('uuid', userUuid)
        .maybeSingle();

      if (jsUser?.id) {
        const { data: member } = await supabaseAdmin
          .from('community_members')
          .select('role')
          .eq('community_id', existingPost.community_id)
          .eq('jobseeker_id', jsUser.id)
          .maybeSingle();

        if (member?.role === 'moderator' || member?.role === 'admin' || jsUser?.role === 'Admin' || jsUser?.role === 'Super Admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Prepare update parameters
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (metadata !== undefined) updateData.metadata = metadata;
    if (isPinned !== undefined) updateData.is_pinned = isPinned;
    if (isLocked !== undefined) updateData.is_locked = isLocked;

    const { data: updated, error } = await supabaseAdmin
      .from('community_posts')
      .update(updateData)
      .eq('id', postId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('[POST_DETAIL_PUT] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE post (Author or Moderator/Admin only)
export async function DELETE(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const userUuid = searchParams.get('userUuid');

    // Fetch existing post to check authorship
    const { data: existingPost } = await supabaseAdmin
      .from('community_posts')
      .select('author_uuid, community_id')
      .eq('id', postId)
      .single();

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    let isAuthorized = existingPost.author_uuid === userUuid;

    // Check if user is moderator/admin
    if (!isAuthorized && userUuid) {
      const { data: jsUser } = await supabaseAdmin
        .from('jobseekers')
        .select('id, role')
        .eq('uuid', userUuid)
        .maybeSingle();

      if (jsUser?.id) {
        const { data: member } = await supabaseAdmin
          .from('community_members')
          .select('role')
          .eq('community_id', existingPost.community_id)
          .eq('jobseeker_id', jsUser.id)
          .maybeSingle();

        if (member?.role === 'moderator' || member?.role === 'admin' || jsUser?.role === 'Admin' || jsUser?.role === 'Super Admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    console.error('[POST_DETAIL_DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
