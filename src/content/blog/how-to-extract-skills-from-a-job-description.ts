import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-extract-skills-from-a-job-description',
  tint: 'emerald',
  title: 'How to Extract Skills From a Job Description Using AI',
  heading: 'Extracting skills from a posting',
  description:
    'Separating what a job genuinely requires from what it lists hopefully, handling boilerplate, and producing requirements a matching system can actually use.',
  keywords: [
    'extract skills from job description',
    'job description parsing ai',
    'required vs preferred skills',
    'job requirements extraction',
    'jd skill parsing',
    'job posting nlp',
    'requirement classification',
    'job description analysis',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['extract skills', 'classify by strength'],
  excerpt:
    'A job description is a wish list written defensively. Treating every item on it as a requirement is why matching systems reject candidates who would have got the job.',
  keyTakeaways: [
    'Postings overstate deliberately, and literal treatment is how matching becomes harmful.',
    'Language and position both carry requirement strength reliably.',
    'Strip boilerplate before extraction — it costs tokens and causes false skills.',
    'Both sides of a match must normalise into the same vocabulary.',
    'The requirements that disqualify most often are not skills at all.',
  ],
  sections: [
    {
      heading: 'Job descriptions overstate deliberately',
      paragraphs: [
        'Postings are written to filter and to protect. A hiring manager lists everything the role might touch, HR adds standard requirements, and legal adds boilerplate. Very little of it is genuinely mandatory.',
        'A system treating the list literally rejects strong candidates for missing the fourth-most-important item, which is the most common way automated matching becomes worse than no matching.',
        'Deduplicate by meaning before counting anything. A posting asking for "Kubernetes", "container orchestration" and "K8s experience" has stated one requirement three times, and treating it as three distorts every score built on the result.',
      ],
    },
    {
      heading: 'Classify by strength, not just presence',
      paragraphs: [
        'The useful extraction separates requirements into tiers based on how they are expressed. Language carries this reliably: "must have", "required", "essential" differ from "familiarity with", "exposure to", "nice to have", "bonus".',
        'Position matters too. Something appearing in the role summary and again in requirements is more central than something in a long list near the end. Structure is evidence, and a model reading the whole posting can use it.',
        'Default to preferred where the language is ambiguous. Over-filtering a candidate who would have got the job is a far more damaging error than including a role that turns out to be a stretch, and the asymmetry should be encoded rather than left to whichever way the model leans.',
      ],
      bullets: [
        'Essential — stated as required, or repeated across sections',
        'Preferred — hedged language, listed among alternatives',
        'Incidental — mentioned once in a long list, or in boilerplate',
        'Implied — not named but obviously needed for the described work',
      ],
      table: {
        caption: 'Reading strength from the posting',
        columns: ['Signal', 'Tier', 'Note'],
        rows: [
          ['In the job title', 'Essential', 'The strongest signal available'],
          ['"Must have", "required"', 'Essential', 'Explicit'],
          ['Repeated across sections', 'Essential', 'Structure as evidence'],
          ['"Familiarity with", "bonus"', 'Preferred', 'Hedged by design'],
          ['One item among twelve', 'Incidental', 'Rarely screened on'],
          ['A round number of years', 'Preferred', 'Almost never literal'],
        ],
      },
    },
    {
      heading: 'Strip the boilerplate',
      paragraphs: [
        'Equal-opportunity statements, benefits paragraphs, company history and application instructions occupy a large share of many postings and contain no requirements at all.',
        'Removing them before extraction improves accuracy and cuts cost. It also prevents an entire class of confusion where a model picks up a skill mentioned in a description of what the company does rather than what the role needs.',
        'That confusion is specific and common. A posting from a company that "builds machine learning infrastructure" for a frontend role will yield machine learning as a requirement unless the company description is removed, and nothing downstream can tell that the extraction was wrong.',
      ],
    },
    {
      heading: 'Normalise to the same taxonomy as the CV side',
      paragraphs: [
        'This sounds obvious and is frequently got wrong: job requirements and candidate skills must be normalised into the same vocabulary, or matching compares incompatible things and silently under-reports.',
        'Use one taxonomy and one alias map for both sides. When a new term appears often enough on either side, add it once and both sides benefit.',
        'Be careful with the direction of an equivalence. "Built data pipelines" supports ETL; ETL does not support "built distributed systems", and an alias map applied symmetrically will eventually credit a candidate with something they cannot defend.',
        'Keep the original term alongside the normalised one. Normalisation is lossy, and an explanation that names the requirement as the posting phrased it is far more convincing than one written in your internal vocabulary.',
      ],
    },
    {
      heading: 'Capture the non-skill requirements too',
      paragraphs: [
        'Skills get the attention, but the requirements that most often disqualify are elsewhere: location and work model, right to work, security clearance, specific certifications, years in a particular domain.',
        'These are usually more binary than skills and therefore more useful as early filters. Extracting them explicitly lets a matching system rule out an unworkable role before paying to reason about skill overlap.',
        'Watch for contradictions between them, because postings contain them routinely. A role labelled remote with a stated office requirement three paragraphs later is common enough that the extractor should flag the conflict rather than silently picking one.',
      ],
    },
    {
      heading: 'Evaluate the extractor, not just the matcher',
      paragraphs: [
        'Extraction sits upstream of everything, so its errors present as bad matching. A team debugging poor recommendations without an extraction evaluation is looking for the fault in the wrong layer.',
        'Keep a labelled set of real postings with expected requirements and tiers, and run it on every prompt or model change. Extraction degrades silently: the output stays well-shaped while the content drifts, and nothing errors.',
        'Measure per field rather than overall. Skill extraction may be excellent while remote policy is unreliable, and one accuracy figure averages away the distinction between a solved problem and an unsolved one.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why not treat every listed skill as required?',
      a: 'Because postings are written defensively and list everything the role might touch. Treating the list literally rejects candidates who would have got the job — the commonest way automated matching becomes harmful.',
    },
    {
      q: 'How do I tell required from preferred?',
      a: 'From the language and the structure — and default to preferred when ambiguous, since over-filtering is the more damaging error.',
    },
    {
      q: 'Should I remove boilerplate before extraction?',
      a: 'Yes. A frontend role at a company that "builds machine learning infrastructure" will yield machine learning as a requirement unless the company description is stripped.',
    },
    {
      q: 'What non-skill requirements matter most?',
      a: 'Location and work model, right to work, clearance, certifications and domain experience — and flag the contradictions between them rather than picking one silently.',
    },
    {
      q: 'Should the same skill named three ways count three times?',
      a: 'No. Deduplicate by meaning first, or one requirement stated repeatedly distorts every score computed from the extraction.',
    },
    {
      q: 'How do I know my extractor has not regressed?',
      a: 'A labelled set of real postings with expected requirements and tiers, run on every change, measured per field rather than overall.',
    },
  ],
  related: ['how-to-extract-skills-from-a-resume', 'how-to-build-an-ai-job-description-parser', 'how-to-build-an-ai-agent-that-scores-job-descriptions'],
};

export default post;
