import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-personalized-job-search-profile',
  tint: 'emerald',
  title: 'How to Build a Personalized Job Search Profile Using AI',
  heading: 'The profile everything else depends on',
  description:
    'Designing the candidate profile that powers matching, tailoring and automation: what to store, how to collect it without a long form, and keeping it current.',
  keywords: [
    'job search profile',
    'candidate profile design',
    'structured candidate data',
    'profile enrichment ai',
    'onboarding without forms',
    'preference capture',
    'profile freshness',
    'personalised job search',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Resumes & ATS',
  excerpt:
    'Every downstream feature — matching, tailoring, auto-apply — is limited by this one object. It is usually the least designed part of the product.',
  sections: [
    {
      heading: 'The profile is the substrate',
      paragraphs: [
        'Matching reads it, document generation composes from it, form filling copies from it, recommendations rank against it. A thin profile caps the quality of all four no matter how good the models are.',
        'Which makes it worth designing properly rather than treating it as a signup form. The question is not what fields a profile page usually has, but what every downstream feature will need to ask.',
      ],
    },
    {
      heading: 'Store structure, not documents',
      paragraphs: [
        'A stored CV file is opaque: nothing can be queried, compared or recombined from it. The useful representation is decomposed — roles with dates, achievements with their metrics, skills with the evidence and recency of each.',
        'Parse the CV into that structure once, then treat the structure as the source of truth. Documents become outputs generated from it rather than the thing you keep.',
      ],
      bullets: [
        'Roles: employer, title, dates, scope',
        'Achievements: what changed, by how much, with which technologies',
        'Skills: evidence, last used, depth',
        'Constraints: location, right to work, notice, compensation expectation',
        'Intent: target roles, what they are moving away from',
      ],
    },
    {
      heading: 'Do not ask for it all at once',
      paragraphs: [
        'A twenty-field onboarding form is abandoned, and the fields that do get filled are filled carelessly. Yet the profile needs more than a CV upload gives you.',
        'Collect progressively and in context: parse the CV for the bulk, ask for one constraint at the moment it first matters, ask for a preference right after a dismissal. Each question is cheap because it obviously relates to what the person is doing.',
      ],
    },
    {
      heading: 'Mark what was inferred',
      paragraphs: [
        'Much of a rich profile comes from parsing and inference, and both are fallible. A seniority level inferred from job titles is a guess, and a guess that silently drives matching is a guess nobody can correct.',
        'Keep provenance on every field — stated, parsed, inferred — and let stated values override the rest. Surface the inferences for confirmation rather than acting on them quietly.',
      ],
    },
    {
      heading: 'Profiles go stale quietly',
      paragraphs: [
        'People change jobs, learn things, change what they want. The profile does not update itself, and a stale one degrades everything downstream while looking perfectly complete.',
        'Timestamp fields and prompt for confirmation of the ones that matter when they age. And treat application outcomes as an input: someone consistently applying outside their stated target has told you their target changed.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why is the candidate profile so important?',
      a: 'Matching, document generation, form filling and recommendations all read from it. A thin profile caps the quality of every one of them regardless of model quality.',
    },
    {
      q: 'Should I store the CV file or parsed data?',
      a: 'Parsed structure as the source of truth — roles, achievements with metrics, skills with evidence and recency. A stored file is opaque and cannot be queried or recombined.',
    },
    {
      q: 'How do I collect profile data without a long form?',
      a: 'Progressively and in context: parse the CV for the bulk, ask each constraint when it first matters, and ask for a preference right after a dismissal.',
    },
    {
      q: 'How do I stop a profile going stale?',
      a: 'Timestamp fields and prompt to confirm the important ones as they age. Also treat outcomes as input — applying consistently outside a stated target means the target changed.',
    },
  ],
  related: ['how-to-build-an-ai-resume-parser', 'how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-extract-skills-from-a-resume'],
};

export default post;
