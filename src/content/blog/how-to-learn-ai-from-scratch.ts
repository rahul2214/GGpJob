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
  excerpt:
    'Most self-study plans fail the same way: too much theory, too early, and nothing finished. Here is a sequence built around shipping.',
  sections: [
    {
      heading: 'Why most self-study plans stall',
      paragraphs: [
        'The usual failure is not laziness. It is starting with a long theory curriculum — linear algebra, then statistics, then classical machine learning — and hitting month four with no working system and no momentum. Motivation collapses because nothing has been finished.',
        'The alternative is to build something small and bad quite early, then let the gaps you hit tell you what to learn next. Theory absorbed to solve a problem you actually have sticks; theory absorbed pre-emptively usually does not.',
      ],
    },
    {
      heading: 'Programming first, properly',
      paragraphs: [
        'Learn Python until you can write something you would not be embarrassed to hand to someone else — functions, error handling, reading other people\'s code, a little testing. Not tutorial-following: actual maintainable code.',
        'Learn SQL alongside it. This is the step most people skip and most regret. Practically every AI job involves getting data out of somewhere and reshaping it, and this is where real projects spend their time.',
      ],
    },
    {
      heading: 'Build before you study deeply',
      paragraphs: [
        'Once you can program, build something end to end using an existing model. Do not train anything yet. Take a real problem, wire up a working system, and put it somewhere a stranger can use it.',
        'You will hit real questions immediately — why is this output wrong, why is it slow, how do I know it improved. Those questions are the correct entry point to theory, because now you have a reason to care about the answers.',
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
      ],
      bullets: [
        'Evaluation: metrics, test sets, and honest measurement of change',
        'Retrieval and embeddings: getting the right context to the model',
        'Statistics and probability, as far as your problems require',
        'Model internals and training, once you have a concrete reason',
      ],
    },
    {
      heading: 'How long, and how to prove it',
      paragraphs: [
        'For someone already programming, six to twelve months of consistent effort with a real deployed project is a realistic path to employability. From zero programming, longer — and the variable that matters most is how much you finish, not how much you consume.',
        'Proof is the part people neglect. A deployed link, a short honest write-up of what broke, and a resume that names the actual tools you used will do more than any number of completed courses. Check that resume against a real posting before you apply.',
      ],
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
  ],
  related: ['ai-skills-in-demand', 'ai-jobs-for-freshers', 'are-ai-certifications-worth-it'],
};

export default post;
