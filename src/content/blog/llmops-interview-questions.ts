import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'llmops-interview-questions',
  tint: 'sky',
  title: 'LLMOps Interview Questions and What They Test',
  heading: 'LLMOps interview questions',
  description:
    'The deployment, evaluation, cost and incident questions LLMOps interviews ask, and how answers from people who have operated these systems differ.',
  keywords: [
    'llmops interview questions',
    'llmops engineer interview',
    'llm operations interview',
    'mlops interview questions llm',
    'ai platform engineer interview',
    'llm deployment questions',
    'llm cost optimization interview',
    'llmops preparation',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  anchors: ['LLMOps interview', 'reproducibility'],
  excerpt:
    'These interviews sort demo-builders from operators, and one question does most of the sorting: what happened the last time quality dropped.',
  keyTakeaways: [
    'The questions cluster around what only exists once real traffic arrives.',
    'You do not own the model, so reproducibility means capturing everything around the call.',
    'Averages hide regressions — the per-case view is what you look at.',
    'Cost scales per request and hides in token counts until the invoice arrives.',
    'The incident question cannot be answered from theory, which is why it carries the most weight.',
  ],
  sections: [
    {
      heading: 'What is being assessed',
      paragraphs: [
        'LLMOps interviews test whether you have run something rather than built something. The questions cluster around the parts that only exist once real traffic arrives: reproducibility, regression detection, cost, and what you did when it broke.',
        'Most candidates can describe an architecture. Far fewer can describe an incident, which is why the incident question carries disproportionate weight.',
        'The underlying concern is whether you will be surprised by things an experienced operator expects. Someone who already knows that providers change behaviour silently, that cost is fine in staging and alarming in production, and that quality degrades without any error being thrown needs far less supervision.',
      ],
    },
    {
      heading: 'Reproducibility without owning the model',
      paragraphs: [
        'Expect a question about versioning. The trap is answering as if this were classical ML, where you control the artefact. With a hosted model you do not: the provider can change behaviour with no deployment on your side.',
        'A strong answer captures everything around the call — prompt, context, parameters, retrieval results, model identifier — precisely because the one component you cannot snapshot is the model. Mentioning that you pin model versions where the provider allows it, and monitor for drift where it does not, shows you have thought about the gap rather than ignored it.',
        'The related question is what you would do the week a pinned version is deprecated. Answering that you would run the evaluation suite against the successor before switching, and hold the comparison rather than accepting the migration blind, is what an operator says.',
      ],
    },
    {
      heading: 'Evaluation and regression',
      paragraphs: [
        'You will be asked how a change gets to production safely. The answer that distinguishes operators is a versioned evaluation set running automatically on every change to prompts, retrieval, context assembly or model version — with per-case results, not just an average.',
        'The follow-up worth preparing: a change improves the average and breaks three previously passing cases. Do you ship it? The right instinct is that averages hide regressions, and the per-case view is what you look at.',
        'Add that you would look at which three broke before deciding. If they are edge cases nobody hits, shipping may be right; if they are the refusal cases where the system should say it does not know, the average improved while the product got worse in the way users notice.',
      ],
      bullets: [
        'What triggers an evaluation run, and what blocks a deploy?',
        'How do you catch a provider-side behaviour change?',
        'How do you grade outputs that have no single correct answer?',
        'How often do you calibrate a model grader against humans?',
      ],
    },
    {
      heading: 'Cost, the question that exposes demos',
      paragraphs: [
        'Classical ML concentrates cost in training. LLM systems concentrate it in serving, where it scales with usage and hides inside a per-request token count nobody looks at until the invoice arrives.',
        'Be ready to reason out loud: what drives cost per request, which changes move it, how you would cut it without hurting quality, and how you decide whether a two-point accuracy gain justifies doubling spend. That last one is a judgement question, and "it depends on the use case" is only a good answer if you then say what it depends on.',
        'Have two concrete levers ready. Routing easy requests to a smaller model and caching a stable prompt prefix are the ones that most often produce large savings with no quality cost, and naming them specifically beats listing optimisation techniques abstractly.',
      ],
      table: {
        caption: 'What a demo-builder and an operator say to the same question',
        columns: ['Question', 'Demo answer', 'Operator answer'],
        rows: [
          ['How do you version it?', 'We store the prompt in git', 'Everything around the call, plus drift monitoring'],
          ['How do you deploy safely?', 'We test it first', 'Eval suite blocks the deploy, per case'],
          ['What does it cost?', 'Not much per call', 'Cost per completed request, and what drives it'],
          ['How do you know it broke?', 'Users tell us', 'Scheduled eval run against production config'],
          ['Quality dropped, nothing shipped', 'Check the code', 'Provider, index, corpus drift — in that order'],
          ['Model gets deprecated', 'Switch to the new one', 'Run the suite against it, compare, then switch'],
        ],
      },
    },
    {
      heading: 'The incident question',
      paragraphs: [
        'Expect: "users report the assistant got worse this week. Nothing was deployed. What do you do?" This is the best question in the interview because it cannot be answered from theory.',
        'Good answers establish facts before theorising — what changed, when it was last known good, whether the evaluation set shows it — then work outward to provider changes, data drift in the retrieval corpus, or a silently failing index. Weak answers jump to a suspected cause, which is exactly what makes real incidents last for days.',
        'The detail that impresses is naming the failure nothing alerts on: a scheduled reindex that stopped succeeding, so new documents are written and never embedded. There is no error, no latency change and no cost change — only answers that quietly stop covering recent material.',
      ],
      example: {
        title: '"It got worse and nothing shipped" — a structured answer',
        paragraphs: [
          'First, make it concrete. Which questions got worse, and when was it last known good? A complaint without a comparison point is not yet an incident.',
          'Then look at the evaluation history, because that converts the whole problem from an opinion into a date. If the nightly run dropped on Tuesday, everything before Tuesday is out of scope.',
          'Then work outward in order of likelihood. Did the provider change the model — check whether the version is pinned and when it last moved. Did the retrieval corpus change — check index document counts and the last successful build. Did traffic change — a new customer asking a different kind of question can shift perceived quality with nothing broken at all.',
          'And if the evaluation set shows nothing while users insist, that is informative too: it means the failure is in a category the suite does not cover, and the outcome of the incident should be a new set of cases rather than only a fix.',
        ],
      },
    },
    {
      heading: 'Preparing without the job title',
      paragraphs: [
        'Ship one small LLM feature and operate it for a few weeks. Add an evaluation set, track cost per request, and let something break. That gives you concrete answers to every question above.',
        'If you come from MLOps or platform engineering, lead with that experience rather than apologising for it. Deployment, monitoring, rollback and reproducibility all transfer; what you add is evaluation design and token economics, and interviewers know the gap is narrower than job descriptions imply.',
        'Frame the transferable parts in their vocabulary. Saying that you would treat the prompt and the retrieval index as deployable artefacts with versions and rollback is the same instinct you already have, expressed in terms that make the fit obvious.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the hardest LLMOps interview question?',
      a: 'The incident one — quality dropped and nothing was deployed. It cannot be answered from theory, and it separates people who have operated these systems from people who have built demos.',
    },
    {
      q: 'How do you version an LLM system you do not own?',
      a: 'By capturing everything around the call: prompt, assembled context, parameters, retrieval results and model identifier. Pin the model version where the provider allows it and monitor for drift where it does not.',
    },
    {
      q: 'Do I need MLOps experience to get an LLMOps role?',
      a: 'It helps considerably and the gap is smaller than job descriptions suggest. Versioning, monitoring and rollback transfer directly; what you add is evaluation design, retrieval and token economics.',
    },
    {
      q: 'What cost answer do interviewers want?',
      a: 'Specifics: what drives cost per request, which changes move it, and how you judge whether a quality gain justifies the spend. "It depends" only counts if you go on to say what it depends on.',
    },
    {
      q: 'Should I ship a change that improves the average but breaks three cases?',
      a: 'Look at which three first. Edge cases nobody hits may be acceptable; refusal cases are not, because the average improved while the product got worse in the way users notice.',
    },
    {
      q: 'Which silent failure is worth naming in an interview?',
      a: 'A scheduled reindex that stopped succeeding. New documents are written and never embedded, so there is no error, no latency change and no cost change — only answers that stop covering recent material.',
    },
  ],
  related: ['llmops-vs-mlops', 'ai-evaluation-llm-evals', 'what-is-ai-observability'],
  references: [
    {
      title: 'AI Risk Management Framework',
      url: 'https://www.nist.gov/itl/ai-risk-management-framework',
      publisher: 'NIST',
      note: 'Useful vocabulary for the monitoring and governance side of these interviews.',
    },
  ],
};

export default post;
