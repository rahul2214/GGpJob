import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-cold-email-agent',
  tint: 'amber',
  title: 'How to Build an AI Cold Email Agent for Job Search',
  heading: 'A cold email agent, built carefully',
  description:
    'The sending infrastructure, consent and suppression handling, follow-up rules, reputation protection, and the regulations that apply to automated outreach.',
  keywords: [
    'cold email agent',
    'automated job search email',
    'email sending infrastructure',
    'suppression list',
    'follow up sequence',
    'sender reputation',
    'can-spam gdpr outreach',
    'outreach automation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Generating the message is the easy tenth of this. The other nine tenths is sending infrastructure and the rules you enforce on yourself.',
  sections: [
    {
      heading: 'Know which rules apply to you',
      paragraphs: [
        'Automated email is regulated, and differently by jurisdiction. Several regimes require a clear sender identity, an accurate subject line, a working opt-out and prompt honouring of it. Others require a lawful basis for processing the recipient’s data at all, and impose penalties that are not nominal.',
        'You will not know which apply from the recipient’s address alone, so build to the strictest requirements you are likely to face. Retrofitting consent handling onto a running system is considerably harder than designing for it.',
      ],
    },
    {
      heading: 'Suppression is the most important data structure',
      paragraphs: [
        'One list, checked before every send, that nothing bypasses. Anyone who opted out, anyone who complained, anyone who bounced repeatedly, and any domain that has asked not to be contacted.',
        'It must be global rather than per user. If one candidate’s agent is told to stop and another’s contacts the same person next week, you have not honoured the opt-out — you have merely rotated who violated it.',
      ],
      bullets: [
        'Global across all users of the platform',
        'Checked in the send path, not the composition path',
        'Permanent, with no expiry or re-permission flow',
        'Including hard bounces and complaint reports',
      ],
    },
    {
      heading: 'Protect the sending reputation',
      paragraphs: [
        'Reputation is a shared asset and it degrades fast. Authenticate the domain properly, start at low volume and increase gradually, and keep message content varied enough that it does not fingerprint as bulk.',
        'Monitor bounce and complaint rates continuously with automatic stops at defined thresholds. Once mail from your domain is being filtered, recovery takes weeks and affects every user, including the careful ones.',
      ],
    },
    {
      heading: 'Follow up once, maybe',
      paragraphs: [
        'Sales cadences of five or six touches are inappropriate here. This is one person asking another about a job, and the fifth unanswered message is harassment rather than persistence.',
        'One follow-up after a reasonable interval is defensible. After that, silence is an answer. Enforce it in code, because an agent optimising for replies will always argue for one more attempt.',
      ],
    },
    {
      heading: 'Send as the candidate, honestly',
      paragraphs: [
        'The message goes out under a real person’s name. It must accurately identify them, and it must not create the impression of a human individually composing each one if that is not what happened.',
        'Where a recipient could reasonably reply expecting a person, a person must receive that reply. An agent that sends but does not deliver responses back to the candidate promptly has manufactured a conversation nobody is having.',
      ],
    },
    {
      heading: 'Volume is the wrong lever',
      paragraphs: [
        'Cold outreach in a job search works because the sender has something specific to say to a specific person. Multiply it and both halves of that disappear, while the metrics — messages sent — improve.',
        'Cap it low, and measure reply rate rather than send count. A falling reply rate at rising volume means the system is burning a shared resource, and the correct response is to slow down rather than to send more.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What regulations apply to automated job search emails?',
      a: 'Several regimes require a clear sender identity, an accurate subject, a working opt-out and prompt honouring of it; others require a lawful basis for processing the recipient data. Build to the strictest.',
    },
    {
      q: 'How should a suppression list work?',
      a: 'One global list checked in the send path, permanent, covering opt-outs, complaints and hard bounces. Per-user lists do not honour an opt-out — they rotate who violates it.',
    },
    {
      q: 'How many follow-ups are appropriate?',
      a: 'One, after a reasonable interval. Sales cadences of five or six touches become harassment in a job search context, and the limit belongs in code.',
    },
    {
      q: 'Should volume be increased if replies are low?',
      a: 'No. A falling reply rate at rising volume means the system is burning a shared resource. Measure reply rate, not sends, and slow down.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'how-to-automate-personalized-recruiter-emails', 'how-to-build-an-ai-follow-up-agent'],
};

export default post;
