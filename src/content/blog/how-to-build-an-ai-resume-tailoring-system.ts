import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-resume-tailoring-system',
  tint: 'emerald',
  title: 'How to Build an AI Resume Tailoring System',
  heading: 'A resume tailoring system',
  description:
    'The system design behind tailoring at scale: a canonical source of truth, versioning per application, diffing, and keeping every variant defensible.',
  keywords: [
    'ai resume tailoring system',
    'resume versioning',
    'tailored cv generation',
    'resume source of truth',
    'cv variant management',
    'resume diff review',
    'automated cv tailoring',
    'resume system design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Generating one tailored CV is a prompt. Generating hundreds and still knowing what each one claimed is a system, and the difference is version control.',
  sections: [
    {
      heading: 'One canonical profile, many renderings',
      paragraphs: [
        'The mistake that makes tailoring unmanageable is treating each generated CV as a document. You end up with fifty files, no idea which claimed what, and no way to correct an error everywhere it appeared.',
        'Model it as one structured profile — the candidate’s actual history, the source of truth — plus a rendering step that selects and orders from it for a given posting. A tailored CV is then a view, not a new document.',
      ],
    },
    {
      heading: 'What tailoring is allowed to change',
      paragraphs: [
        'Define this explicitly in the system rather than leaving it to the prompt. The allowed operations are selection, ordering and rephrasing; everything else is out of scope by construction.',
        'With the boundary encoded, "did this tailoring invent something" becomes a check you can run rather than a judgement someone has to make on every output.',
      ],
      bullets: [
        'Select — which roles and bullets to include',
        'Order — what leads, given what the posting emphasises',
        'Rephrase — same fact, vocabulary matched to the posting',
        'Never — new facts, new employers, new numbers, changed dates',
      ],
    },
    {
      heading: 'Version every variant against its job',
      paragraphs: [
        'Store each generated CV with the job it was made for, the profile version it came from, and the exact rendered output. Not a regeneratable reference — the actual artefact, because models change and you must be able to show what was sent.',
        'This is what lets a candidate answer "what did I claim to these people" months later, which is the question that matters when an interview is booked.',
      ],
    },
    {
      heading: 'Diff, do not re-read',
      paragraphs: [
        'Nobody proofreads their hundredth tailored CV. Presenting the full document for review guarantees it stops being read early, and the one with an error slips through.',
        'Show the diff against the canonical profile instead: these three bullets were reworded, this summary was rewritten, these roles were dropped. A reviewer checks that in seconds and will actually notice the line that drifted.',
      ],
    },
    {
      heading: 'Propagate corrections upstream',
      paragraphs: [
        'When a candidate edits a tailored variant, that edit usually reveals something about the canonical profile — a fact stated badly, a missing achievement, a wrong emphasis.',
        'Offer to apply it to the source rather than only to that variant. Otherwise the same correction gets made repeatedly against every future rendering, which is exactly the tedium the system was meant to remove.',
      ],
    },
    {
      heading: 'Keep the formatting boring',
      paragraphs: [
        'Tailoring is about content, and it is tempting to let the system produce elaborate layouts too. Resist it: many of these documents pass through parsers, and unusual layouts are where parsing fails.',
        'Generate structured content and render through a small number of known-parseable templates. The tailoring earns its value in what the document says, not in how it looks.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How should tailored resumes be stored?',
      a: 'As versions against a single canonical profile, each recorded with the job it was made for and the exact rendered output — not as fifty separate documents with no record of what each claimed.',
    },
    {
      q: 'What should tailoring be allowed to change?',
      a: 'Selection, ordering and rephrasing only. New facts, employers, numbers or dates are out of scope by construction, which turns "did it invent something" into a check rather than a judgement.',
    },
    {
      q: 'Why show a diff instead of the full CV?',
      a: 'Because nobody proofreads their hundredth document. A diff against the canonical profile is checkable in seconds, and the reviewer actually notices the line that drifted.',
    },
    {
      q: 'What happens when a candidate edits a variant?',
      a: 'Offer to apply the change upstream to the canonical profile. Otherwise the same correction has to be made again on every future rendering.',
    },
  ],
  related: ['how-to-reduce-hallucinations-in-ai-resume-generation', 'how-ai-can-create-job-specific-resume-versions', 'how-to-automatically-rewrite-a-resume-for-every-job'],
};

export default post;
