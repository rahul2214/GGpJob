import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'rag-explained',
  tint: 'sky',
  title: 'RAG Explained: What Is Retrieval-Augmented Generation?',
  heading: 'RAG, explained properly',
  description:
    'What retrieval-augmented generation is, why it beats fine-tuning for most knowledge problems, where it quietly fails, and how to tell if yours is working.',
  keywords: [
    'rag explained',
    'what is retrieval augmented generation',
    'rag vs fine tuning',
    'how rag works',
    'rag pipeline',
    'rag chunking strategy',
    'retrieval augmented generation tutorial',
    'rag failure modes',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Retrieval is the cheapest way to give a model knowledge it was never trained on. It is also the component that quietly causes most wrong answers.',
  sections: [
    {
      heading: 'The idea in one paragraph',
      paragraphs: [
        'A model only knows what was in its training data. RAG closes that gap by fetching relevant text at question time and putting it in the prompt, so the model answers from material it can see rather than from memory. Retrieve, then generate.',
        'That is genuinely all it is. The complexity is entirely in the retrieval half, and so is nearly every production failure — which is why teams that describe RAG as "just embeddings and a vector database" tend to be the ones whose answers are confidently wrong.',
      ],
    },
    {
      heading: 'Why it beats fine-tuning for knowledge',
      paragraphs: [
        'Fine-tuning changes how a model behaves. It is poor at making a model know new facts reliably, and it is slow and expensive to redo every time those facts change. If your documentation updates weekly, retraining weekly is absurd.',
        'Retrieval updates the moment the source does, cites where an answer came from, and lets you revoke access to a document without touching the model. Those three properties are why almost every knowledge assistant in production is retrieval-based.',
        'The rule of thumb that holds: fine-tune for form, retrieve for facts. Tone, format and task style are training problems. What is true this week is a retrieval problem.',
      ],
    },
    {
      heading: 'The pipeline, and where each part goes wrong',
      paragraphs: [
        'A minimal system has four stages, and each has a characteristic failure. Recognising which stage broke is most of the debugging skill.',
        'The stage nobody budgets for is chunking. Split too small and a chunk loses the context that made it meaningful; too large and the relevant sentence is diluted among irrelevant ones. Both produce the same symptom — a plausible wrong answer — from opposite causes.',
      ],
      bullets: [
        'Chunking — how documents are split, and what context each piece keeps',
        'Embedding — turning chunks into vectors for similarity search',
        'Retrieval — fetching candidates, then ranking which actually help',
        'Generation — answering from what was retrieved, and saying so when it cannot',
      ],
    },
    {
      heading: 'The failure everyone meets',
      paragraphs: [
        'The classic RAG failure is not an empty result. It is retrieving something that looks right, is about the right subject, and does not contain the answer — after which the model answers anyway, fluently and wrongly.',
        'Diagnose it by looking at what was actually retrieved before blaming the model. Teams that log the assembled context find in an afternoon what they had spent weeks attributing to model quality. If the right passage was not retrieved, no prompt change will fix it.',
      ],
    },
    {
      heading: 'How to know whether yours works',
      paragraphs: [
        'Write thirty questions whose answers you know, run them, and count. That is the entire method, and it is the step most teams skip in favour of trying prompts and forming impressions.',
        'Measure the two halves separately. Retrieval accuracy asks whether the needed passage was in the retrieved set at all — a number you can improve without touching the model. Answer accuracy asks whether the model used it correctly. Conflating them means changing prompts to fix retrieval problems, which never works.',
      ],
      bullets: [
        'Did the right passage get retrieved? (retrieval quality)',
        'Given it, was the answer right? (generation quality)',
        'Did it refuse when the answer was genuinely absent? (honesty)',
        'What did it cost and how long did it take? (viability)',
      ],
    },
    {
      heading: 'When you do not need RAG',
      paragraphs: [
        'If the knowledge fits comfortably in a prompt and rarely changes, just put it in the prompt. A system prompt holding your twenty-page policy document is simpler, faster and more reliable than a retrieval pipeline over the same twenty pages.',
        'RAG earns its complexity when the corpus is too large to include, changes independently of your deployments, or has per-user access rules. Below that threshold it is machinery you will maintain for no gain.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is RAG in simple terms?',
      a: 'Fetching relevant text at question time and putting it in the model’s prompt, so it answers from material it can see rather than from training memory. Retrieve, then generate.',
    },
    {
      q: 'Is RAG better than fine-tuning?',
      a: 'For facts, usually yes — it updates instantly, can cite sources and respects access rules. Fine-tuning is better for changing how a model behaves: tone, format and task style. Fine-tune for form, retrieve for facts.',
    },
    {
      q: 'Why does my RAG system give confidently wrong answers?',
      a: 'Almost always because retrieval returned something on-topic that did not contain the answer, and the model answered anyway. Log the assembled context and check what was actually retrieved before changing the prompt.',
    },
    {
      q: 'Do I still need RAG with very large context windows?',
      a: 'Usually. Cost and latency scale with tokens, and accuracy degrades when the relevant fact sits among thousands of irrelevant ones. Selecting less, better, still beats supplying more.',
    },
  ],
  related: ['what-is-context-engineering', 'how-to-build-a-job-search-rag-system', 'how-embeddings-improve-job-recommendations'],
};

export default post;
