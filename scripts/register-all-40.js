const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'lib', 'blog', 'index.ts');
let content = fs.readFileSync(indexPath, 'utf-8');

const posts = [
  { slug: 'how-to-beat-ats-2026', varName: 'howToBeatAts2026' },
  { slug: 'chatgpt-prompts-for-resume-writing', varName: 'chatgptPromptsForResumeWriting' },
  { slug: '1-page-vs-2-page-resume', varName: 'onePageVsTwoPageResume' },
  { slug: 'tech-resume-action-verbs', varName: 'techResumeActionVerbs' },
  { slug: 'how-to-tailor-resume-for-each-job', varName: 'howToTailorResumeForEachJob' },
  { slug: 'ats-friendly-resume-templates-for-software-engineers', varName: 'atsFriendlyResumeTemplatesForSoftwareEngineers' },
  { slug: 'how-recruiters-use-ai-to-screen-resumes', varName: 'howRecruitersUseAiToScreenResumes' },
  { slug: 'tech-cover-letter-format', varName: 'techCoverLetterFormat' },
  { slug: 'ai-auto-apply-vs-targeted-job-application', varName: 'aiAutoApplyVsTargetedJobApplication' },
  { slug: 'ai-job-search-agent', varName: 'aiJobSearchAgent' },
  { slug: 'automate-job-search-safely', varName: 'automateJobSearchSafely' },
  { slug: 'how-to-find-hidden-tech-jobs', varName: 'howToFindHiddenTechJobs' },
  { slug: 'job-search-tracker-template', varName: 'jobSearchTrackerTemplate' },
  { slug: 'cold-email-recruiters-linkedin-templates', varName: 'coldEmailRecruitersLinkedinTemplates' },
  { slug: 'how-to-spot-fake-job-scams-2026', varName: 'howToSpotFakeJobScams2026' },
  { slug: 'candidate-skill-match-score', varName: 'candidateSkillMatchScore' },
  { slug: 'gcc-jobs-in-india-salary-2026', varName: 'gccJobsInIndiaSalary2026' },
  { slug: 'remote-us-tech-jobs-from-india', varName: 'remoteUsTechJobsFromIndia' },
  { slug: 'tech-jobs-with-visa-sponsorship-2026', varName: 'techJobsWithVisaSponsorship2026' },
  { slug: 'germany-opportunity-card-tech-jobs', varName: 'germanyOpportunityCardTechJobs' },
  { slug: 'tier-2-college-to-product-company-roadmap', varName: 'tier2CollegeToProductCompanyRoadmap' },
  { slug: 'software-engineer-salary-in-india-2026', varName: 'softwareEngineerSalaryInIndia2026' },
  { slug: 'english-speaking-tech-jobs-europe', varName: 'englishSpeakingTechJobsEurope' },
  { slug: 'us-contractor-remote-work-taxes-india', varName: 'usContractorRemoteWorkTaxesIndia' },
  { slug: 'agentic-ai-developer-roadmap-2026', varName: 'agenticAiDeveloperRoadmap2026' },
  { slug: 'full-stack-developer-vs-ai-engineer', varName: 'fullStackDeveloperVsAiEngineer' },
  { slug: 'what-is-context-engineering-in-ai', varName: 'whatIsContextEngineeringInAi' },
  { slug: 'model-context-protocol-mcp-explained', varName: 'modelContextProtocolMcpExplained' },
  { slug: 'devops-engineer-roadmap-2026', varName: 'devopsEngineerRoadmap2026' },
  { slug: 'skills-that-ai-cannot-replace-in-tech', varName: 'skillsThatAiCannotReplaceInTech' },
  { slug: 'how-to-become-a-cybersecurity-engineer-2026', varName: 'howToBecomeACybersecurityEngineer2026' },
  { slug: 'python-developer-roadmap-2026', varName: 'pythonDeveloperRoadmap2026' },
  { slug: 'star-method-behavioral-interview-questions-and-answers', varName: 'starMethodBehavioralInterviewQuestionsAndAnswers' },
  { slug: 'system-design-interview-cheatsheet-2026', varName: 'systemDesignInterviewCheatsheet2026' },
  { slug: 'how-to-negotiate-tech-salary', varName: 'howToNegotiateTechSalary' },
  { slug: 'ai-engineer-interview-questions-and-answers', varName: 'aiEngineerInterviewQuestionsAndAnswers' },
  { slug: 'why-should-we-hire-you-answer-software-developer', varName: 'whyShouldWeHireYouAnswerSoftwareDeveloper' },
  { slug: 'how-to-explain-employment-gap-on-resume-tech', varName: 'howToExplainEmploymentGapOnResumeTech' },
  { slug: 'questions-to-ask-interviewer-software-engineer', varName: 'questionsToAskInterviewerSoftwareEngineer' },
  { slug: 'questions-to-ask-before-joining-a-startup', varName: 'questionsToAskBeforeJoiningAStartup' }
];

const isCRLF = content.includes('\r\n');
const EOL = isCRLF ? '\r\n' : '\n';

// Normalize to LF for manipulation
content = content.replace(/\r\n/g, '\n');

// Generate imports
const importLines = posts
  .map(p => `import ${p.varName} from '@/content/blog/${p.slug}';`)
  .join('\n');

const arrayLines = posts
  .map(p => `  ${p.varName},`)
  .join('\n');

const importMarker = "import h1bVisaExplained from '@/content/blog/h1b-visa-explained';";
if (!content.includes(importMarker)) {
  console.error('Import marker not found!');
  process.exit(1);
}

// Only add if not already present
if (!content.includes('howToBeatAts2026')) {
  const newImportBlock = `${importMarker}\n\n// 40 Trending High-Traffic SEO Pillars (2026)\n${importLines}`;
  content = content.replace(importMarker, newImportBlock);
}

const arrayMarker = '  h1bVisaExplained,\n];';
if (!content.includes(arrayMarker)) {
  console.error('Array marker not found!');
  process.exit(1);
}

if (!content.includes('  howToBeatAts2026,')) {
  const newArrayBlock = `  h1bVisaExplained,\n\n  // 40 Trending High-Traffic SEO Pillars (2026)\n${arrayLines}\n];`;
  content = content.replace(arrayMarker, newArrayBlock);
}

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(indexPath, content, 'utf-8');
console.log(`Successfully registered all ${posts.length} posts in index.ts!`);
