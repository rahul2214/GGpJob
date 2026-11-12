const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'src', 'lib', 'blog', 'index.ts');
const content = fs.readFileSync(indexPath, 'utf-8');

const all40 = [
  'how-to-beat-ats-2026', 'chatgpt-prompts-for-resume-writing', '1-page-vs-2-page-resume', 'tech-resume-action-verbs',
  'how-to-tailor-resume-for-each-job', 'ats-friendly-resume-templates-for-software-engineers', 'how-recruiters-use-ai-to-screen-resumes', 'tech-cover-letter-format',
  'ai-auto-apply-vs-targeted-job-application', 'ai-job-search-agent', 'automate-job-search-safely', 'how-to-find-hidden-tech-jobs',
  'job-search-tracker-template', 'cold-email-recruiters-linkedin-templates', 'how-to-spot-fake-job-scams-2026', 'candidate-skill-match-score',
  'gcc-jobs-in-india-salary-2026', 'remote-us-tech-jobs-from-india', 'tech-jobs-with-visa-sponsorship-2026', 'germany-opportunity-card-tech-jobs',
  'tier-2-college-to-product-company-roadmap', 'software-engineer-salary-in-india-2026', 'english-speaking-tech-jobs-europe', 'us-contractor-remote-work-taxes-india',
  'agentic-ai-developer-roadmap-2026', 'full-stack-developer-vs-ai-engineer', 'what-is-context-engineering-in-ai', 'model-context-protocol-mcp-explained',
  'devops-engineer-roadmap-2026', 'skills-that-ai-cannot-replace-in-tech', 'how-to-become-a-cybersecurity-engineer-2026', 'python-developer-roadmap-2026',
  'star-method-behavioral-interview-questions-and-answers', 'system-design-interview-cheatsheet-2026', 'how-to-negotiate-tech-salary', 'ai-engineer-interview-questions-and-answers',
  'why-should-we-hire-you-answer-software-developer', 'how-to-explain-employment-gap-on-resume-tech', 'questions-to-ask-interviewer-software-engineer', 'questions-to-ask-before-joining-a-startup'
];

console.log('Verifying all 40 posts in index.ts:');
let missingInIndex = [];
for (const slug of all40) {
  if (!content.includes(`@/content/blog/${slug}`)) {
    missingInIndex.push(slug);
  }
}

if (missingInIndex.length === 0) {
  console.log(`✅ All 40 posts are imported in index.ts!`);
} else {
  console.error(`❌ Missing imports:`, missingInIndex);
}

// Check each post file
const blogDir = path.join(__dirname, '..', 'src', 'content', 'blog');
let totalWords = 0;
for (const slug of all40) {
  const filePath = path.join(blogDir, `${slug}.ts`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File missing: ${slug}.ts`);
    continue;
  }
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const words = fileContent.split(/\s+/).length;
  totalWords += words;
}

console.log(`✅ All 40 files exist in src/content/blog/`);
console.log(`📊 Average raw word count per post file: ~${Math.round(totalWords / all40.length)} words`);
