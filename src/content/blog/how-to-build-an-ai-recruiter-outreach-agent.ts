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
  excerpt:
    'The technology for automated outreach is trivial. Everything that determines whether it works — or gets your domain blocked — is policy.',
  sections: [
    {
      heading: 'Be honest about what this is',
      paragraphs: [
        'Automated outreach to people who did not ask to hear from you is cold contact, and building it without acknowledging that leads to systems that harm the person sending as much as the person receiving.',
        'It can still be legitimate. A candidate contacting a named recruiter about a role that recruiter is advertising is reasonable contact. The same system sending two hundred messages a day to anyone with "recruiter" in their title is not, and the line between them is a design decision you make explicitly or by accident.',
      ],
    },
    {
      heading: 'Contact the right person, or nobody',
      paragraphs: [
        'Targeting quality determines everything downstream. A message to someone who does not hire for this area is noise however well written, and enough of it damages the sender’s reputation and the platform’s.',
        'Require a real basis for contact: they posted this role, they lead this team, they wrote about this problem. If the agent cannot state why this specific person, it should not send.',
      ],
      bullets: [
        'A stated connection to the role or team',
        'A verified address, never a guessed one',
        'An honest declared identity — the candidate, not a fake persona',
        'An easy way to decline that is actually honoured',
      ],
    },
    {
      heading: 'Deliverability is a real constraint',
      paragraphs: [
        'Bulk similar messages from one domain get filtered, and once a domain is classified as a source of unwanted mail, recovering is slow and painful. This affects every user of the platform, not just the one who over-sent.',
        'Authenticate properly, keep volumes low, warm up gradually, and monitor bounce and complaint rates as a hard stop rather than a dashboard metric. A single aggressive user can damage delivery for everyone.',
      ],
    },
    {
      heading: 'Gate on quality, and mean it',
      paragraphs: [
        'A generated message that could have been sent to anyone will be treated as what it is. The gate is specificity: does it name this role, does it cite a concrete piece of the candidate’s experience, would it be wrong if sent to someone else.',
        'If the answer to the last question is no, the message is a template and should not be sent. Applying that test rejects a lot of output, which is the point.',
      ],
    },
    {
      heading: 'Limit volume in code',
      paragraphs: [
        'A prompt asking the agent to be considerate is not a limit. Caps on messages per day, per company and per recipient belong in the sending layer, along with a suppression list that survives everything.',
        'Once someone declines, they are done — permanently, across the platform, regardless of which user’s agent contacts them. Honouring that is both a legal requirement in many jurisdictions and the single behaviour that separates outreach from spam.',
      ],
    },
    {
      heading: 'Measure replies, not sends',
      paragraphs: [
        'Volume metrics reward exactly the behaviour that destroys the channel. A system optimising for messages sent will send more and worse ones, and the numbers will look excellent while the outcomes decay.',
        'Track reply rate, positive reply rate and complaint rate. If reply rate falls as volume rises, the system is consuming a finite resource — the willingness of recruiters to read cold messages — and should slow down.',
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
      a: 'Would the message be wrong if sent to someone else? If not, it is a template. That test rejects a lot of generated output, which is the point.',
    },
    {
      q: 'How should opt-outs be handled?',
      a: 'Permanently and platform-wide, regardless of which user agent contacts that person. It is a legal requirement in many places and the behaviour that separates outreach from spam.',
    },
  ],
  related: ['how-to-build-an-ai-cold-email-agent', 'how-to-automate-personalized-recruiter-emails', 'how-ai-can-personalize-recruiter-messages-at-scale'],
};

export default post;
