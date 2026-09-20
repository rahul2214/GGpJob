import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'llmops-vs-mlops',
  tint: 'sky',
  title: 'LLMOps vs MLOps: What Actually Changes',
  heading: 'LLMOps vs MLOps',
  description:
    'How operating LLM systems differs from classical MLOps: evaluation instead of accuracy, prompts and context as artefacts, cost per request, and the skills teams hire for.',
  keywords: [
    'llmops vs mlops',
    'what is llmops',
    'llmops engineer',
    'mlops vs llmops difference',
    'llm operations',
    'llmops skills',
    'llmops jobs',
    'machine learning operations',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['LLMOps', 'MLOps'],
  excerpt:
    'Most MLOps practice still applies. What changes is that you usually do not own the model, correctness is not a number, and cost moves per request rather than per training run.',
  keyTakeaways: [
    'Versioning, monitoring, rollback and reproducibility carry over unchanged — the gap is narrower than postings suggest.',
    'You do not own the model, so reproducibility means capturing everything around the call.',
    'Correctness stops being a number, which is where most teams underinvest.',
    'Cost moves from occasional training runs to every single request, hidden in token counts.',
    'Prompts, indexes, tool definitions and evaluation sets are production artefacts and need version control.',
  ],
  sections: [
    {
      heading: 'What carries over unchanged',
      paragraphs: [
        'The instinct to treat LLMOps as an entirely new discipline is mostly marketing. Versioning what you deploy, reproducing what you shipped, monitoring in production, rolling back safely, keeping a staging environment that resembles production — all of this is the same job with a different payload.',
        'Engineers with real MLOps experience are well positioned. The gap is narrower than job descriptions suggest, and framing existing experience correctly matters more than starting over.',
        'The same applies to the cultural parts. Knowing how to run an incident, how to argue for reliability work against feature pressure, and how to build a deployment process people actually follow transfers completely, and is harder to acquire than any of the new technical material.',
      ],
    },
    {
      heading: 'You usually do not own the model',
      paragraphs: [
        'In classical ML you trained the model, so you controlled when it changed. With a hosted LLM, the thing at the centre of your system is a dependency you do not version and cannot pin indefinitely. A provider update can shift behaviour without any change on your side.',
        'That inverts a core assumption. Reproducibility now means capturing everything around the call — prompt, context, parameters, retrieved documents, model identifier — because the one component you cannot snapshot is the model itself.',
        'It also makes provider migration a standing concern rather than a one-off. Teams that abstracted the call boundary early move between providers in days; teams that scattered vendor-specific calls through their codebase spend a quarter on it.',
      ],
    },
    {
      heading: 'Correctness stops being a number',
      paragraphs: [
        'A classifier gives you accuracy on a held-out set. A summariser gives you text, and whether that text is good is a judgement. This is the single biggest practical difference, and it is where most teams underinvest.',
        'The answer is building evaluation as infrastructure: a versioned set of cases with expected properties, run automatically, with results tracked over time. Without it there is no way to tell whether a prompt change improved things or whether last week was a fluke.',
        'Getting started is less daunting than it sounds. Thirty real cases with expected properties, run on every change, catches more regressions than an elaborate framework nobody maintains — and the habit matters more than the sophistication.',
      ],
      bullets: [
        'A held-out set of real cases, versioned like code',
        'Automated checks for the properties you can state precisely',
        'Model-graded evaluation for the ones you cannot, with spot checks',
        'Regression runs before any prompt, context or model change',
        'Production sampling reviewed by humans on a schedule',
      ],
      table: {
        caption: 'The same operational concern, handled differently',
        columns: ['Concern', 'Classical MLOps', 'LLMOps'],
        rows: [
          ['Model versioning', 'You train and pin it', 'A dependency you cannot snapshot'],
          ['Correctness', 'A metric on a held-out set', 'An evaluation suite and judgement'],
          ['Cost centre', 'Training runs', 'Every request, via tokens'],
          ['Drift', 'Input distribution shifts', 'Provider changes the model under you'],
          ['Rollback', 'Redeploy a model artefact', 'Revert prompt, context and config together'],
          ['Main new risk', 'Data leakage in features', 'Injection and leakage through context'],
        ],
      },
    },
    {
      heading: 'Cost moves from training to serving',
      paragraphs: [
        'Classical ML concentrated cost in training: expensive, occasional, easy to see. LLM systems concentrate it in serving, where it scales with usage and hides inside a per-request token count that nobody looks at until the invoice arrives.',
        'This makes token accounting an operational metric alongside latency and error rate. A context change that improves quality by two per cent and triples token count is a decision, not a free win, and the team should be able to see both numbers before shipping it.',
        'The failure pattern is consistent: cost is fine in staging because volume is low, then becomes the largest line item within a month of launch. Instrumenting cost per request before launch rather than after is the cheapest thing on this list.',
      ],
    },
    {
      heading: 'New artefacts that need lifecycle management',
      paragraphs: [
        'Prompts, retrieval indexes, tool definitions and evaluation sets all behave like production artefacts: they change behaviour, they need review, and a bad one causes an incident. Treating them as configuration edited in a console is how teams end up unable to explain a regression.',
        'The mature setup keeps them in version control, reviews changes like code, and ties each deployment to a specific combination. When something breaks, the question "what changed" has an answer.',
        'Retrieval indexes deserve particular care because they drift silently. An index rebuilt with a different embedding model or a changed chunking rule produces different answers with no deployment event attached, which is close to undiagnosable without versioning.',
      ],
    },
    {
      heading: 'The safety surface is genuinely new',
      paragraphs: [
        'Classical ML had data leakage and bias concerns, which remain. What is new is that the system now consumes untrusted text and, increasingly, acts on it — which introduces failure modes with no counterpart in a classifier deployment.',
        'Prompt injection is the headline one: content retrieved from a document or a web page can address the model directly, and no amount of instruction reliably prevents it. The operational answer is not better prompting but narrower capability — the component reading untrusted content should have no tool that does anything irreversible.',
        'Output handling matters too. Text produced by a model and rendered into a page, passed to a shell, or used in a database query is the same category of risk as any other untrusted input, and it is routinely treated as though it were trusted because it came from your own system.',
      ],
      bullets: [
        'Untrusted retrieved content reaching a component with tools',
        'Sensitive data leaking into context and then into logs',
        'Model output rendered or executed without escaping',
        'Prompts containing credentials or internal detail',
      ],
    },
    {
      heading: 'Moving from MLOps into LLMOps',
      paragraphs: [
        'The transferable core is your platform and reliability experience. What to add is evaluation design, retrieval systems, token and latency budgeting, and the safety surface — prompt injection, data leakage through context, output handling.',
        'A convincing portfolio piece is small but complete: a deployed LLM feature with a versioned evaluation suite, cost per request tracked, and a written account of one regression you caught before release. That last part is what separates candidates who have operated these systems from those who have only built demos.',
        'In interviews, lead with the operational instincts rather than the model knowledge. Being able to say how you would roll back a prompt change, how you would detect a silent index rebuild, or what you would instrument before launch is worth more than describing an architecture.',
      ],
      example: {
        title: 'A regression only an evaluation suite catches',
        paragraphs: [
          'A team changes the system prompt to make answers more concise. Casual testing looks good — the responses are tighter and read better, and it ships on a Thursday.',
          'The evaluation suite, run in CI, drops from 26 of 30 to 21. Inspecting the failures shows they all belong to one category: questions whose correct answer is that the documents do not cover it. The new prompt made the model less willing to say so, and it now guesses instead.',
          'Nothing was visibly broken, no error rate moved, and no user would have reported it for weeks. The suite turned an invisible quality regression into a blocked deployment, which is the entire argument for building one.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'Is LLMOps just MLOps with a new name?',
      a: 'Substantially, yes — versioning, monitoring, rollback and reproducibility all carry over. The genuine differences are that you rarely own the model, correctness requires evaluation rather than a single metric, and cost scales per request instead of per training run.',
    },
    {
      q: 'Do I need to know how to train models for LLMOps?',
      a: 'Rarely. Most roles operate hosted or open-weight models rather than training them. Retrieval, evaluation, cost control and reliability matter far more day to day than training expertise.',
    },
    {
      q: 'What is the hardest part of running LLMs in production?',
      a: 'Knowing whether a change helped. Without a versioned evaluation set you are relying on impressions, and impressions do not catch the regression that affects one request in fifty.',
    },
    {
      q: 'How do I move from MLOps to LLMOps?',
      a: 'Keep your platform and reliability experience front and centre, then add evaluation design, retrieval and token budgeting. Ship one small LLM feature with a real evaluation suite and cost tracking, and describe a regression it caught.',
    },
    {
      q: 'What is genuinely new on the safety side?',
      a: 'The system consumes untrusted text and increasingly acts on it. Prompt injection has no reliable prompting fix, so the answer is narrower capability — no irreversible tool on the component reading untrusted content.',
    },
    {
      q: 'Why does cost surprise teams after launch?',
      a: 'Because it scales per request and staging volume is low. It is routinely fine in testing and the largest line item within a month, which is why cost per request should be instrumented before launch.',
    },
  ],
  related: ['ai-evaluation-llm-evals', 'mlops-vs-llmops-vs-ai-engineering', 'what-is-ai-observability'],
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
