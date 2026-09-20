import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-automatically-rewrite-a-resume-for-every-job',
  tint: 'emerald',
  title: 'How to Automatically Rewrite a Resume for Every Job',
  heading: 'Per-job resume rewriting',
  description:
    'Building automatic tailoring that changes emphasis without changing facts: a structured source of truth, selection over generation, and verifying every claim.',
  keywords: [
    'automatic resume rewriting',
    'tailored resume generation',
    'resume per job',
    'structured resume data',
    'selection vs generation',
    'resume fact verification',
    'ai resume tailoring',
    'resume versioning',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Resumes & ATS',
  anchors: ['rewrite a resume', 'source of truth'],
  excerpt:
    'Tailoring should change what is emphasised, not what is true. The architecture is what enforces that, not the prompt.',
  keyTakeaways: [
    'Generate from a structured record, never by rewriting the previous document.',
    'Selection and ordering do most of the work; generation only phrases what selection chose.',
    'Verification is machine-checkable when the source is structured — use that.',
    'A wholly model-written CV reads like every other one, which is its own signal.',
    'Store the exact document sent; it is both the interview reference and the only feedback you get.',
  ],
  sections: [
    {
      heading: 'Rewrite from structured data, not from the document',
      paragraphs: [
        'Handing a model a CV and a posting and asking for a tailored version is how facts drift. Each rewrite is a fresh interpretation of prose, and dates, titles and figures mutate slightly with every pass.',
        'Keep a structured source of truth — roles, dates, achievements with their metrics, skills with evidence — and generate documents from it. The facts then live in fields that do not change, and the model composes rather than reinterprets.',
        'The drift is worst when versions are chained. Tailoring version eleven from version ten, which came from version nine, compounds small mutations until a job title has quietly changed and nobody can point to when — which is exactly the failure a single canonical record eliminates.',
      ],
    },
    {
      heading: 'Selection does most of the work',
      paragraphs: [
        'Good tailoring is mostly about what you leave out and what you lead with. The same career, ordered differently and trimmed differently, reads as a different candidate to two different employers — without a single altered fact.',
        'So the first pass is selection: which achievements are relevant to this posting, in what order, at what length. Only then does generation phrase the selected items. Teams that start with generation end up fighting hallucination they created themselves.',
        'Selection is also cheap and inspectable in a way generation is not. Scoring each achievement against the extracted requirements is deterministic enough to debug, and when a version emphasises the wrong thing you can see immediately whether selection or phrasing was at fault.',
      ],
      bullets: [
        'Score each achievement against the posting requirements',
        'Select and order by relevance, trim to a realistic length',
        'Generate phrasing only for the selected items',
        'Verify every generated line against the structured record',
      ],
      table: {
        caption: 'Who does what',
        columns: ['Step', 'Mechanism', 'Why not the model'],
        rows: [
          ['Extract requirements', 'Model', 'Genuine language work'],
          ['Score achievements', 'Deterministic', 'Inspectable and cheap'],
          ['Choose and order', 'Deterministic', 'Must be explainable'],
          ['Phrase the selected items', 'Model', 'This is what it is for'],
          ['Insert dates, titles, figures', 'Copied', 'Never let it write a fact'],
          ['Verify claims', 'Deterministic', 'A model checking itself agrees'],
        ],
      },
    },
    {
      heading: 'Verify, do not trust',
      paragraphs: [
        'Even with structured input, generated text can invent a detail — a team size, a percentage, a technology that was not in the record. It will be plausible, which is precisely why it survives review.',
        'Run a verification pass that checks each claim against the source data and rejects anything unsupported. This is a machine-checkable property when the source is structured, and it is the difference between an automated document and a liability.',
        'Watch for inflation as well as invention. "Contributed to" becoming "led", "helped migrate" becoming "owned the migration" — these introduce no new facts and change what the candidate is claiming, and they are the version of this problem that a naive claim-matching check will miss.',
      ],
    },
    {
      heading: 'Keep the person recognisable',
      paragraphs: [
        'A CV rewritten wholesale by a model reads like every other model-written CV: the same rhythms, the same verbs, the same shape. Recruiters reading hundreds of these have started to spot the pattern, and it reads as effort avoided rather than effort spent.',
        'Preserve the candidate’s phrasing where it works. Change emphasis, order and length; change the words only where the original genuinely obscures something relevant.',
        'A reasonable default is to leave a bullet alone unless there is a specific reason to touch it. Rewriting everything on every application maximises both the drift risk and the sameness, and it buys nothing over rewriting the three lines that actually needed to change for this posting.',
      ],
    },
    {
      heading: 'What "requirements" actually means in the extraction step',
      paragraphs: [
        'The quality of the whole pipeline depends on how well the posting is parsed, and postings are not written to be parsed. Responsibilities, requirements, nice-to-haves and company boilerplate are interleaved, and the same requirement often appears three times in different words.',
        'Extract to a normalised list with a weight, rather than a flat set of strings. A skill named in the job title and repeated in the responsibilities matters more than one item in a bulleted list of twelve, and a selection step that treats them equally will lead with the wrong thing.',
        'Deduplicate by meaning, not by string. A posting asking for "Kubernetes", "container orchestration" and "K8s experience" has stated one requirement three times, and counting it three times distorts every score downstream.',
      ],
      example: {
        title: 'One posting, one record, one document',
        paragraphs: [
          'Extraction reads the posting and produces eight weighted requirements. Two are named in the title and carry the most weight; three are repetitions of each other and collapse to one; two sit under "nice to have" and are weighted near zero.',
          'Scoring runs each of the candidate’s thirty-one recorded achievements against those requirements. Nine score above the threshold, spread across three of their five roles.',
          'Selection takes the top two per role, orders them by weight, and trims the oldest role to a single line. Generation receives that ordered list with instructions to phrase each item — and receives no dates, no titles and no figures, because those are copied in afterwards.',
          'Verification compares each produced line to its source achievement, rejects one that upgraded "contributed to" into "led", and regenerates it. The document is stored against the application, unchanged from that moment on.',
        ],
      },
    },
    {
      heading: 'Version and keep what was sent',
      paragraphs: [
        'Once documents are generated per application, each one differs, and the candidate will be interviewed against a specific version. Not knowing which is a real problem in a real conversation.',
        'Store the exact document sent with the application record, permanently. It is also what lets you improve — comparing which tailoring choices preceded responses is the only feedback this system will ever get.',
        'Store the selection alongside the file, not just the file. Knowing which achievements were chosen and in what order is what makes the comparison across applications meaningful, and it costs a few fields to record at the moment the document is produced.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why rewrite from structured data instead of the CV document?',
      a: 'Because each prose rewrite is a fresh interpretation, and dates, titles and figures drift with every pass. Structured fields hold the facts steady while the model composes.',
    },
    {
      q: 'What does good tailoring actually change?',
      a: 'Emphasis, order and length — not facts. The same career, selected and ordered differently, reads as a different candidate to two employers without a single altered claim.',
    },
    {
      q: 'How do I stop generated resumes inventing details?',
      a: 'Run a verification pass that checks every claim against the structured source and rejects the unsupported. With structured input this is machine-checkable, unlike a prompt asking for honesty.',
    },
    {
      q: 'Should I keep the generated versions?',
      a: 'Yes, stored with the application record. The candidate will be interviewed against one specific version, and comparing versions against responses is the only feedback the system gets.',
    },
    {
      q: 'What does a claim check miss?',
      a: 'Inflation. "Contributed to" becoming "led" introduces no new fact and changes what is being claimed, so verification has to compare strength as well as content.',
    },
    {
      q: 'How should posting requirements be extracted?',
      a: 'As a weighted, meaning-deduplicated list. A requirement in the job title outranks one item in a list of twelve, and the same skill named three ways is one requirement.',
    },
  ],
  related: ['how-ai-can-create-job-specific-resume-versions', 'how-to-build-an-ai-resume-tailoring-system', 'how-to-reduce-hallucinations-in-ai-resume-generation'],
};

export default post;
