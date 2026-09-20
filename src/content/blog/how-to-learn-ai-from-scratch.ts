import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-learn-ai-from-scratch',
  tint: 'amber',
  title: 'How to Learn AI From Scratch (Step by Step)',
  heading: 'How to learn AI from scratch',
  description:
    'A realistic path to learning AI from scratch without a PhD: what to learn first, what to skip, how long it takes, and how to prove it to employers.',
  keywords: [
    'how to learn ai from scratch',
    'learn ai for beginners',
    'ai roadmap',
    'machine learning roadmap',
    'self study ai',
    'learn ai without degree',
    'ai learning path',
    'how long to learn ai',
  ],
  publishedAt: '2026-09-08',
  updatedAt: '2026-09-08',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Skills',
  anchors: ['learn AI from scratch', 'self-study'],
  excerpt:
    'Most self-study plans fail the same way: too much theory, too early, and nothing finished. Here is a sequence built around shipping.',
  keyTakeaways: [
    'Plans fail from front-loaded theory and nothing finished, not from lack of effort.',
    'Learn Python properly and SQL alongside it before touching any modelling.',
    'Build something end to end with an existing model before studying deeply — the gaps tell you what to learn.',
    'Evaluation is the step almost everyone skips and the one that separates a demo from a product.',
    'Six to twelve months is realistic if you already program, and finishing matters more than consuming.',
  ],
  sections: [
    {
      heading: 'Why most self-study plans stall',
      paragraphs: [
        'The usual failure is not laziness. It is starting with a long theory curriculum — linear algebra, then statistics, then classical machine learning — and hitting month four with no working system and no momentum. Motivation collapses because nothing has been finished.',
        'The alternative is to build something small and bad quite early, then let the gaps you hit tell you what to learn next. Theory absorbed to solve a problem you actually have sticks; theory absorbed pre-emptively usually does not.',
        'There is a second, quieter failure: treating consumption as progress. Watching a course feels productive and leaves almost nothing behind. The reliable test is whether you could rebuild the thing without the video open.',
      ],
    },
    {
      heading: 'Programming first, properly',
      paragraphs: [
        'Learn Python until you can write something you would not be embarrassed to hand to someone else — functions, error handling, reading other people’s code, a little testing. Not tutorial-following: actual maintainable code.',
        'Learn SQL alongside it. This is the step most people skip and most regret. Practically every AI job involves getting data out of somewhere and reshaping it, and this is where real projects spend their time.',
        'The standard to aim for is narrower than "know Python". It is being able to take a vague task, structure it into functions, handle the cases where the input is wrong, and come back to the code in three weeks and understand it. That is the skill every later step depends on.',
      ],
      bullets: [
        'Write code that handles bad input without crashing',
        'Read someone else’s repository and follow what it does',
        'Write a few tests, enough to catch your own regressions',
        'Use git properly — branches, commits that mean something',
        'SQL: joins, grouping and aggregation over messy real tables',
      ],
    },
    {
      heading: 'Build before you study deeply',
      paragraphs: [
        'Once you can program, build something end to end using an existing model. Do not train anything yet. Take a real problem, wire up a working system, and put it somewhere a stranger can use it.',
        'You will hit real questions immediately — why is this output wrong, why is it slow, how do I know it improved. Those questions are the correct entry point to theory, because now you have a reason to care about the answers.',
        'Choose something you personally want to exist. Motivation is the scarce resource across six months of self-study, and a project you actually use survives the weeks when it is not going well.',
      ],
      bullets: [
        'Something you personally want to exist works best',
        'Real data, however messy',
        'Deployed, not just running locally',
        'Some measurement of whether it works',
      ],
    },
    {
      heading: 'Then go deeper, in this order',
      paragraphs: [
        'With something built, deeper study has somewhere to attach. Evaluation first — most people never learn it properly and it is what separates a demo from a product. Then retrieval and context handling, then the modelling internals.',
        'The ordering is deliberate. Evaluation makes every subsequent change measurable, so learning it early means the rest of your study compounds instead of being a sequence of guesses about whether things improved.',
      ],
      bullets: [
        'Evaluation: metrics, test sets, and honest measurement of change',
        'Retrieval and embeddings: getting the right context to the model',
        'Statistics and probability, as far as your problems require',
        'Model internals and training, once you have a concrete reason',
      ],
      table: {
        caption: 'A rough sequence, with what "done" looks like at each stage',
        columns: ['Stage', 'Rough time', 'Done when'],
        rows: [
          ['Python to a maintainable standard', '2–3 months', 'You return to old code and follow it'],
          ['SQL over messy data', 'Alongside, 3–4 weeks', 'You can answer a real question from raw tables'],
          ['First end-to-end build', '4–6 weeks', 'A stranger can use it at a link'],
          ['Evaluation', '2–3 weeks', 'You can prove a change helped'],
          ['Retrieval and context', '4–6 weeks', 'You fixed a real accuracy problem with it'],
          ['Model internals', 'Ongoing', 'A specific problem required it'],
        ],
      },
    },
    {
      heading: 'What to skip, at least for now',
      paragraphs: [
        'Implementing a transformer from scratch is a good exercise and a poor use of your first six months. It is frequently recommended because it is satisfying and legible, not because it changes what you can build.',
        'The same applies to training models from zero. Almost no production work does this, the compute is expensive, and the skill it builds is narrower than the time it costs. Fine-tuning has its place, and it comes after you can demonstrate that a simpler approach was insufficient.',
        'Skip the framework tour too. Learning five libraries shallowly produces a list; learning one well enough to debug it produces an engineer. You can pick up the others in a week each once you actually need them.',
      ],
    },
    {
      heading: 'How long, and how to prove it',
      paragraphs: [
        'For someone already programming, six to twelve months of consistent effort with a real deployed project is a realistic path to employability. From zero programming, longer — and the variable that matters most is how much you finish, not how much you consume.',
        'Proof is the part people neglect. A deployed link, a short honest write-up of what broke, and a resume that names the actual tools you used will do more than any number of completed courses. Check that resume against a real posting before you apply.',
        'Write as you go rather than at the end. A short note after each significant problem — what broke, what you tried, what fixed it — becomes both your portfolio and the material you will draw on in interviews, and it is almost impossible to reconstruct months later.',
      ],
      example: {
        title: 'A twelve-month plan that actually finishes something',
        paragraphs: [
          'Months 1–3: Python to the point of maintainable code, plus SQL. Output: a small command-line tool that reads messy files and produces a clean report, with tests.',
          'Months 4–5: first end-to-end build using an existing model API. Output: a deployed thing at a URL that solves a problem you personally have.',
          'Month 6: evaluation. Output: fifty test cases with expected answers, run on every change, and a written record of one change that looked better and scored worse.',
          'Months 7–9: retrieval, applied to the same project. Output: a measured accuracy improvement you can explain, including what you traded away.',
          'Months 10–12: a second project in a domain you care about, written up properly, plus applications. Output: two things at links, one written explanation, and a CV that names the real stack.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'Can I learn AI without a degree?',
      a: 'Yes for engineering roles, where demonstrable work carries more weight than credentials. Research positions are the exception and generally still expect a postgraduate degree.',
    },
    {
      q: 'How long does it take to learn AI from scratch?',
      a: 'Six to twelve months of consistent effort to become employable if you already program; considerably longer starting from no coding. Finishing and deploying projects moves that timeline far more than accumulating courses.',
    },
    {
      q: 'Should I learn maths before machine learning?',
      a: 'Learn enough to follow what you are doing, then deepen it when a real problem demands it. Front-loading months of maths before building anything is the most common reason self-study plans are abandoned.',
    },
    {
      q: 'Should I implement a transformer from scratch?',
      a: 'It is a satisfying exercise and a poor use of your first six months. It rarely changes what you can build, and the time is better spent finishing and evaluating a real project.',
    },
    {
      q: 'Do I need to train my own models?',
      a: 'Almost no production work does. Build on existing models first; fine-tuning comes after you can show a simpler approach was genuinely insufficient.',
    },
    {
      q: 'How do I know I am actually making progress?',
      a: 'By whether you could rebuild the last thing without the tutorial open, and by whether anything is finished and reachable at a link. Hours consumed is not a measure.',
    },
  ],
  related: ['ai-skills-in-demand', 'ai-jobs-for-freshers', 'are-ai-certifications-worth-it'],
  references: [
    {
      title: 'asyncio',
      url: 'https://docs.python.org/3/library/asyncio.html',
      publisher: 'Python',
      note: 'The official reference, which is clearer than most tutorials.',
    },
    {
      title: 'Attention Is All You Need',
      url: 'https://arxiv.org/abs/1706.03762',
      publisher: 'arXiv',
      note: 'The transformer architecture paper.',
    },
  ],
};

export default post;
