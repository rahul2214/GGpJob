import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-recruiter-outreach-agent',
  tint: 'amber',
  title: 'How to Build an AI Recruiter Outreach Agent',
  heading: 'Outreach that is not spam',
  description:
    'Building an outreach agent responsibly: who to contact, consent and deliverability, message quality gates, volume limits and measuring the right thing.',
  keywords: [
    'recruiter outreach agent',
    'ai outreach automation',
    'cold outreach job search',
    'email deliverability',
    'outreach volume limits',
    'personalised outreach',
    'outreach compliance',
    'candidate outreach ai',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['recruiter outreach agent', 'outreach that is not spam'],
  excerpt:
    'The technology for automated outreach is trivial. Everything that determines whether it works — or gets your domain blocked — is policy.',
  keyTakeaways: [
    'Cold contact can be legitimate, and the line is a design decision made explicitly or by accident.',
    'If the agent cannot state why this specific person, it should not send.',
    'Deliverability is shared: one aggressive user damages every other user’s mail.',
    'The quality gate is whether the message would be wrong sent to someone else.',
    'Measure replies, not sends — volume metrics reward what destroys the channel.',
  ],
  sections: [
    {
      heading: 'Be honest about what this is',
      paragraphs: [
        'Automated outreach to people who did not ask to hear from you is cold contact, and building it without acknowledging that leads to systems that harm the person sending as much as the person receiving.',
        'It can still be legitimate. A candidate contacting a named recruiter about a role that recruiter is advertising is reasonable contact. The same system sending two hundred messages a day to anyone with "recruiter" in their title is not, and the line between them is a design decision you make explicitly or by accident.',
        'It matters commercially as well as ethically, because both sides of the line are available in the same codebase. A product that drifts across it does not usually decide to; it raises a cap, adds a fallback, relaxes a gate, and arrives somewhere nobody chose.',
      ],
    },
    {
      heading: 'Contact the right person, or nobody',
      paragraphs: [
        'Targeting quality determines everything downstream. A message to someone who does not hire for this area is noise however well written, and enough of it damages the sender’s reputation and the platform’s.',
        'Require a real basis for contact: they posted this role, they lead this team, they wrote about this problem. If the agent cannot state why this specific person, it should not send.',
        'Prefer the channel the posting offered before attempting discovery at all. An application form or a stated contact address is consented contact by definition and reaches someone whose job is to read it, where a private address found elsewhere arrives as an intrusion.',
      ],
      bullets: [
        'A stated connection to the role or team',
        'A verified address, never a guessed one',
        'An honest declared identity — the candidate, not a fake persona',
        'An easy way to decline that is actually honoured',
      ],
      table: {
        caption: 'Legitimate contact, and what is not',
        columns: ['Situation', 'Acceptable', 'Why'],
        rows: [
          ['Named contact on the posting', 'Yes', 'Consented by definition'],
          ['Hiring manager for this team', 'Usually', 'A real basis exists'],
          ['Someone who wrote about this problem', 'Usually', 'Specific and relevant'],
          ['Anyone titled "recruiter"', 'No', 'No basis for this person'],
          ['A guessed address', 'No', 'Bounces, or reaches a stranger'],
          ['Someone who declined before', 'Never', 'Permanent, platform-wide'],
        ],
      },
    },
    {
      heading: 'Deliverability is a real constraint',
      paragraphs: [
        'Bulk similar messages from one domain get filtered, and once a domain is classified as a source of unwanted mail, recovering is slow and painful. This affects every user of the platform, not just the one who over-sent.',
        'Authenticate properly, keep volumes low, warm up gradually, and monitor bounce and complaint rates as a hard stop rather than a dashboard metric. A single aggressive user can damage delivery for everyone.',
        'Keep cold outreach on a different sending domain from transactional mail. A bad week on the first should not start filtering password resets and application confirmations, and separating them is a configuration decision rather than an engineering project.',
        'Sending from the candidate’s own address is usually better for everyone. It arrives as a person rather than a platform, replies reach them directly, and the reputation consequences land where the behaviour is.',
      ],
    },
    {
      heading: 'Gate on quality, and mean it',
      paragraphs: [
        'A generated message that could have been sent to anyone will be treated as what it is. The gate is specificity: does it name this role, does it cite a concrete piece of the candidate’s experience, would it be wrong if sent to someone else.',
        'If the answer to the last question is no, the message is a template and should not be sent. Applying that test rejects a lot of output, which is the point.',
        'Implement the gate in code over the gathered facts rather than as a self-assessment. A model asked whether its own message is specific enough will say yes, which is the same reason every other guardrail sits outside the thing it constrains.',
      ],
    },
    {
      heading: 'Limit volume in code',
      paragraphs: [
        'A prompt asking the agent to be considerate is not a limit. Caps on messages per day, per company and per recipient belong in the sending layer, along with a suppression list that survives everything.',
        'Once someone declines, they are done — permanently, across the platform, regardless of which user’s agent contacts them. Honouring that is both a legal requirement in many jurisdictions and the single behaviour that separates outreach from spam.',
        'Recognise the informal decline as well as the formal one. "Please stop", a complaint-marked bounce, and a reply asking where you got the address are all objections, and a system honouring only an unsubscribe link will keep contacting someone who has clearly asked it not to.',
        'Check the suppression list before composing rather than before sending. Generating a message for a suppressed recipient costs tokens, produces something that must never go out, and only has to leak once through a bug to become a real violation.',
      ],
    },
    {
      heading: 'Measure replies, not sends',
      paragraphs: [
        'Volume metrics reward exactly the behaviour that destroys the channel. A system optimising for messages sent will send more and worse ones, and the numbers will look excellent while the outcomes decay.',
        'Track reply rate, positive reply rate and complaint rate. If reply rate falls as volume rises, the system is consuming a finite resource — the willingness of recruiters to read cold messages — and should slow down.',
        'The number worth managing against is conversations started per week. Five good messages producing two conversations beat two hundred producing one, and only that metric makes the difference visible rather than flattering the wrong system.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is automated recruiter outreach legitimate?',
      a: 'It can be. Contacting a named recruiter about a role they are advertising is reasonable; sending two hundred messages a day to anyone titled recruiter is not. The line is a design decision.',
    },
    {
      q: 'Why does deliverability matter so much?',
      a: 'Bulk similar messages get filtered, and a domain classified as a spam source recovers slowly. One aggressive user can damage delivery for every user of the platform.',
    },
    {
      q: 'What quality gate should outreach messages pass?',
      a: 'Would the message be wrong if sent to someone else? If not, it is a template. Implement the check in code, since a model judging its own output will approve it.',
    },
    {
      q: 'How should opt-outs be handled?',
      a: 'Permanently and platform-wide, recognising informal objections as well as unsubscribe clicks, and checked before composing rather than before sending.',
    },
    {
      q: 'Should outreach share a sending domain with transactional mail?',
      a: 'No. A bad week on cold outreach should not start filtering password resets and application confirmations.',
    },
    {
      q: 'What number should the product manage against?',
      a: 'Conversations started per week. Five good messages producing two conversations beat two hundred producing one, and sends alone cannot show that.',
    },
  ],
  related: ['how-to-build-an-ai-cold-email-agent', 'how-to-automate-personalized-recruiter-emails', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;
