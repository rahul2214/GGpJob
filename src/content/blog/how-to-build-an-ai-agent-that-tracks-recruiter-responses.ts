import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-tracks-recruiter-responses',
  tint: 'amber',
  title: 'How to Build an AI Agent That Tracks Recruiter Responses',
  heading: 'Tracking what comes back',
  description:
    'Classifying recruiter replies accurately: the categories that matter, handling ambiguity, mailbox access and privacy, and surfacing what needs a human now.',
  keywords: [
    'track recruiter responses',
    'email classification agent',
    'reply categorisation',
    'mailbox access privacy',
    'ambiguous rejection detection',
    'application inbox',
    'response tracking',
    'job search inbox automation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['recruiter responses', 'mailbox access'],
  excerpt:
    'An agent reading a job seeker’s inbox has access to the most sensitive thing they own during a search. Design for that first.',
  keyTakeaways: [
    'Narrow the access as far as the provider allows — what the agent cannot see, it cannot leak.',
    'Four categories change behaviour; finer classification is a distraction.',
    'Gently written rejections are genuinely ambiguous, so report confidence and route the unclear.',
    'Draft, never send. An auto-acknowledged invitation can commit someone to a time they cannot make.',
    'Interrupt for the time-sensitive few and batch the rest, or you rebuild the inbox.',
  ],
  sections: [
    {
      heading: 'Mailbox access is the real decision',
      paragraphs: [
        'To track responses you need to see them, and a job seeker’s inbox contains far more than job applications — medical correspondence, finances, private conversations. Asking for broad access to read it is asking for a great deal.',
        'Narrow it as far as the provider allows: a dedicated address for applications, a specific label or folder the user controls, or scoped read access rather than full mailbox permission. What the agent cannot see, it cannot leak.',
        'Read-only is the other half of the ask and the one most easily conceded. Tracking requires reading and nothing else, so a scope that cannot send, delete or modify removes an entire category of possible harm at the cost of nothing the feature needs.',
      ],
      bullets: [
        'A dedicated address used only for applications, where practical',
        'Scoped access to one label or folder, not the whole mailbox',
        'Read-only, since tracking never needs to write',
        'Retain only what relates to a tracked application',
        'Revocation that genuinely deletes retained content',
      ],
    },
    {
      heading: 'The categories that actually matter',
      paragraphs: [
        'Fine-grained classification is a distraction. What changes the candidate’s behaviour is a short list: this needs your attention now, this is a rejection, this is an automated acknowledgement, this is not about a job at all.',
        'Anything needing action now — an interview invitation, a request for availability, a question — should surface immediately and prominently. Everything else can be summarised.',
        'The fourth category carries more weight than it appears to. Correctly identifying that a message is not job-related is what stops the agent processing, storing and summarising personal correspondence it had no business reading, so it deserves to be an explicit outcome rather than a residual bucket.',
      ],
      table: {
        caption: 'Four categories, four behaviours',
        columns: ['Category', 'Action', 'If uncertain'],
        rows: [
          ['Needs attention now', 'Interrupt', 'Interrupt anyway'],
          ['Rejection', 'Update state, no interruption', 'Leave open, ask'],
          ['Automated acknowledgement', 'Record, say nothing', 'Treat as acknowledgement'],
          ['Not job-related', 'Discard, do not store', 'Discard, do not store'],
        ],
      },
    },
    {
      heading: 'Ambiguity is the norm, not the exception',
      paragraphs: [
        'Rejections are frequently written to be gentle, which makes them genuinely hard to classify. "We have decided to move forward with other candidates at this time, but we would like to keep your details on file" contains a decision and an encouragement, and systems regularly read the wrong one.',
        'Report confidence and route uncertain cases to the person. Misclassifying a rejection as an open thread leads to a follow-up that makes the candidate look like they did not read their own mail.',
        'A deferral is a third thing that neither category fits. "We are pausing this search and will be back in touch" is not a rejection and not an open process, and forcing it into either produces a wrong follow-up or a wrongly closed record — so it deserves its own state.',
      ],
    },
    {
      heading: 'Never auto-reply on their behalf',
      paragraphs: [
        'It is technically easy and almost always wrong. An automatic acknowledgement of an interview invitation can commit a candidate to a time they cannot make, and an automated answer to a substantive question can say something they would not.',
        'Draft, do not send. The agent’s value is that the reply is ready in five seconds; the candidate’s value is that it is theirs.',
        'A draft with the context attached is the version that saves real time. Showing the original application, what was sent, and the thread so far means the candidate answers in two minutes instead of spending twenty reconstructing six weeks of history first.',
      ],
    },
    {
      heading: 'Summarise rather than notify for everything',
      paragraphs: [
        'A notification for each classified message recreates the inbox the candidate was trying to escape. The point of tracking is to reduce attention spent, not to redistribute it.',
        'Interrupt for the few things that are genuinely time-sensitive, and batch the rest into a daily summary of what changed. That is the difference between a tool that lowers the anxiety of a job search and one that raises it.',
        'Rejections in particular belong in the digest rather than as an alert. A push notification delivering a rejection is a needlessly unpleasant way to receive news that requires no action, and it is the single easiest thing to get wrong in a product used by people already having a difficult few months.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What access does response tracking need?',
      a: 'As little as possible. A dedicated application address or a scoped read-only label rather than full mailbox permission — a job seeker inbox holds medical, financial and private correspondence.',
    },
    {
      q: 'Which reply categories matter?',
      a: 'Needs attention now, rejection, automated acknowledgement, and not job-related. Finer classification does not change what the candidate does next.',
    },
    {
      q: 'Why are rejections hard to classify?',
      a: 'They are written gently, mixing a decision with encouragement about keeping details on file. Report confidence and route uncertain cases to the person.',
    },
    {
      q: 'Should the agent reply automatically?',
      a: 'No. An auto-acknowledged interview invitation can commit someone to a time they cannot make. Draft in five seconds and let the candidate send.',
    },
    {
      q: 'Why treat "not job-related" as an explicit category?',
      a: 'Because it is what stops the agent processing, storing and summarising personal correspondence it had no business reading.',
    },
    {
      q: 'Should rejections trigger a notification?',
      a: 'No — they belong in the daily digest. A push notification delivering news that requires no action is needlessly unpleasant for someone already having a hard few months.',
    },
  ],
  related: ['how-to-automate-job-application-follow-ups', 'how-to-build-a-job-search-crm-with-ai', 'ai-agent-privacy-resume-data'],
};

export default post;
