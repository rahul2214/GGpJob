import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-evaluation-llm-evals',
  tint: 'sky',
  title: 'AI Evaluation and LLM Evals: How Teams Measure Quality',
  heading: 'How to evaluate an LLM system',
  description:
    'What LLM evals are, how to build an evaluation set that catches regressions, when to use model-graded scoring, and why this is becoming its own job.',
  keywords: [
    'llm evals',
    'ai evaluation',
    'llm evaluation metrics',
    'how to evaluate llm',
    'model graded evaluation',
    'llm regression testing',
    'ai evaluation engineer',
    'eval set design',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['evaluation set', 'LLM evals'],
  excerpt:
    'Without evals you are shipping on impressions. Here is how to build a measurement loop that tells you whether a change helped, and why teams now hire for this specifically.',
  keyTakeaways: [
    'Without evals every change is a coin flip whose result is invisible until a user reports it.',
    'Cases must come from real traffic — synthetic examples miss the inputs that actually break systems.',
    'Prefer deterministic checks; use model grading only where the property is genuinely a judgement.',
    'Run them on every change to prompts, context, retrieval or model version, not as a launch ritual.',
    'Track pass rate alongside cost and latency, or you will ship correct decisions that are commercially unviable.',
  ],
  sections: [
    {
      heading: 'Why impressions are not enough',
      paragraphs: [
        'A team without evals ships a prompt change, tries five examples, sees them look better and deploys. Two weeks later a user reports something broken that used to work. Nobody can say when it broke, because nothing was measuring it.',
        'This is the default state of most LLM products, and it is why teams plateau. Every change is a coin flip whose result is invisible. The first evaluation set a team builds usually finds a regression that has been live for a month.',
        'The deeper cost is organisational. Without a number, disagreements about quality are settled by whoever is most senior or most confident, and the team loses the ability to make a decision it can later defend.',
      ],
    },
    {
      heading: 'What an evaluation set actually is',
      paragraphs: [
        'It is a versioned collection of cases with something checkable about each expected result. Not necessarily an exact expected string — often a property: contains this figure, cites a source, refuses this request, stays under this length, returns valid JSON.',
        'The cases should come from reality. Synthetic examples invented at a desk miss the messy inputs that break systems. Pull from real usage — the awkward phrasings, the ambiguous requests, the ones that previously went wrong.',
        'Include the boring cases as well as the interesting ones. A suite composed entirely of edge cases tells you nothing about whether the ordinary path still works, and the ordinary path is the overwhelming majority of what users experience.',
      ],
      bullets: [
        'Cases drawn from real traffic, including past failures',
        'A checkable property per case rather than an exact match',
        'Coverage of the boring majority, not only edge cases',
        'Version controlled and reviewed like source code',
        'Large enough that a single fluke does not move the number',
      ],
    },
    {
      heading: 'Three ways to grade, in order of preference',
      paragraphs: [
        'Prefer deterministic checks wherever the property can be stated precisely. They are fast, free and unambiguous. A surprising share of what matters is checkable this way: valid structure, presence of a required field, absence of a forbidden claim, length, latency.',
        'Where the property is genuinely a judgement, model-graded evaluation is the practical option — another model scores the output against a rubric. It is useful and imperfect, and it needs its own calibration: periodically check the grader against human judgement on the same cases.',
        'Human review stays necessary for a sample. It is slow and expensive, which is exactly why it should be spent on calibrating the cheaper methods rather than on grading everything.',
      ],
      bullets: [
        'Deterministic — schema, keywords, numbers, structure, latency',
        'Model-graded — rubric scoring for tone, relevance, faithfulness',
        'Human — a small sample, used to keep the other two honest',
      ],
      table: {
        caption: 'Choosing a grading method by what you are checking',
        columns: ['Property', 'Method', 'Note'],
        rows: [
          ['Returns valid JSON', 'Deterministic', 'Free and unambiguous'],
          ['Cites a source present in context', 'Deterministic', 'Check the identifier exists'],
          ['Refuses an out-of-scope request', 'Deterministic or graded', 'Depends how varied refusals are'],
          ['Answer is faithful to the source', 'Model-graded', 'Calibrate the grader on a sample'],
          ['Tone is appropriate', 'Model-graded', 'Rubric must be specific'],
          ['Genuinely useful to a user', 'Human', 'Sample only, to calibrate the rest'],
        ],
      },
    },
    {
      heading: 'Run them as regression tests, not as a launch ritual',
      paragraphs: [
        'The value compounds when evals run automatically on every change to prompts, context assembly, retrieval or model version. Treated as a one-off pre-launch exercise, they tell you about a system that no longer exists.',
        'Wire them into the same pipeline as your tests, keep the history, and look at the trend rather than a single run. A change that improves the average while breaking three previously passing cases is usually not the change you want, and only the per-case view shows that.',
        'Keep the runs cheap enough that nobody is tempted to skip them. A suite that takes forty minutes and costs meaningfully per run gets disabled during a busy week, and a disabled suite protects nothing.',
      ],
    },
    {
      heading: 'How to start when you have nothing',
      paragraphs: [
        'The blocking belief is usually that a proper evaluation framework is needed first. It is not. Thirty cases in a file, a script that runs them, and a printed score is a working evaluation suite, and it will find something within a day.',
        'Collect the cases from what already exists: the bug reports, the awkward questions from your own testing, the three examples someone pasted in a channel when they said the output looked wrong. Those are real failures and they are already written down.',
        'Add a case every time something goes wrong in production. That single habit is what turns a small suite into a good one over a few months, and it costs nothing at the moment of discovery when the example is in front of you anyway.',
      ],
      example: {
        title: 'A minimal first suite',
        paragraphs: [
          'A file of thirty entries. Each has a question, and a property: expected_contains, expected_refuses, or must_cite. A script loops through them, calls your system, checks the property, prints a score and lists the failures.',
          'First run: 21 of 30. Reading the nine failures takes twenty minutes and reveals that six of them share a cause — questions phrased as statements retrieve badly. That is a concrete bug found on day one, in a system that had been live for months.',
          'Nothing about this required a framework, a vendor, or a dashboard. It required writing down thirty things you already knew were true.',
        ],
      },
    },
    {
      heading: 'The metrics worth tracking alongside quality',
      paragraphs: [
        'Quality alone leads to decisions that are technically correct and commercially unviable. A change that raises accuracy by one point and doubles cost per request needs both numbers visible to be judged properly.',
        'The useful dashboard is small: pass rate on the eval set, cost per request, latency at the tail, and refusal or fallback rate. Four numbers that move together tell you more than twenty that nobody reads.',
        'Refusal rate is the one most often omitted and the most diagnostic. A system that quietly becomes more willing to guess looks better on every other metric while getting worse in the way users actually notice.',
      ],
    },
    {
      heading: 'Why this is becoming its own job',
      paragraphs: [
        'Evaluation work is unglamorous and decisive, which is a reliable recipe for specialisation. Teams are now hiring people whose primary responsibility is knowing whether the system is getting better — designing eval sets, calibrating graders, investigating regressions.',
        'It is an unusually good entry point. It needs judgement and rigour more than deep ML background, and it puts you at the centre of every shipping decision. If you want into AI engineering without a research CV, this is the most accessible serious door.',
        'It also builds unusual leverage. The person who can say whether a change helped is consulted on every release, learns the whole system quickly, and accumulates the context that later makes them the obvious choice to own a larger part of it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What are LLM evals in simple terms?',
      a: 'A versioned set of test cases for an AI system, each with something checkable about the expected result, run automatically so you can tell whether a change improved things or broke something that previously worked.',
    },
    {
      q: 'How many cases should an evaluation set have?',
      a: 'Enough that one unusual result does not move the number — typically at least fifty to a few hundred for a focused feature. Coverage of real, ordinary inputs matters more than raw count.',
    },
    {
      q: 'Is it reliable to have a model grade another model?',
      a: 'Usefully reliable when the rubric is specific and the grader is calibrated against human judgement on a sample. It is not a substitute for deterministic checks where a property can be stated precisely.',
    },
    {
      q: 'Is AI evaluation a good career entry point?',
      a: 'Yes, and an underrated one. It rewards rigour rather than research background, and it places you in every release decision — which builds influence and system knowledge quickly.',
    },
    {
      q: 'Do I need an evaluation framework to start?',
      a: 'No. Thirty cases in a file, a script that runs them and a printed score is a working suite, and it will usually find something on the first day.',
    },
    {
      q: 'Which metric do teams most often forget?',
      a: 'Refusal rate. A system that quietly becomes more willing to guess improves on every other number while getting worse in the way users actually notice.',
    },
  ],
  related: ['llmops-vs-mlops', 'what-is-context-engineering', 'how-to-evaluate-an-ai-job-matching-model'],
  references: [
    {
      title: 'AI Risk Management Framework',
      url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      publisher: 'NIST',
      note: 'The framework most AI governance programmes are structured around.',
    },
  ],
};

export default post;
