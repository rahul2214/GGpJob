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
  excerpt:
    'Your dashboards are green and the answers are wrong. That gap is the entire reason AI observability exists as a separate discipline.',
  sections: [
    {
      heading: 'Why normal monitoring misses everything',
      paragraphs: [
        'Conventional monitoring watches for failure: error rates, latency, saturation. An LLM system that has quietly become useless produces none of those signals. It returns 200s, in normal time, with well-formed text that happens to be wrong.',
        'This is the defining problem. There is no exception to catch, because nothing threw. The system is not broken in any sense your infrastructure understands, and the first report will come from a user who noticed something a dashboard cannot see.',
      ],
    },
    {
      heading: 'What has to be captured',
      paragraphs: [
        'The unit worth recording is the whole request, not the model call. When an answer is wrong, the question is which input caused it — and that is unanswerable unless you kept the assembled context rather than the template you think you rendered.',
        'Teams that log the final rendered prompt find bugs in an afternoon that they had spent weeks attributing to model quality. It is the single highest-return thing to add.',
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
      heading: 'The metrics that actually move',
      paragraphs: [
        'Latency and error rate still matter, but they are the least interesting numbers. The ones that tell you whether the system is healthy are quality and cost, and neither appears in a standard observability stack.',
        'Tail latency deserves particular attention. Generation time varies with output length, so an average hides the requests that took eleven seconds. Users experience the tail, not the mean.',
      ],
      bullets: [
        'Pass rate on a fixed evaluation set, tracked over time',
        'Cost per request, and which changes moved it',
        'Refusal and fallback rate — a sudden rise means something upstream broke',
        'Retrieval hit rate: how often the needed passage was even fetched',
        'p95 and p99 latency, not the average',
      ],
    },
    {
      heading: 'Sampling for human review',
      paragraphs: [
        'Automated checks catch what you thought to check for. Everything else is found by people reading real outputs, which means a deliberate sample — a fixed number per day, reviewed on a schedule, with disagreements written down.',
        'Bias the sample towards the interesting: low-confidence answers, unusually long conversations, sessions where the user rephrased the same question repeatedly. A user asking the same thing three different ways is the clearest unlabelled signal of failure you will get.',
      ],
    },
    {
      heading: 'Detecting drift you did not cause',
      paragraphs: [
        'The dependency at the centre of your system is one you do not version. A provider can change model behaviour with no deployment on your side, and the first sign is a quality metric moving on a day your team shipped nothing.',
        'This is why the evaluation set should run on a schedule and not only in CI. A nightly run against production configuration turns "users started complaining last week" into "quality dropped on Tuesday", which is the difference between an investigation and a guess.',
      ],
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
  ],
  related: ['ai-evaluation-llm-evals', 'llmops-vs-mlops', 'how-to-evaluate-an-ai-job-matching-model'],
};

export default post;
