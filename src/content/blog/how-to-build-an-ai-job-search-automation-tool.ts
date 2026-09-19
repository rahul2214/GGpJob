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
  excerpt:
    'A build order for your first one, where each step produces something usable and each checkpoint tells you whether to continue.',
  sections: [
    {
      heading: 'Start absurdly small',
      paragraphs: [
        'The version to build first handles one source, one candidate, and does nothing but fetch and store. No model, no scoring, no applying. It should take an evening.',
        'This feels like not building the product, and it is the step that decides whether the product is possible. Run it daily for a week before adding anything. If it cannot reliably fetch postings for seven days, no amount of clever agent design rescues it.',
      ],
    },
    {
      heading: 'Step two: store properly and deduplicate',
      paragraphs: [
        'Once postings arrive, keep them — with the raw payload alongside whatever you parsed. You will change your parsing repeatedly and you cannot re-fetch a posting that has been taken down.',
        'Then deduplicate. Even one source produces duplicates as roles are reposted, and the moment you add a second source the overlap becomes the dominant problem. Solve it now, while the data is small enough to inspect by hand.',
      ],
      bullets: [
        'Store the raw payload, not just your parse of it',
        'Record which source each posting came from and when',
        'A stable identity per role, not per posting',
        'A quick way to look at yesterday’s intake by eye',
      ],
    },
    {
      heading: 'Step three: extract, then score',
      paragraphs: [
        'Now a model earns its place. Turn the prose description into structure — required skills, seniority, location, work model, salary if present — and store that alongside the raw text.',
        'Score in a second pass, separately from extraction. Keeping them apart means you can improve scoring without re-paying for extraction, and when a score looks wrong you can see whether the extraction was wrong first. That separation is worth more than it sounds.',
      ],
    },
    {
      heading: 'Step four: build the evaluation set before tuning',
      paragraphs: [
        'Take thirty postings you have opinions about and label them yourself: would you apply, yes or no. This takes an hour and is the highest-value hour in the project.',
        'Now you can measure. Every scoring change either improves agreement with your labels or does not, and you will find out that some confident improvements make things worse. Teams that skip this tune by impression and plateau within a week.',
      ],
    },
    {
      heading: 'Step five: tailoring, bounded',
      paragraphs: [
        'Generate a tailored CV or covering note for a high-scoring role. Constrain the model firmly to material the candidate actually supplied — reordering and rephrasing only — and diff the output against the source to catch invention.',
        'Read every one of the first fifty by hand. This is where a system quietly starts claiming things that are not true, and it is far cheaper to discover that now than after it has been sent somewhere.',
      ],
    },
    {
      heading: 'Step six: submission, last and gated',
      paragraphs: [
        'Only now is submission worth building, and it should ship with a human confirming each one. Show exactly what will be sent, require a click, and store what was actually submitted.',
        'Resist the urge to reverse this order. Teams that build submission early end up with a system that applies confidently to jobs it has not judged well, using material it has not checked — which is worse than no automation at all.',
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
      a: 'Before you tune anything. Label thirty postings yourself as apply or skip. It takes an hour and it is the only way to tell whether a scoring change helped or quietly made things worse.',
    },
    {
      q: 'Why build submission last?',
      a: 'Because a system that applies before it judges well, using material nobody checked, is worse than no automation. Submission is the only irreversible step, so it earns its place only once everything upstream is trustworthy.',
    },
  ],
  related: ['how-to-build-an-ai-job-application-agent', 'how-to-build-an-ai-job-finder-using-job-apis', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
