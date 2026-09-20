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
  anchors: ['career gap analyzer', 'employment gaps'],
  excerpt:
    'A tool that detects employment gaps is one design decision away from being a tool that discriminates against carers and the recently ill.',
  keyTakeaways: [
    'Two products live here: one serves the candidate, the other screens them. Know which you built.',
    'Gap causes correlate with protected characteristics, so penalising gaps produces disparate impact.',
    'Detection is easy; the useful act is asking the candidate whether they want to account for it.',
    'Help with honest framing, never with concealment — stretched dates surface in reference checks.',
    'Your matching model may already penalise broken timelines; test with matched profiles.',
  ],
  sections: [
    {
      heading: 'Be clear what you are building',
      paragraphs: [
        'There are two products here and they are easy to confuse. One helps a candidate present a break in their own words. The other helps an employer screen candidates by their breaks. The second is a discrimination engine, whatever it is called internally.',
        'Decide which you are building and design accordingly. If the output is ever consumed by an employer as a signal, you have built the second one regardless of intent.',
        'The test is where the output goes rather than what the feature is called. A "timeline completeness" indicator that reaches a recruiter’s screen is employer-side screening on employment gaps, and the euphemism does not change what the recruiter does with it.',
      ],
    },
    {
      heading: 'Gaps mean many different things',
      paragraphs: [
        'The common causes are caring for a child or a relative, illness, redundancy in a bad market, study, relocation, visa processing, military service, and starting something that did not work out. These correlate strongly with characteristics protected by employment law in many countries.',
        'A system that treats a gap as a negative signal therefore produces disparate impact on carers, disabled people and others, and in several jurisdictions that is unlawful whether or not anyone intended it.',
        'The correlations are strong enough to be predictable rather than incidental. Parental leave and caring responsibilities fall disproportionately on women; long health-related absences correlate with disability — so a gap penalty is a proxy for both, and one that would be plainly unlawful if stated directly.',
      ],
      bullets: [
        'Never score a gap as a negative in a matching or ranking system',
        'Do not infer a reason for a gap — you will be wrong and it will be sensitive',
        'Do not surface gap detection to employers as a screening signal',
        'Measure whether your matching penalises broken timelines, because it may',
      ],
      table: {
        caption: 'Two products that look similar',
        columns: ['', 'Candidate-side', 'Employer-side'],
        rows: [
          ['Who sees the output', 'The candidate', 'A recruiter'],
          ['What it does', 'Offers a way to explain', 'Flags a timeline'],
          ['Who decides', 'The candidate', 'The system, in effect'],
          ['Legal exposure', 'Minimal', 'Substantial'],
          ['Worth building', 'Yes', 'No'],
        ],
      },
    },
    {
      heading: 'Detection should serve the candidate',
      paragraphs: [
        'Identifying a period with no listed role is straightforward. The useful thing to do with it is ask the candidate whether they want to account for it, and help them do so in one honest line if they do.',
        'Often the gap was not empty — freelance work, study, a side project, caring while keeping skills current. Prompting for that is genuinely helpful, and it is the candidate’s choice whether to include it.',
        'Set a sensible threshold and respect it. A few weeks between roles is normal and flagging it is both useless and faintly insulting; a period long enough that a reader might wonder is the only case worth raising at all.',
      ],
    },
    {
      heading: 'Help with framing, not with concealment',
      paragraphs: [
        'There is a real difference between presenting a break clearly and disguising it. Stretching dates to hide a gap is a factual misrepresentation that surfaces during reference checks, and a tool suggesting it is setting the candidate up.',
        'The good version is a short, plain, honest statement: a career break for caring responsibilities, with a return date. Most employers accept this readily; the ones that do not were never going to be persuaded by a date adjustment.',
        'Reasons are optional and the tool should never require one. A candidate is entitled to write "career break, 2022–2023" and say nothing further, and a generator that presses for a medical or personal explanation is asking for information no employer is entitled to.',
      ],
    },
    {
      heading: 'What to say instead, concretely',
      paragraphs: [
        'The format that works is a single line in the employment history, treated like any other entry: a label, dates, and one sentence if there is something relevant to add. Anything longer draws attention to the thing it was meant to settle.',
        'Where the candidate did stay active, that belongs in the line. A contract, a course, an open-source contribution or voluntary work is genuine content, and it changes the entry from an absence into a period with something in it.',
        'Placement matters as much as wording. A break sitting in the timeline where it happened reads as ordinary; a separate section explaining it reads as a defence, and the second invites the scrutiny the first avoids.',
      ],
      bullets: [
        'A labelled entry in the timeline, with dates, like any other role',
        'One sentence maximum, only if there is something to add',
        'Any genuine activity during the period, if the candidate wants it there',
        'No explanation of personal or medical circumstances, ever required',
      ],
    },
    {
      heading: 'Check your own system for the bias',
      paragraphs: [
        'Even with none of this built deliberately, a matching model trained or tuned on historical outcomes may have learned to rank continuous timelines higher, because past hiring did.',
        'Test for it explicitly: take matched candidate profiles differing only in a break, and compare the scores. If they differ, that is a defect in your system, and one you are unlikely to discover any other way.',
        'Re-run the test after every change to the model, the prompt or the scoring weights. A system that passed six months ago is not a system that passes now, and this is exactly the kind of regression that reappears without anyone touching the feature.',
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
    {
      q: 'How should a break appear on a CV?',
      a: 'As a labelled entry in the timeline where it happened, with dates and at most one sentence. A separate explanatory section reads as a defence and invites scrutiny.',
    },
    {
      q: 'Does the candidate have to give a reason?',
      a: 'No. "Career break, 2022–2023" is a complete entry, and a tool pressing for medical or personal detail is asking for what no employer is entitled to.',
    },
  ],
  related: ['how-to-build-an-ai-resume-gap-analyzer', 'how-companies-use-ai-in-hiring', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
