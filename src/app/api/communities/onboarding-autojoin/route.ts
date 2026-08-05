import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Batch subscribe users to relevant communities during onboarding
export async function POST(request: NextRequest) {
  try {
    const { userUuid, skills, countries, interests, goals } = await request.json();

    if (!userUuid) {
      return NextResponse.json({ error: 'User UUID is required' }, { status: 400 });
    }

    // 1. Fetch all communities to match against
    const { data: communities } = await supabaseAdmin
      .from('communities')
      .select('id, name, category');

    if (!communities || communities.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    const keywords = new Set<string>();
    if (skills) skills.forEach((s: string) => keywords.add(s.toLowerCase()));
    if (countries) countries.forEach((c: string) => keywords.add(c.toLowerCase()));
    if (interests) interests.forEach((i: string) => keywords.add(i.toLowerCase()));
    if (goals) goals.forEach((g: string) => keywords.add(g.toLowerCase()));

    // Match community names or categories against user keywords
    const matchedCommIds = communities
      .filter((comm: any) => {
        const commName = comm.name.toLowerCase();
        const commCat = comm.category.toLowerCase();
        
        // Match conditions:
        // E.g. "React Developers" matches skill "React"
        // E.g. "India Jobs" matches country "India"
        return Array.from(keywords).some(key => 
          commName.includes(key) || 
          key.includes(commName.replace('developers', '').replace('jobs', '').trim())
        );
      })
      .map((comm: any) => comm.id);

    // Also auto-subscribe to fallback popular ones if none matched
    if (matchedCommIds.length === 0) {
      const fallbackComms = communities
        .filter((c: any) => c.name === 'Career Guidance' || c.name === 'Resume Reviews')
        .map((c: any) => c.id);
      matchedCommIds.push(...fallbackComms);
    }

    // 2. Perform batch insertions
    const insertRows = matchedCommIds.map((commId: number) => ({
      community_id: commId,
      user_uuid: userUuid,
      role: 'member'
    }));

    if (insertRows.length > 0) {
      const { error } = await supabaseAdmin
        .from('community_members')
        .upsert(insertRows, { onConflict: 'community_id,user_uuid' });

      if (error) throw error;
    }

    
  } catch (err: any) {
    console.error('[ONBOARDING_AUTOJOIN] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
