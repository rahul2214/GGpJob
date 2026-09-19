import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-linkedin-outreach-assistant',
  tint: 'amber',
  title: 'How to Build an AI LinkedIn Outreach Assistant',
  heading: 'Outreach on a platform you do not control',
  description:
    'The constraints that define this problem: platform terms, automation detection, account risk, and the assist-rather-than-automate design that avoids them.',
  keywords: [
    'linkedin outreach assistant',
    'linkedin automation risk',
    'platform terms of service',
    'automation detection',
    'account ban risk',
    'assistive automation',
    'professional network outreach',
    'compliant outreach tool',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'The technical question is how to automate this. The answer is that you largely should not, and the interesting design is what you build instead.',
  sections: [
    {
      heading: 'The terms are the binding constraint',
      paragraphs: [
        'Major professional networks prohibit automated access, scraping and unauthorised tools in their terms of service, and they enforce it. This is not a grey area you can engineer around — it is a stated condition of using the platform.',
        'The consequence lands on your user, not on you. Their account is the one restricted or removed, along with their network and their history, and for many people that account is a substantial professional asset.',
      ],
    },
    {
      heading: 'Detection is better than people assume',
      paragraphs: [
        'Automation is identified from behavioural patterns, not just from a user agent string: timing regularity, action sequences, volume distributions, session characteristics. Randomised delays and headless browser tweaks do not hide the shape of a script.',
        'Tools that promise undetectable automation are selling something they cannot deliver, and the person who bears the outcome is the candidate whose account disappears.',
      ],
      bullets: [
        'Timing regularity across actions',
        'Volumes and sequences no person produces',
        'Session and device fingerprint consistency',
        'Patterns visible across accounts using the same tool',
      ],
    },
    {
      heading: 'Assist instead of automate',
      paragraphs: [
        'Almost all the value here does not require touching the platform. Draft the message from the candidate’s profile and the role. Track who was contacted and when. Suggest who to contact and why. Remind about follow-ups.',
        'The user then sends it themselves, in two seconds, as a human action on a platform they are entitled to use. They get the drafting and the tracking; nobody gets their account restricted.',
      ],
    },
    {
      heading: 'Use the official routes where they exist',
      paragraphs: [
        'Where a platform offers a sanctioned API, use it within its stated limits, and accept that those limits are usually narrower than what an automation tool would do. That narrowness is the point.',
        'Building on a sanctioned integration means your product does not depend on evading detection, which is the only version of this that is still working in two years.',
      ],
    },
    {
      heading: 'Be honest with users about the risk',
      paragraphs: [
        'If you do build anything that touches a platform in ways its terms do not permit, the user deserves to know clearly what they are risking before they connect their account — not in a clause nobody reads.',
        'Most will choose the assistive version once the trade-off is stated plainly. Presenting it as a routine feature, and letting them discover the risk when their account is gone, is the part that is genuinely indefensible.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is automating LinkedIn outreach allowed?',
      a: 'No. Major professional networks prohibit automated access and unauthorised tools in their terms, and they enforce it — against your user account, not your product.',
    },
    {
      q: 'Can automation be made undetectable?',
      a: 'Not reliably. Detection uses behavioural patterns — timing regularity, action sequences, volume distributions — that randomised delays do not hide.',
    },
    {
      q: 'What can you build instead?',
      a: 'An assistant: draft the message from the profile and role, track who was contacted, suggest who to contact and why, remind about follow-ups. The user sends it themselves in seconds.',
    },
    {
      q: 'What if I build it anyway?',
      a: 'Then tell the user plainly what they are risking before they connect their account. Most choose the assistive version once the trade-off is stated.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'how-to-build-an-ai-follow-up-agent', 'how-to-safely-give-ai-agents-browser-access'],
};

export default post;
