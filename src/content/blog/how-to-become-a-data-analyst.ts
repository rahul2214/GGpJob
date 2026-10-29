import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-become-a-data-analyst',
  tint: 'sky',
  title: 'How to Become a Data Analyst With No Experience: Skills, Tools and Roadmap',
  heading: 'How to become a data analyst, even with no experience',
  description:
    'A practical roadmap to becoming a data analyst: Excel, SQL, a BI tool, statistics and Python, portfolio projects that get interviews, certifications worth considering, and how to land your first analyst role.',
  keywords: [
    'how to become a data analyst',
    'data analyst roadmap',
    'data analyst skills',
    'data analyst with no experience',
    'data analyst portfolio projects',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Career Roadmaps',
  anchors: ['become a data analyst', 'data analyst roadmap'],
  excerpt:
    'Data analysis is one of the most accessible ways into tech. The core toolkit — Excel, SQL, a dashboard tool and basic statistics — can be learned in months, and a strong portfolio does much of the convincing.',
  keyTakeaways: [
    'SQL is the single most important skill for analyst job interviews.',
    'Learn one BI tool well: Power BI or Tableau.',
    'Build three portfolio projects that answer real business questions, not just charts.',
    'Your previous domain knowledge (sales, finance, healthcare, operations) is a selling point.',
  ],
  sections: [
    {
      heading: 'What data analysts do',
      paragraphs: [
        'Data analysts collect, clean and analyse data to answer business questions: Why did sales drop? Which customers are likely to churn? Which campaign worked best? Most of the job is turning messy data into a clear recommendation that someone can act on.',
      ],
    },
    {
      heading: 'Skills roadmap',
      paragraphs: [],
      table: {
        caption: 'Data analyst skills in learning order',
        columns: ['Stage', 'Skills', 'Approximate time'],
        rows: [
          ['1', 'Excel or Google Sheets: formulas, pivot tables, lookups, charts', '3–4 weeks'],
          ['2', 'SQL: SELECT, joins, GROUP BY, subqueries, window functions', '6–8 weeks'],
          ['3', 'BI tool: Power BI or Tableau dashboards', '4–6 weeks'],
          ['4', 'Statistics: averages, distributions, correlation, A/B testing basics', '4 weeks'],
          ['5', 'Python: pandas, data cleaning, basic visualisation', '6–8 weeks'],
          ['6', 'Communication: writing insights, presenting findings', 'Ongoing'],
        ],
      },
    },
    {
      heading: 'Portfolio projects that get interviews',
      paragraphs: [
        'Each project should start with a business question, use a realistic dataset, and end with a recommendation. Publish them with a short write-up on GitHub, a portfolio site or LinkedIn.',
      ],
      bullets: [
        'Sales performance dashboard with trends, top products and regional comparisons',
        'Customer churn analysis identifying the strongest predictors of cancellation',
        'Marketing campaign A/B test analysis with a clear recommendation',
        'Public data analysis on a topic you care about, such as housing, transport or health',
      ],
    },
    {
      heading: 'Landing your first role',
      paragraphs: [
        'Search for junior data analyst, reporting analyst, business analyst, operations analyst and marketing analyst titles. Internal moves are often the fastest route: volunteer to build reports in your current job, then use that experience on your resume.',
      ],
    },
  ],
  faqs: [
    { q: 'Do I need a degree to become a data analyst?', a: 'Many employers prefer a degree, but plenty hire based on skills and portfolio, especially for junior roles and internal transfers.' },
    { q: 'Do data analysts need Python?', a: 'Not always for entry-level roles, where SQL, Excel and a BI tool are often enough, but Python broadens your options and is increasingly expected.' },
    { q: 'How long does it take to become a data analyst?', a: 'Four to eight months of consistent study is typical to become job-ready from scratch.' },
  ],
  tools: [
    { name: 'AI Resume Builder', badge: 'Free', description: 'Turn your projects into strong resume bullets for analyst roles.', href: '/resume-builder', ctaText: 'Build my resume' },
  ],
  related: [
    'sql-interview-questions',
    'data-analyst-vs-data-scientist-skills-salaries-jobs',
    'how-to-change-careers',
  ],
  references: [
    { title: 'Data Scientists', url: 'https://www.bls.gov/ooh/math/data-scientists.htm', publisher: 'U.S. Bureau of Labor Statistics', note: 'Pay and outlook for data roles in the United States.' },
    { title: 'Microsoft Learn: Power BI', url: 'https://learn.microsoft.com/en-us/training/powerplatform/power-bi', publisher: 'Microsoft Learn', note: 'Free official training paths for Power BI.' },
  ],
};

export default post;
