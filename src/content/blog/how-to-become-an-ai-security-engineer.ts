import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-become-an-ai-security-engineer',
  tint: 'rose',
  title: 'How to Become an AI Security Engineer: A Practical Path',
  heading: 'Becoming an AI security engineer',
  description:
    'A realistic route into AI security engineering: what to learn in order, what to build, how to get evidence you can show, and what interviews actually test.',
  keywords: [
    'how to become an ai security engineer',
    'ai security engineer skills',
    'ai security career path',
    'llm security engineer',
    'ai red teaming skills',
    'ai security roadmap',
    'prompt injection testing',
    'ai security portfolio',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'AI Security',
  excerpt:
    'There is no degree for this yet, which cuts both ways: no gatekeeping, and no obvious signal. Here is the order that works and the evidence that actually persuades.',
  sections: [
    {
      heading: 'Start from whichever half you already have',
      paragraphs: [
        'This role sits at the intersection of security thinking and AI system knowledge. Almost nobody arrives with both, and the sensible move is to deepen the half you have rather than restarting.',
        'From a security background, you already know how to think about trust boundaries and misuse. What you are missing is a concrete picture of how these systems are assembled. From an engineering background, you know the assembly; what you are missing is the discipline of asking how it breaks on purpose.',
      ],
    },
    {
      heading: 'Learn how the systems are built, not how models are trained',
      paragraphs: [
        'The most common misdirection is spending months on model training. It is interesting and almost never relevant. The attack surface lives in deployment: how context is assembled, what tools the model can call, where output ends up, and which credentials are in play.',
        'Build a small retrieval-augmented system with at least one tool that has a real effect. You need the builder’s view before the attacker’s view is worth anything, because you cannot reason about misuse of an architecture you have never assembled.',
      ],
      bullets: [
        'Assemble a retrieval pipeline end to end and read the final rendered context',
        'Give an agent a tool that writes somewhere, then reason about who can trigger it',
        'Trace one request from user input to model call to side effect',
        'Note every place text from one trust level meets text from another',
      ],
    },
    {
      heading: 'Then learn the specific attack classes',
      paragraphs: [
        'Once you can build one, study how they fail. The categories are reasonably stable now, and each has a clear underlying mechanism rather than being a bag of tricks.',
        'Work through them practically on your own system. Reading about indirect prompt injection is abstract; watching your own agent follow instructions planted in a document you retrieved is not, and it is the moment the threat model becomes intuitive.',
      ],
      bullets: [
        'Direct prompt injection — the user instructs the model against its operator',
        'Indirect injection — instructions arrive inside retrieved or fetched content',
        'Excessive agency — the model can invoke more than the task requires',
        'Sensitive disclosure — context or system instructions leak into output',
        'Insecure output handling — generated text reaches a shell, query or renderer',
        'Supply chain — weights, adapters and packages of uncertain provenance',
      ],
    },
    {
      heading: 'Get the security fundamentals if you lack them',
      paragraphs: [
        'Engineers moving in often skip this and it shows in interviews. AI-specific attacks sit on top of ordinary ones — authentication, authorisation, secrets handling, logging, least privilege. An agent with an over-scoped API key is a credentials problem before it is an AI problem.',
        'You do not need a certification, though one helps if your CV lacks security signal. What you need is to be able to threat model a system out loud, coherently, when asked.',
      ],
    },
    {
      heading: 'Build evidence, because credentials do not exist yet',
      paragraphs: [
        'With no established qualification, hiring rests on demonstrated capability. The highest-leverage artefact is a written security assessment of a system you built or were permitted to test: what you looked at, what you found, why it mattered, what you would change.',
        'Keep it honest and scoped. A three-page assessment of a deliberately small system, written the way a professional report is written, reads as far more credible than a long list of tools you have opened. Only ever test systems you own or have explicit written permission to test.',
      ],
      bullets: [
        'A written assessment of your own system, in professional report form',
        'A reproducible demo of indirect injection and the control that stops it',
        'A short threat model diagram for an agent with tool access',
        'Contributions to an open-source AI security project, however small',
      ],
    },
    {
      heading: 'What interviews actually test',
      paragraphs: [
        'Expect a system to be described and to be asked how you would attack it, then how you would defend it. Interviewers are listening for structured reasoning about trust boundaries, not for memorised jailbreak strings, which date within weeks.',
        'The strongest answers separate the layers: what the model can be talked into, what the surrounding system permits regardless, and which control belongs where. Candidates who say "the real fix is that the tool should never have had that permission" tend to progress.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Do I need a degree or certification to become an AI security engineer?',
      a: 'No established qualification exists yet. A general security certification helps if your CV shows no security background, but demonstrated capability — a written assessment, a reproducible finding — carries more weight in interviews.',
    },
    {
      q: 'How long does it take to move into AI security?',
      a: 'From a security or engineering background, several months of focused work is realistic because you are adding one half rather than both. Starting from neither, plan on longer and build general security fundamentals first.',
    },
    {
      q: 'Should I learn to train models first?',
      a: 'No. Almost all of the attack surface is in deployment — context assembly, tool permissions, output handling and credentials. Training knowledge is interesting but rarely used in the role.',
    },
    {
      q: 'How do I practise AI attacks legally?',
      a: 'Build your own system and attack that, or use platforms that explicitly invite testing. Never test a system you do not own without written permission — unauthorised testing is a criminal matter regardless of intent.',
    },
  ],
  related: ['ai-security-jobs', 'cybersecurity-roadmap', 'cybersecurity-interview-questions'],
};

export default post;
