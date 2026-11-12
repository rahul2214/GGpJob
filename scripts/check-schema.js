const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'src', 'content', 'blog');

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

let issues = [];

for (const slug of all40) {
  const file = path.join(dir, slug + '.ts');
  const code = fs.readFileSync(file, 'utf-8');
  if (code.includes('author: {') || code.includes('author:\n  {') || code.includes('author:  {') || code.includes('"author": {')) {
    issues.push({ slug, issue: 'author is object' });
  }
  if (code.includes('headers:') || code.includes('"headers":')) {
    issues.push({ slug, issue: 'table has headers' });
  }
  if (code.includes('question:') || code.includes('"question":')) {
    issues.push({ slug, issue: 'faqs has question/answer' });
  }
  if (code.includes('{ id:') || code.includes('"id":')) {
    issues.push({ slug, issue: 'anchors has objects' });
  }
  if (code.includes('language:') || code.includes('"language":')) {
    issues.push({ slug, issue: 'example has language/code' });
  }
}

console.log('Total issues found:', issues.length);
console.log(issues);
