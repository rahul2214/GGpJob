import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Helper to map and resolve jobs (reusing our robust mapper)
function mapJobToFrontend(job: any): any {
  return {
    id: job.id,
    uuid: job.uuid,
    jobId: job.job_id,
    title: job.title,
    companyName: job.company_name,
    companyLogo: job.company_logo,
    location: job.location_names ? job.location_names.join(', ') : 'N/A',
    type: job.job_types?.name || 'N/A',
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    isReferral: job.is_referral,
    postedAt: job.posted_at,
    isBoosted: job.plan_type_at_posting === 'boosted' || false
  };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    // 1. Get community name and category
    const { data: comm } = await supabaseAdmin
      .from('communities')
      .select('name, category')
      .eq('id', id)
      .single();

    if (!comm) {
      return NextResponse.json([]);
    }

    const { name, category } = comm;

    // 2. Build search query based on category and name
    let query = supabaseAdmin
      .from('jobs')
      .select(`
        *,
        job_types(name),
        workplace_types(name)
      `)
      .eq('status', 'active');

    const cleanName = name.replace('Developers', '').replace('Careers', '').replace('Jobs', '').trim();

    if (category === 'Companies') {
      // Search by company name
      query = query.ilike('company_name', `%${cleanName}%`);
    } else if (category === 'Countries') {
      // Since locations are joined, let's fetch matching location ids first
      const { data: locs } = await supabaseAdmin
        .from('locations')
        .select('id')
        .ilike('name', `%${cleanName}%`);
      
      const locIds = locs?.map((l: any) => l.id) || [];
      if (locIds.length > 0) {
        query = query.overlaps('location_pks', locIds);
      } else {
        return NextResponse.json([]);
      }
    } else {
      // Technology or Career: Search in title or description
      query = query.or(`title.ilike.%${cleanName}%,description.ilike.%${cleanName}%`);
    }

    const { data: jobs, error } = await query.limit(10).order('posted_at', { ascending: false });
    if (error) throw error;

    if (!jobs || jobs.length === 0) {
      return NextResponse.json([]);
    }

    // Resolve location names
    const allLocationPks = Array.from(new Set(jobs.flatMap((j: any) => j.location_pks || [])));
    const { data: locations } = allLocationPks.length > 0
      ? await supabaseAdmin.from('locations').select('id, name').in('id', allLocationPks)
      : { data: [] };

    const locationMap = new Map(locations?.map((l: any) => [l.id, l.name]) || []);

    const mapped = jobs.map((job: any) => {
      const locNames = (job.location_pks || []).map((pk: number) => locationMap.get(pk)).filter(Boolean);
      return mapJobToFrontend({
        ...job,
        location_names: locNames
      });
    });

    return NextResponse.json(mapped);
  } catch (err: any) {
    console.error('[COMMUNITY_JOBS_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
