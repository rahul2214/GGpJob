export interface SkillMatchResult {
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  totalRequired: number;
  tier: 'top' | 'strong' | 'potential' | 'low';
  tierLabel: string;
  tierTagline: string;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  iconName: 'sparkles' | 'zap' | 'target' | 'compass';
}

/**
 * Calculates skill compatibility match percentage and detailed breakdown 
 * comparing job required skills against candidate skills.
 */
export function calculateSkillMatch(
  jobSkills?: string[],
  userSkills?: (string | { name: string; [key: string]: any })[]
): SkillMatchResult {
  // Normalize job required skills
  const normalizedJobSkills = (jobSkills || [])
    .map(s => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);

  // Normalize candidate skills
  const userSkillNames = (userSkills || [])
    .map(s => {
      if (typeof s === 'string') return s.trim().toLowerCase();
      if (typeof s === 'object' && s?.name) return String(s.name).trim().toLowerCase();
      return '';
    })
    .filter(Boolean);

  if (normalizedJobSkills.length === 0) {
    return {
      matchPercentage: 100,
      matchedSkills: [],
      missingSkills: [],
      totalRequired: 0,
      tier: 'top',
      tierLabel: 'Top Rated Candidate',
      tierTagline: 'Matches all general requirements for this position.',
      badgeBg: 'bg-gradient-to-r from-emerald-500/15 via-teal-500/15 to-emerald-600/15 text-emerald-700 dark:text-emerald-300',
      borderColor: 'border-emerald-500/40 dark:border-emerald-500/30',
      badgeText: 'Top Rated Candidate',
      iconName: 'sparkles'
    };
  }

  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  normalizedJobSkills.forEach(jobSkill => {
    const jobSkillLower = jobSkill.toLowerCase();

    // Check exact or fuzzy skill match
    const isMatched = userSkillNames.some(uSkill => {
      if (uSkill === jobSkillLower) return true;
      const cleanU = uSkill.replace(/[\s.-]/g, '');
      const cleanJ = jobSkillLower.replace(/[\s.-]/g, '');
      if (cleanU === cleanJ) return true;
      if (cleanU.length > 2 && cleanJ.length > 2 && (cleanU.includes(cleanJ) || cleanJ.includes(cleanU))) return true;
      return false;
    });

    if (isMatched) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  });

  const percentage = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);

  let tier: 'top' | 'strong' | 'potential' | 'low';
  let tierLabel: string;
  let tierTagline: string;
  let badgeBg: string;
  let badgeText: string;
  let borderColor: string;
  let iconName: 'sparkles' | 'zap' | 'target' | 'compass';

  if (percentage >= 85) {
    tier = 'top';
    tierLabel = 'Top Rated Candidate';
    tierTagline = `Spot on! You match ${matchedSkills.length} of ${normalizedJobSkills.length} required skills.`;
    badgeBg = 'bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-600/20 text-emerald-800 dark:text-emerald-200';
    borderColor = 'border-emerald-500/50 dark:border-emerald-400/40 shadow-emerald-500/10';
    badgeText = 'Top Rated Candidate';
    iconName = 'sparkles';
  } else if (percentage >= 70) {
    tier = 'strong';
    tierLabel = 'Strong Match';
    tierTagline = `Great fit! You match ${matchedSkills.length} of ${normalizedJobSkills.length} key skills.`;
    badgeBg = 'bg-gradient-to-r from-indigo-500/20 to-blue-500/20 text-indigo-900 dark:text-indigo-200';
    borderColor = 'border-indigo-500/50 dark:border-indigo-400/40 shadow-indigo-500/10';
    badgeText = 'Strong Match';
    iconName = 'zap';
  } else if (percentage >= 50) {
    tier = 'potential';
    tierLabel = 'Potential Match';
    tierTagline = `Good base! You match ${matchedSkills.length} of ${normalizedJobSkills.length} skills (${missingSkills.length} skill gap).`;
    badgeBg = 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-900 dark:text-amber-200';
    borderColor = 'border-amber-500/50 dark:border-amber-400/40 shadow-amber-500/10';
    badgeText = 'Potential Match';
    iconName = 'target';
  } else {
    tier = 'low';
    tierLabel = 'Below 70% Match';
    tierTagline = `You match ${matchedSkills.length} of ${normalizedJobSkills.length} required skills. Add skills to boost match score.`;
    badgeBg = 'bg-gradient-to-r from-rose-500/15 to-purple-500/15 text-rose-900 dark:text-rose-200';
    borderColor = 'border-rose-500/40 dark:border-rose-400/30';
    badgeText = 'Skill Gap Alert';
    iconName = 'compass';
  }

  return {
    matchPercentage: percentage,
    matchedSkills,
    missingSkills,
    totalRequired: normalizedJobSkills.length,
    tier,
    tierLabel,
    tierTagline,
    badgeBg,
    badgeText,
    borderColor,
    iconName
  };
}
