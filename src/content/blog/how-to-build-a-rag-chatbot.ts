import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-rag-chatbot',
  tint: 'sky',
  title: 'How to Build a RAG Chatbot for Your Website in 2026',
  heading: 'How to build a production-ready RAG chatbot for your website',
  description:
    'Step-by-step architecture for building a customer-facing RAG chatbot: multi-turn conversational memory, query condensation, streaming answers, and source citations.',
  keywords: [
    'how to build a chatbot with rag',
    'how to build a rag chatbot for your website',
    'rag chatbot architecture',
    'build a rag chatbot',
    'multi turn rag chatbot',
    'streaming rag chatbot',
    'conversational rag pipeline',
    'rag chatbot tutorial',
    'website ai chatbot with rag',
    'customer support rag chatbot',
  ],
  publishedAt: '2026-09-26',
  updatedAt: '2026-09-26',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Engineering',
  anchors: ['RAG chatbot architecture', 'build a RAG chatbot'],
  excerpt:
    'Single-turn RAG is simple, but building a conversational chatbot requires handling multi-turn follow-ups, condensed query rewriting, token streaming, and clear citations.',
  keyTakeaways: [
    'Naive conversational RAG fails on pronouns ("What did they do next?") because embedding models cannot infer context without query condensation.',
    'Query condensation uses a fast model to rewrite conversational follow-ups into standalone, self-contained search queries before retrieval.',
    'Chat history must be separated: past conversation turns provide conversational context, while retrieved chunks provide factual grounding.',
    'Streaming answers via Server-Sent Events (SSE) cuts perceived time-to-first-token to under 300 milliseconds.',
    'Always provide interactive source badges in the UI so users can verify citations without disrupting chat flow.',
  ],
  sections: [
    {
      heading: 'Why conversational RAG is harder than document search',
      paragraphs: [
        'Many engineering teams build a working document search prototype, wrap a chat interface around it, and immediately discover that the chatbot breaks down after the second turn of conversation.',
        'The breakdown happens because human conversation is inherently contextual and dependent on pronouns. When a user asks "What are the requirements for our Enterprise Plan?", RAG works perfectly. When the user follows up with "How much does it cost?", embedding the phrase "How much does it cost?" into a vector search yields completely useless chunks about pricing across unrelated products.',
        'Converting a static RAG pipeline into a true conversational chatbot requires solving three architectural challenges: query reformulation, conversation memory management, and low-latency streaming.',
      ],
    },
    {
      heading: 'The query condensation step: resolving pronouns and history',
      paragraphs: [
        'The critical component in a conversational RAG chatbot is the Query Reformulator (often termed query condensation or contextualization).',
        'Before the chatbot executes a search against your vector database, it passes the recent chat history (the last 3-4 turns) and the user’s new message to a fast, lightweight LLM with a strict prompt: "Given the chat history and the latest user message, rephrase the message into a complete, standalone question that can be understood without the prior conversation."',
        'When the user asks "How much does it cost?", the query condenser outputs: "What is the pricing and cost of the Enterprise Plan?" This standalone question is then embedded and retrieved against the knowledge base with 100% relevance.',
      ],
      table: {
        caption: 'Query condensation examples in multi-turn chat',
        columns: ['Prior Context', 'User Follow-up', 'Condensed Search Query Generated'],
        rows: [
          ['Discussing refund policy for damaged goods', 'How many days do I have?', 'What is the return window timeframe for damaged products?'],
          ['Talking about remote developer positions in Germany', 'Do you sponsor visas for it?', 'Does the company offer visa sponsorship for remote developer roles in Germany?'],
          ['Explaining health insurance benefits', 'What about dental?', 'What dental coverage and benefits are included in the company health plan?'],
        ],
      },
    },
    {
      heading: 'Structuring prompt context: conversation history vs retrieved chunks',
      paragraphs: [
        'A common architectural bug in custom chatbots is concatenating the retrieved document chunks directly into the user message history. This confuses the model, causing it to treat reference documentation as past conversational banter.',
        'Keep the two context streams strictly separated in the model prompt:',
      ],
      bullets: [
        'System Message: Contains the agent persona, tone guidelines, and strict grounding instructions: "Answer only using the provided Reference Context. If unsure, admit it."',
        'Reference Context Block: Contains the retrieved chunks with unique identifiers (`[Doc 1]`, `[Doc 2]`).',
        'Conversation History: Contains the clean, chronological sequence of prior user questions and assistant answers (omitting past chunks to save tokens).',
        'Latest User Message: The current question triggering the response.',
      ],
      example: {
        title: 'Prompt template for conversational RAG',
        paragraphs: [
          'SYSTEM: You are the JobsDart Support Assistant. Answer accurately using ONLY the Reference Context below. Cite sources using [Doc X].',
          'REFERENCE CONTEXT:\n[Doc 1] Title: Refund Policy - "Subscriptions can be canceled within 14 days for a full refund."\n[Doc 2] Title: Billing FAQ - "Invoices are generated on the 1st of each month."',
          'CHAT HISTORY:\nUser: Can I get my money back if I change my mind?\nAssistant: Yes, you can cancel within 14 days for a full refund [Doc 1].',
          'CURRENT USER QUESTION: Where do I find the invoice for it?',
        ],
      },
    },
    {
      heading: 'Streaming responses and interactive source citations',
      paragraphs: [
        'A customer waiting five seconds in front of a frozen text box assumes the chatbot has crashed. Production chatbots use Server-Sent Events (SSE) or WebSockets to stream generated tokens immediately as they leave the inference engine.',
        'At the start of the stream, send a JSON metadata packet containing the retrieved citation titles, URLs, and similarity scores. Then stream the raw markdown text tokens. The front-end renders the text progressively with a markdown parser, replacing citation tags like `[Doc 1]` with interactive tooltip badges that preview the exact quoted text.',
      ],
      bullets: [
        'Stream tokens via standard HTTP Server-Sent Events (SSE) for maximum firewall and proxy compatibility',
        'Render citation badges as hoverable tooltips so users can verify facts without leaving the chat interface',
        'Implement rate limiting and token consumption guards to prevent abusive multi-thousand token queries',
        'Add thumbs-up/thumbs-down feedback widgets on every assistant response to build your evaluation dataset',
      ],
    },
  ],
  faqs: [
    {
      q: 'How do you build a RAG chatbot?',
      a: 'To build a RAG chatbot: 1) Index your documentation into a vector store, 2) Use a query condensation model to rewrite conversational follow-ups into standalone queries, 3) Retrieve matching chunks, 4) Inject both conversation history and retrieved chunks into an LLM prompt, and 5) Stream the response with citations.',
    },
    {
      q: 'Why do naive RAG chatbots fail on follow-up questions?',
      a: 'They fail because follow-up questions use pronouns like "it", "they", or "the second option". Embedding these pronoun-heavy questions without conversational context returns irrelevant search chunks.',
    },
    {
      q: 'What is query condensation in conversational AI?',
      a: 'Query condensation is a preprocessing step where an LLM analyzes the chat history and the user’s new question to produce a fully qualified, standalone search prompt that contains all necessary entities and context.',
    },
    {
      q: 'How do you handle citations in a RAG chatbot?',
      a: 'Number your retrieved chunks (e.g. `[Doc 1]`, `[Doc 2]`) in the prompt and instruct the model to reference them in its answer. On the client, parse these markers into clickable badges that display the source title and excerpt.',
    },
    {
      q: 'How do you stream answers from a RAG chatbot?',
      a: 'Use Server-Sent Events (SSE) to send chunks of generated text to the browser in real time, reducing the user’s perceived latency to just a few hundred milliseconds.',
    },
  ],
  related: [
    'how-to-build-a-rag-application-from-scratch',
    'how-to-reduce-rag-hallucinations',
    'rag-explained',
    'what-is-agentic-rag',
  ],
  references: [
    {
      title: 'Conversational Question Answering with Retrieval Augmented Generation',
      url: 'https://arxiv.org/abs/2305.14283',
      publisher: 'arXiv',
      note: 'Academic research exploring query reformulation and context tracking in conversational RAG.',
    },
    {
      title: 'MDN Server-Sent Events (SSE) Documentation',
      url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events',
      publisher: 'MDN Web Docs',
      note: 'Standards guide for streaming real-time tokens over standard HTTP connections.',
    },
  ],
};

export default post;
