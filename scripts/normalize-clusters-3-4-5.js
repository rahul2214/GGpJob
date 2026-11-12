const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'content', 'blog');

const slugsToNormalize = [
  // Cluster 3
  'gcc-jobs-in-india-salary-2026', 'remote-us-tech-jobs-from-india', 'tech-jobs-with-visa-sponsorship-2026', 'germany-opportunity-card-tech-jobs',
  'tier-2-college-to-product-company-roadmap', 'software-engineer-salary-in-india-2026', 'english-speaking-tech-jobs-europe', 'us-contractor-remote-work-taxes-india',
  // Cluster 4
  'agentic-ai-developer-roadmap-2026', 'full-stack-developer-vs-ai-engineer', 'what-is-context-engineering-in-ai', 'model-context-protocol-mcp-explained',
  'devops-engineer-roadmap-2026', 'skills-that-ai-cannot-replace-in-tech', 'how-to-become-a-cybersecurity-engineer-2026', 'python-developer-roadmap-2026',
  // Cluster 5
  'star-method-behavioral-interview-questions-and-answers', 'system-design-interview-cheatsheet-2026', 'how-to-negotiate-tech-salary', 'ai-engineer-interview-questions-and-answers',
  'why-should-we-hire-you-answer-software-developer', 'how-to-explain-employment-gap-on-resume-tech', 'questions-to-ask-interviewer-software-engineer', 'questions-to-ask-before-joining-a-startup'
];

const categoryMapping = {
  'salary-guide': 'Career Growth',
  'career-growth': 'Career Growth',
  'interview-prep': 'Interviews',
  'AI Engineering': 'AI Engineering',
  'Resumes & ATS': 'Resumes & ATS',
  'Developer Tech': 'Developer Tech',
  'Global Careers': 'Global Careers'
};

for (const slug of slugsToNormalize) {
  const filePath = path.join(targetDir, `${slug}.ts`);
  if (!fs.existsSync(filePath)) continue;

  let raw = fs.readFileSync(filePath, 'utf-8');
  // Match the object after `export const post: BlogPost =`
  const assignMarker = 'export const post: BlogPost =';
  const markerIdx = raw.indexOf(assignMarker);
  if (markerIdx === -1) {
    console.log(`Marker not found in ${slug}`);
    continue;
  }

  const afterMarker = raw.substring(markerIdx + assignMarker.length);
  const jsonStart = afterMarker.indexOf('{');
  const jsonEnd = afterMarker.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) {
    console.log(`Braces not found in ${slug}`);
    continue;
  }

  const jsonStr = afterMarker.substring(jsonStart, jsonEnd + 1);
  let data;
  try {
    data = JSON.parse(jsonStr);
  } catch (err) {
    // If not strict JSON (e.g. JS object), we can use eval or Function
    data = new Function(`return ${jsonStr}`)();
  }

  // 1. Author
  if (typeof data.author === 'object' && data.author !== null) {
    const authorObj = data.author;
    data.author = authorObj.name || 'JobsDart Career Research Team';
    data.authorProfile = {
      name: authorObj.name || 'JobsDart Career Research Team',
      role: authorObj.role || 'Talent Strategist',
      bio: `${authorObj.name} is a ${authorObj.role} specializing in engineering recruitment and tech careers.`,
      avatarUrl: authorObj.avatarUrl
    };
  }

  // 2. Category
  if (categoryMapping[data.category]) {
    data.category = categoryMapping[data.category];
  }

  // 3. Anchors
  if (Array.isArray(data.anchors) && data.anchors.length > 0) {
    data.anchors = data.anchors.map(a => {
      if (typeof a === 'object' && a !== null) {
        return (a.label || a.id || '').replace(/^\d+\.\s*/, '').trim();
      }
      return String(a);
    }).filter(Boolean);
  }

  // 4. Sections: table & example
  if (Array.isArray(data.sections)) {
    for (const sec of data.sections) {
      if (sec.table) {
        const t = sec.table;
        if (t.headers && !t.columns) {
          t.columns = t.headers;
          delete t.headers;
        }
        if (!t.caption) {
          t.caption = `${sec.heading} Overview & Comparison`;
        }
      }
      if (sec.example) {
        const ex = sec.example;
        if (ex.code && !ex.paragraphs) {
          const lines = ex.code.split('\n\n').filter(Boolean);
          ex.paragraphs = lines;
          delete ex.code;
          delete ex.language;
        }
      }
    }
  }

  // 5. FAQs
  if (Array.isArray(data.faqs)) {
    data.faqs = data.faqs.map(f => {
      return {
        q: f.q || f.question || '',
        a: f.a || f.answer || ''
      };
    });
  }

  // Re-serialize cleanly
  const newContent = `import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = ${JSON.stringify(data, null, 2)};

export default post;
`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`Normalized: ${slug}.ts`);
}

console.log('All 24 posts normalized successfully.');
