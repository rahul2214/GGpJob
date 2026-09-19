import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-career-gap-analyzer',
  tint: 'emerald',
  title: 'How to Build an AI Career Gap Analyzer',
  heading: 'Analysing gaps in a career',
  description:
    'Detecting and framing employment gaps responsibly: what counts as a gap, why penalising them is both unfair and unlawful in places, and what to build instead.',
  keywords: [
    'career gap analyzer',
    'employment gap detection',
    'career break cv',
    'gap explanation resume',
    'hiring bias career breaks',
    'cv timeline analysis',
    'career break framing',
    'responsible hiring ai',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'Resumes & ATS',
  excerpt:
    'A tool that detects employment gaps is one design decision away from being a tool that discriminates against carers and the recently ill.',
  sections: [
    {
      heading: 'Be clear what you are building',
      paragraphs: [
        'There are two products here and they are easy to confuse. One helps a candidate present a break in their own words. The other helps an employer screen candidates by their breaks. The second is a discrimination engine, whatever it is called internally.',
        'Decide which you are building and design accordingly. If the output is ever consumed by an employer as a signal, you have built the second one regardless of intent.',
      ],
    },
    {
      heading: 'Gaps mean many different things',
      paragraphs: [
        'The common causes are caring for a child or a relative, illness, redundancy in a bad market, study, relocation, visa processing, military service, and starting something that did not work out. These correlate strongly with characteristics protected by employment law in many countries.',
        'A system that treats a gap as a negative signal therefore produces disparate impact on carers, disabled people and others, and in several jurisdictions that is unlawful whether or not anyone intended it.',
      ],
      bullets: [
        'Never score a gap as a negative in a matching or ranking system',
        'Do not infer a reason for a gap — you will be wrong and it will be sensitive',
        'Do not surface gap detection to employers as a screening signal',
        'Measure whether your matching penalises broken timelines, because it may',
      ],
    },
    {
      heading: 'Detection should serve the candidate',
      paragraphs: [
        'Identifying a period with no listed role is straightforward. The useful thing to do with it is ask the candidate whether they want to account for it, and help them do so in one honest line if they do.',
        'Often the gap was not empty — freelance work, study, a side project, caring while keeping skills current. Prompting for that is genuinely helpful, and it is the candidate’s choice whether to include it.',
      ],
    },
    {
      heading: 'Help with framing, not with concealment',
      paragraphs: [
        'There is a real difference between presenting a break clearly and disguising it. Stretching dates to hide a gap is a factual misrepresentation that surfaces during reference checks, and a tool suggesting it is setting the candidate up.',
        'The good version is a short, plain, honest statement: a career break for caring responsibilities, with a return date. Most employers accept this readily; the ones that do not were never going to be persuaded by a date adjustment.',
      ],
    },
    {
      heading: 'Check your own system for the bias',
      paragraphs: [
        'Even with none of this built deliberately, a matching model trained or tuned on historical outcomes may have learned to rank continuous timelines higher, because past hiring did.',
        'Test for it explicitly: take matched candidate profiles differing only in a break, and compare the scores. If they differ, that is a defect in your system, and one you are unlikely to discover any other way.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Should a career gap analyser flag gaps to employers?',
      a: 'No. Gaps correlate with caring, illness and other protected characteristics, so surfacing them as a screening signal produces disparate impact — unlawful in several jurisdictions regardless of intent.',
    },
    {
      q: 'What is the legitimate version of this tool?',
      a: 'One that serves the candidate: detect a period with no listed role, ask whether they want to account for it, and help them write one honest line if they do.',
    },
    {
      q: 'Should a tool help hide an employment gap?',
      a: 'No. Stretching dates is a factual misrepresentation that surfaces in reference checks. A short plain statement of a career break is accepted by most employers.',
    },
    {
      q: 'Could my matching model penalise gaps without me building that?',
      a: 'Yes, if it learned from historical outcomes. Test with matched profiles differing only in a break and compare scores — you will not find it any other way.',
    },
  ],
  related: ['how-to-build-an-ai-resume-gap-analyzer', 'how-companies-use-ai-in-hiring', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
