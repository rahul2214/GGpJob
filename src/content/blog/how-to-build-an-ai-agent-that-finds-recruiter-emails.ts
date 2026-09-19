import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-finds-recruiter-emails',
  tint: 'amber',
  title: 'How to Build an AI Agent That Finds Recruiter Email Addresses',
  heading: 'Finding a contact, legitimately',
  description:
    'The legal and practical limits on finding recruiter contact details, why guessing addresses is a bad idea, and what a responsible implementation looks like.',
  keywords: [
    'find recruiter email',
    'email discovery agent',
    'contact enrichment legality',
    'email pattern guessing',
    'gdpr contact data',
    'bounce rate reputation',
    'ethical data collection',
    'recruiter contact finder',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Guessing an address from a name pattern is the standard approach, and it is wrong on three separate counts.',
  sections: [
    {
      heading: 'Start with the legal position',
      paragraphs: [
        'In the EU, the UK and a growing number of other jurisdictions, a work email address identifying a named person is personal data. Collecting it, storing it and using it for outreach are each regulated activities with obligations attached — a lawful basis, a notice, and a right to object.',
        'This is not a footnote to bolt on later. It shapes what the system may store, for how long, and what it must do when someone asks. Building first and considering it afterwards usually means rebuilding.',
      ],
    },
    {
      heading: 'Why guessing is the wrong approach',
      paragraphs: [
        'Pattern-based generation — first.last, first initial plus surname — is what most tools do, and it fails three ways. It bounces, and bounce rates damage domain reputation for everyone on the platform. It reaches the wrong person when the pattern collides with a different employee. And an unverified guess is a claim, not a contact.',
        'The third failure is the most damaging in practice: a message about someone’s job search landing in a stranger’s inbox at their company. That is a privacy incident the candidate never authorised and cannot undo.',
      ],
      bullets: [
        'Unverified addresses bounce, and bounces are a shared cost',
        'Pattern collisions deliver to the wrong colleague',
        'Misdelivered job search mail is a real privacy harm',
        'Never store a guessed address as if it were known',
      ],
    },
    {
      heading: 'Prefer the channel that was offered',
      paragraphs: [
        'Most postings give a route: an application form, a stated contact address, a careers inbox, sometimes a named recruiter with published contact details. That route is consented contact by definition, and it reaches someone whose job is to read it.',
        'An agent should exhaust these before attempting discovery at all. Bypassing an offered channel to reach someone privately is rarely received the way the sender imagined.',
      ],
    },
    {
      heading: 'Use published sources and record where it came from',
      paragraphs: [
        'Company contact pages, the posting itself and a recruiter’s own published profile are legitimate sources. Scraping platforms in breach of their terms, or buying scraped databases of unclear provenance, is not — and the second brings liability along with the data.',
        'Store the source and the date with every address. Without provenance you cannot answer a deletion request properly, you cannot tell verified from guessed, and you cannot defend how you obtained it.',
      ],
    },
    {
      heading: 'Verify, and accept not finding it',
      paragraphs: [
        'Verification before sending — that the domain accepts mail and the address exists — reduces bounces substantially. It does not confirm you have the right person, which no technical check can.',
        'And the agent must be allowed to conclude that no contact is available. The alternative is a system whose fallback is always a guess, which guarantees the failure mode you were trying to avoid.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is a work email address personal data?',
      a: 'If it identifies a named person, yes in the EU, UK and many other jurisdictions. Collecting, storing and using it each carry obligations — a lawful basis, a notice and a right to object.',
    },
    {
      q: 'What is wrong with guessing email patterns?',
      a: 'It bounces and damages shared domain reputation, it collides with other employees, and a misdelivered message about someone job search is a privacy harm they never authorised.',
    },
    {
      q: 'What sources are acceptable?',
      a: 'The posting, company contact pages and a recruiter own published profile. Scraping in breach of terms or buying databases of unclear provenance brings liability with the data.',
    },
    {
      q: 'What should the agent do when no address is found?',
      a: 'Stop and say so. A system whose fallback is always a guess guarantees exactly the bounces and misdeliveries it was meant to avoid.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'how-to-build-an-ai-cold-email-agent', 'ai-agent-privacy-resume-data'],
};

export default post;
