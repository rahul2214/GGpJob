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
  anchors: ['job search CRM', 'automatic capture'],
  excerpt:
    'Every job search tracker dies the same way: manual entry. If the user has to maintain it, they will not.',
  keyTakeaways: [
    'Capture must be a by-product of applying, or the tracker is abandoned by week three.',
    'Model company, contact, role and application separately — the relationship is what matters.',
    'Show two or three things needing action, not an inventory of forty.',
    'Automate the chores people avoid: classification, status updates, follow-up drafts.',
    'A job search is not a sales pipeline; leave the conversion metrics out.',
  ],
  sections: [
    {
      heading: 'Capture automatically or not at all',
      paragraphs: [
        'A spreadsheet works for two weeks and is abandoned by week three, because updating it is work that produces no immediate benefit. Any tracker requiring manual entry follows the same curve.',
        'So capture has to be a by-product of applying. If the application went through your platform, the record exists already. If it went elsewhere, capture it from the confirmation email or a browser extension — anything that does not ask the user to type it twice.',
        'Email is the highest-coverage source and the one worth building first. Almost every application produces a confirmation, almost every rejection arrives there, and a system reading that inbox reconstructs most of a search without the candidate doing anything at all.',
      ],
    },
    {
      heading: 'Model companies and roles separately',
      paragraphs: [
        'A flat list of applications loses the thing that matters most: the relationship. Someone may apply to three roles at one company over six months, speak to two people there and be referred by a third.',
        'Model the company, the contacts, the roles and the applications as distinct entities with links between them. That is what lets the system say "you spoke to this person about a different role in March" — which is exactly the context a candidate forgets and needs.',
        'Company identity is harder than it looks and worth getting right early. The same employer appears with different legal names, through agencies, and under acquired brands, and a system that treats those as four companies loses precisely the history it exists to keep.',
      ],
      bullets: [
        'Company — applications, contacts, notes, response history',
        'Contact — who, where, every interaction',
        'Role — the posting, its requirements, the version of the CV sent',
        'Application — state, dates, documents, outcome',
      ],
      table: {
        caption: 'What each entity earns you',
        columns: ['Entity', 'Without it', 'With it'],
        rows: [
          ['Company', 'Three unrelated rows', 'A relationship with history'],
          ['Contact', 'A name in a note', '"You met them in March"'],
          ['Role', 'A URL that will expire', 'Requirements kept after the posting dies'],
          ['Application', 'A date', 'State, documents and outcome'],
          ['Document version', 'A folder of files', 'What the interviewer is holding'],
        ],
      },
    },
    {
      heading: 'Surface what needs attention, not everything',
      paragraphs: [
        'A dashboard of forty applications with statuses is a to-do list nobody reads. The useful output is short and specific: these two need a follow-up today, this one has a deadline tomorrow, this interview is on Thursday.',
        'Everything else can wait to be asked for. A tracker that opens with three actions outperforms one that opens with a complete inventory, however comprehensive the inventory is.',
        'The interview view is the one screen worth building carefully. Everything relevant to one conversation — the posting, the exact CV sent, the free-text answers written at the time, who was spoken to before and what was said — assembled on one page turns twenty minutes of anxious searching into two minutes of reading.',
      ],
    },
    {
      heading: 'Let AI do the parts people avoid',
      paragraphs: [
        'The reliably neglected tasks are the ones worth automating: classifying replies, updating statuses from inbound mail, drafting follow-ups, summarising a company’s history before an interview.',
        'These share a property — they are chores with a clear correct answer and no creative judgement. That is where automation earns trust, and it is a better place to spend model calls than on advice the candidate did not ask for.',
        'Classification should be allowed to be uncertain. A reply the system cannot confidently categorise belongs in a short review queue rather than being assigned a state, because a wrongly closed application is invisible until the candidate wonders why they never heard back.',
      ],
    },
    {
      heading: 'Privacy is a design constraint here, not a policy page',
      paragraphs: [
        'This system holds a complete record of someone searching for a job while employed, usually including inbox access. Nothing else in a candidate’s toolkit is as sensitive, and the consequence of a leak is not embarrassment but their current job.',
        'Scope the mail integration as narrowly as the provider allows, store only what the tracker needs rather than whole message bodies where a summary suffices, and encrypt what you keep. Read-only access to a filtered set is dramatically better than full mailbox access, and the difference is a scope string.',
        'Make deletion real and obvious. A search ends, and the natural moment to remove everything is the moment it does — a product that makes that easy is one people are willing to give the access to in the first place.',
      ],
      bullets: [
        'Narrowest possible mail scope, read-only where it exists',
        'Store what the tracker needs, not every message body',
        'Encrypt at rest, and keep the key out of the application database',
        'One-action export and one-action delete when the search ends',
        'Never surface anything that could reach the current employer',
      ],
    },
    {
      heading: 'Resist becoming a sales CRM',
      paragraphs: [
        'It is tempting to add pipeline stages, conversion rates and velocity metrics, because the analogy is close and the features are familiar. But a job search is not a sales pipeline: the volumes are small, the outcomes are binary and personal, and the emotional register is entirely different.',
        'Analytics that tell someone their conversion rate is below average are not helpful during a difficult search. Keep the system focused on what to do next, and leave the scoreboard out.',
        'There is one analytic worth showing, and it is diagnostic rather than evaluative: which kinds of application got responses. That points at a change the candidate can make, which is the only reason to show them a number at all.',
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
    {
      q: 'What is the single most valuable screen?',
      a: 'The interview view: the posting, the exact CV sent, the answers written at the time and who was spoken to before, all on one page.',
    },
    {
      q: 'What makes this system unusually sensitive?',
      a: 'It records someone job hunting while employed, usually with inbox access. The consequence of a leak is their current job, so narrow scopes and real deletion are design requirements.',
    },
  ],
  related: ['how-to-build-an-ai-application-tracking-system', 'how-to-build-an-ai-agent-that-tracks-applications', 'how-to-automate-job-application-follow-ups'],
};

export default post;
