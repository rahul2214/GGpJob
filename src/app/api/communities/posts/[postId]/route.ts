import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { encrypt, decrypt } from '@/lib/encryption';

/** Helper: Find post by numeric ID or UUID */
async function findPostByIdOrUuid(postId: string) {
  const numericId = Number(postId);
  if (!isNaN(numericId) && Number.isInteger(numericId) && numericId > 0) {
    const { data: postById } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('id', numericId)
      .maybeSingle();

    if (postById) return postById;
  }

  // Fallback lookup by UUID
  const { data: postByUuid } = await supabaseAdmin
    .from('community_posts')
    .select('*')
    .eq('uuid', postId)
    .maybeSingle();

  return postByUuid;
}

// GET single post details
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const post = await findPostByIdOrUuid(postId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Resolve author, post type name, comments count, reactions, bookmarks
    const [
      { data: seekerById },
      { data: seekerByUuid },
      { data: postTypeData },
      { data: comments },
      { data: reactions },
      { data: bookmark }
    ] = await Promise.all([
      post.jobseeker_id ? supabaseAdmin.from('jobseekers').select('id, uuid, name, email').eq('id', post.jobseeker_id).maybeSingle() : { data: null },
      post.author_uuid ? supabaseAdmin.from('jobseekers').select('id, uuid, name, email').eq('uuid', post.author_uuid).maybeSingle() : { data: null },
      post.post_type_id ? supabaseAdmin.from('community_post_types').select('name').eq('id', post.post_type_id).maybeSingle() : { data: null },
      supabaseAdmin.from('community_comments').select('id, parent_id, is_accepted').eq('post_id', post.id),
      supabaseAdmin.from('community_reactions').select('*').eq('post_id', post.id).is('comment_id', null),
      userId ? supabaseAdmin.from('community_bookmarks').select('id').eq('user_uuid', userId).eq('post_id', post.id).maybeSingle() : { data: null }
    ]);

    const seeker = seekerById || seekerByUuid;
    const author = seeker
      ? { name: seeker.name, role: 'Job Seeker', type: 'seeker', uuid: seeker.uuid }
      : { name: 'Anonymous', role: 'Member', type: 'member', uuid: null };

    const postTypeName = postTypeData?.name || post.post_type || 'discussion';

    const result = {
      id: post.id,
      uuid: post.uuid,
      communityId: post.community_id,
      jobseekerId: post.jobseeker_id,
      authorUuid: author.uuid || post.author_uuid,
      author: {
        name: author.name,
        role: author.role,
        type: author.type
      },
      title: decrypt(post.title),
      content: decrypt(post.content),
      postType: postTypeName,
      postTypeId: post.post_type_id,
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

/** Helper: Check if user is authorized to edit/delete a post */
async function checkCanModifyPost(existingPost: any, rawUserIdentifier: string): Promise<boolean> {
  if (!rawUserIdentifier || !existingPost) return false;

  const strIdentifier = String(rawUserIdentifier).trim();
  const numIdentifier = Number(rawUserIdentifier);
  const isValidNum = !isNaN(numIdentifier) && Number.isInteger(numIdentifier) && numIdentifier > 0;

  // 1. Direct identifier match against post fields
  const postJobseekerIdStr = existingPost.jobseeker_id ? String(existingPost.jobseeker_id) : null;
  const postAuthorUuid = existingPost.author_uuid ? String(existingPost.author_uuid) : null;

  if (postJobseekerIdStr && (postJobseekerIdStr === strIdentifier || (isValidNum && Number(postJobseekerIdStr) === numIdentifier))) {
    return true;
  }
  if (postAuthorUuid && postAuthorUuid.toLowerCase() === strIdentifier.toLowerCase()) {
    return true;
  }

  // 2. Fetch requesting user from jobseekers
  const seekerQueries = [
    supabaseAdmin.from('jobseekers').select('id, uuid, role, email').eq('uuid', strIdentifier).maybeSingle()
  ];
  if (isValidNum) {
    seekerQueries.push(
      supabaseAdmin.from('jobseekers').select('id, uuid, role, email').eq('id', numIdentifier).maybeSingle()
    );
  }
  const seekerResults = await Promise.all(seekerQueries);
  const seeker = seekerResults.find(r => r.data)?.data;

  if (seeker) {
    const seekerIdStr = String(seeker.id);
    const seekerUuidStr = String(seeker.uuid).toLowerCase();

    if (postJobseekerIdStr && postJobseekerIdStr === seekerIdStr) return true;
    if (postAuthorUuid && postAuthorUuid.toLowerCase() === seekerUuidStr) return true;
  }

  // 3. Fetch author of the post from jobseekers
  if (existingPost.jobseeker_id || existingPost.author_uuid) {
    const postAuthorQueries = [];
    if (existingPost.jobseeker_id) {
      postAuthorQueries.push(
        supabaseAdmin.from('jobseekers').select('id, uuid, email').eq('id', existingPost.jobseeker_id).maybeSingle()
      );
    }
    if (existingPost.author_uuid) {
      postAuthorQueries.push(
        supabaseAdmin.from('jobseekers').select('id, uuid, email').eq('uuid', existingPost.author_uuid).maybeSingle()
      );
    }
    const postAuthorResults = await Promise.all(postAuthorQueries);
    const postAuthor = postAuthorResults.find(r => r.data)?.data;

    if (postAuthor) {
      if (strIdentifier === String(postAuthor.id) || strIdentifier.toLowerCase() === String(postAuthor.uuid).toLowerCase()) {
        return true;
      }
      if (seeker && (seeker.id === postAuthor.id || seeker.uuid?.toLowerCase() === postAuthor.uuid?.toLowerCase())) {
        return true;
      }
    }
  }

  // 4. Global Admin check
  const { data: adminByUuid } = await supabaseAdmin.from('admins').select('id').eq('uuid', strIdentifier).maybeSingle();
  if (adminByUuid) return true;

  if (seeker?.role === 'Admin' || seeker?.role === 'Super Admin') return true;

  // 5. Community Moderator / Admin check
  const memberQueries = [];
  if (seeker?.id) {
    memberQueries.push(
      supabaseAdmin.from('community_members').select('role').eq('community_id', existingPost.community_id).eq('jobseeker_id', seeker.id).maybeSingle()
    );
  }
  memberQueries.push(
    supabaseAdmin.from('community_members').select('role').eq('community_id', existingPost.community_id).eq('user_uuid', strIdentifier).maybeSingle()
  );

  const memberResults = await Promise.all(memberQueries);
  const memberRole = memberResults.find(r => r.data?.role)?.data?.role;

  if (memberRole === 'moderator' || memberRole === 'admin') {
    return true;
  }

  return false;
}

// PUT edit post (Author or Moderator/Admin only)
export async function PUT(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const { title, content, userUuid, authorUuid, userId, id: bodyUserId, metadata, isPinned, isLocked } = body;
    const rawUserIdentifier = userUuid || authorUuid || userId || bodyUserId || searchParams.get('userUuid') || searchParams.get('userId');

    if (!rawUserIdentifier) {
      return NextResponse.json({ error: 'User identification (userUuid or userId) is required' }, { status: 400 });
    }

    // Fetch existing post
    const existingPost = await findPostByIdOrUuid(postId);

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isAuthorized = await checkCanModifyPost(existingPost, rawUserIdentifier);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permission denied. You are not authorized to edit this post.' }, { status: 403 });
    }

    // Prepare update parameters with encrypted title and content
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    if (title !== undefined) updateData.title = encrypt(title);
    if (content !== undefined) updateData.content = encrypt(content);
    if (metadata !== undefined) updateData.metadata = metadata;
    if (isPinned !== undefined) updateData.is_pinned = isPinned;
    if (isLocked !== undefined) updateData.is_locked = isLocked;

    const { data: updated, error } = await supabaseAdmin
      .from('community_posts')
      .update(updateData)
      .eq('id', existingPost.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...updated,
      title: title !== undefined ? title : decrypt(updated.title),
      content: content !== undefined ? content : decrypt(updated.content)
    });
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
    const queryUserIdentifier = searchParams.get('userUuid') || searchParams.get('authorUuid') || searchParams.get('userId');

    if (!queryUserIdentifier) {
      return NextResponse.json({ error: 'User identification (userUuid or userId) is required' }, { status: 400 });
    }

    // Fetch existing post
    const existingPost = await findPostByIdOrUuid(postId);

    if (!existingPost) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const isAuthorized = await checkCanModifyPost(existingPost, queryUserIdentifier);

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permission denied. You are not authorized to delete this post.' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('id', existingPost.id);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: any) {
    console.error('[POST_DETAIL_DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


