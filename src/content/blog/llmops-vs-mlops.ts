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
  excerpt:
    'Most MLOps practice still applies. What changes is that you usually do not own the model, correctness is not a number, and cost moves per request rather than per training run.',
  sections: [
    {
      heading: 'What carries over unchanged',
      paragraphs: [
        'The instinct to treat LLMOps as an entirely new discipline is mostly marketing. Versioning what you deploy, reproducing what you shipped, monitoring in production, rolling back safely, keeping a staging environment that resembles production — all of this is the same job with a different payload.',
        'Engineers with real MLOps experience are well positioned. The gap is narrower than job descriptions suggest, and framing existing experience correctly matters more than starting over.',
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
      ],
      bullets: [
        'A held-out set of real cases, versioned like code',
        'Automated checks for the properties you can state precisely',
        'Model-graded evaluation for the ones you cannot, with spot checks',
        'Regression runs before any prompt, context or model change',
        'Production sampling reviewed by humans on a schedule',
      ],
    },
    {
      heading: 'Cost moves from training to serving',
      paragraphs: [
        'Classical ML concentrated cost in training: expensive, occasional, easy to see. LLM systems concentrate it in serving, where it scales with usage and hides inside a per-request token count that nobody looks at until the invoice arrives.',
        'This makes token accounting an operational metric alongside latency and error rate. A context change that improves quality by two per cent and triples token count is a decision, not a free win, and the team should be able to see both numbers before shipping it.',
      ],
    },
    {
      heading: 'New artefacts that need lifecycle management',
      paragraphs: [
        'Prompts, retrieval indexes, tool definitions and evaluation sets all behave like production artefacts: they change behaviour, they need review, and a bad one causes an incident. Treating them as configuration edited in a console is how teams end up unable to explain a regression.',
        'The mature setup keeps them in version control, reviews changes like code, and ties each deployment to a specific combination. When something breaks, the question "what changed" has an answer.',
      ],
    },
    {
      heading: 'Moving from MLOps into LLMOps',
      paragraphs: [
        'The transferable core is your platform and reliability experience. What to add is evaluation design, retrieval systems, token and latency budgeting, and the safety surface — prompt injection, data leakage through context, output handling.',
        'A convincing portfolio piece is small but complete: a deployed LLM feature with a versioned evaluation suite, cost per request tracked, and a written account of one regression you caught before release. That last part is what separates candidates who have operated these systems from those who have only built demos.',
      ],
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
  ],
  related: ['ai-evaluation-llm-evals', 'ai-inference-engineer', 'devops-engineer-roadmap'],
};

export default post;
