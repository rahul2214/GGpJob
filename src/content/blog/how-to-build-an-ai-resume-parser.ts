import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-resume-parser',
  tint: 'emerald',
  title: 'How to Build an AI Resume Parser',
  heading: 'Building a resume parser',
  description:
    'Turning CV files into structured data: why PDF extraction is the hard part, handling two-column layouts, dates and headings, and validating what you extracted.',
  keywords: [
    'ai resume parser',
    'build resume parser',
    'cv parsing ai',
    'pdf resume extraction',
    'resume to structured data',
    'resume parsing accuracy',
    'docx resume parser',
    'resume data extraction',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['resume parser', 'extraction before intelligence'],
  excerpt:
    'The model is the easy part. Getting readable text out of a two-column PDF is where resume parsers actually fail.',
  keyTakeaways: [
    'A PDF describes marks on a page, so reading order is luck rather than structure.',
    'Handle DOCX through its own structure; converting to PDF discards what you were given.',
    'Ask for a strict schema and treat a validation failure as a parse failure.',
    'Dates drive experience, gaps and seniority, so subtle errors become confident nonsense.',
    'Candidate corrections are both the authority and your best evaluation data.',
  ],
  sections: [
    {
      heading: 'Extraction before intelligence',
      paragraphs: [
        'Teams start by choosing a model and discover the real problem is upstream: a PDF is a description of where marks go on a page, not a document with structure. Text extraction returns something in reading order only by luck.',
        'A two-column CV is the classic failure. Extract naively and you get a line of the left column followed by a line of the right, interleaved into nonsense — and no model, however good, recovers the intended meaning from that reliably.',
        'The worst version is quieter than nonsense. Sometimes the interleaving produces something that still reads as a plausible CV, with a job title from the sidebar sitting under the wrong employer — structurally valid, entirely wrong, and invisible until an interviewer asks about it.',
      ],
    },
    {
      heading: 'Handle the formats separately',
      paragraphs: [
        'DOCX is structured and comparatively easy: paragraphs, styles and tables are all addressable, and heading styles often tell you the sections directly. Take advantage of that rather than converting to PDF first, which throws away information you were given.',
        'PDF needs layout-aware extraction that preserves coordinates, so you can detect columns by clustering text blocks horizontally before reading them. Scanned CVs need OCR and should be flagged as lower confidence throughout.',
        'Passing an awkward document directly to a model that reads it visually is a legitimate fallback for the cases that defeat extraction. Use it as an escalation rather than the default, since text extraction is far cheaper and correct for the majority.',
      ],
      bullets: [
        'DOCX — use the document structure; do not convert to PDF',
        'PDF — layout-aware extraction with coordinates, detect columns first',
        'Scanned PDF — OCR, and mark every downstream field lower confidence',
        'Reject or escalate what you cannot read rather than guessing',
      ],
      table: {
        caption: 'Formats and what goes wrong',
        columns: ['Format', 'Approach', 'Failure to watch'],
        rows: [
          ['DOCX', 'Read the structure directly', 'Tables used for layout'],
          ['Single-column PDF', 'Text extraction', 'Rarely fails'],
          ['Two-column PDF', 'Cluster by coordinates first', 'Plausible interleaving'],
          ['Scanned PDF', 'OCR, low confidence', 'Confident misreadings'],
          ['Design-heavy PDF', 'Visual read', 'Text inside images'],
        ],
      },
    },
    {
      heading: 'Where the model earns its place',
      paragraphs: [
        'Once you have text in sensible reading order, extraction into structure is genuinely well suited to a model. CVs have no standard: headings vary, dates come in a dozen formats, and the same information appears in prose or bullets.',
        'Ask for a strict schema and validate the response rather than trusting it. Employment entries with a title, employer, start and end, and a list of bullets; education similarly; skills as a flat list. Anything that fails validation is a parse failure, not a value to store.',
        'Validate the domain as well as the shape. An end date before a start date, an employment period of forty years, or a graduation date in the future are all schema-valid and obviously wrong, and catching them here is far cheaper than discovering them in a seniority calculation.',
      ],
    },
    {
      heading: 'Dates are harder than they look',
      paragraphs: [
        'Real CVs contain "Jan 2020 – Present", "2019-2021", "March 2018 to date", "Summer 2017", and ranges that overlap because someone held two roles at once. Normalising this is fiddly and worth doing carefully, because everything downstream depends on it.',
        'Years of experience, career gaps and seniority inference all derive from dates. A parser that gets them subtly wrong produces a profile that is confidently misleading in every subsequent calculation.',
        'Ambiguous numeric formats deserve particular caution. A date written 03/04/2021 means different months depending on the locale assumed, and a one-month error becomes an inconsistency a background check flags later — so preserve the original string alongside the parsed value and mark the ambiguity rather than resolving it silently.',
        'Overlaps are usually real rather than a parse error. Concurrent contracts, a promotion recorded as two entries and part-time work alongside a main role are all normal, and a parser that "corrects" them is deleting true information.',
      ],
    },
    {
      heading: 'Validate against the source',
      paragraphs: [
        'The failure worth guarding against is invention: a model filling a missing employer name with a plausible one, or inferring a degree that is not stated. This is rare and severe, because the fabricated value looks exactly like a real one.',
        'Check that extracted values actually appear in the source text. Anything that does not is either a parse artefact or an invention, and both should be flagged rather than stored silently.',
        'Keep the raw extracted text as well as the structure. Schemas change and parsers improve, and re-deriving from a stored original is a batch job where asking every candidate to upload again is an admission of failure.',
      ],
    },
    {
      heading: 'Let the candidate correct it',
      paragraphs: [
        'No parser is accurate enough to be the final word on someone’s own history. Show what was extracted, make it editable, and treat corrections as the authoritative version.',
        'Corrections are also your best evaluation data. A field the candidate edits often is a field your parser handles badly, and that signal is far more useful than an accuracy figure measured on a sample you assembled yourself.',
        'Show the parsed structure rather than the extracted text. A wall of text is skimmed and approved; roles, dates and employers laid out as fields is where someone actually notices that a title has landed under the wrong company.',
        'Mark provenance so a correction survives. A field the candidate fixed must not be silently overwritten the next time their CV is re-parsed, and knowing which values a person set is the only thing that prevents it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the hardest part of building a resume parser?',
      a: 'Text extraction, not the model. A PDF describes marks on a page rather than a structured document, so a two-column CV extracts as interleaved nonsense unless you detect columns first.',
    },
    {
      q: 'Should I convert DOCX files to PDF before parsing?',
      a: 'No. DOCX carries structure — paragraphs, styles, tables — that tells you where sections are. Converting to PDF discards information you were handed for free.',
    },
    {
      q: 'How do I stop the parser inventing values?',
      a: 'Verify that each extracted value actually appears in the source text. Anything that does not is either a parse artefact or a fabrication, and both should be flagged rather than stored.',
    },
    {
      q: 'Why do dates matter so much in a resume parser?',
      a: 'Because years of experience, career gaps and seniority all derive from them. Subtly wrong dates produce a profile that is confidently misleading in every downstream calculation.',
    },
    {
      q: 'Should overlapping employment dates be corrected?',
      a: 'No. Concurrent contracts, promotions recorded as two entries and part-time work alongside a main role are normal, and correcting them deletes true information.',
    },
    {
      q: 'How should the extraction be shown for review?',
      a: 'As the parsed structure, not the extracted text. A wall of text gets skimmed; fields laid out as roles and dates is where someone notices a title under the wrong employer.',
    },
  ],
  related: ['how-to-extract-skills-from-a-resume', 'how-to-build-an-ai-job-description-parser', 'how-to-build-an-ai-resume-gap-analyzer'],
};

export default post;
