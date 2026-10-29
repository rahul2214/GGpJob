import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-become-a-project-manager',
  tint: 'emerald',
  title: 'How to Become a Project Manager: Skills, Certifications (PMP, CAPM) and Career Path',
  heading: 'How to become a project manager',
  description:
    'How to start a project management career: core skills, Agile and Scrum, certifications like CAPM, PMP and Scrum Master, how to get experience without the title, and the typical PM career path.',
  keywords: [
    'how to become a project manager',
    'project manager career path',
    'pmp certification',
    'capm vs pmp',
    'project manager without experience',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Career Roadmaps',
  anchors: ['become a project manager', 'PMP certification'],
  excerpt:
    'Project managers plan work, coordinate people and deliver results on time and on budget. Many people already do parts of the job informally — here is how to turn that into a recognised career.',
  keyTakeaways: [
    'Start by managing projects in your current role; most PMs move into the job internally.',
    'Learn both traditional (waterfall) and Agile/Scrum methods.',
    'CAPM suits beginners; PMP requires documented project experience and is widely recognised.',
    'Communication, risk management and stakeholder management matter as much as tools.',
  ],
  sections: [
    {
      heading: 'What project managers do',
      paragraphs: [
        'A project manager defines scope, builds a plan, manages budget and timeline, coordinates the team, tracks risks and communicates progress to stakeholders. In software teams, the work often follows Agile practices such as sprints, backlogs and retrospectives.',
      ],
    },
    {
      heading: 'Core skills',
      paragraphs: [],
      bullets: [
        'Planning and scheduling: work breakdown structures, milestones, dependencies',
        'Budgeting and resource management',
        'Risk and issue management',
        'Stakeholder communication and reporting',
        'Agile and Scrum practices',
        'Tools: Jira, Asana, Trello, Microsoft Project, spreadsheets',
        'Leadership and conflict resolution',
      ],
    },
    {
      heading: 'Certifications compared',
      paragraphs: [],
      table: {
        caption: 'Common project management certifications',
        columns: ['Certification', 'Best for', 'Notes'],
        rows: [
          ['CAPM (Certified Associate in Project Management)', 'Beginners', 'Entry-level PMI certification; requires project management education hours'],
          ['PMP (Project Management Professional)', 'Experienced PMs', 'Requires documented project experience plus training; widely recognised globally'],
          ['Certified ScrumMaster / Professional Scrum Master', 'Agile and software teams', 'Short courses focused on Scrum'],
          ['PRINCE2', 'UK, Europe and government projects', 'Process-based method popular in the UK'],
        ],
      },
    },
    {
      heading: 'Getting experience without the title',
      paragraphs: [
        'Volunteer to coordinate a project at work, lead an event or migration, or manage a project for a non-profit. Document scope, timeline, budget, team size and results. Those details become strong resume bullets and also count toward PMP experience requirements.',
      ],
    },
    {
      heading: 'Typical career path',
      paragraphs: [
        'Common progression runs from project coordinator to project manager, then senior project manager, programme manager and portfolio or PMO leader. Some PMs move into product management, operations leadership or delivery director roles.',
      ],
    },
  ],
  faqs: [
    { q: 'Can I become a project manager without experience?', a: 'Start as a project coordinator or assistant, or take on projects in your current role. Those are the most common entry points.' },
    { q: 'Is the PMP worth it?', a: 'For experienced project managers, PMP is one of the most recognised credentials and is often requested in job postings.' },
  ],
  related: [
    'how-to-change-careers',
    'ai-product-manager-roadmap',
    'skills-to-put-on-a-resume',
  ],
  references: [
    { title: 'Project Management Professional (PMP)', url: 'https://www.pmi.org/certifications/project-management-pmp', publisher: 'Project Management Institute', note: 'Official PMP requirements and exam details.' },
    { title: 'Project Management Specialists', url: 'https://www.bls.gov/ooh/business-and-financial/project-management-specialists.htm', publisher: 'U.S. Bureau of Labor Statistics', note: 'Duties, pay and job outlook for project managers.' },
  ],
};

export default post;
