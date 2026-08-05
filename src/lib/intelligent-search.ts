import type { Job } from './types';

// Synonym dictionary for intelligent expansion
const SYNONYM_MAP: Record<string, string[]> = {
  'frontend': ['front end', 'react', 'reactjs', 'vue', 'vuejs', 'angular', 'ui', 'web developer'],
  'react': ['reactjs', 'react.js', 'frontend', 'front end', 'javascript', 'typescript'],
  'backend': ['back end', 'node', 'nodejs', 'python', 'java', 'golang', 'go', 'api', 'express'],
  'node': ['nodejs', 'node.js', 'backend', 'javascript', 'express'],
  'fullstack': ['full stack', 'full-stack', 'software engineer', 'web developer'],
  'remote': ['wfh', 'work from home', 'telecommute', 'distributed', 'anywhere'],
  'developer': ['engineer', 'coder', 'programmer', 'architect'],
  'engineer': ['developer', 'architect', 'coder', 'programmer'],
  'manager': ['lead', 'director', 'head', 'vp', 'supervisor'],
  'data': ['analytics', 'bi', 'machine learning', 'ai', 'data science', 'sql'],
  'ml': ['machine learning', 'ai', 'deep learning', 'nlp', 'llm', 'data science'],
  'ai': ['artificial intelligence', 'machine learning', 'ml', 'llm', 'genai'],
  'ui': ['ux', 'design', 'user interface', 'user experience', 'frontend'],
  'qa': ['testing', 'test engineer', 'automation', 'sdet', 'quality assurance'],
  'devops': ['sre', 'cloud', 'infrastructure', 'kubernetes', 'aws', 'docker'],
};

function normalize(str: string): string {
  return (str || '').toLowerCase().trim();
}

/**
 * Expands search tokens with synonyms
 */
export function expandKeywords(query: string): string[] {
  const normalizedQuery = normalize(query);
  const rawTokens = normalizedQuery.split(/[\s,+/]+/).filter(t => t.length > 1);
  const expanded = new Set<string>(rawTokens);

  rawTokens.forEach(token => {
    if (SYNONYM_MAP[token]) {
      SYNONYM_MAP[token].forEach(syn => expanded.add(syn));
    }
    // Check if token is contained in any synonym key
    Object.entries(SYNONYM_MAP).forEach(([key, syns]) => {
      if (token.includes(key) || key.includes(token)) {
        expanded.add(key);
        syns.forEach(s => expanded.add(s));
      }
    });
  });

  return Array.from(expanded);
}

export interface SearchMatchResult {
  job: Job;
  relevanceScore: number;
  matchedFields: string[];
}

/**
 * Intelligent Multi-Field Search & Ranking Engine
 * Searches across: Job Title, Skills, Company, Country, State, City, Remote, Industry, Employment Type
 */
export function intelligentSearchJobs(jobs: Job[], query: string): Job[] {
  if (!query || query.trim() === '') return jobs;

  const normalizedQuery = normalize(query);
  const keywords = expandKeywords(query);

  const scoredResults: SearchMatchResult[] = jobs.map(job => {
    let score = 0;
    const matchedFields = new Set<string>();

    const jobTitle = normalize(job.title || '');
    const company = normalize(job.companyName || job.company || '');
    const country = normalize(job.country || '');
    const state = normalize(job.state || '');
    const city = normalize(job.city || job.location || '');
    const remoteType = normalize(job.remoteType || job.workplaceType || '');
    const industry = normalize(job.industry || '');
    const empType = normalize(job.employmentType || job.type || '');
    const skills = (job.requiredSkills || (job as any).skill_names || []).map((s: any) => normalize(s));

    // 1. Exact Full Query Match (Bonus 120 pts)
    if (jobTitle.includes(normalizedQuery)) {
      score += 120;
      matchedFields.add('Job Title (Exact)');
    }
    if (company.includes(normalizedQuery)) {
      score += 100;
      matchedFields.add('Company (Exact)');
    }

    // 2. Keyword & Synonym Tokens Match Across All 9 Fields
    keywords.forEach(kw => {
      const normKw = normalize(kw);

      // Job Title (60 pts)
      if (jobTitle.includes(normKw)) {
        score += 60;
        matchedFields.add('Job Title');
      }

      // Skills (50 pts)
      if (skills.some((s: string) => s.includes(normKw) || normKw.includes(s))) {
        score += 50;
        matchedFields.add('Skills');
      }

      // Company (40 pts)
      if (company.includes(normKw)) {
        score += 40;
        matchedFields.add('Company');
      }

      // Country (30 pts)
      if (country.includes(normKw)) {
        score += 30;
        matchedFields.add('Country');
      }

      // State (25 pts)
      if (state.includes(normKw)) {
        score += 25;
        matchedFields.add('State');
      }

      // City / Location (25 pts)
      if (city.includes(normKw)) {
        score += 25;
        matchedFields.add('City');
      }

      // Remote Type (25 pts)
      if (remoteType.includes(normKw) || (normKw === 'remote' && (remoteType === 'remote' || city.includes('remote')))) {
        score += 25;
        matchedFields.add('Remote');
      }

      // Industry (25 pts)
      if (industry.includes(normKw)) {
        score += 25;
        matchedFields.add('Industry');
      }

      // Employment Type (20 pts)
      if (empType.includes(normKw)) {
        score += 20;
        matchedFields.add('Employment Type');
      }
    });

    return {
      job,
      relevanceScore: score,
      matchedFields: Array.from(matchedFields),
    };
  });

  // Filter out non-matching jobs (relevanceScore > 0) and rank by score descending
  return scoredResults
    .filter(r => r.relevanceScore > 0)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .map(r => ({ ...r.job, searchRelevanceScore: r.relevanceScore }));
}
