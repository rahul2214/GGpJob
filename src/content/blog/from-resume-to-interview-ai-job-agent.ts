import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'from-resume-to-interview-ai-job-agent',
  tint: 'violet',
  title: 'From Resume to Interview: How an AI Job Agent Can Automate the Process',
  heading: 'CV in, interview out',
  description:
    'Following one CV through a complete agent pipeline to an interview, with the decisions, handoffs and failure points at each stage made explicit.',
  keywords: [
    'resume to interview automation',
    'ai job agent pipeline',
    'application journey',
    'agent handoff points',
    'interview preparation ai',
    'end to end job agent',
    'automated application process',
    'job agent walkthrough',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Following a single CV through the whole pipeline makes the design decisions concrete, including the three places a person has to be involved.',
  sections: [
    {
      heading: 'The CV becomes structured data',
      paragraphs: [
        'The document is parsed into roles, dates, achievements with their metrics, and skills with evidence. From this point the file is an artefact; the structure is the source of truth.',
        'Errors here propagate everywhere — a mis-parsed date becomes a wrong employment history on forty applications — so this is the step that deserves a human check before anything else runs.',
      ],
    },
    {
      heading: 'Targets are confirmed, not inferred',
      paragraphs: [
        'The agent proposes roles the profile supports and the candidate confirms or adjusts. That confirmation becomes the authority for everything downstream.',
        'Skipping this produces a search anchored to the past, which is precisely wrong for anyone changing direction — and they are the people who most need the help.',
      ],
    },
    {
      heading: 'Discovery, filtering and scoring',
      paragraphs: [
        'The agent searches several sources, deduplicates by employer and role, filters on eligibility as a hard gate, and ranks what remains against the confirmed target.',
        'The expensive scoring runs only on the shortlist. Postings that look stale, reposted repeatedly or unserious are flagged rather than hidden, so the candidate sees the concern and decides.',
      ],
      bullets: [
        'Multiple sources, deduplicated on identity not URL',
        'Eligibility as a gate, never as a weight',
        'Cheap ranking first, careful scoring on the shortlist',
        'Concerns surfaced, not silently filtered',
      ],
    },
    {
      heading: 'Documents, then the first hard stop',
      paragraphs: [
        'For selected roles the agent plans what to emphasise, generates from the structured record, and verifies every claim against it. Anything unsupported is removed rather than softened.',
        'Then it stops. The candidate sees the complete application — every field, document and free-text answer — and confirms. This is the control that makes the rest of the pipeline safe to run.',
      ],
    },
    {
      heading: 'Submission and tracking',
      paragraphs: [
        'The agent navigates the portal, fills fields from the structured profile, verifies each step, and submits on confirmation. The exact documents sent are stored against the application.',
        'It then watches for responses, classifies them, updates state and surfaces what needs attention. Ambiguous replies go to the candidate rather than being acted on.',
      ],
    },
    {
      heading: 'Interview preparation, and the handover',
      paragraphs: [
        'When an interview is scheduled, the agent assembles what is useful: the exact CV version sent, the posting’s requirements, the company summary, what was written in the free-text answers, likely questions.',
        'And that is where it stops for good. The interview is a person evaluating a person, and everything after it — the conversation, the negotiation, the decision — belongs to the candidate.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Where does the pipeline need a human?',
      a: 'Three places: checking the parsed CV, confirming the target roles, and confirming each application before submission. Everything else can run unattended.',
    },
    {
      q: 'Why check the parsed CV first?',
      a: 'Because errors propagate. A mis-parsed date becomes a wrong employment history on forty applications, and nothing downstream will catch it.',
    },
    {
      q: 'What does the agent do after submitting?',
      a: 'Stores the exact documents sent, watches for responses, classifies them and updates state — routing anything ambiguous to the candidate rather than acting on it.',
    },
    {
      q: 'Where does the agent stop?',
      a: 'At interview preparation. It assembles the CV version sent, the requirements and likely questions; the conversation and everything after belong to the candidate.',
    },
  ],
  related: ['building-an-end-to-end-autonomous-job-search-system', 'how-ai-agents-search-and-apply-for-jobs', 'the-complete-architecture-of-an-ai-job-application-platform'],
};

export default post;
