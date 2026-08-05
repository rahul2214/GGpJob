import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// GET bookmarked posts for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User UUID is required' }, { status: 400 });
    }

    const { data: bookmarks, error } = await supabaseAdmin
      .from('community_bookmarks')
      .select('post_id')
      .eq('user_uuid', userId);

    if (error) throw error;

    if (!bookmarks || bookmarks.length === 0) {
      return NextResponse.json([]);
    }

    const postIds = bookmarks.map((b: any) => b.post_id);

    // Fetch corresponding posts
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .in('id', postIds);

    if (postsError) throw postsError;

    return NextResponse.json(posts || []);
  } catch (err: any) {
    console.error('[BOOKMARKS_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST toggle bookmark status on a post
export async function POST(request: NextRequest) {
  try {
    const { userId, postId } = await request.json();

    if (!userId || !postId) {
      return NextResponse.json({ error: 'User UUID and Post ID are required' }, { status: 400 });
    }

    // Check if bookmark exists
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('community_bookmarks')
      .select('id')
      .eq('user_uuid', userId)
      .eq('post_id', postId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (existing) {
      // Delete bookmark
      const { error: deleteError } = await supabaseAdmin
        .from('community_bookmarks')
        .delete()
        .eq('id', existing.id);

      if (deleteError) throw deleteError;
      return NextResponse.json({ success: true, bookmarked: false });
    } else {
      // Insert bookmark
      const { error: insertError } = await supabaseAdmin
        .from('community_bookmarks')
        .insert({
          user_uuid: userId,
          post_id: postId
        });

      if (insertError) throw insertError;
      return NextResponse.json({ success: true, bookmarked: true });
    }
  } catch (err: any) {
    console.error('[BOOKMARKS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
