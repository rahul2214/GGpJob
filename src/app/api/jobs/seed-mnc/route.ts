import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: dbJobs, error } = await supabaseAdmin
      .from('jobs')
      .select('*')
      .order('id', { ascending: false })
      .limit(10);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      count: dbJobs ? dbJobs.length : 0,
      jobs: dbJobs || []
    });
  } catch (err: any) {
    console.error('[API_JOBS_SEED_MNC_GET] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const MNC_JOBS = [
      {
        title: "Principal Cloud Solutions Architect — Enterprise Azure",
        company_name: "Microsoft",
        company_logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg",
        company_website: "https://www.microsoft.com",
        company_linkedin_url: "https://www.linkedin.com/company/microsoft",
        company_overview: "Microsoft Corporation is a global technology MNC enabling digital transformation for the intelligent cloud and intelligent edge era.",
        company_rating: 4.8,
        job_link: "https://careers.microsoft.com/us/en/job/1684920/Principal-Cloud-Solutions-Architect",
        salary_min: 175000,
        salary_max: 240000,
        salary_currency: "USD",
        experience_min: 7,
        experience_max: 15,
        country: "United States",
        state: "Washington",
        city: "Redmond",
        address: "One Microsoft Way, Redmond, WA 98052",
        remote_type: "Hybrid",
        employment_type: "Full-Time",
        visa_sponsorship: true,
        status: "active",
        vacancies: 3,
        description: "Microsoft is hiring a Principal Cloud Solutions Architect to design resilient, multi-region Azure cloud architectures for Fortune 500 enterprise clients.",
        sections: [
          {
            title: "Role Impact & Key Responsibilities",
            content: "• Architect scalable, high-availability cloud infrastructure on Microsoft Azure for enterprise customers.\n• Lead technical design reviews for cloud migration, microservices decomposition, and disaster recovery strategies."
          }
        ],
        required_skills: ["Azure", "Kubernetes", "Terraform", "C#", "Cloud Architecture"],
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        title: "Senior Staff AI & LLM Systems Engineer",
        company_name: "Google",
        company_logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
        company_website: "https://about.google",
        company_linkedin_url: "https://www.linkedin.com/company/google",
        company_overview: "Google LLC is an American multinational technology company focusing on search engine technology, cloud computing, AI, and consumer electronics.",
        company_rating: 4.9,
        job_link: "https://careers.google.com/jobs/results/148290381023019/Senior-Staff-AI-Engineer",
        salary_min: 190000,
        salary_max: 260000,
        salary_currency: "USD",
        experience_min: 6,
        experience_max: 12,
        country: "United States",
        state: "California",
        city: "Mountain View",
        address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
        remote_type: "Hybrid",
        employment_type: "Full-Time",
        visa_sponsorship: true,
        status: "active",
        vacancies: 2,
        description: "Google Core AI & DeepMind engineering teams are looking for a Senior Staff AI & LLM Systems Engineer to build distributed training pipelines.",
        sections: [
          {
            title: "Responsibilities",
            content: "• Design distributed training infrastructure scaling to tens of thousands of TPU v5e / Nvidia H100 accelerators.\n• Optimize LLM inference latency, memory bandwidth, and quantization algorithms."
          }
        ],
        required_skills: ["PyTorch", "JAX", "C++", "Python", "LLM", "Distributed Systems"],
        posted_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      }
    ];

    const insertedJobs = [];
    for (const job of MNC_JOBS) {
      const { data, error } = await supabaseAdmin
        .from('jobs')
        .insert([job])
        .select()
        .single();
      if (!error && data) {
        insertedJobs.push(data);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully posted ${insertedJobs.length} MNC jobs into Supabase DB!`,
      jobs: insertedJobs,
    });
  } catch (err: any) {
    console.error('[API_JOBS_SEED_MNC_POST] Error:', err);
    return NextResponse.json({ error: err.message || 'Failed to post MNC jobs' }, { status: 500 });
  }
}
