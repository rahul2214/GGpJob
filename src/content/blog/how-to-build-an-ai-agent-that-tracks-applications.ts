import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-tracks-applications',
  tint: 'violet',
  title: 'How to Build an AI Agent That Tracks Every Job Application',
  heading: 'Tracking every application',
  description:
    'The data model for application tracking, how to classify recruiter replies, why silence is the hardest state to handle, and what to do with the data.',
  keywords: [
    'track job applications ai',
    'job application tracker',
    'application tracking agent',
    'ai email classification jobs',
    'job search crm build',
    'application status tracking',
    'recruiter reply classification',
    'job pipeline tracking',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['tracks applications', 'state transitions'],
  excerpt:
    'Tracking is the least glamorous component and the only one that makes the whole system improve. It is also where most implementations stop.',
  keyTakeaways: [
    'Without outcomes there is no ground truth, so nothing downstream can improve.',
    'Record transitions with dates, not a status field that overwrites its own history.',
    'Keep classification confidence, and never let a low-confidence label set state silently.',
    'Silence is the commonest outcome and needs a per-employer expectation to interpret.',
    'The uncomfortable pattern the data reveals is worth more than another hundred applications.',
  ],
  sections: [
    {
      heading: 'Why tracking is worth building',
      paragraphs: [
        'An agent that applies without tracking repeats itself indefinitely. It cannot tell you which kinds of role respond, cannot avoid reapplying, and cannot answer the question that matters after a month: is any of this working?',
        'It is also the component that turns an automation into a system that learns. Every downstream improvement — better scoring, better targeting, better timing — depends on knowing what happened to what you sent.',
        'And it is what the candidate needs on the morning of an interview. The exact CV that was sent eleven weeks ago, the free-text answers written at the time, and what the first-round interviewer asked are all things nobody reconstructs from memory.',
      ],
    },
    {
      heading: 'The data model',
      paragraphs: [
        'The core record is an application: candidate, job group, what was actually sent, when, through which channel, and its current state. States should reflect what genuinely happens rather than an idealised funnel.',
        'Crucially, record state transitions rather than overwriting a status field. "Applied on the third, acknowledged on the fourth, rejected on the nineteenth" tells you the employer’s response time; a row saying "rejected" tells you nothing you can learn from.',
        'Attach the submitted content immutably rather than by reference to a regenerable document. A record pointing at "the current CV" will resolve to something different in three months, which is precisely when the candidate needs the version the interviewer is holding.',
      ],
      bullets: [
        'Applied — with the exact submitted content attached',
        'Acknowledged — automated receipt, which means almost nothing',
        'Screening, interviewing, offer, rejected, withdrawn',
        'Stale — no contact for longer than this employer’s norm',
      ],
      table: {
        caption: 'What each transition lets you learn',
        columns: ['Transition', 'Tells you'],
        rows: [
          ['Applied → acknowledged', 'The submission worked'],
          ['Applied → nothing, ever', 'Either the pile, or the posting was not real'],
          ['Acknowledged → screening', 'The application passed a first read'],
          ['Screening → rejected', 'The level or a requirement, possibly'],
          ['Interview → rejected', 'Something in the conversation — ask the candidate'],
          ['Any → stale', 'Time to follow up, once'],
        ],
      },
    },
    {
      heading: 'Classifying replies',
      paragraphs: [
        'Most updates arrive as email, and this is where a model genuinely helps: rejections, interview invitations, requests for information and automated acknowledgements all look different across thousands of employers, and rules break constantly.',
        'Classify into a small fixed set and keep confidence. The important design choice is that a low-confidence classification should surface to the candidate rather than silently setting a state — misclassifying an interview invitation as a rejection is the kind of error that costs someone a job.',
        'Make the thresholds asymmetric to match the costs. Closing an application wrongly is expensive and leaving one open wrongly costs a redundant follow-up, so the confidence required to move something to rejected should be higher than the confidence required to leave it alone.',
      ],
    },
    {
      heading: 'Matching a reply to an application',
      paragraphs: [
        'Replies rarely carry a reference number. They arrive from an address you have not seen, mention a title shared by three applications, or come from an agency representing a client whose name is never stated.',
        'Combine the signals — sender domain, thread references, role title, timing — and accept that some will not resolve. Attaching a reply to the wrong application corrupts two records at once, which is worse than leaving one unmatched and asking.',
        'Where the portal allows it, a unique reply-to address per application converts this from a fuzzy matching problem into a lookup, and it is a few minutes of setup rather than an ongoing source of error.',
      ],
    },
    {
      heading: 'Silence is the hard part',
      paragraphs: [
        'The most common outcome is no response at all, and it is genuinely ambiguous: still in the pile, quietly rejected, or lost. Treating silence as rejection is usually right and occasionally very wrong.',
        'The workable approach is a per-employer expectation learned from history. If this company has always replied within ten days, silence at fourteen means something; if they typically take six weeks, it means nothing. Where you have no history, use the aggregate and say that is what you are doing.',
        'Keep "stale" distinct from "rejected" in the model rather than collapsing them. The candidate’s next action differs — one calls for a follow-up and the other for nothing — and an application marked rejected on no evidence also quietly corrupts every statistic built on top of it.',
      ],
    },
    {
      heading: 'Feeding it back',
      paragraphs: [
        'Once outcomes exist, the scoring model has ground truth. Roles resembling the ones that reached interview should rank higher; patterns that never get past screening should be down-weighted, and the candidate should be told what the system noticed.',
        'The insight is often uncomfortable and useful: applications to a particular seniority never progress, or roles requiring a specific tool always stall. That is worth more to a job seeker than another hundred submissions, and it only exists if something was tracking.',
        'Be honest about the sample size when reporting it. One person’s search produces tens of confounded outcomes, so the right framing is an observation the candidate can weigh rather than a finding — and aggregate patterns across many users are where a claim becomes solid enough to state plainly.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why does application tracking matter so much?',
      a: 'It is the only component that makes the system improve. Without outcomes there is no ground truth for scoring, no way to avoid reapplying, and no answer to whether any of it is working.',
    },
    {
      q: 'Should I store a status field or state transitions?',
      a: 'Transitions. "Applied, acknowledged, rejected" with dates tells you the employer’s response behaviour; a single field saying "rejected" throws away everything you could have learned.',
    },
    {
      q: 'How should an agent classify recruiter emails?',
      a: 'Into a small fixed set, with confidence retained and asymmetric thresholds. Closing an application wrongly is expensive; leaving one open wrongly costs a redundant follow-up.',
    },
    {
      q: 'How do you handle applications that get no reply?',
      a: 'Learn a per-employer response-time expectation from history. Silence at fourteen days means something from a company that usually replies in ten, and nothing from one that takes six weeks.',
    },
    {
      q: 'What if a reply cannot be matched to an application?',
      a: 'Leave it unmatched and ask. Attaching it to the wrong application corrupts two records, and a unique reply-to address per application avoids the problem entirely where portals allow it.',
    },
    {
      q: 'Why store the submitted document rather than a reference?',
      a: 'Because a reference to "the current CV" resolves differently in three months — which is exactly when the candidate needs the version the interviewer is reading.',
    },
  ],
  related: ['how-to-build-a-job-search-crm-with-ai', 'how-to-build-an-ai-agent-that-learns-from-rejections', 'how-to-automate-job-application-follow-ups'],
};

export default post;
