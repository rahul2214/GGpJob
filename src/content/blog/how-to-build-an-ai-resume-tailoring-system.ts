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
  anchors: ['tailoring system', 'canonical profile'],
  excerpt:
    'Generating one tailored CV is a prompt. Generating hundreds and still knowing what each one claimed is a system, and the difference is version control.',
  keyTakeaways: [
    'A tailored CV is a view over one canonical profile, not a new document.',
    'Encode what tailoring may change, so "did it invent something" becomes a check.',
    'Store the actual artefact, because a regenerated document is a different document.',
    'Show the diff — nobody proofreads their hundredth CV.',
    'Push corrections upstream, or the same fix gets made on every future rendering.',
  ],
  sections: [
    {
      heading: 'One canonical profile, many renderings',
      paragraphs: [
        'The mistake that makes tailoring unmanageable is treating each generated CV as a document. You end up with fifty files, no idea which claimed what, and no way to correct an error everywhere it appeared.',
        'Model it as one structured profile — the candidate’s actual history, the source of truth — plus a rendering step that selects and orders from it for a given posting. A tailored CV is then a view, not a new document.',
        'It also stops the drift that chained rewriting produces. Tailoring version eleven from version ten compounds small mutations until a job title has quietly changed and nobody can say when, and rendering from one record eliminates that entirely.',
      ],
    },
    {
      heading: 'What tailoring is allowed to change',
      paragraphs: [
        'Define this explicitly in the system rather than leaving it to the prompt. The allowed operations are selection, ordering and rephrasing; everything else is out of scope by construction.',
        'With the boundary encoded, "did this tailoring invent something" becomes a check you can run rather than a judgement someone has to make on every output.',
        'Encoding it means the fixed fields are copied rather than generated. A model that never writes a date cannot get a date wrong, which is a stronger guarantee than any instruction telling it to be careful with dates.',
      ],
      bullets: [
        'Select — which roles and bullets to include',
        'Order — what leads, given what the posting emphasises',
        'Rephrase — same fact, vocabulary matched to the posting',
        'Never — new facts, new employers, new numbers, changed dates',
      ],
      table: {
        caption: 'The variability contract',
        columns: ['Element', 'May change', 'Produced by'],
        rows: [
          ['Summary', 'Yes, per role', 'Generation'],
          ['Which achievements appear', 'Yes', 'Selection'],
          ['Their order', 'Yes', 'Ranking against the posting'],
          ['Their wording', 'Within limits', 'Generation, then verified'],
          ['Employer, title, dates', 'Never', 'Copied'],
          ['Metrics and credentials', 'Never', 'Copied'],
        ],
      },
    },
    {
      heading: 'Version every variant against its job',
      paragraphs: [
        'Store each generated CV with the job it was made for, the profile version it came from, and the exact rendered output. Not a regeneratable reference — the actual artefact, because models change and you must be able to show what was sent.',
        'This is what lets a candidate answer "what did I claim to these people" months later, which is the question that matters when an interview is booked.',
        'Store the selection alongside the file. Knowing which achievements were chosen and in what order is what makes comparison across applications meaningful, and it is a few fields recorded at the moment of generation rather than an analysis afterwards.',
      ],
    },
    {
      heading: 'Diff, do not re-read',
      paragraphs: [
        'Nobody proofreads their hundredth tailored CV. Presenting the full document for review guarantees it stops being read early, and the one with an error slips through.',
        'Show the diff against the canonical profile instead: these three bullets were reworded, this summary was rewritten, these roles were dropped. A reviewer checks that in seconds and will actually notice the line that drifted.',
        'Flag what could not be verified rather than leaving the reviewer to spot it. A line the system could not trace to the structured record should arrive marked, because that is the one sentence on the screen that genuinely needs a person to decide.',
        'Watch the approval rate as a signal about the review itself. If every variant is approved in two seconds, the diff is either too long or the queue is, and the control has become decoration.',
      ],
    },
    {
      heading: 'Propagate corrections upstream',
      paragraphs: [
        'When a candidate edits a tailored variant, that edit usually reveals something about the canonical profile — a fact stated badly, a missing achievement, a wrong emphasis.',
        'Offer to apply it to the source rather than only to that variant. Otherwise the same correction gets made repeatedly against every future rendering, which is exactly the tedium the system was meant to remove.',
        'Keep already-sent documents immutable when the profile changes. A correction should affect future renderings and never the record of what was actually submitted, or the system quietly rewrites history a candidate may have to account for.',
      ],
    },
    {
      heading: 'Keep the formatting boring',
      paragraphs: [
        'Tailoring is about content, and it is tempting to let the system produce elaborate layouts too. Resist it: many of these documents pass through parsers, and unusual layouts are where parsing fails.',
        'Generate structured content and render through a small number of known-parseable templates. The tailoring earns its value in what the document says, not in how it looks.',
        'Two-column templates are the specific thing to avoid. Text extracts in the document’s internal order rather than the visual one, so a job title from the sidebar lands under the wrong employer — structurally valid output that is completely wrong and silent about it.',
        'Test the templates the way an employer’s system will read them. Extracting text from your own rendered PDF and checking it comes back in the right order takes an afternoon and is the only way to know the layout is safe.',
      ],
    },
  ],
  faqs: [
    {
      q: 'How should tailored resumes be stored?',
      a: 'As versions against a single canonical profile, each recorded with the job it was made for, the selection used, and the exact rendered output — not as fifty separate documents.',
    },
    {
      q: 'What should tailoring be allowed to change?',
      a: 'Selection, ordering and rephrasing only. New facts, employers, numbers or dates are out of scope by construction, which turns "did it invent something" into a check rather than a judgement.',
    },
    {
      q: 'Why show a diff instead of the full CV?',
      a: 'Because nobody proofreads their hundredth document. A diff against the canonical profile is checkable in seconds, with unverifiable lines flagged rather than left to spot.',
    },
    {
      q: 'What happens when a candidate edits a variant?',
      a: 'Offer to apply the change upstream to the canonical profile — while keeping already-sent documents immutable, so the record of what was submitted never changes.',
    },
    {
      q: 'Which template layouts should be avoided?',
      a: 'Two-column ones. Text extracts in the document internal order rather than the visual one, producing a valid-looking CV with content under the wrong headings.',
    },
    {
      q: 'How do I know a template is parser-safe?',
      a: 'Extract text from your own rendered output and check the reading order. It takes an afternoon and it is the only way to find out before an employer does.',
    },
  ],
  related: ['how-to-reduce-hallucinations-in-ai-resume-generation', 'how-ai-can-create-job-specific-resume-versions', 'how-to-automatically-rewrite-a-resume-for-every-job'],
};

export default post;
