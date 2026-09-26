import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'advanced-rag-retrieval-techniques',
  tint: 'violet',
  title: 'Advanced RAG Techniques: Sentence-Window, Parent-Doc & Reranking',
  heading: 'Advanced RAG retrieval techniques: moving beyond basic chunking',
  description:
    'Master advanced RAG architectures: sentence-window retrieval, parent-document retrieval, query expansion, HyDE, modular RAG, and cross-encoder reranking.',
  keywords: [
    'advanced rag retrieval techniques',
    'sentence window retrieval',
    'parent document retrieval',
    'query expansion in rag',
    'query rewriting in rag',
    'reranking in rag',
    'modular rag architecture',
    'hierarchical rag',
    'hyde hypothetical document embeddings',
    'improving rag retrieval quality',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 11,
  category: 'AI Engineering',
  anchors: ['sentence-window retrieval', 'parent-document retrieval'],
  excerpt:
    'Naive chunk-and-search reaches an accuracy ceiling quickly. Advanced techniques like sentence-window retrieval, parent-document linking, query rewriting, and cross-encoder reranking push retrieval accuracy past 95%.',
  keyTakeaways: [
    'Naive chunking creates a dilemma: small chunks embed accurately but lack narrative context, while large chunks embed poorly but retain context.',
    'Sentence-Window Retrieval decouples the unit of retrieval from the unit of synthesis by embedding single sentences but returning surrounding context windows.',
    'Parent-Document Retrieval matches small sub-chunks during vector search but injects full parent sections into the prompt.',
    'Hypothetical Document Embeddings (HyDE) prompts an LLM to hallucinate a plausible answer first, then searches for documents similar to that answer.',
    'Cross-encoder reranking acts as an essential quality filter, re-scoring top vector candidates with full attention before synthesis.',
  ],
  sections: [
    {
      heading: 'The chunk-size dilemma in standard RAG',
      paragraphs: [
        'Every developer who builds a basic RAG pipeline runs into an unavoidable contradiction: what size should your chunks be?',
        'If you make chunks small (e.g. 100 tokens), your embedding model generates laser-focused vectors that match user queries with high precision. However, when those small chunks are passed to the generator LLM, the model lacks the surrounding context needed to understand the broader nuance, often missing key qualifiers located in neighboring sentences.',
        'If you make chunks large (e.g. 1,000 tokens), the chunk contains rich narrative context, but the embedding model averages the meaning across too many disparate sentences. The resulting vector becomes diluted, lowering cosine similarity and causing search to miss the chunk entirely.',
        'Advanced RAG techniques solve this dilemma by decoupling the text that is searched from the text that is fed to the model.',
      ],
    },
    {
      heading: 'Sentence-Window Retrieval and Parent-Document Retrieval',
      paragraphs: [
        'The two most powerful patterns for resolving the chunk-size dilemma are Sentence-Window Retrieval and Parent-Document Retrieval.',
        'In Sentence-Window Retrieval, text is split into individual sentences, and each sentence is embedded independently with its exact position tracked. When a user query matches a sentence vector, the retrieval engine does not return just that isolated sentence; it fetches a sliding window of surrounding sentences (e.g. 3 sentences before and 3 sentences after). The search achieves high embedding precision, while the LLM receives complete narrative context.',
        'Parent-Document Retrieval expands this concept to hierarchical document structures. Documents are parsed into large parent sections (e.g. 1,000 tokens) and then subdivided into small child chunks (e.g. 150 tokens). The vector database indexes only the child chunks. When a child chunk matches the query, the system swaps it out and returns the entire parent section to the LLM, preserving complete tables, code blocks, and section continuity.',
      ],
      table: {
        caption: 'Advanced retrieval techniques compared',
        columns: ['Technique', 'How It Works', 'Primary Problem Solved', 'Compute Overhead'],
        rows: [
          ['Sentence-Window Retrieval', 'Embeds single sentence; retrieves surrounding window', 'Eliminates context loss around small chunks', 'Low (fast positional lookup)'],
          ['Parent-Document Retrieval', 'Embeds child chunks; retrieves whole parent section', 'Preserves document structure and tables', 'Low (key-value parent lookup)'],
          ['Query Rewriting / Expansion', 'Reformulates user queries into multiple search terms', 'Fixes poor user query phrasing and vocabulary gaps', 'Moderate (one lightweight LLM call)'],
          ['HyDE (Hypothetical Embeddings)', 'Generates hypothetical answer, embeds that answer', 'Bridges semantic gap between question and answer', 'Moderate (one fast LLM generation)'],
          ['Cross-Encoder Reranking', 'Computes deep query-document attention on top 30 hits', 'Filters out semantic false positives', 'Moderate (fast neural scoring)'],
        ],
      },
    },
    {
      heading: 'Pre-retrieval transformations: Query Rewriting and HyDE',
      paragraphs: [
        'Retrieval failures often begin with the user’s query. Real users ask vague, misspelled, or slang-filled questions that do not resemble formal documentation language.',
        'Query Expansion uses an LLM to generate 3 to 5 related search phrases or sub-queries. The system executes these queries in parallel, combining and deduplicating the retrieved chunks. This dramatically boosts recall for complex domain questions.',
        'Hypothetical Document Embeddings (HyDE) takes a radical approach: instead of embedding the user’s question (which may look linguistically very different from the answer), it asks an LLM to generate a speculative, hypothetical answer. Even if the hypothetical answer contains minor factual errors, its linguistic style, terminology, and semantic structure closely mirror the true source documentation. Embedding the hypothetical answer retrieves real documents with startling accuracy.',
      ],
      example: {
        title: 'HyDE in action: obscure technical question',
        paragraphs: [
          'User Question: "Why is our pod stuck in CrashLoopBackOff with code 137?"',
          'Standard Vector Search: Matches articles generally discussing pod lifecycle states and exit codes.',
          'HyDE Generation: "Exit code 137 in Kubernetes indicates that the container was terminated by the Linux OOM (Out Of Memory) killer due to exceeding memory limits or cgroup constraints."',
          'Search Result: Embedding the HyDE text matches the specific internal documentation on "Debugging Kubernetes OOMKilled Containers" with a 0.96 cosine score.',
        ],
      },
    },
    {
      heading: 'Post-retrieval optimization: Cross-Encoder Reranking',
      paragraphs: [
        'The final line of defense against hallucinations is post-retrieval reranking. Standard vector databases use bi-encoder embeddings, which evaluate the query and documents separately. While bi-encoders can search across millions of documents in milliseconds, they lack deep cross-attentional nuance.',
        'A cross-encoder reranker (such as Cohere Rerank or BGE-Reranker) analyzes the query and candidate chunk together, computing full cross-attention between every token in the query and every token in the candidate passage.',
        'By pulling the top 30 results from vector search and filtering them down to the top 4 using a cross-encoder, you eliminate up to 70% of false-positive chunks, providing pristine grounding for the final generative model.',
      ],
      bullets: [
        'Adopt sentence-window retrieval for narrative text where surrounding context is essential',
        'Use parent-document retrieval when working with structured technical manuals or legal contracts',
        'Implement query rewriting to turn vague conversational prompts into crisp search terms',
        'Always place a cross-encoder reranker between your vector database and your generator prompt',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is sentence-window retrieval in RAG?',
      a: 'Sentence-window retrieval is an advanced RAG technique where individual sentences are embedded for high-precision search, but the retrieval engine returns the matching sentence along with a surrounding window of adjacent sentences to provide complete context to the LLM.',
    },
    {
      q: 'What is parent-document retrieval?',
      a: 'Parent-document retrieval splits documents into large parent chunks and smaller child chunks. Only the small child chunks are embedded and searched, but when a match occurs, the entire parent chunk is passed to the LLM to preserve full structural context.',
    },
    {
      q: 'What is HyDE (Hypothetical Document Embeddings)?',
      a: 'HyDE is a technique where an LLM generates a hypothetical answer to a user’s question first. That hypothetical answer is then embedded and used to search the vector database, bridging the semantic gap between questions and answers.',
    },
    {
      q: 'What is query expansion in RAG?',
      a: 'Query expansion uses an LLM to generate multiple synonyms, related questions, or sub-queries from a single user prompt, executing them in parallel to maximize document recall.',
    },
    {
      q: 'How much does reranking improve RAG accuracy?',
      a: 'Empirical studies consistently show that adding a cross-encoder reranker improves RAG retrieval precision by 20% to 40% while dramatically reducing model hallucinations caused by irrelevant context chunks.',
    },
  ],
  related: [
    'rag-explained',
    'how-to-reduce-rag-hallucinations',
    'hybrid-search-vs-vector-search',
    'what-is-agentic-rag',
  ],
  references: [
    {
      title: 'Precise Zero-Shot Dense Retrieval without Relevance Labels (HyDE)',
      url: 'https://arxiv.org/abs/2212.10496',
      publisher: 'arXiv',
      note: 'The original paper introducing Hypothetical Document Embeddings for zero-shot dense retrieval.',
    },
    {
      title: 'BGE Reranker: Large Language Model Cross-Encoder Architecture',
      url: 'https://github.com/',
      publisher: 'GitHub',
      note: 'Open-source state-of-the-art cross-encoder reranking models for information retrieval pipelines.',
    },
  ],
};

export default post;
