import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'skills-to-put-on-a-resume',
  tint: 'emerald',
  title: 'Best Skills to Put on a Resume in 2026 (Hard & Soft Skills by Job)',
  heading: 'The best skills to put on a resume, and how to prove them',
  description:
    'Which skills to put on a resume in 2026: in-demand hard and soft skills by job type, how to choose the right ones from a job description, and how to format a skills section that passes ATS screening.',
  keywords: [
    'skills to put on a resume',
    'resume skills section',
    'hard skills vs soft skills',
    'top skills for resume 2026',
    'technical skills for resume',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Resumes & ATS',
  anchors: ['skills to put on a resume', 'resume skills section'],
  excerpt:
    'Recruiters and ATS software look for specific, named skills — not adjectives. Here is how to pick the right skills for each application, examples by job type, and how to prove them in your experience section.',
  keyTakeaways: [
    'List 8–15 skills that appear in the job description, named exactly as the employer writes them.',
    'Hard skills (tools, languages, certifications) belong in the skills section; soft skills are better shown in bullet points.',
    'Group technical skills by category so a recruiter can scan them in five seconds.',
    'Every important skill in your list should also appear in at least one achievement bullet.',
  ],
  sections: [
    {
      heading: 'Hard skills vs soft skills',
      paragraphs: [
        'Hard skills are teachable, measurable abilities: Python, SQL, Excel, financial modelling, Figma, a forklift licence or a nursing certification. Soft skills are how you work: communication, leadership, problem-solving, adaptability.',
        'Applicant tracking systems match mostly on hard skills because they are concrete nouns. Soft skills still matter to the human reader, but writing "excellent communicator" in a list proves nothing. Show it instead: "Presented quarterly results to 40 stakeholders".',
      ],
    },
    {
      heading: 'In-demand skills by job family',
      paragraphs: [
        'These are skills that appear again and again in current postings. Use them as a starting point, then keep only the ones you can honestly support.',
      ],
      table: {
        caption: 'Common resume skills by job family',
        columns: ['Job family', 'Hard skills', 'Soft skills to demonstrate'],
        rows: [
          ['Software engineering', 'Python, Java, JavaScript/TypeScript, React, SQL, Git, Docker, AWS/Azure, REST APIs', 'Code review, collaboration, ownership'],
          ['Data and analytics', 'SQL, Excel, Power BI/Tableau, Python (pandas), statistics, A/B testing', 'Storytelling with data, stakeholder communication'],
          ['Marketing', 'SEO, Google Analytics, paid social, content strategy, CRM tools, copywriting', 'Creativity, experimentation, reporting'],
          ['Sales and customer success', 'Salesforce/HubSpot, pipeline management, negotiation, product demos', 'Relationship building, resilience'],
          ['Project and operations', 'Agile/Scrum, Jira, budgeting, risk management, MS Project, PMP', 'Leadership, prioritisation, conflict resolution'],
          ['Healthcare', 'Patient assessment, EHR systems (Epic, Cerner), BLS/ACLS, medication administration', 'Empathy, calm under pressure, teamwork'],
        ],
      },
    },
    {
      heading: 'How to choose skills for each application',
      paragraphs: [
        'The best skills list is not the longest one; it is the one that matches the job. Rebuild it for every application from the posting itself.',
      ],
      bullets: [
        'Copy the job description and highlight every tool, method and qualification it names',
        'Keep the ones you have genuinely used, using the employer\'s exact spelling (for example "Microsoft Power BI", not "PBI")',
        'Put the most-mentioned skills first in each group',
        'Add both forms of common abbreviations once: "Search Engine Optimization (SEO)"',
        'Remove anything outdated or universal, such as "Microsoft Word" or "internet research", unless the posting asks for it',
      ],
    },
    {
      heading: 'How to format the skills section',
      paragraphs: [
        'Keep the section plain text, near the top for technical roles and after experience for others. Avoid rating bars, stars and percentages: ATS software cannot read them, and "80% Python" invites awkward questions.',
      ],
      example: {
        title: 'Example skills section for a full-stack developer',
        paragraphs: [
          'Languages: TypeScript, JavaScript, Python, SQL',
          'Frameworks: React, Next.js, Node.js, Express',
          'Data and cloud: PostgreSQL, Redis, AWS (EC2, S3, Lambda), Docker',
          'Practices: REST API design, unit and integration testing, CI/CD with GitHub Actions',
        ],
      },
    },
    {
      heading: 'Prove your skills in the experience section',
      paragraphs: [
        'A skill listed once in a box is weak evidence. A skill used in a result is strong evidence. For each of your top five skills, make sure at least one bullet shows it producing an outcome — for example, "Reduced report preparation time by 6 hours a week by automating data pulls with Python and SQL".',
      ],
    },
  ],
  commonMistakes: [
    { mistake: 'Listing 40 skills to look impressive', fix: 'Keep 8–15 that match the role; long lists dilute the important ones.' },
    { mistake: 'Using graphics or skill bars', fix: 'Use plain comma-separated text grouped by category.' },
    { mistake: 'Listing skills you cannot discuss', fix: 'Only include what you could answer two interview questions about.' },
  ],
  tools: [
    { name: 'ATS Resume Checker', badge: 'Free', description: 'Find out which skills from the job description are missing from your resume.', href: '/ats-score', ctaText: 'Scan my resume' },
  ],
  faqs: [
    { q: 'How many skills should I put on my resume?', a: 'Between 8 and 15 is a good range for most roles. Technical roles can list a few more if they are grouped clearly by category.' },
    { q: 'Should I put soft skills on my resume?', a: 'Mention one or two in your summary if the job emphasises them, but prove them through achievements rather than listing them as words.' },
    { q: 'Where should the skills section go?', a: 'Near the top for technical and early-career resumes, where skills are the main selling point. After experience for senior roles, where results lead.' },
  ],
  related: [
    'how-to-improve-your-ats-resume-score-before-applying',
    'resume-action-verbs',
    'top-high-paying-technology-skills-2026',
  ],
  references: [
    { title: 'O*NET OnLine', url: 'https://www.onetonline.org/', publisher: 'O*NET OnLine', note: 'Lists the skills, tools and technologies used in hundreds of occupations, based on U.S. labour research.' },
    { title: 'The Future of Jobs Report 2025', url: 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/', publisher: 'World Economic Forum', note: 'Employer survey on the skills expected to grow fastest worldwide.' },
  ],
};

export default post;
