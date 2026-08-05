import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { encrypt, decrypt } from '@/lib/encryption';

// GET all comments for a post
export async function GET(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;

    // Fetch comments — author_id is now int8 → jobseekers(id)
    const { data: comments, error } = await supabaseAdmin
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (!comments || comments.length === 0) {
      return NextResponse.json([]);
    }

    const commentIds = comments.map((c: any) => c.id);
    // Collect unique jobseeker int8 IDs
    const authorIds = Array.from(new Set(comments.map((c: any) => c.author_id).filter(Boolean)));

    // Fetch author details (only jobseekers since FK → jobseekers.id)
    // Also fetch XP profiles (by uuid) and reactions
    const [
      { data: seekers },
      { data: reactions }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('id, uuid, name, email').in('id', authorIds),
      supabaseAdmin.from('community_reactions').select('*').in('comment_id', commentIds).is('post_id', null)
    ]);

    // Build author map keyed by int8 id
    const authorMap = new Map<number, any>();
    seekers?.forEach((s: any) => authorMap.set(s.id, { name: s.name, role: 'Job Seeker', type: 'seeker', uuid: s.uuid }));

    const reactionsMap = new Map<number, any[]>();
    reactions?.forEach((r: any) => {
      const list = reactionsMap.get(r.comment_id) || [];
      list.push(r);
      reactionsMap.set(r.comment_id, list);
    });

    const mapped = comments.map((c: any) => {
      const author = authorMap.get(c.author_id) || { name: 'Anonymous', role: 'Member', type: 'member', uuid: null };
      const commentReactions = reactionsMap.get(c.id) || [];

      return {
        id: c.id,
        uuid: c.uuid,
        postId: c.post_id,
        parentId: c.parent_id,
        authorId: c.author_id,
        authorUuid: author.uuid, // expose uuid for client-side comparisons
        author: {
          name: author.name,
          role: author.role,
          type: author.type
        },
        content: decrypt(c.content),
        isAccepted: c.is_accepted,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
        reactions: commentReactions
      };
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error('[COMMENTS_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST add a comment or reply to a post
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const body = await request.json();
    const { content, authorUuid, parentId } = body;

    if (!content || !authorUuid) {
      return NextResponse.json({ error: 'Content and Author UUID are required' }, { status: 400 });
    }

    // Resolve jobseeker int8 id from the provided UUID
    const { data: seeker, error: seekerErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', authorUuid)
      .maybeSingle();

    if (seekerErr || !seeker) {
      return NextResponse.json({ error: 'Author not found in jobseekers' }, { status: 404 });
    }

    // Insert comment with author_id (int8)
    const { data: comment, error } = await supabaseAdmin
      .from('community_comments')
      .insert({
        post_id: postId,
        parent_id: parentId || null,
        author_id: seeker.id,
        content: encrypt(content)
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...comment,
      content
    });
  } catch (err: any) {
    console.error('[COMMENTS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT mark comment as accepted answer or edit comment
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { commentId, isAccepted, content, userUuid } = body;

    if (!commentId || !userUuid) {
      return NextResponse.json({ error: 'Comment ID and User UUID are required' }, { status: 400 });
    }

    // Resolve requesting user's jobseeker id
    const { data: requestingSeeker } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', userUuid)
      .maybeSingle();

    const requestingAuthorId = requestingSeeker?.id ?? null;

    // Fetch comment and parent post to check authorization
    const { data: existingComment } = await supabaseAdmin
      .from('community_comments')
      .select('*, community_posts(author_uuid)')
      .eq('id', commentId)
      .single();

    if (!existingComment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    const isPostAuthor = (existingComment.community_posts as any)?.author_uuid === userUuid;
    const isCommentAuthor = requestingAuthorId !== null && existingComment.author_id === requestingAuthorId;

    let updatedComment;

    if (isAccepted !== undefined) {
      // Only the author of the question (post) can accept an answer
      if (!isPostAuthor) {
        return NextResponse.json({ error: 'Only the question creator can accept answers.' }, { status: 403 });
      }

      // First reset all accepted answers for this post
      await supabaseAdmin
        .from('community_comments')
        .update({ is_accepted: false })
        .eq('post_id', existingComment.post_id);

      // Now set this one
      const { data, error } = await supabaseAdmin
        .from('community_comments')
        .update({ is_accepted: isAccepted })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      updatedComment = data;

     
    } else if (content !== undefined) {
      // Only comment author can edit content
      if (!isCommentAuthor) {
        return NextResponse.json({ error: 'Only the comment author can edit.' }, { status: 403 });
      }

      const { data, error } = await supabaseAdmin
        .from('community_comments')
        .update({ content: encrypt(content), updated_at: new Date().toISOString() })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      updatedComment = data;
    }

    return NextResponse.json(updatedComment);
  } catch (err: any) {
    console.error('[COMMENTS_PUT] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE a comment (Author, Post Author, or Admin/Moderator only)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    const userUuid = searchParams.get('userUuid');

    if (!commentId || !userUuid) {
      return NextResponse.json({ error: 'Comment ID and User UUID are required' }, { status: 400 });
    }

    // Resolve requesting user's jobseeker id
    const { data: requestingSeeker } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', userUuid)
      .maybeSingle();

    const requestingAuthorId = requestingSeeker?.id ?? null;

    const { data: comment } = await supabaseAdmin
      .from('community_comments')
      .select('*, community_posts(community_id, author_uuid)')
      .eq('id', commentId)
      .single();

    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // Comment author (by int8 id) or post author (by uuid) can delete
    const isCommentAuthor = requestingAuthorId !== null && comment.author_id === requestingAuthorId;
    const isPostAuthor = (comment.community_posts as any)?.author_uuid === userUuid;
    let isAuthorized = isCommentAuthor || isPostAuthor;

    if (!isAuthorized) {
      // Check moderator role
      const { data: member } = await supabaseAdmin
        .from('community_members')
        .select('role')
        .eq('community_id', (comment.community_posts as any).community_id)
        .eq('user_uuid', userUuid)
        .maybeSingle();

      const { data: seeker } = await supabaseAdmin
        .from('jobseekers')
        .select('role')
        .eq('uuid', userUuid)
        .maybeSingle();

      if (member?.role === 'moderator' || member?.role === 'admin' || seeker?.role === 'Admin' || seeker?.role === 'Super Admin') {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('community_comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;

    return NextResponse.json({ success: true, message: 'Comment deleted successfully' });
  } catch (err: any) {
    console.error('[COMMENTS_DELETE] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
