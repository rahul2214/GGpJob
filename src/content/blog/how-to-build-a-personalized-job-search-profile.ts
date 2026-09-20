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
  anchors: ['candidate profile', 'profile freshness'],
  excerpt:
    'Every downstream feature — matching, tailoring, auto-apply — is limited by this one object. It is usually the least designed part of the product.',
  keyTakeaways: [
    'A thin profile caps the quality of matching, generation and form filling regardless of model quality.',
    'Store decomposed structure, not documents; documents become outputs.',
    'Collect progressively and in context rather than through a long onboarding form.',
    'Keep provenance per field — stated beats parsed beats inferred.',
    'Profiles go stale while looking complete; timestamp fields and treat outcomes as input.',
  ],
  sections: [
    {
      heading: 'The profile is the substrate',
      paragraphs: [
        'Matching reads it, document generation composes from it, form filling copies from it, recommendations rank against it. A thin profile caps the quality of all four no matter how good the models are.',
        'Which makes it worth designing properly rather than treating it as a signup form. The question is not what fields a profile page usually has, but what every downstream feature will need to ask.',
        'Working backwards from those features produces a noticeably different schema. Form filling needs values ready to paste; generation needs achievements with metrics attached; matching needs skills with recency and evidence — and none of those are what a conventional profile page collects.',
      ],
    },
    {
      heading: 'Store structure, not documents',
      paragraphs: [
        'A stored CV file is opaque: nothing can be queried, compared or recombined from it. The useful representation is decomposed — roles with dates, achievements with their metrics, skills with the evidence and recency of each.',
        'Parse the CV into that structure once, then treat the structure as the source of truth. Documents become outputs generated from it rather than the thing you keep.',
        'Keep the original file too, but as an artefact rather than a record. Parsers improve and extraction rules change, and re-deriving structure from a stored original is a batch job where asking the candidate to upload again is an admission of failure.',
      ],
      bullets: [
        'Roles: employer, title, dates, scope',
        'Achievements: what changed, by how much, with which technologies',
        'Skills: evidence, last used, depth',
        'Constraints: location, right to work, notice, compensation expectation',
        'Intent: target roles, what they are moving away from',
      ],
      table: {
        caption: 'What each downstream feature needs from the profile',
        columns: ['Feature', 'Needs', 'Fails without it'],
        rows: [
          ['Matching', 'Skills with recency, constraints', 'Recommends ineligible roles'],
          ['Tailoring', 'Achievements with metrics', 'Generic bullets, or invented ones'],
          ['Form filling', 'Paste-ready values', 'Stops on every third field'],
          ['Ranking', 'Stated intent', 'Anchors to the past'],
          ['Interview prep', 'The version sent', 'Cannot reconstruct the conversation'],
        ],
      },
    },
    {
      heading: 'Do not ask for it all at once',
      paragraphs: [
        'A twenty-field onboarding form is abandoned, and the fields that do get filled are filled carelessly. Yet the profile needs more than a CV upload gives you.',
        'Collect progressively and in context: parse the CV for the bulk, ask for one constraint at the moment it first matters, ask for a preference right after a dismissal. Each question is cheap because it obviously relates to what the person is doing.',
        'Dismissals are the richest and cheapest source available. "Not interested" on a surfaced role, with two or three reasons offered as one-tap options, produces more usable preference data in a week than any questionnaire, because the person is answering about something concrete in front of them.',
      ],
    },
    {
      heading: 'Mark what was inferred',
      paragraphs: [
        'Much of a rich profile comes from parsing and inference, and both are fallible. A seniority level inferred from job titles is a guess, and a guess that silently drives matching is a guess nobody can correct.',
        'Keep provenance on every field — stated, parsed, inferred — and let stated values override the rest. Surface the inferences for confirmation rather than acting on them quietly.',
        'Provenance also protects against re-inference overwriting a correction. A candidate who fixed their seniority should not find it silently reset the next time their CV is re-parsed, and the only thing preventing that is knowing which value a person put there.',
      ],
    },
    {
      heading: 'Two things a CV will never tell you',
      paragraphs: [
        'Constraints and intent are absent from every CV ever written, and they are the two things that most determine whether a recommendation is any good. Nothing in a document says someone cannot relocate, needs sponsorship, or is leaving the field the document describes.',
        'Ask for them explicitly and treat them as authoritative. A stated target should outweigh an entire employment history, because the history describes where someone has been and the target describes the only thing the product is for.',
        'Refusals belong here too and are the most under-collected field in this category. Employers to exclude, a sector they will not return to, whether they will take a management role — each takes one tap to state, is impossible to infer, and prevents the recommendations that make people distrust the system.',
      ],
      bullets: [
        'Location, relocation willingness, remote requirements',
        'Right to work, and whether sponsorship is needed',
        'Notice period and earliest realistic start',
        'Compensation floor, stated once',
        'Target roles, and what they are moving away from',
        'Employers and sectors to exclude, with no explanation required',
      ],
    },
    {
      heading: 'Profiles go stale quietly',
      paragraphs: [
        'People change jobs, learn things, change what they want. The profile does not update itself, and a stale one degrades everything downstream while looking perfectly complete.',
        'Timestamp fields and prompt for confirmation of the ones that matter when they age. And treat application outcomes as an input: someone consistently applying outside their stated target has told you their target changed.',
        'Ask at the right moment rather than on a schedule. A confirmation prompt at the start of a session, or when a stale field is about to determine something visible, gets answered; the same question in a notification during the week does not.',
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
      a: 'Parsed structure as the source of truth — roles, achievements with metrics, skills with evidence and recency. Keep the original as an artefact, since parsers improve and re-derivation is a batch job.',
    },
    {
      q: 'How do I collect profile data without a long form?',
      a: 'Progressively and in context: parse the CV for the bulk, ask each constraint when it first matters, and ask for a preference right after a dismissal.',
    },
    {
      q: 'How do I stop a profile going stale?',
      a: 'Timestamp fields and prompt to confirm the important ones as they age. Also treat outcomes as input — applying consistently outside a stated target means the target changed.',
    },
    {
      q: 'What can never be inferred from a CV?',
      a: 'Constraints and intent. Nothing in a document says someone cannot relocate, needs sponsorship, or is leaving the field the document describes — and those decide recommendation quality.',
    },
    {
      q: 'Why does provenance matter on every field?',
      a: 'So a stated value outranks a parsed one, and so a re-parse cannot silently overwrite a correction the candidate made.',
    },
  ],
  related: ['how-to-build-an-ai-resume-parser', 'how-to-build-an-ai-agent-that-learns-your-job-preferences', 'how-to-extract-skills-from-a-resume'],
};

export default post;
