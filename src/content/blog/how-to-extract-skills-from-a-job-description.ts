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
  excerpt:
    'A job description is a wish list written defensively. Treating every item on it as a requirement is why matching systems reject candidates who would have got the job.',
  sections: [
    {
      heading: 'Job descriptions overstate deliberately',
      paragraphs: [
        'Postings are written to filter and to protect. A hiring manager lists everything the role might touch, HR adds standard requirements, and legal adds boilerplate. Very little of it is genuinely mandatory.',
        'A system treating the list literally rejects strong candidates for missing the fourth-most-important item, which is the most common way automated matching becomes worse than no matching.',
      ],
    },
    {
      heading: 'Classify by strength, not just presence',
      paragraphs: [
        'The useful extraction separates requirements into tiers based on how they are expressed. Language carries this reliably: "must have", "required", "essential" differ from "familiarity with", "exposure to", "nice to have", "bonus".',
        'Position matters too. Something appearing in the role summary and again in requirements is more central than something in a long list near the end. Structure is evidence, and a model reading the whole posting can use it.',
      ],
      bullets: [
        'Essential — stated as required, or repeated across sections',
        'Preferred — hedged language, listed among alternatives',
        'Incidental — mentioned once in a long list, or in boilerplate',
        'Implied — not named but obviously needed for the described work',
      ],
    },
    {
      heading: 'Strip the boilerplate',
      paragraphs: [
        'Equal-opportunity statements, benefits paragraphs, company history and application instructions occupy a large share of many postings and contain no requirements at all.',
        'Removing them before extraction improves accuracy and cuts cost. It also prevents an entire class of confusion where a model picks up a skill mentioned in a description of what the company does rather than what the role needs.',
      ],
    },
    {
      heading: 'Normalise to the same taxonomy as the CV side',
      paragraphs: [
        'This sounds obvious and is frequently got wrong: job requirements and candidate skills must be normalised into the same vocabulary, or matching compares incompatible things and silently under-reports.',
        'Use one taxonomy and one alias map for both sides. When a new term appears often enough on either side, add it once and both sides benefit.',
      ],
    },
    {
      heading: 'Capture the non-skill requirements too',
      paragraphs: [
        'Skills get the attention, but the requirements that most often disqualify are elsewhere: location and work model, right to work, security clearance, specific certifications, years in a particular domain.',
        'These are usually more binary than skills and therefore more useful as early filters. Extracting them explicitly lets a matching system rule out an unworkable role before paying to reason about skill overlap.',
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
      a: 'From the language and the structure. "Must have" and "essential" differ from "familiarity with" and "bonus", and anything repeated across the summary and the requirements is more central than a single mention in a long list.',
    },
    {
      q: 'Should I remove boilerplate before extraction?',
      a: 'Yes. Equal-opportunity statements, benefits and company history contain no requirements, cost tokens, and cause the model to pick up skills describing what the company does rather than what the role needs.',
    },
    {
      q: 'What non-skill requirements matter most?',
      a: 'Location and work model, right to work, clearance, certifications and domain-specific experience. They are more binary than skills, which makes them better early filters.',
    },
  ],
  related: ['how-to-extract-skills-from-a-resume', 'how-to-build-an-ai-job-description-parser', 'how-to-build-an-ai-agent-that-scores-job-descriptions'],
};

export default post;
