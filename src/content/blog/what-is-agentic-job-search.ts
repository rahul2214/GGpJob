import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-agentic-job-search',
  tint: 'violet',
  title: 'What Is Agentic Job Search?',
  heading: 'Agentic job search',
  description:
    'How agentic job search changes what a candidate actually does day to day, which parts of the search it removes, and which it makes more important.',
  keywords: [
    'agentic job search',
    'what is agentic job search',
    'ai job search strategy',
    'automated job hunting',
    'agentic search explained',
    'ai job search workflow',
    'job search with ai agents',
    'future of job searching',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI & Careers',
  excerpt:
    'The interesting question is not what the agent does. It is what is left for you once it does it, and whether that residue is the valuable part.',
  sections: [
    {
      heading: 'A change in what you spend time on',
      paragraphs: [
        'Conventional job searching is mostly logistics: scanning listings, discarding most of them, rewriting the same document slightly differently, retyping the same details into another form. Judgement is maybe a tenth of the time.',
        'Agentic job search reverses that ratio. The logistics are delegated, and what remains is deciding what you want, judging whether a role is worth pursuing, and doing well in conversations with people. Whether that is an improvement depends entirely on whether you were any good at the part that is left.',
      ],
    },
    {
      heading: 'What it removes',
      paragraphs: [
        'The clearest wins are in work that is repetitive and verifiable. Scanning hundreds of listings against fixed criteria, spotting that three postings are the same role, re-ordering a CV to match a posting’s vocabulary, keeping track of what you sent where.',
        'These are genuinely tedious and genuinely mechanical, and nobody was ever hired because they did them especially well. Removing them recovers hours that were pure overhead.',
      ],
      bullets: [
        'Filtering listings against criteria you can state',
        'Deduplicating the same role across sources',
        'Reformatting and re-emphasising the same material',
        'Tracking what was sent where, and when to follow up',
      ],
    },
    {
      heading: 'What it makes more important, not less',
      paragraphs: [
        'When applying becomes cheap for everyone, the application stops being a signal. An employer receiving three times the volume filters harder, and the things that survive harder filtering are the ones automation cannot manufacture: a referral, demonstrated work, a specific reason you want this role.',
        'So the counter-intuitive consequence is that agentic search raises the value of the non-automatable parts. The candidate who uses the recovered hours to talk to people and build something visible is in a much stronger position than the one who uses them to send four hundred applications.',
      ],
    },
    {
      heading: 'The trap',
      paragraphs: [
        'The obvious failure is treating cheaper applications as a reason to send more. It feels productive, produces a satisfying number, and is close to useless — because the constraint was never how many applications you could send.',
        'The second trap is losing track of what was sent in your name. Agentic search only works if you can still answer, in an interview, why you applied and what interested you. A candidate who cannot is worse off than one who applied to a tenth as many roles deliberately.',
      ],
    },
    {
      heading: 'Using it well',
      paragraphs: [
        'Set the agent to be selective rather than exhaustive. Ask it to surface ten roles worth your attention rather than a hundred that match, and require a reason attached to each so you can correct its judgement.',
        'Then spend the recovered time on the parts it cannot do. That is the whole strategy, and it is why the people getting the most from these tools are often applying to fewer jobs than before, not more.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is agentic job search in simple terms?',
      a: 'Delegating the logistics of job hunting — scanning, filtering, reformatting, tracking — to a system that decides the steps itself, so your time goes to judgement and conversations instead.',
    },
    {
      q: 'Does agentic job search mean applying to more jobs?',
      a: 'It makes that possible, and it is usually the wrong move. Volume was never the constraint, and when applying is cheap for everyone, employers filter harder on things automation cannot fake.',
    },
    {
      q: 'What becomes more valuable when job applications are automated?',
      a: 'Referrals, visible work and a specific reason for wanting a particular role. Those survive harder filtering precisely because they cannot be generated at volume.',
    },
    {
      q: 'What is the main risk?',
      a: 'Losing track of what was sent in your name. If you cannot explain in an interview why you applied, you are worse off than someone who applied to far fewer roles deliberately.',
    },
  ],
  related: ['what-is-an-ai-job-agent', 'what-is-ai-powered-job-hunting', 'how-many-jobs-should-you-apply-to-with-ai'],
};

export default post;
