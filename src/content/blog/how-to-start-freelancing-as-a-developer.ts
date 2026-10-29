import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-start-freelancing-as-a-developer',
  tint: 'amber',
  title: 'How to Start Freelancing as a Developer: Finding Clients, Pricing and Contracts',
  heading: 'How to start freelancing as a developer',
  description:
    'A practical guide for developers starting freelance work: choosing a niche, building a portfolio, finding first clients, pricing hourly or per project, writing contracts and getting paid internationally.',
  keywords: [
    'how to start freelancing',
    'freelance web developer',
    'how to find freelance clients',
    'freelance pricing',
    'freelancing for beginners',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Career Roadmaps',
  anchors: ['start freelancing', 'freelance developer'],
  excerpt:
    'Freelancing gives you flexibility and access to global clients, but it is a business. A clear niche, a portfolio of results, simple contracts and steady outreach are what turn it into a reliable income.',
  keyTakeaways: [
    'Pick a niche — for example, Shopify stores for small brands or Next.js sites for SaaS startups.',
    'Your first clients usually come from your network, not marketplaces.',
    'Price by project or value once you understand the scope; track hours to stay profitable.',
    'Always use a written contract with scope, payment terms, revisions and ownership.',
  ],
  sections: [
    {
      heading: 'Choose a niche',
      paragraphs: [
        'Generalists compete on price. Specialists compete on results. Combine a technology with a type of client — "WordPress performance fixes for e-commerce", "React dashboards for logistics companies" — so prospects immediately understand what you solve.',
      ],
    },
    {
      heading: 'Find your first clients',
      paragraphs: [],
      table: {
        caption: 'Ways to find freelance clients',
        columns: ['Channel', 'How to use it'],
        rows: [
          ['Your network', 'Tell former colleagues, friends and local businesses exactly what you offer'],
          ['Freelance marketplaces', 'Start with small, well-defined jobs to build reviews'],
          ['Agencies', 'Offer overflow development to design and marketing agencies'],
          ['Content', 'Write short case studies and tutorials in your niche'],
          ['Direct outreach', 'Find businesses with an obvious problem (slow site, broken checkout) and offer a fix'],
        ],
      },
    },
    {
      heading: 'Pricing your work',
      paragraphs: [
        'Start by calculating the income you need, adding taxes, software, equipment and unpaid time (sales, admin, learning). Divide by realistic billable hours — often only 50 to 70% of working time. That gives your minimum hourly rate.',
        'As you gain confidence, quote fixed project prices based on scope and value, with a clear list of what is included and what costs extra.',
      ],
    },
    {
      heading: 'Contracts and getting paid',
      paragraphs: [],
      bullets: [
        'Define scope, deliverables and timeline in writing',
        'Take a deposit (often 30–50%) before starting',
        'Limit revision rounds and charge for changes outside scope',
        'State when intellectual property transfers — usually on final payment',
        'Use invoicing and payment platforms that handle international transfers',
        'Register your business and understand tax obligations where you live',
      ],
    },
  ],
  commonMistakes: [
    { mistake: 'Underpricing to win the first jobs', fix: 'Set a sustainable minimum rate and raise it with every new client.' },
    { mistake: 'Starting work without a contract', fix: 'Use a simple written agreement for every project, however small.' },
    { mistake: 'Endless scope creep', fix: 'Write down what is included and quote separately for extras.' },
  ],
  faqs: [
    { q: 'Can beginners start freelancing?', a: 'Yes, with small, well-defined projects. Building a few strong portfolio pieces first makes it much easier.' },
    { q: 'Should I quit my job to freelance?', a: 'Many freelancers start part-time and switch only when they have steady clients and several months of savings.' },
  ],
  related: [
    'best-legitimate-work-from-home-jobs-for-beginners',
    'how-to-find-remote-jobs-at-international-companies',
    'how-to-become-a-software-engineer',
  ],
  references: [
    { title: 'Self-employment', url: 'https://www.gov.uk/working-for-yourself', publisher: 'GOV.UK', note: 'Official UK guidance on registering and paying tax when self-employed.' },
  ],
};

export default post;
