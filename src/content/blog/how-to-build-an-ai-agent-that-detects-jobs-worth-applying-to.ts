import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-detects-jobs-worth-applying-to',
  tint: 'indigo',
  title: 'How to Build an AI Agent That Detects Jobs Worth Applying To',
  heading: 'Filtering out what is not worth it',
  description:
    'Detecting the postings that waste a candidate’s time: stale listings, CV-collection exercises, unrealistic requirement lists, and employers who never respond.',
  keywords: [
    'jobs worth applying to',
    'detect fake job postings',
    'ghost jobs detection',
    'stale listing detection',
    'employer responsiveness',
    'application quality filter',
    'job posting signals',
    'job search filtering',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['jobs worth applying to', 'stale listings'],
  excerpt:
    'A large fraction of job search effort goes into applications that were never going to produce anything, for reasons visible in the posting.',
  keyTakeaways: [
    'Effort saved on a dead posting is total, which makes this worth more than a few points of match accuracy.',
    'No signal is conclusive; weight several and let the candidate see the concern.',
    'Employer response behaviour predicts outcomes better than anything in the posting text.',
    'Annotate rather than hide — a candidate cannot appeal what they never saw.',
    'Fraud is a different problem: block it, and accept false positives.',
  ],
  sections: [
    {
      heading: 'Some postings cannot result in a job',
      paragraphs: [
        'Listings exist that are not live vacancies: roles already filled internally, postings kept open to collect CVs, positions advertised to satisfy a process requirement, and outright fraud. Candidates spend real hours on all of them.',
        'Detecting these is more valuable than improving match scores by a few points, because the effort saved is total rather than marginal.',
        'It is also the part of the search a candidate cannot do for themselves. Nobody applying to one role can tell that it has been reposted four times in six months, and a platform seeing the whole market is the only participant with that view.',
      ],
    },
    {
      heading: 'The observable signals',
      paragraphs: [
        'No single signal is conclusive, and several together are informative. Reposting the same role repeatedly, an unusually long time open with no change, a requirement list nobody could satisfy, vagueness about what the person would actually do, and an employer with no record of responding.',
        'Weight them, do not treat any as decisive. Some genuine roles are hard to fill and stay open for months, and a system that condemns those is removing real opportunities.',
        'Comparison against the norm for the role type matters more than absolute values. Four weeks open is unremarkable for a specialist position and notable for a high-volume one, and a threshold that ignores the category flags the wrong things in both directions.',
      ],
      bullets: [
        'Reposted repeatedly with no substantive change',
        'Open far longer than typical for the role type',
        'Requirements that no realistic candidate profile satisfies',
        'No description of the actual work, only of the ideal person',
        'Employer with a poor observed response record',
        'A salary range so wide it communicates nothing',
      ],
      table: {
        caption: 'Signals, strength, and how they fail',
        columns: ['Signal', 'Strength', 'False positive'],
        rows: [
          ['Reposted repeatedly', 'Strong', 'A genuinely hard-to-fill role'],
          ['Long time open', 'Moderate', 'Specialist roles, normally'],
          ['Impossible requirement list', 'Moderate', 'Badly written, real vacancy'],
          ['No description of the work', 'Weak', 'Lazy copy, real vacancy'],
          ['Employer never responds', 'Strong', 'Too few observations'],
          ['Contact details off-platform', 'Strong, for fraud', 'Small employers'],
        ],
      },
    },
    {
      heading: 'Employer behaviour is the strongest signal you have',
      paragraphs: [
        'If your platform sees applications and responses, you know which employers reply and how quickly. That is information candidates cannot get anywhere else and it predicts outcomes better than anything in the posting text.',
        'Use it carefully. Aggregate over enough applications to be meaningful, account for role type and volume, and avoid publishing something that amounts to an unverified accusation about a company.',
        'Statistical honesty matters here because the claim is about a real organisation. Three applications with no reply is not evidence, and a system that presents it as a response rate is producing a defamatory-sounding number out of noise — so set a minimum sample and show a confidence, or say nothing.',
      ],
    },
    {
      heading: 'Report rather than hide',
      paragraphs: [
        'Silently filtering postings out is a strong action on an uncertain judgement. A candidate who would have applied to a real role never learns it existed, and cannot appeal a decision they cannot see.',
        'Show the posting with the concern stated: this has been reposted four times in six months, this employer rarely responds. The candidate decides, with information they did not previously have.',
        'State the observation rather than the conclusion. "Reposted four times since March" is a fact the candidate can weigh; "probably a ghost job" is an inference presented as one, and the first is both more useful and more defensible.',
      ],
    },
    {
      heading: 'Scam detection is a separate, sharper problem',
      paragraphs: [
        'Fraudulent postings — advance-fee schemes, identity harvesting, money laundering recruitment — have distinct patterns and cause direct harm rather than wasted effort.',
        'Treat them differently: block rather than annotate, and be willing to accept false positives, because the cost of one fraudulent posting reaching a candidate far exceeds the cost of holding a legitimate one for review.',
        'The patterns are specific enough to encode directly. Requests for payment, requests for bank or identity documents before any interview, contact moved immediately to a consumer messaging app, and a package far above market for the stated requirements each warrant blocking on their own rather than contributing to a weighted score.',
        'Make review the recovery path so blocking is safe. A legitimate employer caught by these rules should be able to reach a person quickly, which is what makes an aggressive threshold acceptable rather than arbitrary.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why do some job postings never result in a hire?',
      a: 'They may be filled internally, kept open to collect CVs, posted to satisfy a process requirement, or fraudulent. Candidates spend real hours on all of these.',
    },
    {
      q: 'What signals indicate a posting is not worth applying to?',
      a: 'Repeated reposting without change, unusually long time open, requirements no realistic profile satisfies, no description of the actual work, and a poor employer response record.',
    },
    {
      q: 'Should low-quality postings be hidden automatically?',
      a: 'No — that is a strong action on an uncertain judgement, and the candidate cannot appeal what they never saw. Show the posting with the concern stated and let them decide.',
    },
    {
      q: 'Should suspected scams be treated the same way?',
      a: 'No. Fraudulent postings cause direct harm, so block rather than annotate and accept false positives — holding a legitimate posting costs far less than one scam reaching a candidate.',
    },
    {
      q: 'How should a response rate be presented?',
      a: 'With a minimum sample and a confidence, or not at all. Three applications with no reply is noise, and publishing it as a rate makes an accusation out of nothing.',
    },
    {
      q: 'What should the annotation actually say?',
      a: 'The observation, not the conclusion. "Reposted four times since March" is a fact the candidate can weigh; "probably a ghost job" is an inference dressed as one.',
    },
  ],
  related: ['how-to-verify-a-job-posting-is-genuine', 'how-to-build-an-ai-agent-that-decides-which-jobs-to-apply-to', 'fake-job-offer-scams'],
};

export default post;
