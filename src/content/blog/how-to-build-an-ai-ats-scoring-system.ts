import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-ats-scoring-system',
  tint: 'emerald',
  title: 'How to Build an AI ATS Scoring System',
  heading: 'Scoring candidates responsibly',
  description:
    'Building employer-side scoring that is defensible: what may and may not be used, ranking rather than rejecting, auditability, bias testing and regulatory exposure.',
  keywords: [
    'ats scoring system',
    'candidate ranking ai',
    'hiring algorithm compliance',
    'bias audit hiring',
    'automated decision making',
    'explainable candidate scoring',
    'recruiting ai governance',
    'employer side scoring',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['ATS scoring system', 'candidate ranking'],
  excerpt:
    'This is the one system in the stack where getting it wrong is a legal matter, not just a product one.',
  keyTakeaways: [
    'Scoring that influences hiring brings employment and discrimination law into scope.',
    'Score against this role’s stated requirements, never against resemblance to past hires.',
    'Rank with reasons and leave the decision with a person who genuinely engages.',
    'Log inputs, requirements, per-requirement outcomes and versions — you will be asked.',
    'Bias enters through proxies, so test with matched profiles before launch and on a schedule.',
  ],
  sections: [
    {
      heading: 'Understand what you are building',
      paragraphs: [
        'Employer-side scoring influences whether a person gets a job. That places it under employment law, discrimination law, and — increasingly — specific rules governing automated decision-making in hiring, several of which require bias auditing, candidate notice, or both.',
        'The obligations differ by jurisdiction and change, so treat this as a design constraint you confirm with counsel rather than one you infer from a blog post. What follows is engineering practice, not legal advice.',
        'The engineering consequence is that the requirements arrive early rather than late. Auditability, reproducibility and disclosure are properties of the architecture, and a system built without them cannot be made compliant by adding a settings page afterwards.',
      ],
    },
    {
      heading: 'Score requirements, not resemblance',
      paragraphs: [
        'The tempting design learns from who was hired before, and the result reproduces whatever the past did — including its biases, with better consistency and more confidence.',
        'Score against the stated requirements of this role instead. Did the candidate demonstrate this specific thing, with this evidence. That is defensible, explainable to a candidate, and it does not encode historical hiring patterns.',
        'It also produces a better artefact for the recruiter. A per-requirement breakdown showing what was evidenced and what was not is something a person can act on and disagree with, where a similarity score is a number they can only accept or ignore.',
      ],
      bullets: [
        'Per-requirement evidence, not an overall similarity number',
        'Requirements taken from the posting, fixed before scoring begins',
        'No use of name, photograph, age, address or institution prestige',
        'No learning target derived from past hiring decisions',
      ],
      table: {
        caption: 'Two designs, compared on what matters here',
        columns: ['Property', 'Learned from past hires', 'Scored against requirements'],
        rows: [
          ['Explainable to a candidate', 'No', 'Yes'],
          ['Encodes historical bias', 'Yes, by construction', 'Only via proxies'],
          ['Survives a role changing', 'Poorly', 'Requirements change with it'],
          ['Auditable', 'Hard', 'Straightforward'],
          ['Defensible to a regulator', 'Difficult', 'Reasonable'],
        ],
      },
    },
    {
      heading: 'Rank, do not reject',
      paragraphs: [
        'A system that automatically rejects is making the decision. A system that orders a list and surfaces reasons leaves the decision with a person, which is both a better design and, in several jurisdictions, the difference between permitted and prohibited.',
        'That only holds if the human involvement is real. A recruiter who approves the top twenty without reading is not meaningful review, and designing the interface to encourage genuine engagement is part of the engineering.',
        'Measure whether it is real rather than assuming. How often a recruiter promotes someone the system ranked low, and how often they reject someone it ranked high, are both observable — and if neither ever happens, the ranking is deciding and the human step is documentation.',
      ],
    },
    {
      heading: 'Log enough to answer questions later',
      paragraphs: [
        'You may be asked why a specific candidate was ranked where they were — by that candidate, by a regulator, or by your own team investigating a pattern. Recreating it months afterwards is impossible without a record.',
        'Log the inputs, the extracted requirements, the per-requirement outcomes, the model and prompt version, and the final ordering, per candidate. Retention has its own rules, so take advice on how long — but plan for keeping it.',
        'Reproducibility is the property that makes the log worth keeping. Being able to re-run a scoring decision from eight months ago with the model and prompt of the day is what turns an archive into an answer, and it means versioning both rather than only the code around them.',
      ],
    },
    {
      heading: 'Test for disparate impact deliberately',
      paragraphs: [
        'Bias does not require a protected attribute in the input. Career gaps, university names, address, phrasing conventions and hobbies all correlate with protected characteristics, and a model will use them if they help.',
        'Test with matched profiles differing only in one signal and compare outcomes. Do it before launch and on a schedule afterwards, because model and prompt changes can reintroduce what an earlier test cleared.',
        'Pair that with outcome monitoring on real traffic, because matched-profile testing only finds what you thought to vary. Comparing progression rates by group across actual candidates catches proxies nobody anticipated, which is most of them.',
        'Decide in advance what a failed test triggers. A threshold with no defined consequence becomes a number somebody explains away under delivery pressure, and the time to agree that a material disparity halts a release is before one appears.',
      ],
      bullets: [
        'Matched profiles differing in one signal, run before every release',
        'Outcome monitoring by group on real traffic, continuously',
        'A defined threshold with a defined consequence, agreed in advance',
        'Re-testing after any model or prompt change, without exception',
      ],
    },
    {
      heading: 'Tell candidates what is happening',
      paragraphs: [
        'Disclosure that automated tools are used in screening is required in a growing number of places, and it is reasonable regardless. Candidates broadly accept it; what they object to is discovering it afterwards.',
        'Where the rules require it, provide a route to request human review. Building that path in from the start is considerably easier than adding it once a system is in production.',
        'A review route also has to lead somewhere. Someone must own these requests, be able to see the per-requirement record, and be able to overturn an outcome — otherwise it is a form that generates a reply rather than a remedy.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What makes employer-side scoring different from candidate-side tools?',
      a: 'It influences whether someone gets a job, which brings employment and discrimination law into scope, plus specific automated-decision rules requiring bias audits or candidate notice in several jurisdictions.',
    },
    {
      q: 'Should the model learn from past hiring decisions?',
      a: 'No. It reproduces whatever the past did, including its biases, with more consistency and confidence. Score against the stated requirements of this role instead.',
    },
    {
      q: 'Can the system reject candidates automatically?',
      a: 'Prefer ranking with reasons and a real human decision. Automatic rejection makes the system the decision-maker, which is prohibited in some jurisdictions and indefensible in others.',
    },
    {
      q: 'How does bias enter without protected attributes?',
      a: 'Through proxies — career gaps, university names, address, phrasing. Test with matched profiles differing in one signal, and monitor real outcomes by group for the proxies you did not anticipate.',
    },
    {
      q: 'How do I know the human review is meaningful?',
      a: 'Measure how often a recruiter promotes a low-ranked candidate or rejects a high-ranked one. If neither happens, the ranking is deciding and the human step is documentation.',
    },
    {
      q: 'What does auditability require in practice?',
      a: 'Reproducibility. Re-running a decision from eight months ago with the model and prompt of the day, which means versioning both rather than only the surrounding code.',
    },
  ],
  related: ['how-companies-use-ai-in-hiring', 'how-to-build-an-ai-ats-resume-scorer', 'how-to-evaluate-an-ai-job-matching-model'],
  references: [
    {
      title: 'AI Risk Management Framework',
      url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      publisher: 'NIST',
      note: 'A structure for documenting and reviewing risk in an automated decision system.',
    },
  ],
};

export default post;
