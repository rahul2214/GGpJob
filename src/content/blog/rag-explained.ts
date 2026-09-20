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
  anchors: ['retrieval-augmented generation', 'RAG pipeline'],
  excerpt:
    'Retrieval is the cheapest way to give a model knowledge it was never trained on. It is also the component that quietly causes most wrong answers.',
  keyTakeaways: [
    'Retrieve, then generate. All the complexity — and nearly every failure — lives in the retrieval half.',
    'Fine-tune for form, retrieve for facts. Retrieval updates instantly, cites sources and respects access rules.',
    'Chunking is the stage nobody budgets for and the one that causes the most plausible wrong answers.',
    'The classic failure is retrieving something on-topic that lacks the answer, then answering anyway.',
    'Measure retrieval accuracy and answer accuracy separately or you will change prompts to fix retrieval bugs.',
  ],
  sections: [
    {
      heading: 'The idea in one paragraph',
      paragraphs: [
        'A model only knows what was in its training data. RAG closes that gap by fetching relevant text at question time and putting it in the prompt, so the model answers from material it can see rather than from memory. Retrieve, then generate.',
        'That is genuinely all it is. The complexity is entirely in the retrieval half, and so is nearly every production failure — which is why teams that describe RAG as "just embeddings and a vector database" tend to be the ones whose answers are confidently wrong.',
        'It helps to think of it as search with a writing step attached. Everything the search literature knows about relevance, ranking and evaluation applies, and teams that ignore that body of knowledge rediscover it slowly.',
      ],
    },
    {
      heading: 'Why it beats fine-tuning for knowledge',
      paragraphs: [
        'Fine-tuning changes how a model behaves. It is poor at making a model know new facts reliably, and it is slow and expensive to redo every time those facts change. If your documentation updates weekly, retraining weekly is absurd.',
        'Retrieval updates the moment the source does, cites where an answer came from, and lets you revoke access to a document without touching the model. Those three properties are why almost every knowledge assistant in production is retrieval-based.',
        'The rule of thumb that holds: fine-tune for form, retrieve for facts. Tone, format and task style are training problems. What is true this week is a retrieval problem.',
      ],
      table: {
        caption: 'Choosing between retrieval and fine-tuning',
        columns: ['Requirement', 'Retrieval', 'Fine-tuning'],
        rows: [
          ['Facts that change', 'Updates instantly', 'Requires retraining'],
          ['Citing a source', 'Natural', 'Not possible'],
          ['Per-user access rules', 'Enforced at query time', 'Baked in for everyone'],
          ['Consistent tone or format', 'Weak', 'Strong'],
          ['A specialised task style', 'Weak', 'Strong'],
          ['Cost to change', 'Reindex', 'Retrain and revalidate'],
        ],
      },
    },
    {
      heading: 'The pipeline, and where each part goes wrong',
      paragraphs: [
        'A minimal system has four stages, and each has a characteristic failure. Recognising which stage broke is most of the debugging skill.',
        'The stage nobody budgets for is chunking. Split too small and a chunk loses the context that made it meaningful; too large and the relevant sentence is diluted among irrelevant ones. Both produce the same symptom — a plausible wrong answer — from opposite causes.',
        'Chunking along the document’s own structure usually beats chunking by a fixed token count, because the author already grouped related material for a human reader. A requirement split across two arbitrary windows is the single most common cause of a retrievable fact not being retrieved.',
      ],
      bullets: [
        'Chunking — how documents are split, and what context each piece keeps',
        'Embedding — turning chunks into vectors for similarity search',
        'Retrieval — fetching candidates, then ranking which actually help',
        'Generation — answering from what was retrieved, and saying so when it cannot',
      ],
    },
    {
      heading: 'Pure vector search is rarely enough',
      paragraphs: [
        'Embedding similarity handles meaning well and exact tokens badly. A user searching for a specific error code, a version number, a product name or an uncommon acronym wants documents containing that string, and a vector search returns things that are broadly about the area instead.',
        'The standard fix is hybrid retrieval: run a lexical search alongside the vector search and fuse the two result lists. Fuse the rankings rather than averaging the scores, because lexical and vector scores are not on a comparable scale and averaging silently favours whichever produces larger numbers.',
        'Then re-rank the merged shortlist with a model that sees the query and the passage together. Retrieval optimises for recall and ranking optimises for precision, and trying to do both in one step is why results feel almost right but never quite.',
      ],
    },
    {
      heading: 'The failure everyone meets',
      paragraphs: [
        'The classic RAG failure is not an empty result. It is retrieving something that looks right, is about the right subject, and does not contain the answer — after which the model answers anyway, fluently and wrongly.',
        'Diagnose it by looking at what was actually retrieved before blaming the model. Teams that log the assembled context find in an afternoon what they had spent weeks attributing to model quality. If the right passage was not retrieved, no prompt change will fix it.',
        'The second most common failure is the opposite: the passage was retrieved and the model ignored it in favour of its own training memory. That one is a generation problem and does respond to prompting — which is exactly why separating the two diagnoses matters.',
      ],
      example: {
        title: 'Same symptom, three different causes',
        paragraphs: [
          'A user asks what the notice period is for a specific contract type, and gets a confident wrong answer of one month.',
          'Cause one — chunking. The notice clause was split so that "thirty days" sat in one chunk and the contract type it applied to sat in another. Neither chunk alone answers the question, and the retrieved one looked relevant.',
          'Cause two — retrieval. The corpus contains a similar clause for a different contract type, which scored higher because the phrasing was closer to the question. The right passage was ranked eighth and only five were passed through.',
          'Cause three — generation. The correct passage was retrieved and included, and the model answered from general knowledge about typical notice periods instead. Only this third case is fixed by changing the prompt.',
        ],
      },
    },
    {
      heading: 'How to know whether yours works',
      paragraphs: [
        'Write thirty questions whose answers you know, run them, and count. That is the entire method, and it is the step most teams skip in favour of trying prompts and forming impressions.',
        'Measure the two halves separately. Retrieval accuracy asks whether the needed passage was in the retrieved set at all — a number you can improve without touching the model. Answer accuracy asks whether the model used it correctly. Conflating them means changing prompts to fix retrieval problems, which never works.',
        'Include questions the corpus cannot answer. A system that never says it does not know is worse than one that occasionally refuses, and refusal behaviour is invisible unless you test for it deliberately.',
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
        'Large context windows raise that threshold without removing it. Cost and latency still scale with tokens, and accuracy still degrades when the relevant fact sits among thousands of irrelevant ones, so selecting less and better continues to beat supplying more.',
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
    {
      q: 'Is vector search alone enough?',
      a: 'Rarely. It misses exact tokens — error codes, versions, product names. Run lexical search alongside it, fuse the rankings rather than the scores, and re-rank the merged shortlist.',
    },
    {
      q: 'How should I chunk documents?',
      a: 'Along the document’s own structure rather than by fixed token count. A requirement split across two arbitrary windows is the most common reason a retrievable fact is not retrieved.',
    },
  ],
  related: ['what-is-context-engineering', 'how-to-build-a-job-search-rag-system', 'how-to-build-semantic-job-search'],
  references: [
    {
      title: 'Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks',
      url: 'https://arxiv.org/abs/2005.11401',
      publisher: 'arXiv',
      note: 'The paper the term RAG comes from.',
    },
    {
      title: 'pgvector',
      url: 'https://github.com/pgvector/pgvector',
      publisher: 'GitHub',
      note: 'The extension itself, including index types and their trade-offs.',
    },
  ],
};

export default post;
