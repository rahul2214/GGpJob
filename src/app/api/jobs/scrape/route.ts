import { NextResponse, NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

// Decode HTML entities in text & descriptions
function decodeHtmlEntities(str?: string): string {
  if (!str) return '';
  return str
    .replace(/&#x26;/gi, '&')
    .replace(/&#x27;/gi, "'")
    .replace(/&#x39;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#039;/gi, "'");
}

// Parse numeric salaries from text strings (e.g. "$120k - $160k" or "$140,000")
function parseSalaryRange(salaryStr?: string): { salaryMin: number | null; salaryMax: number | null } {
  if (!salaryStr) return { salaryMin: null, salaryMax: null };

  const matches = salaryStr.match(/\$?(\d+)(k|\,000)?\s*(?:-|to|–)\s*\$?(\d+)(k|\,000)?/i);
  if (matches) {
    let min = parseInt(matches[1], 10);
    let max = parseInt(matches[3], 10);
    if (matches[2]?.toLowerCase() === 'k' || min < 1000) min *= 1000;
    if (matches[4]?.toLowerCase() === 'k' || max < 1000) max *= 1000;
    return { salaryMin: min, salaryMax: max };
  }

  const singleMatch = salaryStr.match(/\$?(\d+)(k|\,000)?/i);
  if (singleMatch) {
    let val = parseInt(singleMatch[1], 10);
    if (singleMatch[2]?.toLowerCase() === 'k' || val < 1000) val *= 1000;
    return { salaryMin: val, salaryMax: val + 20000 };
  }

  return { salaryMin: null, salaryMax: null };
}

// Scrape jobs from Remotive API + Arbeitnow API
async function scrapePublicJobs(): Promise<any[]> {
  const scrapedJobs: any[] = [];

  // 1. Remotive API
  try {
    const res = await fetch('https://remotive.com/api/remote-jobs?limit=15', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.jobs)) {
        data.jobs.forEach((item: any) => {
          const { salaryMin, salaryMax } = parseSalaryRange(item.salary);
          scrapedJobs.push({
            externalId: `remotive-${item.id}`,
            title: decodeHtmlEntities(item.title),
            companyName: decodeHtmlEntities(item.company_name),
            companyLogo: item.company_logo || item.company_logo_url || null,
            description: decodeHtmlEntities(item.description || `Job position for ${item.title} at ${item.company_name}.`),
            location: item.candidate_required_location || 'Remote',
            type: item.job_type === 'full_time' ? 'Full-time' : item.job_type || 'Full-time',
            category: item.category || 'Software Development',
            salaryMin: salaryMin || 110000,
            salaryMax: salaryMax || 160000,
            tags: Array.isArray(item.tags) ? item.tags.slice(0, 4) : ['Remote', 'Tech'],
            jobLink: item.url || null,
            publishedAt: item.publication_date || new Date().toISOString(),
          });
        });
      }
    }
  } catch (err) {
    console.error('[SCRAPE_REMOTIVE_ERROR]', err);
  }

  // 2. Arbeitnow API (Backup / Additional Jobs)
  try {
    const res = await fetch('https://www.arbeitnow.com/api/job-board-api', { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.data)) {
        data.data.slice(0, 10).forEach((item: any) => {
          scrapedJobs.push({
            externalId: `arbeitnow-${item.slug || Math.random()}`,
            title: decodeHtmlEntities(item.title),
            companyName: decodeHtmlEntities(item.company_name),
            companyLogo: null,
            description: decodeHtmlEntities(item.description || `Opening for ${item.title} at ${item.company_name}.`),
            location: item.location || 'Remote',
            type: item.job_types?.join(', ') || 'Full-time',
            category: item.tags?.[0] || 'Software Development',
            salaryMin: 95000,
            salaryMax: 140000,
            tags: Array.isArray(item.tags) ? item.tags.slice(0, 4) : ['Tech', 'Engineering'],
            jobLink: item.url || null,
            publishedAt: new Date(item.created_at * 1000).toISOString() || new Date().toISOString(),
          });
        });
      }
    }
  } catch (err) {
    console.error('[SCRAPE_ARBEITNOW_ERROR]', err);
  }

  return scrapedJobs;
}

export async function POST(request: NextRequest) {
  try {
    const scraped = await scrapePublicJobs();

    if (scraped.length === 0) {
      return NextResponse.json({ message: 'No scraped jobs found', insertedCount: 0, jobs: [] });
    }

    // Map scraped category to industry field
    // No domain lookup needed - category maps directly to industry text

    // Fetch existing job titles & company names to prevent duplicate insertion
    const { data: existingJobs } = await supabaseAdmin.from('jobs').select('title, company_name');
    const existingSet = new Set<string>();
    if (existingJobs) {
      existingJobs.forEach((j: any) => {
        if (j.title && j.company_name) {
          existingSet.add(`${j.title.toLowerCase()}_${j.company_name.toLowerCase()}`);
        }
      });
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

    const jobsToInsert: any[] = [];

    for (let i = 0; i < scraped.length; i++) {
      const item = scraped[i];
      const key = `${item.title.toLowerCase()}_${item.companyName.toLowerCase()}`;
      if (existingSet.has(key)) continue; // skip duplicates

      // Alternate referral status every 2 items for balanced test dataset
      const isReferral = i % 2 === 0;
      const matchedIndustry = item.category || 'Other';

      jobsToInsert.push({
        job_id: item.externalId,
        title: item.title,
        description: item.description,
        company_name: item.companyName,
        company_logo: item.companyLogo,
        industry: matchedIndustry,
        salary_min: item.salaryMin,
        salary_max: item.salaryMax,
        job_role: item.title,
        experience_min: 2,
        experience_max: 5,
        is_referral: isReferral,
        posted_at: item.publishedAt || now.toISOString(),
        expires_at: expiresAt,
        app_expires_at: expiresAt,
        max_applies: 100,
        status: 'active',
        vacancies: 2,
        job_link: item.jobLink,
      });

      existingSet.add(key);
    }

    if (jobsToInsert.length === 0) {
      return NextResponse.json({
        message: 'All scraped jobs already exist in database.',
        insertedCount: 0,
        jobs: []
      });
    }

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('jobs')
      .insert(jobsToInsert)
      .select();

    if (insertError) {
      console.error('[SCRAPE_JOBS_INSERT_ERROR]', insertError);
      return NextResponse.json({ error: 'Failed to insert scraped jobs', details: insertError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: `Successfully scraped and pushed ${insertedData?.length || 0} jobs into database!`,
      insertedCount: insertedData?.length || 0,
      jobs: insertedData || []
    }, { status: 201 });

  } catch (err: any) {
    console.error('[API_JOBS_SCRAPE_ERROR]', err);
    return NextResponse.json({ error: err.message || 'Scraping failed' }, { status: 500 });
  }
}

// GET trigger for convenience in browser or cron jobs
export async function GET(request: NextRequest) {
  return POST(request);
}
