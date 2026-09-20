import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-search-automation-tool',
  tint: 'violet',
  title: 'How to Build an AI Job Search Automation Tool Step by Step',
  heading: 'Building a job search automation tool',
  description:
    'A step-by-step build for a first job search automation tool — start with one source and one candidate, add capability in order, with a checkpoint at each stage.',
  keywords: [
    'build job search automation tool',
    'ai job search tool tutorial',
    'job automation step by step',
    'first ai agent project',
    'job scraper to agent',
    'build job search bot',
    'job search tool tutorial',
    'automate job search project',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['job search automation tool', 'start absurdly small'],
  excerpt:
    'A build order for your first one, where each step produces something usable and each checkpoint tells you whether to continue.',
  keyTakeaways: [
    'The first version fetches and stores, with no model at all — and running it for a week is the real test.',
    'Store the raw payload, because you cannot re-fetch a posting that has been taken down.',
    'Separate extraction from scoring so a wrong score is diagnosable.',
    'Label thirty postings before tuning anything; it is the highest-value hour in the project.',
    'Submission is built last and gated, because it is the only irreversible step.',
  ],
  sections: [
    {
      heading: 'Start absurdly small',
      paragraphs: [
        'The version to build first handles one source, one candidate, and does nothing but fetch and store. No model, no scoring, no applying. It should take an evening.',
        'This feels like not building the product, and it is the step that decides whether the product is possible. Run it daily for a week before adding anything. If it cannot reliably fetch postings for seven days, no amount of clever agent design rescues it.',
        'Check the terms of the source before you build on it. A source added without reading them becomes a coverage promise you may have to withdraw later, and the week of running is also a week of finding out whether they mind.',
      ],
    },
    {
      heading: 'Step two: store properly and deduplicate',
      paragraphs: [
        'Once postings arrive, keep them — with the raw payload alongside whatever you parsed. You will change your parsing repeatedly and you cannot re-fetch a posting that has been taken down.',
        'Then deduplicate. Even one source produces duplicates as roles are reposted, and the moment you add a second source the overlap becomes the dominant problem. Solve it now, while the data is small enough to inspect by hand.',
        'Key identity on employer, normalised title and location rather than on the posting URL. The same role arrives with four different links, and a URL-based key produces a feed that looks full and contains twenty roles.',
      ],
      bullets: [
        'Store the raw payload, not just your parse of it',
        'Record which source each posting came from and when',
        'A stable identity per role, not per posting',
        'A quick way to look at yesterday’s intake by eye',
      ],
      table: {
        caption: 'Each step, and how you know it worked',
        columns: ['Step', 'Output', 'Checkpoint'],
        rows: [
          ['Fetch and store', 'A table of postings', 'Seven days without a gap'],
          ['Deduplicate', 'One row per real role', 'Duplicates visible by eye are gone'],
          ['Extract', 'Structured fields', 'Spot-check twenty by hand'],
          ['Score', 'A ranked shortlist', 'Agreement with your own labels'],
          ['Tailor', 'A document per role', 'Read the first fifty yourself'],
          ['Submit', 'A sent application', 'You approved each one'],
        ],
      },
    },
    {
      heading: 'Step three: extract, then score',
      paragraphs: [
        'Now a model earns its place. Turn the prose description into structure — required skills, seniority, location, work model, salary if present — and store that alongside the raw text.',
        'Score in a second pass, separately from extraction. Keeping them apart means you can improve scoring without re-paying for extraction, and when a score looks wrong you can see whether the extraction was wrong first. That separation is worth more than it sounds.',
        'Cache the extraction against a content hash from the start. A posting seen by several candidates should be read once, and retrofitting that later means re-processing everything you already paid for.',
      ],
    },
    {
      heading: 'Step four: build the evaluation set before tuning',
      paragraphs: [
        'Take thirty postings you have opinions about and label them yourself: would you apply, yes or no. This takes an hour and is the highest-value hour in the project.',
        'Now you can measure. Every scoring change either improves agreement with your labels or does not, and you will find out that some confident improvements make things worse. Teams that skip this tune by impression and plateau within a week.',
        'Study the disagreements individually rather than chasing the aggregate number. Some of them are the system being wrong, and some are you having been inconsistent — and only reading them tells you which, which is also how the labels get better.',
      ],
    },
    {
      heading: 'Step five: tailoring, bounded',
      paragraphs: [
        'Generate a tailored CV or covering note for a high-scoring role. Constrain the model firmly to material the candidate actually supplied — reordering and rephrasing only — and diff the output against the source to catch invention.',
        'Read every one of the first fifty by hand. This is where a system quietly starts claiming things that are not true, and it is far cheaper to discover that now than after it has been sent somewhere.',
        'Never let the model write a date, a title or a figure. Copy those from the structured record, because a model that never produces a fact cannot get one wrong, which is a stronger guarantee than any instruction about being careful.',
      ],
    },
    {
      heading: 'What to build before you have users',
      paragraphs: [
        'Three things are far cheaper to add now than after people depend on the tool, and all three are invisible in a demo. A daily cost figure, so you find out what a user costs before an invoice tells you. A hard cap on applications per day, per employer and per week, enforced in code. And a way to stop everything in one action.',
        'Add a record of what was actually sent at the same time — the resolved field values, the document, the timestamp. The first time someone asks what went out under their name, that record is the only answer, and it cannot be reconstructed afterwards.',
        'Idempotency belongs here too rather than after the first duplicate. A key derived from candidate, employer and role, written before the attempt and updated after, is perhaps an hour of work and it prevents the single most visible failure this category has.',
      ],
      bullets: [
        'Cost per user per day, visible from the first week',
        'Caps in code that survive a restart',
        'A stop control the user can reach',
        'An immutable record of what was submitted',
        'Idempotency keyed by candidate, employer and role',
      ],
    },
    {
      heading: 'Step six: submission, last and gated',
      paragraphs: [
        'Only now is submission worth building, and it should ship with a human confirming each one. Show exactly what will be sent, require a click, and store what was actually submitted.',
        'Resist the urge to reverse this order. Teams that build submission early end up with a system that applies confidently to jobs it has not judged well, using material it has not checked — which is worse than no automation at all.',
        'Require positive evidence that it worked rather than an absence of errors. A confirmation element, a known success page, or the application appearing in the portal’s own list — anything short of that is recorded as unknown and resolved later, because a candidate who believes they applied and did not has been failed more thoroughly than one whose tool stopped.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What should my first version do?',
      a: 'Fetch postings from one source for one candidate and store them. No model, no scoring, no applying. Run it daily for a week — if ingestion is not reliable, nothing downstream matters.',
    },
    {
      q: 'Why store the raw posting as well as the parsed version?',
      a: 'You will change your parsing many times, and you cannot re-fetch a posting that has been taken down. The raw payload is the only thing that lets you reprocess history.',
    },
    {
      q: 'When should I build the evaluation set?',
      a: 'Before you tune anything. Label thirty postings yourself as apply or skip, then study the disagreements individually rather than chasing the aggregate number.',
    },
    {
      q: 'Why build submission last?',
      a: 'Because a system that applies before it judges well, using material nobody checked, is worse than no automation. Submission is the only irreversible step.',
    },
    {
      q: 'What should exist before the first real user?',
      a: 'A daily cost figure, hard caps in code, a stop control, an immutable record of what was sent, and idempotency. All five are invisible in a demo and expensive to retrofit.',
    },
    {
      q: 'How should identity be keyed when deduplicating?',
      a: 'Employer, normalised title and location — never the posting URL. The same role arrives with four links, and a URL key leaves a feed that looks full and is not.',
    },
  ],
  related: ['how-to-build-an-ai-job-application-agent', 'how-to-build-an-ai-job-finder-using-job-apis', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
