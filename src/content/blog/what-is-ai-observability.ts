import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'what-is-ai-observability',
  tint: 'sky',
  title: 'What Is AI Observability? Monitoring LLM Systems in Production',
  heading: 'AI observability, explained',
  description:
    'Why ordinary monitoring misses LLM failures, what to trace and log instead, the metrics that matter, and how teams find out a system degraded.',
  keywords: [
    'what is ai observability',
    'llm observability',
    'monitoring llm in production',
    'ai tracing',
    'llm metrics',
    'ai observability tools',
    'llm logging best practices',
    'detect llm regression',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['AI observability', 'LLM monitoring'],
  excerpt:
    'Your dashboards are green and the answers are wrong. That gap is the entire reason AI observability exists as a separate discipline.',
  keyTakeaways: [
    'A degraded LLM system returns 200s at normal speed with fluent wrong answers — nothing throws.',
    'Log the final assembled prompt, not the template. It is the highest-return thing to add.',
    'Quality and cost are the metrics that matter, and neither appears in a standard stack.',
    'Sample outputs for human review, biased towards low confidence and repeated rephrasings.',
    'Run the evaluation set on a schedule, because the model can change with no deployment on your side.',
  ],
  sections: [
    {
      heading: 'Why normal monitoring misses everything',
      paragraphs: [
        'Conventional monitoring watches for failure: error rates, latency, saturation. An LLM system that has quietly become useless produces none of those signals. It returns 200s, in normal time, with well-formed text that happens to be wrong.',
        'This is the defining problem. There is no exception to catch, because nothing threw. The system is not broken in any sense your infrastructure understands, and the first report will come from a user who noticed something a dashboard cannot see.',
        'The consequence is that observability here has to measure the content of responses rather than the fact of them. That is a different discipline from availability monitoring, which is why bolting it onto an existing stack rarely works without deliberate effort.',
      ],
    },
    {
      heading: 'What has to be captured',
      paragraphs: [
        'The unit worth recording is the whole request, not the model call. When an answer is wrong, the question is which input caused it — and that is unanswerable unless you kept the assembled context rather than the template you think you rendered.',
        'Teams that log the final rendered prompt find bugs in an afternoon that they had spent weeks attributing to model quality. It is the single highest-return thing to add.',
        'Record what retrieval discarded as well as what it returned. Knowing that the correct passage was ranked eighth when you only passed five is a specific, fixable diagnosis; knowing only that the answer was wrong is not.',
      ],
      bullets: [
        'The final assembled prompt, not the template',
        'What retrieval returned, with scores, including what was discarded',
        'Every tool called, its arguments and its result',
        'Model, version and parameters at the time of the call',
        'Token counts in and out, and end-to-end latency',
        'The user-visible output, so a complaint can be traced to a trace',
      ],
    },
    {
      heading: 'Logging user data needs a deliberate policy',
      paragraphs: [
        'Everything above involves storing what users typed and what the system retrieved on their behalf, which in most products means personal data and sometimes a great deal of it. Useful observability and careless data retention are very easy to build at the same time.',
        'Decide the policy before the logging: what is retained, for how long, who can read it, and whether sensitive fields are redacted at write time rather than at query time. Redacting on the way in is the only version that survives someone exporting a dataset later.',
        'Sampling helps here as well as with cost. Full-fidelity traces for a percentage of traffic, with metadata-only records for the rest, gives most of the diagnostic value at a fraction of the retention exposure.',
      ],
    },
    {
      heading: 'The metrics that actually move',
      paragraphs: [
        'Latency and error rate still matter, but they are the least interesting numbers. The ones that tell you whether the system is healthy are quality and cost, and neither appears in a standard observability stack.',
        'Tail latency deserves particular attention. Generation time varies with output length, so an average hides the requests that took eleven seconds. Users experience the tail, not the mean.',
        'Refusal rate is the most diagnostic single number and the one most often missing. A system that quietly becomes more willing to guess improves on every other metric while getting worse in exactly the way users notice.',
      ],
      bullets: [
        'Pass rate on a fixed evaluation set, tracked over time',
        'Cost per request, and which changes moved it',
        'Refusal and fallback rate — a sudden rise means something upstream broke',
        'Retrieval hit rate: how often the needed passage was even fetched',
        'p95 and p99 latency, not the average',
      ],
      table: {
        caption: 'What each signal tells you, and what it misses',
        columns: ['Signal', 'Catches', 'Misses'],
        rows: [
          ['Error rate', 'Outages, timeouts', 'Fluent wrong answers'],
          ['p95 latency', 'Slow generations', 'Quality entirely'],
          ['Eval pass rate', 'Regressions you thought to test for', 'Novel failure modes'],
          ['Refusal rate', 'Guessing, upstream breakage', 'Whether the answer was right'],
          ['Retrieval hit rate', 'Retrieval-side failures', 'Generation-side failures'],
          ['Human sampling', 'What nobody predicted', 'Anything rare'],
        ],
      },
    },
    {
      heading: 'Sampling for human review',
      paragraphs: [
        'Automated checks catch what you thought to check for. Everything else is found by people reading real outputs, which means a deliberate sample — a fixed number per day, reviewed on a schedule, with disagreements written down.',
        'Bias the sample towards the interesting: low-confidence answers, unusually long conversations, sessions where the user rephrased the same question repeatedly. A user asking the same thing three different ways is the clearest unlabelled signal of failure you will get.',
        'Feed what you find back into the evaluation set. A failure discovered by a human once and never encoded as a test case will be rediscovered by a user later, which makes the review expensive rather than valuable.',
      ],
    },
    {
      heading: 'Detecting drift you did not cause',
      paragraphs: [
        'The dependency at the centre of your system is one you do not version. A provider can change model behaviour with no deployment on your side, and the first sign is a quality metric moving on a day your team shipped nothing.',
        'This is why the evaluation set should run on a schedule and not only in CI. A nightly run against production configuration turns "users started complaining last week" into "quality dropped on Tuesday", which is the difference between an investigation and a guess.',
        'Drift also comes from your own side in ways no deployment records. A reindexed corpus, a changed embedding model, or a document set that grew in one direction will all move behaviour without a release, and only a scheduled measurement catches them.',
      ],
      example: {
        title: 'What a scheduled eval run actually catches',
        paragraphs: [
          'A team ships nothing for eight days. On the ninth, the nightly evaluation run drops from 27 of 30 to 22, and the failures cluster in one category — questions about recently added documents.',
          'The investigation takes an hour instead of a week, because the date is known. A scheduled reindex job had begun failing silently four days earlier; new documents were being written to the corpus and never embedded, so they were unretrievable.',
          'No error rate moved, no latency changed, and no user had complained yet. The only signal was a number on a chart that nobody would have been plotting without a fixed set of questions run against production every night.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'How is AI observability different from normal monitoring?',
      a: 'Normal monitoring detects failure — errors, latency, saturation. An LLM system that has degraded returns 200s at normal speed with fluent wrong answers, so it needs quality signals rather than availability signals.',
    },
    {
      q: 'What is the single most useful thing to log?',
      a: 'The final assembled prompt that actually went to the model, not the template. Most "the model is bad" investigations end the moment someone reads what the model was really sent.',
    },
    {
      q: 'How do I detect that quality dropped?',
      a: 'Run a fixed evaluation set on a schedule against production configuration and track the pass rate. That converts vague complaints into a date, which is what makes the cause findable.',
    },
    {
      q: 'Do I need a specialist tool for this?',
      a: 'Not to start. Structured logs holding the prompt, retrieval results, tool calls, tokens and output cover most of the value. Specialist tooling helps at scale, once the volume makes ad hoc querying painful.',
    },
    {
      q: 'Is logging all this data a privacy problem?',
      a: 'It can be. Decide retention, access and redaction before you build the logging, redact sensitive fields at write time, and consider full traces for a sample with metadata-only for the rest.',
    },
    {
      q: 'What causes quality to drift without a deployment?',
      a: 'A provider changing the model, or your own side changing silently — a reindex, a new embedding model, or a corpus that grew unevenly. Only scheduled measurement catches any of them.',
    },
  ],
  related: ['ai-evaluation-llm-evals', 'llmops-vs-mlops', 'how-to-evaluate-an-ai-job-matching-model'],
  references: [
    {
      title: 'AI Risk Management Framework',
      url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      publisher: 'NIST',
      note: 'The framework most AI governance programmes are structured around.',
    },
  ],
};

export default post;
