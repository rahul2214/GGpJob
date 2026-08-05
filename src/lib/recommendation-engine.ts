import type { Job, User } from './types';

export interface DetailedRecommendationWeights {
  skillsMatch: number;          // 0.25 (25%)
  preferredJobTitles: number;   // 0.15 (15%)
  locationMatch: number;        // 0.15 (15%)
  experienceMatch: number;      // 0.10 (10%)
  remotePreference: number;     // 0.08 (8%)
  employmentType: number;       // 0.07 (7%)
  salaryExpectation: number;    // 0.05 (5%)
  preferredIndustries: number;  // 0.05 (5%)
  visaSponsorship: number;      // 0.04 (4%)
  workAuthorization: number;    // 0.03 (3%)
  preferredLanguages: number;   // 0.03 (3%)
}

export const DEFAULT_DETAILED_WEIGHTS: DetailedRecommendationWeights = {
  skillsMatch: 0.25,
  preferredJobTitles: 0.15,
  locationMatch: 0.15,
  experienceMatch: 0.10,
  remotePreference: 0.08,
  employmentType: 0.07,
  salaryExpectation: 0.05,
  preferredIndustries: 0.05,
  visaSponsorship: 0.04,
  workAuthorization: 0.03,
  preferredLanguages: 0.03,
};

function normalizeString(str: string): string {
  return (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Relevance-Based Recommendation Engine
 * Calculates a comprehensive match score (0 to 100) based on all 13 Primary Factors.
 */
export function calculateInternationalJobMatch(
  user: User,
  job: Job,
  weights: DetailedRecommendationWeights = DEFAULT_DETAILED_WEIGHTS
): { score: number; breakdown: Record<string, number> } {
  if (!user) {
    return { score: 50, breakdown: {} };
  }

  // 1. Skills Match (25%)
  const userSkillNames = new Set(
    (user.skills || []).map(s => typeof s === 'string' ? normalizeString(s) : normalizeString(s.name))
  );
  const jobSkills = (job.requiredSkills || []).concat(job.niceToHaveSkills || []);
  let skillsScore = 0;
  if (jobSkills.length > 0) {
    let matchedCount = 0;
    jobSkills.forEach(reqSkill => {
      const normReq = normalizeString(reqSkill);
      if (Array.from(userSkillNames).some(uSkill => uSkill.includes(normReq) || normReq.includes(uSkill))) {
        matchedCount++;
      }
    });
    skillsScore = Math.min(1, matchedCount / Math.max(1, job.requiredSkills?.length || 1));
  } else {
    skillsScore = userSkillNames.size > 0 ? 0.7 : 0.5;
  }

  // 2. Preferred Job Titles (15%)
  let titleScore = 0;
  const userTitles = (user.preferredJobTitles || []).concat(user.headline ? [user.headline] : []);
  const jobTitleNorm = normalizeString(`${job.title || ''} ${job.job_role || ''} ${job.jobFunction || ''}`);
  if (userTitles.length > 0) {
    const hasMatch = userTitles.some(t => {
      const normT = normalizeString(t);
      return normT && (jobTitleNorm.includes(normT) || normT.includes(jobTitleNorm));
    });
    titleScore = hasMatch ? 1.0 : 0.4;
  } else {
    titleScore = 0.5;
  }

  // 3. Country, State / Province, City Location Match (15%)
  let locationScore = 0;
  const isJobRemote = job.remoteType === 'remote' || job.workplaceType === 'Remote';
  if (isJobRemote || user.openWorldwide) {
    locationScore = 1.0;
  } else {
    const userCountry = (user.country || '').toLowerCase();
    const userState = (user.state || '').toLowerCase();
    const userCity = (user.currentCity || '').toLowerCase();

    const jobCountry = (job.country || '').toLowerCase();
    const jobState = (job.state || '').toLowerCase();
    const jobCity = (job.city || job.location || '').toLowerCase();

    const prefLocations = (user.preferredLocations || []).map(l => l.toLowerCase());

    if (userCity && jobCity && (userCity.includes(jobCity) || jobCity.includes(userCity))) {
      locationScore = 1.0;
    } else if (userState && jobState && userState === jobState) {
      locationScore = 0.9;
    } else if (userCountry && jobCountry && userCountry === jobCountry) {
      locationScore = 0.8;
    } else if (prefLocations.some(pref => `${jobCity} ${jobState} ${jobCountry}`.includes(pref))) {
      locationScore = 0.85;
    } else if (user.openToRelocate) {
      locationScore = 0.6;
    } else {
      locationScore = 0.3;
    }
  }

  // 4. Experience Match (10%)
  let expScore = 1.0;
  const userExp = user.experienceYears || 0;
  const minExp = job.minExperience || 0;
  const maxExp = job.maxExperience || 30;
  if (userExp >= minExp && userExp <= maxExp) {
    expScore = 1.0;
  } else if (userExp < minExp) {
    expScore = Math.max(0.1, 1 - (minExp - userExp) * 0.25);
  } else {
    expScore = 0.85; // overqualified
  }

  // 5. Remote Preference (8%)
  let remoteScore = 0.5;
  const pref = user.remotePreference || 'any';
  if (pref === 'any') {
    remoteScore = 1.0;
  } else if (pref === 'remote' && isJobRemote) {
    remoteScore = 1.0;
  } else if (pref === 'onsite' && !isJobRemote) {
    remoteScore = 1.0;
  } else if (pref === 'hybrid' && (job.workplaceType === 'Hybrid' || job.remoteType === 'hybrid')) {
    remoteScore = 1.0;
  } else {
    remoteScore = 0.4;
  }

  // 6. Employment Type (7%)
  let empScore = 0.5;
  const userEmpTypes = user.employmentTypes || [];
  const jobType = job.type || (job as any).employmentType;
  if (userEmpTypes.length > 0 && jobType) {
    empScore = userEmpTypes.some(t => normalizeString(t) === normalizeString(jobType)) ? 1.0 : 0.3;
  } else {
    empScore = 0.7;
  }

  // 7. Salary Expectation (5%)
  let salaryScore = 0.7;
  const minExpSalary = user.preferredSalaryMin || user.expectedSalary || 0;
  const maxExpSalary = user.preferredSalaryMax || 0;
  const jobMinSalary = job.salaryMin || 0;
  const jobMaxSalary = job.salaryMax || jobMinSalary;

  if (minExpSalary > 0 && jobMaxSalary > 0) {
    if (jobMaxSalary >= minExpSalary) {
      salaryScore = 1.0;
    } else {
      salaryScore = Math.max(0.2, jobMaxSalary / minExpSalary);
    }
  } else {
    salaryScore = 0.7;
  }

  // 8. Preferred Industries (5%)
  let indScore = 0.5;
  const userIndustries = user.preferredIndustries || [];
  if (userIndustries.length > 0 && job.industry) {
    const normJobInd = normalizeString(job.industry);
    indScore = userIndustries.some(ind => normalizeString(ind) === normJobInd || normJobInd.includes(normalizeString(ind))) ? 1.0 : 0.4;
  } else {
    indScore = 0.7;
  }

  // 9. Visa Sponsorship Requirement (4%)
  let visaScore = 1.0;
  const userVisa = user.visaRequirement || '';
  const jobSponsorship = (job as any).visaSponsorship || (job as any).visa_sponsorship;
  if (userVisa.toLowerCase().includes('requires') || userVisa.toLowerCase().includes('sponsorship')) {
    visaScore = jobSponsorship ? 1.0 : 0.2;
  } else {
    visaScore = 1.0;
  }

  // 10. Work Authorization (3%)
  let authScore = 0.7;
  const userAuth = user.workAuthorization || [];
  if (userAuth.length > 0 && job.country) {
    authScore = userAuth.some(country => normalizeString(country) === normalizeString(job.country!)) ? 1.0 : 0.5;
  } else {
    authScore = 0.8;
  }

  // 11. Preferred Languages (3%)
  let langScore = 0.8;
  const userLangs = user.preferredLanguages || [];
  const jobLangs = (job as any).languages || [];
  if (userLangs.length > 0 && jobLangs.length > 0) {
    const hasLangMatch = userLangs.some(l => jobLangs.some((jl: string) => normalizeString(jl) === normalizeString(l)));
    langScore = hasLangMatch ? 1.0 : 0.5;
  }

  // Calculate total score using exact weights
  const totalWeightedScore =
    skillsScore * weights.skillsMatch +
    titleScore * weights.preferredJobTitles +
    locationScore * weights.locationMatch +
    expScore * weights.experienceMatch +
    remoteScore * weights.remotePreference +
    empScore * weights.employmentType +
    salaryScore * weights.salaryExpectation +
    indScore * weights.preferredIndustries +
    visaScore * weights.visaSponsorship +
    authScore * weights.workAuthorization +
    langScore * weights.preferredLanguages;

  const scorePercentage = Math.round(totalWeightedScore * 100);

  return {
    score: scorePercentage,
    breakdown: {
      skillsMatch: Math.round(skillsScore * 100),
      preferredJobTitles: Math.round(titleScore * 100),
      locationMatch: Math.round(locationScore * 100),
      experienceMatch: Math.round(expScore * 100),
      remotePreference: Math.round(remoteScore * 100),
      employmentType: Math.round(empScore * 100),
      salaryExpectation: Math.round(salaryScore * 100),
      preferredIndustries: Math.round(indScore * 100),
      visaSponsorship: Math.round(visaScore * 100),
      workAuthorization: Math.round(authScore * 100),
      preferredLanguages: Math.round(langScore * 100),
    },
  };
}
