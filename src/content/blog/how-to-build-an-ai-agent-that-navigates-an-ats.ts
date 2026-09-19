import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-agent-that-navigates-an-ats',
  tint: 'rose',
  title: 'How to Build an AI Agent That Navigates an ATS Website',
  heading: 'Navigating an applicant tracking system',
  description:
    'What ATS portals have in common, how to detect which one you are on, handling multi-step flows and account walls, and where an agent should stop.',
  keywords: [
    'ats automation agent',
    'navigate ats website',
    'ats detection',
    'multi step application flow',
    'account creation wall',
    'ats form handling',
    'job portal automation',
    'application agent design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Applicant tracking systems are a small number of products dressed in thousands of skins. Detect the product and most of the difficulty disappears.',
  sections: [
    {
      heading: 'Detect the platform first',
      paragraphs: [
        'A handful of systems power most corporate hiring, each customised per employer with a logo and a colour scheme. The layout underneath is broadly stable, which means a generic per-page reasoning approach is doing expensive work that identification would avoid.',
        'Identify from the URL pattern, the markup signature or a known asset path, then load the handler for that platform and fall back to generic reasoning only when detection fails. This cuts both cost and failure rate substantially.',
      ],
      bullets: [
        'URL and host patterns — the cheapest and most reliable signal',
        'Markup fingerprints — stable per platform, not per employer',
        'A per-platform handler with known step order and field semantics',
        'Generic reasoning kept as the fallback path, not the default',
      ],
    },
    {
      heading: 'Model the flow as steps with a known order',
      paragraphs: [
        'Most portals follow the same sequence: account or email, personal details, CV upload with parsed-field correction, work history, screening questions, voluntary disclosures, review, submit. Knowing this lets the agent anticipate rather than rediscover.',
        'Track which step you are on and validate the transition. Landing on an unexpected step means something went wrong — a validation error, a session expiry — and detecting it early is far better than continuing to fill a form that will not submit.',
      ],
    },
    {
      heading: 'The parsed-CV correction step is where quality is won or lost',
      paragraphs: [
        'Many portals parse the uploaded CV and pre-fill fields, usually imperfectly: dates shifted, employers merged, a job title truncated. An agent that accepts the pre-fill submits an application containing errors the candidate never made.',
        'Treat this screen as a reconciliation against the structured profile you already hold, field by field. It is the single highest-value check in the whole flow, because everything downstream is read by a human recruiter as the candidate’s own words.',
      ],
    },
    {
      heading: 'Account walls and multi-factor prompts',
      paragraphs: [
        'Many portals require an account before applying, and some send a verification code. An agent cannot and should not silently create accounts and manage credentials on the candidate’s behalf without them knowing.',
        'Design for the handoff: detect the wall, persist state, ask the person, resume. Anything involving a code sent to their phone or inbox is theirs to complete, and the agent’s job is to make resuming afterwards seamless.',
      ],
    },
    {
      heading: 'Know which questions the agent must not answer',
      paragraphs: [
        'Voluntary disclosure sections — demographics, veteran status, disability — are the candidate’s to answer or decline. An agent filling them in, however plausibly, is making a personal declaration on someone’s behalf.',
        'The same applies to anything legally consequential: sponsorship needs, notice periods, salary expectations, criminal history. Collect these once, explicitly, as stored answers the candidate confirmed — never as something the model infers from a CV.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should an agent reason about every ATS page from scratch?',
      a: 'No. A handful of platforms power most corporate hiring, so detect the platform from the URL or markup fingerprint and use a per-platform handler, keeping generic reasoning as fallback.',
    },
    {
      q: 'Why is the parsed-CV screen so important?',
      a: 'Because portals pre-fill it imperfectly — shifted dates, merged employers, truncated titles — and an agent that accepts it submits errors a recruiter reads as the candidate own words.',
    },
    {
      q: 'How should an agent handle account creation and verification codes?',
      a: 'By stopping. Detect the wall, persist state, hand off to the person, and resume cleanly. Codes sent to their phone or inbox are theirs to complete.',
    },
    {
      q: 'Which ATS questions should an agent never answer?',
      a: 'Voluntary demographic disclosures, and anything legally consequential — sponsorship, notice period, salary expectation, criminal history. Those are stored answers the candidate confirmed, not model inferences.',
    },
  ],
  related: ['how-to-build-a-universal-ats-automation-agent', 'how-applicant-tracking-systems-work', 'how-to-build-an-ai-agent-that-handles-different-forms'],
};

export default post;
