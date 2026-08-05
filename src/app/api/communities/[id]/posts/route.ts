import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET posts inside a community (with filters/type)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // community id
    const { searchParams } = new URL(request.url);
    const postType = searchParams.get('postType'); // filter by postType
    const filter = searchParams.get('filter'); // trending, newest, unanswered,Solved
    const userId = searchParams.get('userId');

    let query = supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('community_id', id);

    if (postType && postType !== 'all') {
      query = query.eq('post_type', postType);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    if (!posts || posts.length === 0) {
      return NextResponse.json([]);
    }

    // Resolve details (Authors, Comments Counts, Reactions, Bookmarked status)
    const postIds = posts.map((p: any) => p.id);
    const authorUuids = Array.from(new Set(posts.map((p: any) => p.author_uuid)));

    const [
      { data: seekers },
      { data: employees },
      { data: recruiters },
      { data: adminUsers },
      { data: comments },
      { data: reactions },
      { data: bookmarks }
    ] = await Promise.all([
      supabaseAdmin.from('jobseekers').select('uuid, name, email').in('uuid', authorUuids),
      supabaseAdmin.from('employees').select('uuid, name, email').in('uuid', authorUuids),
      supabaseAdmin.from('recruiters').select('uuid, name, email, company_name').in('uuid', authorUuids),
      supabaseAdmin.from('admins').select('uuid, name, email').in('uuid', authorUuids),
      supabaseAdmin.from('community_comments').select('id, post_id, parent_id, is_accepted').in('post_id', postIds),
      supabaseAdmin.from('community_reactions').select('*').in('post_id', postIds).is('comment_id', null),
      userId ? supabaseAdmin.from('community_bookmarks').select('post_id').eq('user_uuid', userId) : { data: [] }
    ]);

    // Build Maps for efficient lookup
    const authorMap = new Map<string, any>();
    seekers?.forEach((s: any) => authorMap.set(s.uuid, { name: s.name, role: 'Job Seeker', type: 'seeker' }));
    employees?.forEach((e: any) => authorMap.set(e.uuid, { name: e.name, role: 'Employee', type: 'employee' }));
    recruiters?.forEach((r: any) => authorMap.set(r.uuid, { name: r.name, role: r.company_name || 'Recruiter', type: 'recruiter' }));
    adminUsers?.forEach((a: any) => authorMap.set(a.uuid, { name: a.name, role: 'Admin', type: 'admin' }));

    const commentsMap = new Map<number, any[]>();
    comments?.forEach((c: any) => {
      const list = commentsMap.get(c.post_id) || [];
      list.push(c);
      commentsMap.set(c.post_id, list);
    });

    const reactionsMap = new Map<number, any[]>();
    reactions?.forEach((r: any) => {
      const list = reactionsMap.get(r.post_id) || [];
      list.push(r);
      reactionsMap.set(r.post_id, list);
    });

    const bookmarkedSet = new Set<number>(bookmarks?.map((b: any) => b.post_id) || []);

    // Map to frontend response format
    let mapped = posts.map((p: any) => {
      const author = authorMap.get(p.author_uuid) || { name: 'Anonymous', role: 'Member', type: 'member' };
      const commList = commentsMap.get(p.id) || [];
      const reactList = reactionsMap.get(p.id) || [];

      // Calculate score for sorting
      const likesCount = reactList.length;
      const commentsCount = commList.length;
      const isSolved = commList.some((c: any) => c.is_accepted);

      return {
        id: p.id,
        uuid: p.uuid,
        communityId: p.community_id,
        authorUuid: p.author_uuid,
        author: {
          name: author.name,
          role: author.role,
          type: author.type
        },
        title: p.title,
        content: p.content,
        postType: p.post_type,
        metadata: p.metadata || {},
        isPinned: p.is_pinned,
        isLocked: p.is_locked,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        commentCount: commentsCount,
        reactions: reactList,
        isBookmarked: bookmarkedSet.has(p.id),
        isSolved,
        likesCount
      };
    });

    // Apply Sorting Filters
    if (filter === 'trending') {
      mapped.sort((a: any, b: any) => (b.likesCount + b.commentCount * 2) - (a.likesCount + a.commentCount * 2));
    } else if (filter === 'newest') {
      mapped.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (filter === 'unanswered' && postType === 'question') {
      mapped = mapped.filter((p: any) => p.commentCount === 0);
    } else if (filter === 'solved' && postType === 'question') {
      mapped = mapped.filter((p: any) => p.isSolved);
    } else {
      // Default: show pinned posts first, then newest
      mapped.sort((a: any, b: any) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    }

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error('[COMMUNITY_POSTS_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST create post inside a community
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // community id
    const body = await request.json();
    const { authorUuid, title, content, postType, metadata } = body;

    if (!authorUuid || !title || !content || !postType) {
      return NextResponse.json({ error: 'Author, Title, Content, and Post Type are required' }, { status: 400 });
    }

    // 1. Insert post
    const { data: newPost, error } = await supabaseAdmin
      .from('community_posts')
      .insert({
        community_id: id,
        author_uuid: authorUuid,
        title,
        content,
        post_type: postType,
        metadata: metadata || {}
      })
      .select()
      .single();

    return NextResponse.json(newPost);
  } catch (err: any) {
    console.error('[COMMUNITY_POSTS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
