import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-vector-embeddings-work',
  tint: 'sky',
  title: 'How Vector Embeddings Work in RAG: The Math and Mechanics Explained',
  heading: 'How vector embeddings work in RAG: dimensionality, metrics, and semantic spaces',
  description:
    'How do vector embeddings work in RAG? Explore vector projection, cosine similarity vs dot product vs Euclidean distance, dimensionality trade-offs, and embedding drift.',
  keywords: [
    'how vector embeddings work',
    'how embeddings work in rag',
    'vector embeddings explained',
    'cosine similarity vs dot product vs euclidean distance',
    'dense vector representations',
    'embedding dimensions trade-offs',
    'how semantic search works with llms',
    'matryoshka embeddings explained',
    'vector embeddings in machine learning',
    'embedding drift in production rag',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['vector embeddings explained', 'dense vector representations'],
  excerpt:
    'Vector embeddings translate human language into geometric coordinates where semantic meaning equals proximity. Here is how high-dimensional math powers modern semantic search.',
  keyTakeaways: [
    'An embedding is an array of floating-point numbers mapping human concepts into high-dimensional geometric space (typically 768 to 3,072 dimensions).',
    'Concepts with similar semantic meanings cluster together in vector space regardless of whether they share exact vocabulary.',
    'Cosine similarity measures the angle between vectors (invariant to document length), whereas dot product considers both angle and magnitude.',
    'Matryoshka Representation Learning (MRL) allows developers to truncate embedding dimensions by 50% or more with negligible loss in retrieval recall.',
    'Mixing embedding models or upgrading an embedding model without re-indexing your entire database corrupts similarity scores due to embedding space drift.',
  ],
  sections: [
    {
      heading: 'From raw text to geometric coordinates',
      paragraphs: [
        'Computers do not understand the conceptual meaning of words, sentences, or technical skills. They only understand numbers. For decades, text search relied on lexical indexing—counting exact keyword frequencies using algorithms like TF-IDF and BM25. While fast, lexical matching fails when a job seeker searches for "frontend engineer" and an open vacancy specifies "React developer".',
        'Vector embeddings solve this fundamental limitation. An embedding model takes arbitrary text—a word, a paragraph, or an entire resume—and transforms it into a fixed-length array of floating-point numbers called a dense vector representation. In this coordinate space, geometric distance directly mirrors semantic meaning.',
        'When looking at vector embeddings explained through geometry, phrases that express similar underlying intent land near each other in space, enabling machines to understand relationships, analogies, and conceptual synonyms.',
      ],
      bullets: [
        'Dense vectors capture semantic intent rather than literal character strings.',
        'High-dimensional coordinate geometry groups conceptual synonyms naturally together.',
        'Enables cross-lingual, semantic, and fuzzy concept retrieval across millions of documents.',
      ],
    },
    {
      heading: 'Similarity metrics: Cosine vs Dot Product vs Euclidean Distance',
      paragraphs: [
        'Once two pieces of text are converted into dense vector representations, how does a vector database determine how closely related they are? Search engines use three primary mathematical metrics.',
      ],
      table: {
        caption: 'Comparison of Vector Distance and Similarity Metrics',
        columns: ['Metric', 'Formula Concept', 'When to Use', 'Sensitivity to Text Length'],
        rows: [
          ['Cosine Similarity', 'Cosine of the angle between two vectors (-1.0 to 1.0)', 'General text and document search', 'Invariant (length-normalized)'],
          ['Dot Product (Inner Product)', 'Sum of pairwise element products', 'When embeddings are pre-normalized to unit length (L2=1)', 'Sensitive to vector magnitude'],
          ['Euclidean Distance (L2)', 'Straight-line physical distance between vector coordinates', 'Clustering and spatial anomaly detection', 'Sensitive to magnitude and scale'],
        ],
      },
    },
    {
      heading: 'Dimensionality trade-offs and Matryoshka embeddings',
      paragraphs: [
        'Vector dimensionality represents a constant engineering balancing act between semantic precision and infrastructure cost. Early embedding models used 384 or 768 dimensions. Contemporary models frequently output 1,536 or 3,072 dimensions per chunk.',
        'Higher dimensions capture finer semantic nuance, but they quadruple RAM requirements and disk storage while slowing down approximate nearest neighbor (ANN) search across millions of vectors.',
        'Modern architectures overcome this dilemma through Matryoshka Representation Learning (MRL). MRL trains embedding models such that the most critical semantic information is packed into the first 256 or 512 dimensions. Developers can truncate 1,536-dimensional vectors to 512 dimensions, reducing vector database storage costs by 66% while preserving 98% of retrieval accuracy.',
      ],
      example: {
        title: 'Matryoshka Dimension Truncation in Practice',
        paragraphs: [
          'Calling text-embedding-3-large with dimensions=512 extracts the top 512 dimensions directly from the 3,072-dimensional representation.',
          'Re-normalizing the truncated vector to unit length (L2 norm = 1.0) enables high-speed inner product search with near-zero accuracy drop.',
        ],
      },
    },
    {
      heading: 'The risk of embedding drift in production',
      paragraphs: [
        'A critical mistake in enterprise RAG architectures is treating embeddings as static, interchangeable strings. Embedding spaces are model-specific coordinate systems.',
        'If you embed your document repository using an OpenAI model and subsequently embed incoming user queries using an open-source BGE or Cohere model, the resulting vectors exist in completely separate, non-overlapping universes. The cosine similarity scores will be random noise.',
        'Furthermore, when upgrading an embedding model from version 2 to version 3, teams cannot perform a rolling update on the fly. The entire database must be re-embedded in a dual-write migration before switching search traffic over.',
      ],
      bullets: [
        'Never mix vectors generated from different embedding models in the same search collection.',
        'Always record the embedding model name and dimension version in document chunk metadata.',
        'Plan dual-write migration pipelines whenever upgrading embedding model versions in production.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the difference between dense and sparse embeddings?',
      a: 'Dense embeddings map text into dense floating-point vectors where every dimension holds a non-zero value representing abstract semantic concepts. Sparse embeddings (such as BM25 or SPLADE) map text to vocabulary-sized arrays where only words present in the document have non-zero weights.',
    },
    {
      q: 'Why is cosine similarity preferred over Euclidean distance for text search?',
      a: 'Cosine similarity measures directional angle rather than Euclidean distance, preventing longer documents containing more tokens from being artificially penalized simply because their vector magnitude is larger.',
    },
    {
      q: 'Can embedding models handle code and technical documentation effectively?',
      a: 'General text models struggle with syntax, but modern state-of-the-art embedding models are explicitly trained on GitHub repositories and documentation, achieving high accuracy on programming queries.',
    },
  ],
  related: [
    'hybrid-search-vs-vector-search',
    'rag-reranking-explained',
    'how-to-build-a-rag-application-from-scratch',
  ],
  references: [
    {
      title: 'Matryoshka Representation Learning',
      url: 'https://arxiv.org/abs/2205.13147',
      publisher: 'arXiv',
      note: 'The academic breakthrough demonstrating nested representations that allow elastic dimension truncation in vector embeddings.',
    },
    {
      title: 'OpenAI Python SDK Repository',
      url: 'https://github.com/openai/openai-python',
      publisher: 'GitHub',
      note: 'Official client library providing access to multidimensional embedding endpoints.',
    },
  ],
};

export default post;
