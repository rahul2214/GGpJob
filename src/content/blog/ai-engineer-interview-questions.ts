import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'ai-engineer-interview-questions',
  tint: 'sky',
  title: 'AI Engineer Interview Questions and How to Answer Them',
  heading: 'AI engineer interview questions',
  description:
    'The questions AI engineering interviews actually ask, what interviewers are listening for, and how strong answers differ from ones that sound correct.',
  keywords: [
    'ai engineer interview questions',
    'llm interview questions',
    'ai engineer interview preparation',
    'rag interview questions',
    'ai engineering interview',
    'machine learning engineer interview',
    'ai system design interview',
    'ai engineer questions answers',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Interviews',
  excerpt:
    'Most AI engineering interviews are not testing model knowledge. They are testing whether you have debugged a system that was confidently wrong.',
  sections: [
    {
      heading: 'What these interviews are really assessing',
      paragraphs: [
        'AI engineering interviews rarely probe how transformers work mathematically, because that knowledge barely affects the job. They probe whether you have built something that failed in production and worked out why.',
        'That shapes how to prepare. Memorised definitions are easy to spot and carry little weight. Specific stories about a system that behaved badly, what you measured and what you changed are what interviewers remember.',
      ],
    },
    {
      heading: 'The retrieval questions',
      paragraphs: [
        'Almost every interview covers retrieval, because almost every production system uses it. Expect to be asked how you would build one, then pressed on what happens when it returns the wrong thing.',
        'The answer that separates candidates addresses ranking and evaluation rather than stopping at embeddings. Saying you would embed documents and retrieve the nearest matches describes a tutorial; explaining how you would know whether retrieval was the problem describes the job.',
      ],
      bullets: [
        'How would you chunk documents, and what breaks if chunks are too small?',
        'How do you know whether a wrong answer came from retrieval or generation?',
        'When would you add re-ranking, and what does it cost?',
        'How would you handle a question whose answer spans several documents?',
        'What would you do if the correct passage is retrieved but ignored?',
      ],
    },
    {
      heading: 'The evaluation questions',
      paragraphs: [
        'Expect "how do you know it is working". This is the highest-signal question in the whole interview, because teams that have shipped these systems have an answer and teams that have not do not.',
        'A strong answer describes a versioned set of real cases, automatic checks where properties are stateable, model-graded scoring where they are not, and running the whole thing on every change. Mentioning that you calibrate the grader against human judgement marks you out considerably.',
      ],
    },
    {
      heading: 'The cost and latency questions',
      paragraphs: [
        'These separate candidates who have run systems from those who have built demos. A demo has no cost problem; a production system has an invoice and a latency budget.',
        'Be ready to reason out loud about token counts, what drives them, and the trade-off when a quality improvement doubles cost. Knowing that time to first token and total latency are different concerns, and matter differently in a streaming interface, is a small detail that signals real experience.',
      ],
      bullets: [
        'What drives cost per request, and how would you reduce it?',
        'How would you cut latency without hurting quality?',
        'When would you route to a smaller model?',
        'How do you decide whether a quality gain justifies its cost?',
      ],
    },
    {
      heading: 'The failure questions',
      paragraphs: [
        'You will be asked about hallucination, and the weak answer is a definition. The strong answer treats it as a system problem: what was retrieved, what the instructions said, whether the model was asked something unanswerable from the material it was given.',
        'Similarly for prompt injection. Interviewers want to hear that the defence is architectural — limiting what the system can do — rather than a promise to detect malicious input, which does not work reliably.',
      ],
    },
    {
      heading: 'The system design round',
      paragraphs: [
        'Expect an open design problem: build a support assistant over company documentation, or a system that summarises legal contracts. These assess structured thinking more than any particular answer.',
        'Start by asking what "good" means and what a failure costs, before proposing architecture. Candidates who design first and consider quality later signal that they have not run one of these systems, because evaluation is what dominates the work in practice.',
      ],
      bullets: [
        'Clarify the acceptable error rate before designing',
        'Sketch the data path — ingestion, retrieval, generation, output handling',
        'Say how you would evaluate it, unprompted',
        'Address cost and latency without being asked',
        'Name what you would monitor once it is live',
      ],
    },
    {
      heading: 'Preparing without production experience',
      paragraphs: [
        'Build one small system properly and break it deliberately. Give it a corpus, write thirty questions you know the answers to, measure how many it gets right, then improve that number and record what each change did.',
        'That single exercise gives you concrete answers to nearly every question above. Interviewers are not expecting scale; they are listening for whether you have watched one of these systems be wrong and worked out why.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Do AI engineer interviews ask about transformer internals?',
      a: 'Occasionally at a conceptual level, rarely mathematically. Most questions concern retrieval, evaluation, cost and failure handling — the things that determine whether a production system works.',
    },
    {
      q: 'What is the most important question to prepare for?',
      a: '"How do you know it is working." Your answer to that reveals whether you have shipped one of these systems, and a specific account of an evaluation set and a regression it caught is the strongest response available.',
    },
    {
      q: 'How do I answer a question about hallucination?',
      a: 'Treat it as a system problem rather than defining the term. Discuss what was retrieved, whether the question was answerable from that material, and how you would measure the rate — not just that models sometimes invent things.',
    },
    {
      q: 'Can I pass an AI engineering interview without job experience?',
      a: 'Yes, with a built system you can discuss concretely. Build one, measure it, break it and improve it — then describe the measurements. That answers most interview questions better than experience described vaguely.',
    },
  ],
  related: ['ai-agent-interview-questions', 'ai-evaluation-llm-evals', 'what-is-context-engineering'],
};

export default post;
