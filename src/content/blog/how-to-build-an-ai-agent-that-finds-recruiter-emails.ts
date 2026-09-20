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
  anchors: ['recruiter email addresses', 'email discovery'],
  excerpt:
    'Guessing an address from a name pattern is the standard approach, and it is wrong on three separate counts.',
  keyTakeaways: [
    'A work address identifying a named person is personal data in many jurisdictions.',
    'Pattern guessing bounces, collides, and delivers job search mail to strangers.',
    'Exhaust the channel the posting offered before attempting discovery at all.',
    'Record the source and date with every address, or you cannot answer a deletion request.',
    'The agent must be able to conclude that no contact is available.',
  ],
  sections: [
    {
      heading: 'Start with the legal position',
      paragraphs: [
        'In the EU, the UK and a growing number of other jurisdictions, a work email address identifying a named person is personal data. Collecting it, storing it and using it for outreach are each regulated activities with obligations attached — a lawful basis, a notice, and a right to object.',
        'This is not a footnote to bolt on later. It shapes what the system may store, for how long, and what it must do when someone asks. Building first and considering it afterwards usually means rebuilding.',
        'The obligations are concrete enough to design against. Be able to say where an address came from and when, be able to delete it on request within the required window, honour an objection permanently rather than for a cooling-off period, and be able to tell someone what you hold about them.',
      ],
    },
    {
      heading: 'Why guessing is the wrong approach',
      paragraphs: [
        'Pattern-based generation — first.last, first initial plus surname — is what most tools do, and it fails three ways. It bounces, and bounce rates damage domain reputation for everyone on the platform. It reaches the wrong person when the pattern collides with a different employee. And an unverified guess is a claim, not a contact.',
        'The third failure is the most damaging in practice: a message about someone’s job search landing in a stranger’s inbox at their company. That is a privacy incident the candidate never authorised and cannot undo.',
        'The reputation cost compounds in a way individual users never see. Sustained bounces from a shared sending domain degrade deliverability for every legitimate message the platform sends, so one aggressive feature quietly reduces the effectiveness of everything else the product does.',
      ],
      bullets: [
        'Unverified addresses bounce, and bounces are a shared cost',
        'Pattern collisions deliver to the wrong colleague',
        'Misdelivered job search mail is a real privacy harm',
        'Never store a guessed address as if it were known',
      ],
      table: {
        caption: 'Sources, ranked',
        columns: ['Source', 'Acceptable', 'Note'],
        rows: [
          ['Application form on the posting', 'Yes', 'Consented by definition'],
          ['Address stated in the posting', 'Yes', 'Intended for this purpose'],
          ['Company contact page', 'Yes', 'Published deliberately'],
          ['A recruiter’s own published profile', 'Yes', 'Record where and when'],
          ['Scraped in breach of terms', 'No', 'Liability travels with the data'],
          ['Purchased list, unclear provenance', 'No', 'No lawful basis you can evidence'],
          ['Guessed from a name pattern', 'No', 'A claim, not a contact'],
        ],
      },
    },
    {
      heading: 'Prefer the channel that was offered',
      paragraphs: [
        'Most postings give a route: an application form, a stated contact address, a careers inbox, sometimes a named recruiter with published contact details. That route is consented contact by definition, and it reaches someone whose job is to read it.',
        'An agent should exhaust these before attempting discovery at all. Bypassing an offered channel to reach someone privately is rarely received the way the sender imagined.',
        'It usually works better, too, which makes this an easy argument. A message through the stated channel arrives where someone is looking for it; the same message to a personal address arrives as an intrusion, and the second is less likely to get a reply even when it is read.',
      ],
    },
    {
      heading: 'Use published sources and record where it came from',
      paragraphs: [
        'Company contact pages, the posting itself and a recruiter’s own published profile are legitimate sources. Scraping platforms in breach of their terms, or buying scraped databases of unclear provenance, is not — and the second brings liability along with the data.',
        'Store the source and the date with every address. Without provenance you cannot answer a deletion request properly, you cannot tell verified from guessed, and you cannot defend how you obtained it.',
        'Record a confidence alongside it and never let the two collapse. An address read from a posting and an address inferred from a pattern must be distinguishable forever, because the moment they are stored identically, the system has lost the ability to behave differently about them.',
      ],
    },
    {
      heading: 'Suppression and the right to object',
      paragraphs: [
        'A suppression list is the single most important piece of state in this system. Anyone who asks not to be contacted goes on it permanently, checked before generation rather than before sending, so no message is ever produced for a suppressed recipient.',
        'Make it global rather than per user. If a recruiter has asked one candidate’s agent not to contact them, honouring that only for that candidate means the platform keeps contacting them through everyone else, which is precisely the behaviour the objection was about.',
        'Detect the informal objection as well as the formal one. "Please stop", a bounce marked as a complaint, or a reply asking who gave you the address are all objections, and a system that only recognises a formal opt-out link will keep sending.',
        'Rate limits belong beside it. Even legitimate contact becomes harassment at volume, and a per-recipient cap — never more than one unanswered message, never again within a quarter — costs nothing and prevents the pattern that makes a platform unwelcome.',
      ],
    },
    {
      heading: 'Verify, and accept not finding it',
      paragraphs: [
        'Verification before sending — that the domain accepts mail and the address exists — reduces bounces substantially. It does not confirm you have the right person, which no technical check can.',
        'And the agent must be allowed to conclude that no contact is available. The alternative is a system whose fallback is always a guess, which guarantees the failure mode you were trying to avoid.',
        'Make that outcome useful rather than a dead end. Reporting that no verified contact exists and offering the application form instead is a complete answer, and it is the honest version of what the tool was asked to do.',
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
      a: 'Stop and say so, then offer the application form. A system whose fallback is always a guess guarantees exactly the bounces and misdeliveries it was meant to avoid.',
    },
    {
      q: 'Should the suppression list be global or per user?',
      a: 'Global. Honouring an objection only for one candidate means the platform keeps contacting that person through everyone else, which is what they objected to.',
    },
    {
      q: 'What counts as an objection?',
      a: '"Please stop", a complaint-marked bounce, or a reply asking who gave you the address. A system that only recognises a formal opt-out link will keep sending.',
    },
  ],
  related: ['how-to-build-an-ai-recruiter-outreach-agent', 'how-to-build-an-ai-cold-email-agent', 'ai-agent-privacy-resume-data'],
};

export default post;
