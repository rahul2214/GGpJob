import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-context-engineering',
  tint: 'sky',
  title: 'What Is Context Engineering? The Skill That Replaced Prompting',
  heading: 'What context engineering actually is',
  description:
    'Context engineering is deciding what an AI model sees before it answers. Here is what the job involves, how it differs from prompt engineering, and the skills teams hire for.',
  keywords: [
    'what is context engineering',
    'context engineering',
    'context engineering vs prompt engineering',
    'context window management',
    'rag context engineering',
    'ai context engineering jobs',
    'llm context design',
    'context engineering skills',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  excerpt:
    'Prompt engineering was about phrasing. Context engineering is about what the model can see at all — retrieval, memory, tools and budget. It is where the hard problems moved.',
  sections: [
    {
      heading: 'The shift from phrasing to inputs',
      paragraphs: [
        'Prompt engineering treated the instruction as the variable. You rewrote the wording until the output improved. That worked when models were weak at following instructions and the whole task fitted in a few hundred words.',
        'Context engineering treats the inputs as the variable. The question is no longer "how do I word this" but "what should be in front of the model when it answers, and what should not be". Modern models follow instructions well. What they cannot do is know something you never showed them, or ignore something misleading that you did.',
      ],
    },
    {
      heading: 'What actually goes into a context window',
      paragraphs: [
        'A production request is rarely one prompt. It is an assembled document: system instructions, retrieved passages, prior conversation, tool outputs, schemas and the user message. Somebody has to decide what goes in, in what order, and what gets dropped when it will not all fit.',
        'That assembly is the engineering. Get it right and a mid-sized model performs well. Get it wrong and the largest available model still answers from the wrong passage, because the wrong passage is what it was given.',
      ],
      bullets: [
        'System instructions — role, constraints, output format',
        'Retrieved documents — which chunks, ranked how, how many',
        'Conversation history — kept in full, summarised, or truncated',
        'Tool results — raw payloads or filtered fields',
        'Token budget — what gets evicted first when the window fills',
      ],
    },
    {
      heading: 'Why a bigger context window did not solve it',
      paragraphs: [
        'The common assumption was that million-token windows would make retrieval unnecessary. Put everything in and let the model sort it out. In practice that trades one problem for three: cost scales with tokens, latency scales with tokens, and accuracy degrades when the relevant fact is buried among thousands of irrelevant ones.',
        'Models attend unevenly across a long context. Information at the start and end tends to be used more reliably than material in the middle. Knowing that, and placing what matters accordingly, is a concrete skill with measurable effects.',
        'The practical consequence is that selecting less, better, usually beats supplying more. Relevance beats volume, and the work of deciding what is relevant does not go away as windows grow.',
      ],
    },
    {
      heading: 'The failure modes you are hired to prevent',
      paragraphs: [
        'Most production AI failures are context failures wearing a different label. The model is blamed for hallucinating when it was given nothing relevant to answer from. It is blamed for ignoring instructions when those instructions were three thousand tokens upstream of a contradicting example.',
        'Diagnosing these means reading the assembled context that actually went to the model, not the template you think you wrote. Teams that log the final rendered context find bugs in days that they had been attributing to model quality for months.',
      ],
      bullets: [
        'Retrieval returns plausible but wrong passages, and the answer is confidently wrong',
        'Stale cached context contradicts fresher tool output',
        'Conversation summarisation silently drops the constraint the user cared about',
        'Tool output is dumped in raw, and its noise crowds out the question',
      ],
    },
    {
      heading: 'What teams look for when hiring',
      paragraphs: [
        'Job descriptions still often say "prompt engineer", but the interview is about retrieval quality, chunking strategy, evaluation and cost control. The tell is whether a candidate reaches for a rewording or for a measurement when shown a failing case.',
        'The strongest signal you can give is a worked example: a system where you measured a baseline, changed what the model was shown, and reported the effect on both accuracy and cost. That demonstrates the whole loop, which is what the role is.',
      ],
      bullets: [
        'Retrieval and ranking — embeddings, hybrid search, re-ranking',
        'Chunking and document structure',
        'Evaluation sets and regression testing for quality',
        'Token accounting and latency budgets',
        'Reading traces to find which input caused an output',
      ],
    },
    {
      heading: 'How to build the skill without a job in it',
      paragraphs: [
        'Pick a corpus you know well enough to grade answers — your own notes, a documentation set, a public dataset. Build the naive version: embed everything, retrieve the top few chunks, answer. Then write thirty questions with known correct answers and measure how many it gets right.',
        'Improving that number is the entire discipline in miniature. You will change chunk sizes, add re-ranking, adjust what history you keep. Each change gives you a number that moved, and a sentence you can say in an interview that most candidates cannot.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is context engineering replacing prompt engineering?',
      a: 'It is absorbing it. Wording still matters, but it is now one input among several. The higher-value work is deciding what the model sees — retrieval, history, tool output and token budget — which is where most production failures actually originate.',
    },
    {
      q: 'Do I need a machine learning background for context engineering?',
      a: 'No. It is closer to systems and information-retrieval work than to model training. Strong backend skills, an understanding of search and ranking, and the discipline to measure changes matter more than knowing how to train a transformer.',
    },
    {
      q: 'What is the difference between context engineering and RAG?',
      a: 'RAG is one technique inside context engineering — retrieving documents to include in the prompt. Context engineering also covers conversation memory, tool output handling, instruction placement and what to evict when the window fills.',
    },
    {
      q: 'How do I show context engineering skills without production experience?',
      a: 'Build a small retrieval system over a corpus you can grade, write an evaluation set of questions with known answers, and record how accuracy and cost changed as you altered retrieval and chunking. The measured before-and-after is the evidence.',
    },
  ],
  related: ['mcp-explained-for-developers', 'ai-evaluation-llm-evals', 'prompt-engineering-jobs'],
};

export default post;
