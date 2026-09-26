import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-graphrag',
  tint: 'emerald',
  title: 'What Is GraphRAG? Knowledge Graphs vs Vector RAG Explained',
  heading: 'What is GraphRAG and when should you use it over vector RAG?',
  description:
    'Explore what GraphRAG is, how knowledge graph retrieval outperforms pure vector search for complex reasoning, when to use it, and how to build one.',
  keywords: [
    'what is graphrag',
    'graphrag vs rag',
    'when to use graphrag',
    'can graphrag replace vector search',
    'how does graphrag work',
    'graphrag explained for beginners',
    'graphrag vs vector rag',
    'graphrag vs knowledge graphs',
    'how to build a graphrag application',
    'neo4j for graphrag',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 11,
  category: 'AI Engineering',
  anchors: ['GraphRAG architecture', 'GraphRAG vs vector RAG'],
  excerpt:
    'Vector search fails when questions require connecting multiple concepts across thousands of pages. GraphRAG combines LLMs with knowledge graphs to answer complex holistic questions.',
  keyTakeaways: [
    'Vector search finds isolated paragraphs matching a query, but fails at holistic, corpus-wide summarization ("What are the main themes in this investigation?").',
    'GraphRAG extracts entities, relationships, and claims from raw text and organizes them into a hierarchical knowledge graph.',
    'Hierarchical community detection clusters related entities and pre-summarizes them at different levels of abstraction.',
    'You do not need Neo4j to get started: relational databases like PostgreSQL with recursive CTEs or lightweight graph libraries can power GraphRAG.',
    'GraphRAG has higher indexing cost and latency than vector RAG, making it best suited for complex intelligence, research, and legal analysis.',
  ],
  sections: [
    {
      heading: 'The blind spot of pure vector search',
      paragraphs: [
        'Vector similarity search is fundamentally local. It takes a query, computes its mathematical embedding vector, and finds the closest text chunks in high-dimensional space. This excels at direct factual lookups: "What is the deductible on Policy Plan B?"',
        'However, vector RAG fails completely on global sensemaking questions. If an analyst asks "What are the common financial schemes used by the defendants across these 20,000 pages of legal transcripts?", vector search looks for chunks containing words like "common financial schemes". Because no single chunk contains the complete synthesis, the vector search returns irrelevant fragments, and the LLM produces a partial or hallucinated answer.',
        'GraphRAG was engineered specifically to solve this blind spot. Developed initially by researchers at Microsoft, it bridges the gap between unstructured text and structured relational intelligence.',
      ],
    },
    {
      heading: 'How GraphRAG works: from text to knowledge graph',
      paragraphs: [
        'Unlike traditional RAG, which only indexes raw text chunks, GraphRAG performs intensive offline extraction during the ingestion phase to build a structured representation of the entire dataset.',
      ],
      bullets: [
        'Entity & Relationship Extraction: An LLM analyzes source text chunks to extract named entities (people, companies, locations, concepts) and the specific relationships connecting them.',
        'Knowledge Graph Construction: Entities form graph nodes, and relationships form directed edges, annotated with descriptions and source document citations.',
        'Community Detection: Algorithms like the Leiden algorithm partition the graph into hierarchical clusters of densely connected entities (communities).',
        'Community Summarization: An LLM generates pre-computed executive summaries for each community at macro, meso, and micro abstraction levels.',
        'Global Query Routing: When a user asks a broad thematic question, GraphRAG queries the community summaries in parallel, generating a comprehensive, evidence-backed synthesis.',
      ],
      table: {
        caption: 'Vector RAG vs GraphRAG comparison',
        columns: ['Feature', 'Vector RAG', 'GraphRAG'],
        rows: [
          ['Primary Search Mechanism', 'Cosine distance across dense embeddings', 'Graph traversal & community summary synthesis'],
          ['Best Question Types', 'Point queries ("What is X?")', 'Global thematic queries ("How does X connect to Y?")'],
          ['Ingestion Compute Cost', 'Low (one embedding call per chunk)', 'High (multiple LLM extraction calls per chunk)'],
          ['Multi-Hop Reasoning', 'Poor (relies on coincidence in single chunk)', 'Native (follows graph edges across documents)'],
          ['Traceability & Citations', 'Direct chunk attribution', 'Entity and relationship graph provenance'],
          ['Query Latency', 'Fast (50ms - 200ms)', 'Moderate to Slow (300ms - 1500ms)'],
        ],
      },
    },
    {
      heading: 'Do you really need a dedicated graph database like Neo4j?',
      paragraphs: [
        'A widespread belief is that implementing GraphRAG requires purchasing and managing an enterprise graph database like Neo4j, Amazon Neptune, or TigerGraph. While dedicated graph engines excel at deep multi-hop traversals over billions of edges, they are often unnecessary for early-to-mid stage GraphRAG implementations.',
        'You can implement production GraphRAG using standard relational databases like PostgreSQL. By storing entities in an `entities` table and connections in an `edges` table, you can easily perform multi-hop traversals using SQL recursive Common Table Expressions (CTEs) or specialized extensions like Apache AGE.',
        'Many lightweight implementations store the pre-computed community summaries in standard key-value stores or vector tables, completely avoiding active graph traversal at query time.',
      ],
      example: {
        title: 'Real example: analyzing clinical trial conflicts across medical journals',
        paragraphs: [
          'A medical researcher queries 5,000 research papers: "Which pharmaceutical companies have funded trials involving Dr. Smith, and what clinical outcomes did those trials report?"',
          'Vector RAG fails: chunks mentioning Dr. Smith often omit the funding disclosures, which are placed at the end of the papers, while chunks with funding disclosures do not list all trial outcomes.',
          'GraphRAG succeeds: it identifies the entity "Dr. Smith", traverses the "INVESTIGATED" edge to clinical trial nodes, follows the "FUNDED_BY" edges to corporate sponsor nodes, and aggregates the linked outcome metrics into an exact relational report.',
        ],
      },
    },
    {
      heading: 'When should you choose GraphRAG over Vector RAG?',
      paragraphs: [
        'Because GraphRAG requires significant upfront indexing compute (using LLMs to extract entities from every chunk), it should be chosen deliberately based on your problem domain rather than applied as a generic replacement for search.',
        'Choose GraphRAG when your users need to connect disparate clues across a large corpus: fraud investigations, corporate acquisitions, intelligence analysis, competitive research, and complex medical or legal discovery.',
        'If your workload is primarily answering factual questions from user manuals, customer support FAQs, or software API documentation, traditional hybrid search (combining BM25 and vector embeddings) is faster, cheaper, and more than sufficient.',
      ],
      bullets: [
        'Assess whether your users ask "needle in a haystack" questions (use Vector RAG) or "shape of the haystack" questions (use GraphRAG)',
        'Calculate upfront extraction costs: run entity extraction on a small 100-page sample before indexing your entire archive',
        'Consider hybrid GraphRAG: use vector search to locate initial anchor entities, then traverse graph edges for surrounding context',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is GraphRAG?',
      a: 'GraphRAG is a retrieval architecture that uses an LLM to extract a structured knowledge graph (entities and relationships) from text, clusters them into communities, and uses both graph traversal and pre-computed summaries to answer complex, corpus-wide questions.',
    },
    {
      q: 'How does GraphRAG differ from traditional vector RAG?',
      a: 'Traditional RAG matches queries to isolated text chunks using semantic vector similarity. GraphRAG connects entities across documents into a web of relationships, allowing the model to answer thematic and multi-hop questions that no single chunk contains.',
    },
    {
      q: 'Can GraphRAG replace vector search entirely?',
      a: 'No. GraphRAG complements vector search rather than replacing it. In fact, most advanced GraphRAG systems use vector embeddings to index entity descriptions and community summaries.',
    },
    {
      q: 'Is GraphRAG expensive to build?',
      a: 'Indexing is significantly more expensive than standard RAG because it requires LLM calls to extract entities, relationships, and community summaries across your entire corpus. However, query-time costs can be comparable.',
    },
    {
      q: 'Do I need Neo4j for GraphRAG?',
      a: 'No. You can build GraphRAG using PostgreSQL (with recursive CTEs or the Apache AGE extension), SQLite, or lightweight in-memory graph libraries like NetworkX.',
    },
  ],
  related: [
    'rag-alternatives-in-2026',
    'what-is-agentic-rag',
    'postgresql-pgvector-for-ai-job-search',
    'rag-explained',
  ],
  references: [
    {
      title: 'From Local to Global: A Graph RAG Approach to Query-Focused Summarization',
      url: 'https://arxiv.org/abs/2404.16130',
      publisher: 'arXiv',
      note: 'The original Microsoft Research paper introducing the GraphRAG framework and community summarization.',
    },
    {
      title: 'PostgreSQL Relational and Hierarchical Queries',
      url: 'https://postgresql.org/',
      publisher: 'PostgreSQL',
      note: 'Technical documentation for recursive queries used to traverse entity relationship graphs.',
    },
  ],
};

export default post;
