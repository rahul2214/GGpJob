import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin-config';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const userId = searchParams.get('userId');

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Check authorization
    const recruiterDoc = await db.collection('recruiters').doc(userId).get();
    const employeeDoc = !recruiterDoc.exists ? await db.collection('employees').doc(userId).get() : null;
    const userDoc = recruiterDoc.exists ? recruiterDoc : employeeDoc;

    if (!userDoc || !userDoc.exists) {
        return NextResponse.json({ error: 'Unauthorized: Recruiter profile not found' }, { status: 403 });
    }

    const userData = userDoc.data()!;
    const now = new Date();
    const hasPremium = userData.planType === 'premium';
    const hasTalentPlan = userData.talentSearchExpiresAt && new Date(userData.talentSearchExpiresAt) > now;

    if (!hasPremium && !hasTalentPlan) {
        return NextResponse.json({ 
            error: 'Access Denied: Talent Search requires a Premium or Talent Search plan.',
            requiresPlan: true 
        }, { status: 403 });
    }

    const search = searchParams.get('search')?.toLowerCase() || '';
    const domainId = searchParams.get('domain') || '';
    const skillIds = searchParams.getAll('skill').filter(Boolean);
    // No cap — return all matching candidates

    // Paginate through the entire users collection in batches of 200
    const PAGE_SIZE = 200;
    let allDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];
    let lastDoc: FirebaseFirestore.QueryDocumentSnapshot | undefined;

    while (true) {
      let query = db.collection('users').orderBy('__name__').limit(PAGE_SIZE);
      if (lastDoc) query = query.startAfter(lastDoc) as any;

      const snap = await query.get();
      allDocs = allDocs.concat(snap.docs);
      if (snap.docs.length < PAGE_SIZE) break; // last page reached
      lastDoc = snap.docs[snap.docs.length - 1];
    }

    const allUsers = allDocs.map(doc => ({ id: doc.id, ...doc.data() } as any));

    // Fetch skills for each matched user (in parallel, capped at 50 per user)
    const usersWithSkills = await Promise.all(
      allUsers.map(async (u) => {
        try {
          const skillsSnap = await db.collection('users').doc(u.id).collection('skills').get();
          const skills: { id: string; name: string }[] = skillsSnap.docs.map(s => ({
            id: s.id,
            name: s.data().name || '',
          }));
          return { ...u, skills };
        } catch {
          return { ...u, skills: [] };
        }
      })
    );

    let results = usersWithSkills;

    // Filter by domain
    if (domainId) {
      results = results.filter(u => u.domainId === domainId);
    }

    // Fetch master skills once to map IDs to names for more robust filtering
    const masterSkillsSnap = await db.collection('skills').get();
    const masterSkillsMap = new Map();
    masterSkillsSnap.docs.forEach(doc => masterSkillsMap.set(doc.id, doc.data().name?.toLowerCase()));

    // Filter by specific skill IDs (check ID or Name for robustness)
    if (skillIds.length > 0) {
      results = results.filter(u => {
        return skillIds.some(id => {
          const targetName = masterSkillsMap.get(id);
          const match = u.skills.some((s: any) => 
            s.id === id || 
            (targetName && s.name?.toLowerCase() === targetName)
          );
          return match;
        });
      });
    }

    // Filter by text search (name, headline, role, skills)
    if (search) {
      results = results.filter(u => {
        const skillNames = u.skills.map((s: any) => s.name?.toLowerCase()).join(' ');
        return (
          u.name?.toLowerCase().includes(search) ||
          u.headline?.toLowerCase().includes(search) ||
          u.role?.toLowerCase().includes(search) ||
          skillNames.includes(search)
        );
      });
    }

    // Sort: users with photo and headline first (more complete profiles)
    results.sort((a, b) => {
      const scoreA = (a.photoUrl ? 2 : 0) + (a.headline ? 1 : 0) + (a.skills.length > 0 ? 1 : 0);
      const scoreB = (b.photoUrl ? 2 : 0) + (b.headline ? 1 : 0) + (b.skills.length > 0 ? 1 : 0);
      return scoreB - scoreA;
    });

    // Sanitize output — never send sensitive fields to recruiter
    const sanitized = results.map(u => ({
      id: u.id,
      name: u.name,
      headline: u.headline || '',
      photoUrl: u.photoUrl || '',
      domainId: u.domainId || '',
      skills: u.skills,
      resumeUrl: u.resumeUrl || '',
      location: u.location || '',
    }));

    return NextResponse.json(sanitized);
  } catch (e: any) {
    console.error('[API_TALENT_SEARCH] Error:', e);
    return NextResponse.json({ error: 'Failed to search talent', details: e.message }, { status: 500 });
  }
}
