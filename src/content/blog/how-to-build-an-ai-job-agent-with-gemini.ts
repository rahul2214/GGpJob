import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-an-ai-job-agent-with-gemini',
  tint: 'sky',
  title: 'How to Build an AI Job Agent With Gemini',
  heading: 'Building on Gemini models',
  description:
    'Where Gemini fits in a job agent: long context, multimodal document handling, function calling and structured output, and the trade-offs of a large context window.',
  keywords: [
    'gemini job agent',
    'gemini function calling',
    'long context window',
    'multimodal document parsing',
    'gemini structured output',
    'context window tradeoffs',
    'resume pdf parsing ai',
    'gemini api agent',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['job agent with Gemini', 'long context'],
  excerpt:
    'A very large context window is genuinely useful here and also a trap: it makes the lazy design possible for longer than it should be.',
  keyTakeaways: [
    'Long context removes chunking machinery and makes comparison judgements more consistent.',
    'Reading a CV visually handles the layouts that silently defeat text extraction.',
    'Tokens still cost money and relevance still degrades — generosity, not a substitute for retrieval.',
    'Define an output schema for every extraction step rather than parsing prose.',
    'Keep an adapter seam so capability and price changes do not require a rewrite.',
  ],
  sections: [
    {
      heading: 'Long context suits this problem',
      paragraphs: [
        'Job matching involves large inputs — a full CV, several postings, a candidate’s application history. Being able to hold all of it at once removes a lot of chunking machinery and the errors that come with it.',
        'It is particularly useful for comparison tasks. Evaluating one CV against ten postings in a single call, with everything visible, produces more consistent relative judgements than ten independent calls ever will.',
        'Consistency is the underrated part. Ten independent scoring calls drift against each other because nothing anchors them to a common scale, where one call ranking ten postings produces an ordering that is internally coherent even if the absolute numbers are arbitrary.',
      ],
    },
    {
      heading: 'Multimodal handling of documents',
      paragraphs: [
        'CVs arrive as PDFs with columns, tables, graphics and occasionally scanned pages. A text-extraction pipeline mangles exactly those cases, and the mangling is silent.',
        'Passing the document directly to a model that reads it visually handles layouts that defeat extraction. Verify the result against your structured profile rather than trusting it, but as a parsing path for awkward documents it is markedly better than the alternative.',
        'Use it as a fallback rather than the default path. Text extraction is far cheaper and correct for the majority of documents, so the sensible design extracts first, detects the failure signs — out-of-order sections, missing dates, a suspiciously short result — and escalates only those to the expensive route.',
      ],
      bullets: [
        'Multi-column layouts that linearise badly',
        'Tables of skills or dates',
        'Scanned or image-based pages',
        'Anything where extracted text arrives out of reading order',
      ],
      table: {
        caption: 'Which parsing path to use',
        columns: ['Document', 'Path', 'Why'],
        rows: [
          ['Single-column PDF', 'Text extraction', 'Cheap and accurate'],
          ['Two-column layout', 'Visual read', 'Extraction reorders content'],
          ['Tables of dates or skills', 'Visual read', 'Structure is lost in text'],
          ['Scanned pages', 'Visual read', 'No text layer at all'],
          ['Plain DOCX', 'Text extraction', 'Structure already present'],
        ],
      },
    },
    {
      heading: 'Large context is not free',
      paragraphs: [
        'Every token in the window costs money and latency, and relevance still degrades when the important detail is buried among a hundred thousand tokens of loosely related material. "Put everything in" is a design that works until it quietly stops.',
        'Retrieval remains the right approach at scale: select what matters and send that. Use the large window to be generous with what you include, not as a substitute for deciding what is relevant.',
        'The failure is gradual rather than obvious, which is what makes it dangerous. Nothing errors when the context grows; results simply get slightly worse and slightly slower, and the cause is invisible unless someone is comparing against a smaller, curated prompt.',
      ],
    },
    {
      heading: 'Tools and structured output',
      paragraphs: [
        'Function calling and schema-constrained responses work the way you would expect, and the same rules apply as anywhere: describe tools by their effect, keep required parameters few, and make error returns instructive.',
        'Define output schemas for every extraction step rather than parsing prose. This is the single change that most reduces incidents in an extraction-heavy pipeline, regardless of provider.',
        'Validate the domain as well as the shape. A schema-valid result with a salary of zero, a date in the future or a location outside the allowed set has satisfied the constraint and not the requirement, and catching that at the boundary is far cheaper than discovering it in a ranking.',
      ],
    },
    {
      heading: 'Keep the adapter seam',
      paragraphs: [
        'Provider capabilities and prices move, and an agent wired directly to one SDK is expensive to move later. Express tools and results in your own types and keep the provider behind one adapter.',
        'This also makes routing possible: multimodal parsing to one provider, cheap classification to another, hard judgement to a third. That flexibility is only available if the seam exists from the start.',
        'Record which provider and model produced each stored result. Without that, a change in behaviour after a model update is indistinguishable from a change in the market, and re-scoring for consistency becomes guesswork rather than a query.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the main advantage of a long context window here?',
      a: 'It removes chunking machinery for large inputs, and it makes comparison tasks more consistent — one CV against ten postings in a single call with everything visible.',
    },
    {
      q: 'Can I pass a CV PDF directly to the model?',
      a: 'Yes, and it handles multi-column layouts, tables and scanned pages that silently defeat text extraction. Use it as a fallback after extraction rather than as the default path.',
    },
    {
      q: 'Does a large context window replace retrieval?',
      a: 'No. Tokens cost money and latency, and relevance degrades when the key detail is buried. Use the window to be generous, not to skip deciding what matters.',
    },
    {
      q: 'Should I commit to one provider?',
      a: 'Keep an adapter seam. It preserves the option to route multimodal parsing, cheap classification and hard judgement to different providers as prices and capabilities move.',
    },
    {
      q: 'Why does a bloated context fail quietly?',
      a: 'Because nothing errors. Results get slightly worse and slower, and the cause stays invisible unless someone compares against a smaller curated prompt.',
    },
    {
      q: 'Is a schema-valid response good enough?',
      a: 'Not on its own. A zero salary, a future date or a disallowed location all satisfy the schema, so domain validation belongs at the same boundary.',
    },
  ],
  related: ['how-to-build-an-ai-job-agent-with-openai', 'how-to-build-an-ai-resume-parser', 'how-to-build-an-ai-job-agent-with-claude'],
};

export default post;
