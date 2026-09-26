import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-graphrag-application',
  tint: 'emerald',
  title: 'How to Build a GraphRAG Application From Scratch',
  heading: 'How to build a GraphRAG application: a practical implementation guide',
  description:
    'Learn how to build a GraphRAG application from scratch: entity extraction prompts, knowledge graph construction, community clustering, and global search synthesis.',
  keywords: [
    'how to build a graphrag application',
    'build a graphrag application',
    'extracting knowledge graph entities',
    'graphrag implementation tutorial',
    'knowledge graph rag from scratch',
    'graphrag python code',
    'leiden community detection graphrag',
    'graphrag community summaries',
    'building graphrag with postgresql',
    'graphrag architecture step by step',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 11,
  category: 'AI Engineering',
  anchors: ['build a GraphRAG application', 'extracting knowledge graph entities'],
  excerpt:
    'Vector search misses thematic relationships across large document collections. Here is a practical engineering guide to building a GraphRAG system from scratch, from entity extraction to community summarization.',
  keyTakeaways: [
    'GraphRAG requires a two-phase architecture: an offline knowledge-graph extraction pipeline and an online dual-mode retrieval engine.',
    'Entity and relationship extraction uses structured JSON prompting with gleaning passes to catch overlooked connections.',
    'Hierarchical community detection (like the Leiden algorithm) clusters densely connected entities into multi-level topical groups.',
    'Community summaries pre-compute answers to broad, corpus-wide questions before the user ever types a query.',
    'Query processing routes dynamically: local point queries traverse direct graph edges, while global thematic queries inspect community summaries.',
  ],
  sections: [
    {
      heading: 'The two-phase architecture of a GraphRAG system',
      paragraphs: [
        'Building a GraphRAG system requires shifting your mental model from simple vector indexing to automated knowledge engineering. Unlike traditional RAG, which processes documents independently, GraphRAG maps the connections between all documents in your collection.',
        'A complete GraphRAG implementation consists of two distinct operational phases: the Offline Graph Extraction & Clustering Pipeline, and the Online Retrieval & Synthesis Engine.',
        'During the offline phase, your system reads source text, extracts entities and relationships, builds a graph network, and generates hierarchical community summaries. During the online phase, the system uses this pre-computed graph to answer both local entity lookups and global thematic questions.',
      ],
    },
    {
      heading: 'Phase 1: Entity extraction and gleaning passes',
      paragraphs: [
        'The foundation of GraphRAG is accurate entity and relationship extraction. You split your raw text into chunks (typically 600 to 1,000 tokens) and pass each chunk to an LLM with a specialized extraction prompt.',
        'The prompt instructs the model to identify named entities (e.g. `Organization`, `Person`, `Location`, `Technology`, `Event`) and the specific directed relationships connecting them (e.g. `ACQUIRED`, `INVESTIGATED`, `DEPENDS_ON`).',
        'Crucially, a single extraction pass often misses subtle relationships. Production systems implement "gleaning passes": asking the model a follow-up question ("Are there any additional entities or relationships in this text that you missed?") until the model returns an empty list. This increases relationship yield by up to 35%.',
      ],
      table: {
        caption: 'Graph extraction data model schema',
        columns: ['Data Element', 'Attributes Stored', 'Example Instance'],
        rows: [
          ['Entity (Node)', 'Name, Type, Description, Source Chunks', 'Stripe | Organization | Online payment infrastructure provider'],
          ['Relationship (Edge)', 'Source, Target, Description, Weight, Source Chunks', 'Stripe -> Paystack | ACQUIRED | Stripe acquired Paystack for $200M in 2020'],
          ['Community (Cluster)', 'Level, Member Entities, Summary', 'Fintech M&A | Cluster of payment providers and African expansion deals'],
        ],
      },
    },
    {
      heading: 'Phase 2: Community detection and hierarchical summarization',
      paragraphs: [
        'Once nodes and edges are extracted from all documents, the raw graph typically contains thousands of interconnected points. Querying this massive graph directly at inference time would overwhelm model context windows.',
        'GraphRAG solves this by applying community detection algorithms — specifically the Leiden algorithm — to partition the graph into a hierarchy of clusters. Closely related entities are grouped into Level-0 micro-communities, which roll up into Level-1 meso-communities, and finally Level-2 macro-communities.',
        'For each detected community, an LLM generates a pre-computed executive summary: describing the overarching narrative, key actors, controversial claims, and unresolved questions within that cluster. These community summaries are what allow GraphRAG to answer global questions ("What were the main regulatory controversies across all portfolio companies?") in seconds.',
      ],
      example: {
        title: 'Building community summaries in PostgreSQL',
        paragraphs: [
          'Store nodes and edges in standard tables: `CREATE TABLE graph_nodes (id UUID PRIMARY KEY, name TEXT UNIQUE, type TEXT, description TEXT);`',
          '`CREATE TABLE graph_edges (id UUID PRIMARY KEY, source_id UUID REFERENCES graph_nodes(id), target_id UUID REFERENCES graph_nodes(id), relationship TEXT, weight FLOAT, description TEXT);`',
          '`CREATE TABLE community_summaries (id UUID PRIMARY KEY, level INT, title TEXT, summary TEXT, embedding vector(1536));`',
          'At query time, global questions search against `community_summaries` vectors, while local queries traverse `graph_edges` using SQL joins.',
        ],
      },
    },
    {
      heading: 'Phase 3: The dual-mode query engine (Local vs Global search)',
      paragraphs: [
        'When a user submits a query to a GraphRAG system, the engine determines whether the prompt is a Local Search or a Global Search.',
        'Local Search is used for specific entity questions ("What patents did Dr. Vance file in 2024?"). The engine identifies the anchor entity node, retrieves its immediate neighboring nodes and incident edges, and passes that sub-graph into the LLM context.',
        'Global Search is used for broad thematic questions ("What are the recurring failure modes in our rocket launches?"). The engine queries the pre-computed community summaries in parallel, aggregates their insights, and synthesizes a comprehensive report complete with entity citations.',
      ],
      bullets: [
        'Use gleaning passes during extraction to maximize relationship discovery',
        'Pre-compute community summaries so global questions do not require real-time graph traversal',
        'Index community summaries with vector embeddings for fast semantic routing',
        'Implement caching for frequent entity neighborhoods to minimize database latency',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do you build a GraphRAG application?',
      a: 'To build GraphRAG: 1) Parse documents and extract entities and relationships using an LLM, 2) Store them as a knowledge graph, 3) Run community detection (like Leiden) to cluster related entities, 4) Generate pre-computed summaries for each cluster, and 5) Route user queries to either local graph traversals or global community summaries.',
    },
    {
      q: 'What is entity gleaning in GraphRAG?',
      a: 'Gleaning is a technique where an LLM is prompted multiple times on the same text passage to discover secondary entities and subtle relationships that were overlooked during the initial extraction pass.',
    },
    {
      q: 'What is the Leiden algorithm used for in GraphRAG?',
      a: 'The Leiden algorithm is a community detection algorithm that partitions a large graph network into hierarchical clusters of densely connected nodes, enabling structured summarization at different abstraction levels.',
    },
    {
      q: 'What is the difference between Local Search and Global Search in GraphRAG?',
      a: 'Local Search answers specific questions about individual entities by inspecting their immediate graph neighbors. Global Search answers broad thematic questions by querying pre-computed community summaries across the entire dataset.',
    },
    {
      q: 'Can you build GraphRAG using PostgreSQL?',
      a: 'Yes. PostgreSQL can easily store graph nodes, directed edges, and community summaries in standard relational tables with pgvector, avoiding the operational overhead of a separate graph database.',
    },
  ],
  related: [
    'what-is-graphrag',
    'how-to-build-a-rag-application-from-scratch',
    'postgresql-pgvector-for-ai-job-search',
    'rag-alternatives-in-2026',
  ],
  references: [
    {
      title: 'From Local to Global: A Graph RAG Approach to Query-Focused Summarization',
      url: 'https://arxiv.org/abs/2404.16130',
      publisher: 'arXiv',
      note: 'The foundational Microsoft Research paper detailing GraphRAG implementation and community detection.',
    },
    {
      title: 'PostgreSQL Relational and Hierarchical Queries',
      url: 'https://postgresql.org/',
      publisher: 'PostgreSQL',
      note: 'Technical specifications for storing and traversing graph structures in PostgreSQL.',
    },
  ],
};

export default post;
