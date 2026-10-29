/**
 * Server-side reads for the public community pages.
 *
 * The community pages were rendered entirely in the browser, so crawlers saw
 * an empty shell: no headings, no community list, no posts. These helpers let
 * the server components render the same data into the initial HTML. They
 * return exactly what the public GET APIs already return to anonymous callers
 * (minus per-user state such as joined or bookmarked), so nothing new is
 * exposed by rendering it server-side.
 *
 * Only import this from server components and route handlers.
 */

import { supabaseAdmin } from '@/lib/supabase-admin';
import { decrypt } from '@/lib/encryption';

export interface CommunitySummary {
  id: number;
  uuid: string;
  /** URL segment derived from the name, e.g. "ai-machine-learning". */
  slug: string;
  name: string;
  description: string | null;
  category: string;
  icon: string;
  memberCount: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CommunityPostSummary {
  id: number;
  uuid: string;
  communityId: number;
  authorUuid: string | null;
  author: { name: string; role: string; type: string };
  title: string;
  content: string;
  postType: string;
  metadata: Record<string, unknown>;
  isPinned: boolean;
  isLocked: boolean;
  isSolved: boolean;
  commentCount: number;
  likesCount: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface CommunityComment {
  id: number;
  uuid: string;
  parentId: number | null;
  authorUuid: string | null;
  author: { name: string; role: string; type: string };
  content: string;
  isAccepted: boolean;
  createdAt: string;
  updatedAt: string | null;
  reactions: unknown[];
}

const ANONYMOUS = { name: 'Anonymous', role: 'Member', type: 'member', uuid: null as string | null };

/**
 * Readable URL segment for a community name: "AI & Machine Learning" →
 * "ai-machine-learning", "Next.js" → "next-js", "UI/UX Design" → "ui-ux-design".
 */
export function slugifyCommunityName(name: string): string {
  return (name || '')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'community';
}

/**
 * Slugs are computed rather than stored, so they must be unique across the
 * current set: the oldest community keeps the plain slug and any later one
 * with the same name gets its id appended.
 */
function slugMap(rows: Array<{ id: number; name: string }>): Map<number, string> {
  const map = new Map<number, string>();
  const taken = new Set<string>();
  [...rows].sort((a, b) => a.id - b.id).forEach(row => {
    const base = slugifyCommunityName(row.name);
    const slug = taken.has(base) ? `${base}-${row.id}` : base;
    taken.add(slug);
    map.set(row.id, slug);
  });
  return map;
}

async function loadSlugMap(): Promise<Map<number, string>> {
  const { data, error } = await supabaseAdmin.from('communities').select('id, name');
  if (error) throw error;
  return slugMap((data || []) as Array<{ id: number; name: string }>);
}

/** Public path of a community page. */
export function communityPath(community: { slug: string }): string {
  return `/communities/${community.slug}`;
}

/** Public path of a discussion inside a community. */
export function communityPostPath(community: { slug: string }, postId: number): string {
  return `/communities/${community.slug}/posts/${postId}`;
}

function mapCommunity(row: any, slug: string): CommunitySummary {
  return {
    id: row.id,
    uuid: row.uuid,
    slug,
    name: row.name,
    description: row.description ?? null,
    category: row.category || 'Career',
    icon: row.icon || 'Users',
    memberCount: row.members_count?.[0]?.count || 0,
    createdAt: row.created_at ?? null,
    updatedAt: row.updated_at ?? null,
  };
}

function safeDecrypt(value: string | null | undefined): string {
  if (!value) return '';
  try {
    return decrypt(value);
  } catch {
    return '';
  }
}

export async function listCommunities(): Promise<CommunitySummary[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('communities')
      .select('*, members_count:community_members(count)')
      .order('name');
    if (error) {
      console.error('[COMMUNITIES_SERVER] list failed:', error.message);
      return [];
    }
    const rows = data || [];
    const slugs = slugMap(rows as Array<{ id: number; name: string }>);
    return rows.map((row: any) => mapCommunity(row, slugs.get(row.id)!));
  } catch (err) {
    console.error('[COMMUNITIES_SERVER] list error:', err);
    return [];
  }
}

/**
 * Looks a community up by slug (canonical), numeric id or uuid. The last two
 * still resolve so older links keep working; callers redirect them to the slug.
 */
export async function getCommunity(param: string): Promise<CommunitySummary | null> {
  let key: string;
  try {
    key = decodeURIComponent(param).trim();
  } catch {
    return null;
  }
  const isNumeric = /^\d+$/.test(key);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);

  try {
    const slugs = await loadSlugMap();
    let id: number | null = null;
    if (isNumeric) {
      id = slugs.has(Number(key)) ? Number(key) : null;
    } else if (!isUuid) {
      // Also accept a name typed or pasted directly ("AI & Machine Learning").
      const wanted = slugifyCommunityName(key);
      for (const [cid, slug] of slugs) {
        if (slug === key.toLowerCase() || slug === wanted) {
          id = cid;
          break;
        }
      }
      if (id === null) return null;
    }

    const query = supabaseAdmin.from('communities').select('*, members_count:community_members(count)');
    const { data, error } = await (id !== null ? query.eq('id', id) : query.eq('uuid', key)).maybeSingle();
    if (error) {
      console.error('[COMMUNITIES_SERVER] get failed:', error.message);
      return null;
    }
    return data ? mapCommunity(data, slugs.get(data.id) || slugifyCommunityName(data.name)) : null;
  } catch (err) {
    console.error('[COMMUNITIES_SERVER] get error:', err);
    return null;
  }
}

async function postTypeNames(): Promise<Map<number, string>> {
  const { data } = await supabaseAdmin.from('community_post_types').select('id, name');
  const map = new Map<number, string>();
  (data || []).forEach((t: any) => map.set(t.id, t.name));
  return map;
}

async function enrichPosts(posts: any[]): Promise<CommunityPostSummary[]> {
  if (posts.length === 0) return [];

  const postIds = posts.map(p => p.id);
  const jobseekerIds = Array.from(new Set(posts.map(p => p.jobseeker_id).filter(Boolean)));
  const authorUuids = Array.from(new Set(posts.map(p => p.author_uuid).filter(Boolean)));

  const [types, byId, byUuid, comments, reactions] = await Promise.all([
    postTypeNames(),
    jobseekerIds.length ? supabaseAdmin.from('jobseekers').select('id, uuid, name').in('id', jobseekerIds) : Promise.resolve({ data: [] as any[] }),
    authorUuids.length ? supabaseAdmin.from('jobseekers').select('id, uuid, name').in('uuid', authorUuids) : Promise.resolve({ data: [] as any[] }),
    supabaseAdmin.from('community_comments').select('post_id, is_accepted').in('post_id', postIds),
    supabaseAdmin.from('community_reactions').select('post_id').in('post_id', postIds).is('comment_id', null),
  ]);

  const authorById = new Map<number, any>();
  (byId.data || []).forEach((s: any) => authorById.set(s.id, s));
  const authorByUuid = new Map<string, any>();
  (byUuid.data || []).forEach((s: any) => authorByUuid.set(s.uuid, s));

  const commentCounts = new Map<number, number>();
  const solved = new Set<number>();
  (comments.data || []).forEach((c: any) => {
    commentCounts.set(c.post_id, (commentCounts.get(c.post_id) || 0) + 1);
    if (c.is_accepted) solved.add(c.post_id);
  });
  const likeCounts = new Map<number, number>();
  (reactions.data || []).forEach((r: any) => likeCounts.set(r.post_id, (likeCounts.get(r.post_id) || 0) + 1));

  return posts.map(p => {
    const seeker = (p.jobseeker_id && authorById.get(p.jobseeker_id)) || (p.author_uuid && authorByUuid.get(p.author_uuid));
    const author = seeker ? { name: seeker.name, role: 'Job Seeker', type: 'seeker', uuid: seeker.uuid } : ANONYMOUS;
    return {
      id: p.id,
      uuid: p.uuid,
      communityId: p.community_id,
      authorUuid: author.uuid || p.author_uuid || null,
      author: { name: author.name || 'Member', role: author.role, type: author.type },
      title: safeDecrypt(p.title),
      content: safeDecrypt(p.content),
      postType: (p.post_type_id && types.get(p.post_type_id)) || p.post_type || 'discussion',
      metadata: p.metadata || {},
      isPinned: !!p.is_pinned,
      isLocked: !!p.is_locked,
      isSolved: solved.has(p.id),
      commentCount: commentCounts.get(p.id) || 0,
      likesCount: likeCounts.get(p.id) || 0,
      createdAt: p.created_at,
      updatedAt: p.updated_at ?? null,
    };
  });
}

/** Posts in a community, pinned first and then newest — the default feed order. */
export async function listCommunityPosts(communityId: number, limit = 50): Promise<CommunityPostSummary[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('community_id', communityId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) {
      console.error('[COMMUNITIES_SERVER] posts failed:', error.message);
      return [];
    }
    return await enrichPosts(data || []);
  } catch (err) {
    console.error('[COMMUNITIES_SERVER] posts error:', err);
    return [];
  }
}

export async function getCommunityPost(postId: string): Promise<CommunityPostSummary | null> {
  if (!/^\d+$/.test(postId) && !/^[0-9a-f-]{36}$/i.test(postId)) return null;
  try {
    const isNumeric = /^\d+$/.test(postId);
    const { data, error } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq(isNumeric ? 'id' : 'uuid', isNumeric ? Number(postId) : postId)
      .maybeSingle();
    if (error || !data) return null;
    const [post] = await enrichPosts([data]);
    return post ?? null;
  } catch (err) {
    console.error('[COMMUNITIES_SERVER] post error:', err);
    return null;
  }
}

export async function listPostComments(postId: number): Promise<CommunityComment[]> {
  try {
    const { data: comments, error } = await supabaseAdmin
      .from('community_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    if (error || !comments || comments.length === 0) return [];

    const authorIds = Array.from(new Set(comments.map((c: any) => c.author_id).filter(Boolean)));
    const commentIds = comments.map((c: any) => c.id);
    const [{ data: seekers }, { data: reactions }] = await Promise.all([
      authorIds.length ? supabaseAdmin.from('jobseekers').select('id, uuid, name').in('id', authorIds) : Promise.resolve({ data: [] as any[] }),
      supabaseAdmin.from('community_reactions').select('*').in('comment_id', commentIds).is('post_id', null),
    ]);

    const authorMap = new Map<number, any>();
    (seekers || []).forEach((s: any) => authorMap.set(s.id, s));
    const reactionMap = new Map<number, unknown[]>();
    (reactions || []).forEach((r: any) => {
      const list = reactionMap.get(r.comment_id) || [];
      list.push(r);
      reactionMap.set(r.comment_id, list);
    });

    return comments.map((c: any) => {
      const seeker = authorMap.get(c.author_id);
      return {
        id: c.id,
        uuid: c.uuid,
        parentId: c.parent_id ?? null,
        authorUuid: seeker?.uuid ?? null,
        author: seeker ? { name: seeker.name, role: 'Job Seeker', type: 'seeker' } : { name: 'Anonymous', role: 'Member', type: 'member' },
        content: safeDecrypt(c.content),
        isAccepted: !!c.is_accepted,
        createdAt: c.created_at,
        updatedAt: c.updated_at ?? null,
        reactions: reactionMap.get(c.id) || [],
      };
    });
  } catch (err) {
    console.error('[COMMUNITIES_SERVER] comments error:', err);
    return [];
  }
}

/** Minimum post length for a thread to be indexed; shorter ones are noindex. */
export const MIN_INDEXABLE_POST_CHARS = 40;

/** Recent indexable posts across all communities, for the sitemap. */
export async function listRecentPostRefs(limit = 1000): Promise<Array<{ id: number; communitySlug: string; updatedAt: string }>> {
  try {
    const [{ data, error }, slugs] = await Promise.all([
      supabaseAdmin
        .from('community_posts')
        .select('id, community_id, content, created_at, updated_at')
        .order('created_at', { ascending: false })
        .limit(limit),
      loadSlugMap(),
    ]);
    if (error) {
      console.error('[COMMUNITIES_SERVER] post refs failed:', error.message);
      return [];
    }
    return (data || [])
      .filter((p: any) => slugs.has(p.community_id) && safeDecrypt(p.content).trim().length >= MIN_INDEXABLE_POST_CHARS)
      .map((p: any) => ({ id: p.id, communitySlug: slugs.get(p.community_id)!, updatedAt: p.updated_at || p.created_at }));
  } catch (err) {
    console.error('[COMMUNITIES_SERVER] post refs error:', err);
    return [];
  }
}

/**
 * JSON for a <script type="application/ld+json"> block.
 *
 * Community content is user-written, so "<" is escaped: otherwise a post
 * containing "</script>" would close the tag and inject markup into the page.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

/** Plain-text excerpt for meta descriptions and cards. */
export function excerpt(text: string, max = 155): string {
  const clean = (text || '').replace(/[#*_`>\[\]]/g, '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max).trim()}…`;
}
