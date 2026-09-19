import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'python-interview-questions-for-freshers',
  tint: 'emerald',
  title: 'Python Interview Questions for Freshers (With Answers)',
  heading: 'Python interview questions for freshers',
  description:
    'The Python questions freshers actually get asked, what each one is really testing, and the follow-ups that separate memorised answers from understanding.',
  keywords: [
    'python interview questions for freshers',
    'python fresher interview',
    'python basic interview questions',
    'mutable vs immutable python',
    'python list vs tuple',
    'python coding round preparation',
    'python interview answers',
    'entry level python questions',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  excerpt:
    'Most fresher Python questions have a memorised answer everyone gives and a follow-up almost nobody survives. The follow-up is the actual test.',
  sections: [
    {
      heading: 'How these interviews are structured',
      paragraphs: [
        'A fresher Python interview is usually three parts: language questions to check you understand rather than recite, a small coding problem, and a few questions about anything on your CV. The language part is where most candidates are filtered.',
        'Interviewers know the standard answers are memorised, so they ask one level deeper. Preparing the second level rather than the first is the single highest-return thing you can do.',
      ],
    },
    {
      heading: 'Mutability, the question behind many questions',
      paragraphs: [
        '"What is the difference between a list and a tuple" gets the answer "lists are mutable, tuples are not" from everyone. The follow-up is what matters: why does that distinction exist, and when does it bite?',
        'Be ready for the mutable default argument — a function with `def f(x, items=[])` that accumulates across calls. It is the most commonly asked Python gotcha, it confuses people who have only memorised definitions, and explaining why it happens demonstrates that you understand when defaults are evaluated.',
      ],
      bullets: [
        'Why a tuple can be a dict key and a list cannot',
        'What happens with a mutable default argument, and why',
        'The difference between `==` and `is`, and when `is` misleads',
        'Shallow versus deep copy, with an example where it matters',
      ],
    },
    {
      heading: 'Questions about how Python runs',
      paragraphs: [
        'Expect something about the GIL, decorators, generators or context managers. These are the topics where a clear explanation is genuinely distinguishing, because most candidates can name them and few can explain what problem each solves.',
        'Generators are worth real preparation. Being able to say that they produce values lazily so you never hold the whole sequence in memory, and give a case where that is the difference between working and running out of memory, is a better answer than any definition.',
      ],
    },
    {
      heading: 'The coding round',
      paragraphs: [
        'Fresher coding problems are usually string and collection manipulation rather than hard algorithms: counting, grouping, deduplicating, reversing, finding a first non-repeating item. What is assessed is whether you write clean, working code and talk while doing it.',
        'Reach for the standard library and say why. Using `collections.Counter` and explaining that you would rather not reimplement it shows judgement; interviewers occasionally ask you to write it by hand afterwards, and knowing both is the strongest position.',
      ],
      bullets: [
        'State your approach before typing',
        'Handle the empty input and the single-element case out loud',
        'Say the complexity of what you wrote, without being asked',
        'If stuck, narrate what you are considering rather than going silent',
      ],
    },
    {
      heading: 'Questions about your own project',
      paragraphs: [
        'Anything on your CV is fair game, and this is where freshers most often come unstuck — not because the project was weak but because they cannot explain a decision inside it.',
        'For each project, prepare one sentence on what it does, one on the hardest problem you hit, and one on something you would build differently now. That last one signals reflection, which interviewers read as the ability to learn from work rather than just complete it.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What Python topics come up most for freshers?',
      a: 'Mutability, list versus tuple versus set versus dict, the mutable default argument, `==` versus `is`, generators, decorators and the GIL. Prepare the follow-up explanation, not just the definition.',
    },
    {
      q: 'How hard are fresher Python coding rounds?',
      a: 'Usually string and collection manipulation rather than difficult algorithms. Clean working code, stated complexity and thinking out loud matter more than finding a clever solution.',
    },
    {
      q: 'Should I use built-in libraries in a coding round?',
      a: 'Yes, and say why you chose them. Interviewers sometimes then ask you to implement it by hand, so knowing both the library and the underlying logic is the strongest position.',
    },
    {
      q: 'How do I answer questions about my own project?',
      a: 'Prepare three sentences per project: what it does, the hardest problem you hit, and what you would build differently now. The third one signals reflection and is the one most freshers have not thought about.',
    },
  ],
  related: ['python-developer-roadmap', 'react-interview-questions', 'data-engineer-interview-questions'],
};

export default post;
