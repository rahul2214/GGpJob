import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-job-search-crm-with-ai',
  tint: 'amber',
  title: 'How to Build a Job Search CRM With AI',
  heading: 'A CRM for a job search',
  description:
    'Designing a job search tracker that people actually maintain: automatic capture, the right data model, useful surfacing, and what to leave out.',
  keywords: [
    'job search crm',
    'application tracker design',
    'automatic capture applications',
    'job search organisation',
    'pipeline tracking',
    'crm data model',
    'job search dashboard',
    'application management',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Every job search tracker dies the same way: manual entry. If the user has to maintain it, they will not.',
  sections: [
    {
      heading: 'Capture automatically or not at all',
      paragraphs: [
        'A spreadsheet works for two weeks and is abandoned by week three, because updating it is work that produces no immediate benefit. Any tracker requiring manual entry follows the same curve.',
        'So capture has to be a by-product of applying. If the application went through your platform, the record exists already. If it went elsewhere, capture it from the confirmation email or a browser extension — anything that does not ask the user to type it twice.',
      ],
    },
    {
      heading: 'Model companies and roles separately',
      paragraphs: [
        'A flat list of applications loses the thing that matters most: the relationship. Someone may apply to three roles at one company over six months, speak to two people there and be referred by a third.',
        'Model the company, the contacts, the roles and the applications as distinct entities with links between them. That is what lets the system say "you spoke to this person about a different role in March" — which is exactly the context a candidate forgets and needs.',
      ],
      bullets: [
        'Company — applications, contacts, notes, response history',
        'Contact — who, where, every interaction',
        'Role — the posting, its requirements, the version of the CV sent',
        'Application — state, dates, documents, outcome',
      ],
    },
    {
      heading: 'Surface what needs attention, not everything',
      paragraphs: [
        'A dashboard of forty applications with statuses is a to-do list nobody reads. The useful output is short and specific: these two need a follow-up today, this one has a deadline tomorrow, this interview is on Thursday.',
        'Everything else can wait to be asked for. A tracker that opens with three actions outperforms one that opens with a complete inventory, however comprehensive the inventory is.',
      ],
    },
    {
      heading: 'Let AI do the parts people avoid',
      paragraphs: [
        'The reliably neglected tasks are the ones worth automating: classifying replies, updating statuses from inbound mail, drafting follow-ups, summarising a company’s history before an interview.',
        'These share a property — they are chores with a clear correct answer and no creative judgement. That is where automation earns trust, and it is a better place to spend model calls than on advice the candidate did not ask for.',
      ],
    },
    {
      heading: 'Resist becoming a sales CRM',
      paragraphs: [
        'It is tempting to add pipeline stages, conversion rates and velocity metrics, because the analogy is close and the features are familiar. But a job search is not a sales pipeline: the volumes are small, the outcomes are binary and personal, and the emotional register is entirely different.',
        'Analytics that tell someone their conversion rate is below average are not helpful during a difficult search. Keep the system focused on what to do next, and leave the scoreboard out.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why do job search trackers get abandoned?',
      a: 'Manual entry. Updating a record produces no immediate benefit, so it stops by week three. Capture has to be a by-product of applying.',
    },
    {
      q: 'What should the data model look like?',
      a: 'Company, contact, role and application as separate linked entities — that is what lets the system recall you spoke to someone about a different role months ago.',
    },
    {
      q: 'What should the dashboard show?',
      a: 'Two or three things that need action today, not an inventory of forty applications. A complete list is a to-do list nobody reads.',
    },
    {
      q: 'Should a job search CRM show conversion metrics?',
      a: 'No. A job search is not a sales pipeline — volumes are small and outcomes personal. Telling someone their conversion rate is below average does not help during a hard search.',
    },
  ],
  related: ['how-to-build-an-ai-application-tracking-system', 'how-to-build-an-ai-agent-that-tracks-applications', 'how-to-automate-job-application-follow-ups'],
};

export default post;
