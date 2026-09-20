import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'mlops-vs-llmops-vs-ai-engineering',
  tint: 'sky',
  title: 'MLOps vs LLMOps vs AI Engineering',
  heading: 'Three overlapping job titles',
  description:
    'What each of these roles actually does day to day, where they genuinely differ, which skills transfer, and how to read a job posting that uses the terms loosely.',
  keywords: [
    'mlops vs llmops',
    'ai engineering role',
    'llmops responsibilities',
    'mlops responsibilities',
    'ai career paths',
    'ml platform engineer',
    'ai engineer skills',
    'ai job titles',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI & Careers',
  anchors: ['three job titles', 'read the responsibilities'],
  excerpt:
    'Employers use these three titles interchangeably, which makes reading the responsibilities far more useful than reading the title.',
  keyTakeaways: [
    'The dividing question is whether your organisation owns the model.',
    'LLMOps replaces training concerns with prompts, evaluation, cost and fallbacks.',
    'AI engineering is product-facing systems work and leans on software engineering.',
    'Infrastructure and cost discipline transfer fully; the intuition does not.',
    'Concrete signals in a posting tell you what the job is; the title does not.',
  ],
  sections: [
    {
      heading: 'MLOps: models you train and own',
      paragraphs: [
        'The traditional discipline sits around a model your organisation trains: data pipelines, feature stores, training infrastructure, experiment tracking, deployment, and monitoring for drift in the data or the predictions.',
        'The defining assumption is ownership of the model. You can retrain it, you can inspect it, and when its behaviour changes you can trace that to the data or the training process.',
        'It is not a declining field, which is worth saying because the discourse implies otherwise. Recommendation, forecasting, fraud detection and pricing are all still trained models with real business value, and they are not going to be replaced by an API call.',
      ],
    },
    {
      heading: 'LLMOps: models you call and cannot see inside',
      paragraphs: [
        'When the model is an external API, most of the traditional toolkit does not apply. There is no training run, no feature store, no drift in the usual sense. What replaces it is prompt and version management, evaluation, cost control, latency management and fallback behaviour.',
        'The genuinely new problems are that the same input can produce different outputs, that a provider can change the model underneath you, and that quality has no single metric — so evaluation is continuous and partly subjective.',
        'Cost becomes a production concern in a way it rarely is elsewhere. Spend scales with traffic rather than with infrastructure, which means a feature can be functionally perfect and commercially unviable, and noticing that is part of the job rather than someone else’s problem.',
      ],
      bullets: [
        'Prompt and configuration versioning, with rollback',
        'Evaluation sets and regression testing on every change',
        'Cost and rate limit management as a production concern',
        'Fallbacks for provider outages and degraded responses',
      ],
      table: {
        caption: 'The same concerns, differently shaped',
        columns: ['Concern', 'MLOps', 'LLMOps'],
        rows: [
          ['The model', 'You train it', 'You call it'],
          ['Versioning', 'Model artefacts', 'Prompts and configuration'],
          ['Quality', 'A metric on a test set', 'Evaluation sets and judgement'],
          ['Drift', 'In the data', 'In the provider'],
          ['Cost driver', 'Training and serving compute', 'Tokens, scaling with traffic'],
          ['Rollback', 'Redeploy a model', 'Revert a prompt, pin a version'],
        ],
      },
    },
    {
      heading: 'AI Engineering: building the product',
      paragraphs: [
        'The broadest of the three and usually the most product-facing. It covers designing systems that use models to do something useful: retrieval pipelines, agents, tool integration, guardrails and the application around all of it.',
        'It leans more on software engineering than on machine learning. Many of the strongest people in these roles came from backend or full-stack work rather than from a research background.',
        'The recurring surprise for people entering it is how little of the work is about the model. Most of the difficulty is in retrieval quality, tool design, state, evaluation and the failure modes of a non-deterministic component inside an otherwise ordinary system.',
      ],
    },
    {
      heading: 'What transfers, and what does not',
      paragraphs: [
        'Infrastructure, deployment, monitoring, data handling and cost discipline transfer fully between all three. Someone with solid MLOps experience is well placed to move.',
        'What does not transfer is the intuition. Prompt behaviour, evaluation design for open-ended output, retrieval quality and agent failure modes are learned by doing, and they are where the actual difficulty of the newer roles lies.',
        'Backend engineers transfer more easily than many expect, and the gap runs the other direction. Retrieval design, evaluation and cost control are learnable in months; the systems discipline that makes a production service reliable is not, and that is the half most AI engineering roles are actually short of.',
      ],
    },
    {
      heading: 'What each is worth, and where the demand is',
      paragraphs: [
        'Compensation tracks scarcity and proximity to revenue rather than the label. A role owning a production system that customers depend on pays more than one supporting internal experiments, regardless of which of the three words is in the title.',
        'Demand for the newer titles has grown fast enough that the supply is thin and the postings are often written by people who have not done the job. That produces both unrealistic requirement lists and genuine opportunities for candidates who can demonstrate shipped work.',
        'Shipped work is the strongest signal available in this market. A deployed retrieval system with an evaluation harness, or an agent with real guardrails, evidences more than any certification, and it is the thing interviewers in these roles actually ask about.',
      ],
    },
    {
      heading: 'Read the responsibilities, not the title',
      paragraphs: [
        'Employers apply these labels inconsistently. An "AI Engineer" posting may describe pure platform work, and an "MLOps Engineer" posting may be entirely about calling external model APIs.',
        'Look for the concrete signals: is there training infrastructure, is there an external provider, is there a product surface, is evaluation mentioned. Those tell you what the job is, regardless of what it is called.',
        'One question at interview settles most of the ambiguity: what does this team ship, and who uses it. The answer distinguishes platform work from product work and research from delivery more reliably than any job description does.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the core difference between MLOps and LLMOps?',
      a: 'Ownership of the model. MLOps assumes you train and can inspect it; LLMOps assumes an external API you call, which replaces training concerns with prompts, evaluation, cost and fallbacks.',
    },
    {
      q: 'Is AI Engineering a machine learning role?',
      a: 'Usually less than people expect. It is product-facing systems work — retrieval, agents, tool integration, guardrails — and many strong practitioners came from backend engineering.',
    },
    {
      q: 'Do MLOps skills transfer to LLMOps?',
      a: 'The infrastructure, monitoring and cost discipline transfer fully. What does not is intuition about prompt behaviour, open-ended evaluation and agent failure modes.',
    },
    {
      q: 'How do I tell what a job posting really means?',
      a: 'Read the responsibilities, and ask at interview what the team ships and who uses it. That distinguishes platform from product more reliably than any title.',
    },
    {
      q: 'Is MLOps a declining field?',
      a: 'No. Recommendation, forecasting, fraud detection and pricing are still trained models with real value, and none of them is replaced by an API call.',
    },
    {
      q: 'What evidences capability best in this market?',
      a: 'Shipped work. A deployed retrieval system with an evaluation harness, or an agent with real guardrails, is what interviewers in these roles actually ask about.',
    },
  ],
  related: ['llmops-vs-mlops', 'ai-evaluation-llm-evals', 'what-is-ai-observability'],
};

export default post;
