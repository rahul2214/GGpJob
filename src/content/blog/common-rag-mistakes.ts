import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'common-rag-mistakes',
  tint: 'rose',
  title: 'Common RAG Mistakes Developers Make (And How to Fix Them)',
  heading: 'The 8 most common RAG mistakes developers make in production',
  description:
    'Why is your RAG system failing? Explore the top 8 RAG mistakes developers make: naive chunking, missing rerankers, semantic mismatch, and prompt stuffing.',
  keywords: [
    'common rag mistakes',
    'rag anti patterns',
    'why your rag system isn\'t working',
    'common rag mistakes developers make',
    'debugging rag applications',
    'rag failure modes',
    'fixing rag accuracy',
    'rag chunking mistakes',
    'rag vector search issues',
    'how to improve rag pipeline',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['common RAG mistakes', 'RAG anti-patterns'],
  excerpt:
    'Building RAG that works in a Jupyter notebook is easy; building RAG that works for 10,000 real users is hard. Here are the 8 architectural anti-patterns that quietly wreck production RAG systems.',
  keyTakeaways: [
    'Fixed character chunking without syntax awareness cuts sentences in half, causing severe vector retrieval degradation.',
    'Relying solely on vector embeddings for technical terms, part numbers, or error codes guarantees search misses.',
    'Stuffing 20+ chunks into an LLM prompt triggers the "lost-in-the-middle" effect, causing the model to miss the critical sentence.',
    'Failing to give the LLM an explicit negative constraint ("State if information is absent") forces the model to hallucinate.',
    'Treating RAG as a static database rather than an active information retrieval engine prevents teams from diagnosing whether failures stem from retrieval or generation.',
  ],
  sections: [
    {
      heading: 'The reality of production RAG: why notebooks lie',
      paragraphs: [
        'Almost every RAG system begins as an exciting notebook demo: you load five PDFs, run an out-of-the-box chunker, query an embedding API, and ask three carefully chosen questions. The answers look brilliant, and the project is approved for production.',
        'Two weeks after deployment, the complaints roll in: "The bot made up a refund policy that doesn’t exist", "It can’t find the documentation for error code 403", "It contradicts itself when I ask follow-up questions."',
        'RAG failures are rarely caused by the underlying foundation model. They are caused by subtle architectural anti-patterns in data preparation, search design, and prompt assembly. Here are the eight most pervasive mistakes developers make and exactly how to fix them.',
      ],
    },
    {
      heading: 'Mistake 1 to 4: Ingestion, chunking, and search flaws',
      paragraphs: [
        'The earliest stages of the RAG pipeline are where the most irreversible errors occur.',
      ],
      bullets: [
        '1. Arbitrary Fixed-Character Splitting: Chopping text strictly every 500 characters splits words, table rows, and multi-sentence explanations in half. Fix: Use recursive character or markdown-aware chunking that respects headers and paragraph breaks.',
        '2. Relying Solely on Vector Cosine Distance: Embedding models compress meaning into general semantic directions, failing completely on exact part numbers (e.g. `X-800`), error codes, and unique proper nouns. Fix: Implement hybrid search combining BM25 keyword matching with vector embeddings.',
        '3. Ignoring Document Metadata: Treating all chunks as an undifferentiated pool makes it impossible to filter by date, department, or user permissions. Fix: Attach structured metadata (author, created date, access level) to every vector row and apply pre-retrieval SQL filtering.',
        '4. Omitting a Cross-Encoder Reranker: Bi-encoder vector search is great for fast coarse screening, but pulls false positives. Passing unranked vector chunks directly to the LLM pollutes the prompt. Fix: Deploy a cross-encoder reranker (like Cohere Rerank or BGE) to filter top-30 candidates down to the top 4 pristine passages.',
      ],
      table: {
        caption: 'The 8 most common RAG mistakes and their engineering solutions',
        columns: ['Anti-Pattern', 'Symptoms in Production', 'Engineering Fix'],
        rows: [
          ['Fixed character splitting', 'Truncated sentences, incomplete definitions', 'Recursive markdown/syntax-aware chunking'],
          ['Pure vector search', 'Misses exact error codes, SKUs, and names', 'Hybrid search (BM25 + pgvector via RRF)'],
          ['No reranker', 'Irrelevant context injected into prompt', 'Add Cross-Encoder Reranking on top 25 hits'],
          ['Context stuffing (>15 chunks)', 'Attention fatigue, "lost in the middle" errors', 'Reduce to top 3-5 high-relevance chunks'],
          ['Permissive prompt instructions', 'Model hallucinates when chunks lack answer', 'Enforce strict negative constraints ("State if unknown")'],
          ['No query condensation in chat', 'Follow-up questions fail on pronouns ("it")', 'Rewrite conversational follow-ups into standalone queries'],
          ['No document deletion pipeline', 'Contradictory answers from stale chunks', 'Webhook-driven real-time chunk invalidation'],
          ['Evaluating without metrics', 'Changing prompts to fix search bugs', 'Measure Context Precision vs Answer Faithfulness'],
        ],
      },
    },
    {
      heading: 'Mistake 5 to 8: Prompt construction and conversational failures',
      paragraphs: [
        'Even if your retrieval engine fetches pristine chunks, poor prompt assembly and lack of conversation state will derail the user experience.',
      ],
      bullets: [
        '5. Context Stuffing (Injecting Too Many Chunks): Pulling 20 chunks into a prompt creates noise and triggers attention diffusion. The model suffers from the "lost-in-the-middle" effect and overlooks the single relevant paragraph. Fix: Quality over quantity — pass only the top 3-5 verified chunks.',
        '6. Permissive Prompt Instructions: If you tell an LLM "Use this context to answer the question", but the context doesn’t have the answer, the model feels obligated to produce a response, drawing on pre-trained assumptions to fabricate a plausible hallucination. Fix: Add a strict negative guardrail: "Answer strictly based on the provided context. If the context does not provide the answer, state that the documentation does not contain this information."',
        '7. Neglecting Multi-Turn Query Condensation: In chat applications, users ask follow-up questions like "How much does that cost?" If you embed that sentence directly, vector search returns pricing for random products. Fix: Use a lightweight LLM to rewrite the follow-up into a standalone question before running retrieval.',
        '8. Lacking Continuous Evaluation Metrics: Tweaking chunk sizes and prompt instructions based on casual "vibe checks" leads to silent regressions. Fix: Maintain a gold-standard evaluation dataset of 100 test questions and measure Context Recall and Answer Faithfulness automatically in CI/CD.',
      ],
      example: {
        title: 'Before & after fixing permissive prompt instructions',
        paragraphs: [
          'Question: "Does our company offer pet bereavement leave?" (The policy documents say nothing about pet bereavement).',
          'Permissive Prompt Output: "Yes, our company values employee well-being and provides compassionate bereavement leave for immediate family and household companions, typically 3 to 5 days." (Completely fabricated hallucination).',
          'Hardened Negative Prompt Output: "The provided HR policies do not mention pet bereavement leave. Please consult your HR business partner for specialized exceptions." (100% grounded and compliant).',
        ],
      },
    },
    {
      heading: 'Building a culture of RAG observability',
      paragraphs: [
        'To keep your RAG application healthy over months and years, treat it like an observable software service. Log every user query, the exact chunk IDs retrieved, their similarity scores, the final prompt sent to the LLM, and the user’s reaction (thumbs up/down).',
        'Reviewing the bottom 5% of queries with low user ratings or low retrieval similarity will immediately expose gaps in your documentation, poor chunk boundaries, or vocabulary mismatches.',
      ],
      bullets: [
        'Log all intermediate steps: query, rewritten query, retrieved chunk IDs, rerank scores, and final output',
        'Add user feedback buttons (thumbs up / down) to collect real-world failure cases automatically',
        'Establish automated regression tests in CI/CD before updating embedding models or prompts',
        'Audit your document sources regularly to purge deprecated or contradictory files',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most common mistake when building RAG?',
      a: 'The most common mistake is fixed-character chunking (splitting text strictly every 500 characters), which slices sentences and paragraphs in half, destroying their semantic meaning for both the embedding model and the generator LLM.',
    },
    {
      q: 'Why does my RAG system hallucinate when context is provided?',
      a: 'It hallucinates because the retrieved context was only topically adjacent rather than containing the exact answer, and your prompt failed to instruct the model to explicitly declare when information is missing.',
    },
    {
      q: 'Why does vector search miss exact error codes or product names?',
      a: 'Vector embeddings map words to general semantic concepts rather than preserving exact character strings. To find exact codes or SKUs, you must use hybrid search combining BM25 keyword matching with vector embeddings.',
    },
    {
      q: 'How many chunks should I inject into a RAG prompt?',
      a: 'For most standard applications, injecting the top 3 to 5 highly relevant chunks (approx. 1,000 to 2,000 tokens) provides the best balance between complete context and peak model attention.',
    },
    {
      q: 'How do you fix RAG in multi-turn chat applications?',
      a: 'Use query condensation: before searching the vector database, pass the chat history and the user’s latest message to a fast model to rewrite it into a self-contained, standalone search query.',
    },
  ],
  related: [
    'how-to-reduce-rag-hallucinations',
    'how-to-build-a-rag-application-from-scratch',
    'advanced-rag-retrieval-techniques',
    'hybrid-search-vs-vector-search',
  ],
  references: [
    {
      title: 'Evaluating Retrieval-Augmented Generation Systems',
      url: 'https://arxiv.org/abs/2309.01431',
      publisher: 'arXiv',
      note: 'The RAGAS framework analyzing the primary root causes of retrieval and generation failures.',
    },
    {
      title: 'OWASP Top 10 for Large Language Model Applications',
      url: 'https://owasp.org/www-project-top-10-for-large-language-model-applications/',
      publisher: 'OWASP',
      note: 'Comprehensive security guidelines on managing hallucination, data leakage, and prompt boundaries.',
    },
  ],
};

export default post;
