import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'star-method-interview-answers',
  tint: 'amber',
  title: 'STAR Method Interview Technique: Format, Examples and Template',
  heading: 'The STAR method: how to structure interview answers',
  description:
    'Learn the STAR interview method (Situation, Task, Action, Result) with a fill-in template, five worked examples, and tips to keep answers under two minutes.',
  keywords: [
    'star method',
    'star method interview',
    'star interview technique examples',
    'situation task action result',
    'how to answer behavioral questions',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 7,
  category: 'Interviews',
  anchors: ['STAR method', 'Situation, Task, Action, Result'],
  excerpt:
    'STAR — Situation, Task, Action, Result — turns rambling stories into tight, convincing answers. Here is how to use it, how much time to spend on each part, and examples you can adapt.',
  keyTakeaways: [
    'STAR stands for Situation, Task, Action, Result, and works for any "tell me about a time" question.',
    'Spend most of the answer on Action (about 60%) and always finish with a measurable Result.',
    'Say "I", not "we": the interviewer is assessing what you personally did.',
    'Prepare six to eight stories that can each answer several different questions.',
  ],
  sections: [
    {
      heading: 'What the STAR method is',
      paragraphs: [
        'Behavioural interview questions ask for past examples because past behaviour is a good predictor of future performance. STAR gives you a simple order to tell those examples so the interviewer gets everything they need to score you.',
      ],
      table: {
        caption: 'The four parts of a STAR answer',
        columns: ['Part', 'What to say', 'Share of answer'],
        rows: [
          ['Situation', 'Context in one or two sentences: where, when, what was happening', '~10%'],
          ['Task', 'Your specific responsibility or the goal you owned', '~10%'],
          ['Action', 'The steps you personally took and why you chose them', '~60%'],
          ['Result', 'The outcome, ideally measured, plus what you learned', '~20%'],
        ],
      },
    },
    {
      heading: 'A STAR answer template',
      paragraphs: ['Fill in each line, then practise saying it aloud in 90 seconds to two minutes.'],
      example: {
        title: 'Template',
        paragraphs: [
          'Situation: "At [company/project], [brief context and the problem]."',
          'Task: "I was responsible for [your goal or role]."',
          'Action: "First I [step 1]. Then I [step 2], because [reason]. Finally, I [step 3]."',
          'Result: "As a result, [measurable outcome]. I learned [lesson], which I now apply by [habit]."',
        ],
      },
    },
    {
      heading: 'Worked example: handling a tight deadline',
      paragraphs: [
        'Question: "Tell me about a time you worked under pressure."',
        'Situation: "Two weeks before a client launch, our lead developer left the project." Task: "I was asked to make sure the checkout feature shipped on time." Action: "I listed the remaining work, cut two nice-to-have features with the client\'s agreement, paired with a junior developer on the payment integration, and held a 10-minute daily check-in." Result: "We launched on the planned date with no critical bugs, and the client renewed for another year."',
      ],
    },
    {
      heading: 'Stories to prepare',
      paragraphs: ['Build a small bank of stories that cover the themes most interviewers test.'],
      bullets: [
        'A success you are proud of, with numbers',
        'A failure or mistake and what changed afterwards',
        'A conflict with a colleague or stakeholder',
        'A time you led without formal authority',
        'A time you dealt with ambiguity or changing priorities',
        'A time you learned something new quickly',
      ],
    },
  ],
  commonMistakes: [
    { mistake: 'Spending a minute on the Situation', fix: 'Give just enough context to understand the problem, then move on.' },
    { mistake: 'Ending without a result', fix: 'State the outcome, even if it was partial, and what you learned.' },
    { mistake: 'Describing what the team did', fix: 'Use "I" for your actions and credit the team briefly.' },
  ],
  faqs: [
    { q: 'How long should a STAR answer be?', a: 'Aim for 90 seconds to two minutes. If the interviewer wants more detail, they will ask a follow-up.' },
    { q: 'Can I use the same example twice?', a: 'It is better not to repeat a story in the same interview. Prepare enough stories that each one can answer a few different questions.' },
    { q: 'What is the CAR or STARR method?', a: 'CAR (Context, Action, Result) is a shorter version. STARR adds a final "Reflection" on what you learned, which many interviewers appreciate.' },
  ],
  tools: [
    { name: 'Job Search', description: 'Find roles to practise for and apply when you are ready.', href: '/jobs', ctaText: 'Browse jobs' },
  ],
  related: [
    'behavioral-interview-questions-and-answers',
    'how-to-answer-tell-me-about-yourself-in-an-interview',
    'best-ai-mock-interview-tools',
  ],
};

export default post;
