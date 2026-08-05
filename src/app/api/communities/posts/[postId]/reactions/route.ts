import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// POST toggle a reaction on a post or comment
export async function POST(request: NextRequest, { params }: { params: { postId: string } }) {
  try {
    const { postId } = params;
    const { userUuid, commentId, reactionType } = await request.json(); // reactionType: like, celebrate, insightful, helpful, love, funny

    if (!userUuid || !reactionType) {
      return NextResponse.json({ error: 'User UUID and Reaction Type are required' }, { status: 400 });
    }

    // Toggle reaction logic
    let existingQuery = supabaseAdmin
      .from('community_reactions')
      .select('*')
      .eq('user_uuid', userUuid);

    if (commentId) {
      existingQuery = existingQuery.eq('comment_id', commentId);
    } else {
      existingQuery = existingQuery.eq('post_id', postId).is('comment_id', null);
    }

    const { data: existingReaction, error: fetchError } = await existingQuery.maybeSingle();
    if (fetchError) throw fetchError;

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Toggle Off: Remove reaction
        const { error: deleteError } = await supabaseAdmin
          .from('community_reactions')
          .delete()
          .eq('id', existingReaction.id);

        if (deleteError) throw deleteError;
        return NextResponse.json({ success: true, reacted: false, reactionType: null });
      } else {
        // Update reaction type
        const { data: updated, error: updateError } = await supabaseAdmin
          .from('community_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id)
          .select()
          .single();

        if (updateError) throw updateError;
        return NextResponse.json({ success: true, reacted: true, reactionType: updated.reaction_type });
      }
    } else {
      // Create new reaction
      const insertData: any = {
        user_uuid: userUuid,
        reaction_type: reactionType
      };
      if (commentId) insertData.comment_id = commentId;
      else insertData.post_id = postId;

      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('community_reactions')
        .insert(insertData)
        .select()
        .single();

      if (insertError) throw insertError;

      return NextResponse.json({ success: true, reacted: true, reactionType: inserted.reaction_type });
    }
  } catch (err: any) {
    console.error('[COMMUNITY_REACTIONS_POST] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
