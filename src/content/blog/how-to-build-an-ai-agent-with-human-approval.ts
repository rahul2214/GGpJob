import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-with-human-approval',
  tint: 'rose',
  title: 'How to Build an AI Agent With Human Approval Before Applying',
  heading: 'Human approval, designed properly',
  description:
    'How to build an approval step that people actually read: what to show, how to batch without inviting rubber-stamping, and where approval must never be optional.',
  keywords: [
    'human in the loop ai agent',
    'ai agent approval workflow',
    'human approval before applying',
    'agent confirmation design',
    'approval gate ai',
    'safe ai automation',
    'human oversight agent',
    'ai agent review step',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Security',
  excerpt:
    'An approval step nobody reads is worse than none — it provides the appearance of oversight and the accountability that comes with it.',
  sections: [
    {
      heading: 'Approval fails by being ignored',
      paragraphs: [
        'The failure mode is not people rejecting good applications. It is people approving everything without looking, which happens reliably once the volume is high and the items look similar.',
        'That is worse than no gate at all. Without a gate, mistakes are the system’s. With a gate that is rubber-stamped, mistakes are the candidate’s — they approved it — while the oversight that was supposed to justify the gate never happened.',
      ],
    },
    {
      heading: 'Show the diff, not the document',
      paragraphs: [
        'Presenting a full tailored CV for approval guarantees it will not be read past the first few times. Present what changed instead: the three bullets that were reworded, the summary line that was rewritten, the skills that were reordered.',
        'A reviewer can check five diffs in the time it takes to skim one document, and they will actually notice the one where a claim drifted from the truth — which is the entire purpose of the step.',
      ],
      bullets: [
        'What changed from the candidate’s base material',
        'Any claim not directly traceable to the source, flagged',
        'The specific job, with the score and its reasoning',
        'Free-text answers in full — these are always novel',
        'What will be submitted, exactly as it will appear',
      ],
    },
    {
      heading: 'Batch, but keep attention high',
      paragraphs: [
        'One notification per application trains people to dismiss notifications. A daily batch of everything awaiting approval works better, because the reviewer arrives in a reviewing frame of mind rather than being interrupted.',
        'Order the batch by risk rather than chronology. Put the items with flagged claims, low scores or unusual free-text answers first, while attention is highest. The routine ones can be at the bottom where a faster pass is genuinely appropriate.',
      ],
    },
    {
      heading: 'Make rejection cheap and informative',
      paragraphs: [
        'If rejecting requires explanation, people approve to avoid the friction. One click to reject, with an optional reason, keeps the gate honest.',
        'Then use the reasons. A reviewer rejecting three roles because the location was wrong is telling the scoring system something specific, and feeding that back is what stops the same rejection recurring next week. An approval queue that does not learn generates the same rejections indefinitely.',
      ],
    },
    {
      heading: 'Where approval must never be optional',
      paragraphs: [
        'Some steps should have no configuration that turns the gate off, regardless of how much a user wants to automate further. These are the ones where a mistake cannot be withdrawn or constitutes a statement about the person.',
        'Everything else can be automated freely once a candidate has watched it work. The discipline is drawing this list once, deliberately, and treating it as a property of the system rather than a preference.',
      ],
      bullets: [
        'Final submission of any application',
        'Free-text answers about motivation or fit',
        'Eligibility, right-to-work and background declarations',
        'Salary expectations and notice commitments',
        'Anything sent to a named human, such as a recruiter email',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why is a rubber-stamped approval step worse than none?',
      a: 'Because it transfers accountability to the person approving while delivering none of the oversight. Without a gate the mistake is the system’s; with an ignored one it is theirs.',
    },
    {
      q: 'What should an approval screen show?',
      a: 'The diff against the candidate’s base material, any claim not traceable to the source, the job with its score and reasoning, and free-text answers in full. Not the whole document.',
    },
    {
      q: 'How do I keep reviewers paying attention?',
      a: 'Batch daily rather than notifying per item, and order by risk — flagged claims and unusual answers first, routine items last where a fast pass is genuinely fine.',
    },
    {
      q: 'Which steps should never be automatable?',
      a: 'Final submission, free-text answers about you, eligibility and background declarations, salary and notice commitments, and anything sent to a named human. Treat that list as a property of the system, not a setting.',
    },
  ],
  related: ['how-to-design-human-approval-for-ai-job-applications', 'what-is-autonomous-job-application', 'how-to-prevent-an-agent-applying-to-the-wrong-job'],
};

export default post;
