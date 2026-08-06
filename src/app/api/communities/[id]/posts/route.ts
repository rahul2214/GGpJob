import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { encrypt, decrypt } from '@/lib/encryption';

/** Resolve postType string → post_type_id (bigint) */
async function resolvePostTypeId(typeName: string): Promise<number> {
  const normalized = (typeName || 'discussion').toLowerCase();
  const { data: existing } = await supabaseAdmin
    .from('community_post_types')
    .select('id')
    .eq('name', normalized)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Insert missing type dynamically if not present
  const { data: inserted } = await supabaseAdmin
    .from('community_post_types')
    .insert({ name: normalized })
    .select('id')
    .single();

  return inserted?.id || 1;
}

// GET posts inside a community (with filters/type)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params; // community id
    const { searchParams } = new URL(request.url);
    const postTypeParam = searchParams.get('postType'); // filter by postType name
    const filter = searchParams.get('filter'); // trending, newest, unanswered, solved
    const userId = searchParams.get('userId');

    // Fetch types for mapping
    const { data: allTypes } = await supabaseAdmin.from('community_post_types').select('id, name');
    const typeIdToNameMap = new Map<number, string>();
    const typeNameToIdMap = new Map<string, number>();
    allTypes?.forEach((t: any) => {
      typeIdToNameMap.set(t.id, t.name);
      typeNameToIdMap.set(t.name.toLowerCase(), t.id);
    });

    let query = supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('community_id', id);

    if (postTypeParam && postTypeParam !== 'all') {
      const targetTypeId = typeNameToIdMap.get(postTypeParam.toLowerCase());
      if (targetTypeId) {
        query = query.eq('post_type_id', targetTypeId);
      }
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    if (!posts || posts.length === 0) {
      return NextResponse.json([]);
    }

    const postIds = posts.map((p: any) => p.id);
    // Support jobseeker_id (new int8 FK) or author_uuid (legacy)
    const jobseekerIds = Array.from(new Set(posts.map((p: any) => p.jobseeker_id).filter(Boolean)));
    const authorUuids = Array.from(new Set(posts.map((p: any) => p.author_uuid).filter(Boolean)));

    const [
      { data: seekersById },
      { data: seekersByUuid },
      { data: comments },
      { data: reactions },
      { data: bookmarks }
    ] = await Promise.all([
      jobseekerIds.length > 0 ? supabaseAdmin.from('jobseekers').select('id, uuid, name, email').in('id', jobseekerIds) : { data: [] },
      authorUuids.length > 0 ? supabaseAdmin.from('jobseekers').select('id, uuid, name, email').in('uuid', authorUuids) : { data: [] },
      supabaseAdmin.from('community_comments').select('id, post_id, parent_id, is_accepted').in('post_id', postIds),
      supabaseAdmin.from('community_reactions').select('*').in('post_id', postIds).is('comment_id', null),
      userId ? supabaseAdmin.from('community_bookmarks').select('post_id').eq('user_uuid', userId) : { data: [] }
    ]);

    // Build author lookup maps
    const authorMapById = new Map<number, any>();
    seekersById?.forEach((s: any) => authorMapById.set(s.id, { name: s.name, role: 'Job Seeker', type: 'seeker', uuid: s.uuid }));

    const authorMapByUuid = new Map<string, any>();
    seekersByUuid?.forEach((s: any) => authorMapByUuid.set(s.uuid, { name: s.name, role: 'Job Seeker', type: 'seeker', uuid: s.uuid }));

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

    // Map to frontend response format with decrypted title & content
    let mapped = posts.map((p: any) => {
      const author = (p.jobseeker_id ? authorMapById.get(p.jobseeker_id) : null) ||
        (p.author_uuid ? authorMapByUuid.get(p.author_uuid) : null) ||
        { name: 'Anonymous', role: 'Member', type: 'member', uuid: null };

      const commList = commentsMap.get(p.id) || [];
      const reactList = reactionsMap.get(p.id) || [];
      const likesCount = reactList.length;
      const commentsCount = commList.length;
      const isSolved = commList.some((c: any) => c.is_accepted);
      const postTypeName = (p.post_type_id ? typeIdToNameMap.get(p.post_type_id) : null) || p.post_type || 'discussion';

      return {
        id: p.id,
        uuid: p.uuid,
        communityId: p.community_id,
        jobseekerId: p.jobseeker_id,
        authorUuid: author.uuid || p.author_uuid,
        author: {
          name: author.name,
          role: author.role,
          type: author.type
        },
        title: decrypt(p.title),
        content: decrypt(p.content),
        postType: postTypeName,
        postTypeId: p.post_type_id,
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
    } else if (filter === 'unanswered' && postTypeParam === 'question') {
      mapped = mapped.filter((p: any) => p.commentCount === 0);
    } else if (filter === 'solved' && postTypeParam === 'question') {
      mapped = mapped.filter((p: any) => p.isSolved);
    } else {
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

    // 1. Resolve jobseeker int8 ID from authorUuid
    const { data: seeker, error: seekerErr } = await supabaseAdmin
      .from('jobseekers')
      .select('id')
      .eq('uuid', authorUuid)
      .maybeSingle();

    if (seekerErr || !seeker) {
      return NextResponse.json({ error: 'Only registered jobseekers can publish posts' }, { status: 403 });
    }

    // 2. Resolve post_type_id from postType name
    const postTypeId = await resolvePostTypeId(postType);

    // 3. Encrypt title and content before inserting into community_posts
    const encryptedTitle = encrypt(title);
    const encryptedContent = encrypt(content);

    const { data: newPost, error } = await supabaseAdmin
      .from('community_posts')
      .insert({
        community_id: id,
        jobseeker_id: seeker.id,
        post_type_id: postTypeId,
        title: encryptedTitle,
        content: encryptedContent,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      ...newPost,
      title,
      content,
      postType
    });
  } catch (err: any) {
    console.error('[COMMUNITY_POSTS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

