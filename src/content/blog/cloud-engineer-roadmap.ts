import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'cloud-engineer-roadmap',
  tint: 'emerald',
  title: 'Cloud Engineer Roadmap 2026: What to Learn and Skip',
  heading: 'Cloud engineer roadmap',
  description:
    'A practical cloud engineering path for 2026: networking first, one provider deeply, infrastructure as code, and which certifications are actually worth the time.',
  keywords: [
    'cloud engineer roadmap',
    'cloud engineer roadmap 2026',
    'how to become a cloud engineer',
    'cloud engineering skills',
    'aws vs azure career',
    'terraform skills',
    'cloud certification worth it',
    'cloud engineer portfolio',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Career Roadmaps',
  anchors: ['cloud engineer', 'infrastructure as code'],
  excerpt:
    'Most people start with a certification and skip networking. That order is backwards, and it shows the moment something does not connect.',
  keyTakeaways: [
    'Networking is the foundation. Without it you are pattern-matching tutorials rather than diagnosing.',
    'Learn one provider deeply — three shallowly leaves you unable to solve a real problem in any of them.',
    'Infrastructure as code is the dividing line between a cloud user and a cloud engineer.',
    'Cost reduction is measurable, recurring and disproportionately valued in interviews.',
    'One certification plus one real system beats four certifications and nothing built.',
  ],
  sections: [
    {
      heading: 'Networking first, and this is not negotiable',
      paragraphs: [
        'The most common gap in self-taught cloud engineers is networking. Everything in cloud infrastructure sits on it, and without it you are pattern-matching tutorials rather than reasoning. When a service cannot reach another service, networking knowledge is what turns a day of guessing into ten minutes of diagnosis.',
        'You do not need a networking qualification. You need to genuinely understand addressing, subnets, routing, DNS resolution and how a packet gets from one machine to another — and to be able to explain why a connection is failing rather than trying settings until one works.',
        'The test of whether you have enough is whether you can predict what will break before you change something. Engineers who can say that widening a subnet will not fix a routing problem, and explain why, are reasoning; everyone else is experimenting in production.',
      ],
      bullets: [
        'IP addressing and subnetting, well enough to plan a range',
        'Routing tables and gateways',
        'DNS resolution end to end, including why caching confuses people',
        'Firewalls, security groups and the difference between them',
        'TLS — what it protects and where it terminates',
        'Load balancing at different layers',
      ],
    },
    {
      heading: 'Linux, because almost everything runs on it',
      paragraphs: [
        'Comfortable command-line Linux is assumed rather than requested. Processes, permissions, systemd, logs, disk and memory diagnosis. You will spend a lot of time on machines you cannot access through any interface but a terminal.',
        'The specific habit worth building is diagnosis under pressure: a service is down, you have a shell, find out why. That is a practised skill, and it is what a troubleshooting interview round is checking for.',
        'Build the habit of working from evidence rather than from memory of what usually goes wrong. Check what is listening, check what the logs actually say, check whether the disk is full — in that order, every time, rather than guessing at the cause you saw last month.',
      ],
    },
    {
      heading: 'One provider, deeply, then the concepts transfer',
      paragraphs: [
        'Pick the provider with the strongest hiring market where you want to work and learn it properly. Learning three shallowly is a common and expensive mistake — you end up unable to solve a real problem in any of them.',
        'The services that matter are fewer than the catalogue suggests. Compute, storage, networking, identity, managed databases and the monitoring stack cover the overwhelming majority of real work. Identity and access management deserves particular attention, because it is where both the hardest bugs and the worst breaches originate.',
        'Resist the pull of the service catalogue. Providers release dozens of products a year and almost none of them appear in job requirements; a candidate who knows the core six properly is more employable than one who has touched thirty.',
      ],
      bullets: [
        'Compute — virtual machines, containers, serverless functions',
        'Storage — object, block and their durability and cost characteristics',
        'Virtual networking — the cloud expression of what you learned above',
        'Identity and access management, studied properly rather than copied',
        'Managed databases and their backup and failover behaviour',
        'Monitoring, logging and alerting',
      ],
    },
    {
      heading: 'Infrastructure as code is the dividing line',
      paragraphs: [
        'Clicking through a console makes you a cloud user. Defining infrastructure in code that can be reviewed, versioned and reproduced makes you a cloud engineer. Employers screen for this explicitly, and its absence is disqualifying at anything above junior level.',
        'Learn one tool well. What matters is understanding state, drift between declared and actual infrastructure, module structure and how to make changes safely in an environment people depend on. Applying a change that destroys and recreates a database teaches this lesson memorably.',
        'Learn to read a plan before applying it, and to be suspicious of any plan proposing to replace rather than update a stateful resource. That single habit prevents the most common category of self-inflicted production incident in this discipline.',
      ],
      table: {
        caption: 'What to learn, roughly in order, and why it comes there',
        columns: ['Stage', 'Why here', 'Signal you are ready to move on'],
        rows: [
          ['Networking', 'Everything sits on it', 'You can explain a failed connection'],
          ['Linux', 'Almost everything runs on it', 'You can diagnose from a shell'],
          ['One provider core services', 'Where the work happens', 'You built something real in it'],
          ['Infrastructure as code', 'Separates user from engineer', 'You can review a plan safely'],
          ['CI/CD and deployment', 'How changes reach production', 'Your project deploys itself'],
          ['Cost and security', 'Where seniority shows', 'You reduced a bill or closed a gap'],
        ],
      },
    },
    {
      heading: 'Cost is part of the engineering',
      paragraphs: [
        'Cloud engineers who can reduce a bill are valued disproportionately, because the saving is measurable and recurring. This is one of the few areas where an individual contributor can point to a figure and have it believed.',
        'Learn where money actually goes: idle resources nobody owns, oversized instances chosen defensively, data transfer between regions, storage tiers never reviewed. A documented cost reduction is one of the strongest items you can carry into an interview.',
        'Cross-region data transfer deserves a specific mention because it surprises people. It is easy to design an architecture that moves large volumes between regions without noticing, and the charge appears as a line nobody can immediately attribute to a decision.',
      ],
    },
    {
      heading: 'Certifications, honestly assessed',
      paragraphs: [
        'An associate-level certification is genuinely useful when you have no cloud experience on your CV, because it gets you past automated filters and signals baseline familiarity. Beyond that first one, returns fall quickly.',
        'Nobody senior is impressed by a stack of certificates without corresponding experience, and some interviewers treat a long list with mild suspicion. One certification plus one real system you built and can discuss beats four certifications and nothing built.',
        'The exception is consultancies and partner organisations, where certification counts are a commercial requirement. If you are targeting those specifically, the calculation genuinely changes and more certifications have direct value.',
      ],
    },
    {
      heading: 'What to build',
      paragraphs: [
        'Deploy something real, defined entirely in code, with monitoring, a deployment pipeline and a documented recovery procedure. It does not need to be large. It needs to be complete, and you need to be able to explain every decision in it.',
        'Then break it deliberately and fix it. Delete a resource and restore it. Explaining a failure you caused and recovered from is more convincing than describing a system that has never been tested.',
        'Write the recovery procedure before you need it, then follow it exactly during the deliberate break. Discovering that your own runbook is wrong is the most useful hour in the whole exercise, and it is a story that lands well in an interview.',
      ],
      example: {
        title: 'A small project that covers everything employers check',
        paragraphs: [
          'A single web service with a managed database behind it. Entirely defined in code, deployed by a pipeline from a git push, with logs and metrics going somewhere you can query and one alert that actually fires.',
          'Then the exercise: delete the database. Follow your own recovery document. You will find that the restore takes longer than you assumed, that the connection string needed updating somewhere you forgot, and that your alert either did not fire or fired for the wrong reason.',
          'Fix all three and write down what happened. That write-up demonstrates infrastructure as code, deployment automation, monitoring and incident recovery in one page — and it is drawn from something you genuinely did rather than a tutorial you followed.',
        ],
      },
    },
  ],
  faqs: [
    {
      q: 'Which cloud provider should I learn first?',
      a: 'The one with the strongest hiring market in your target location. Concepts transfer heavily between providers, so depth in one is far more valuable than shallow familiarity with three.',
    },
    {
      q: 'Do I need a cloud certification to get hired?',
      a: 'One associate-level certification helps when your CV has no cloud experience, mainly by getting past filters. Additional certifications add little compared with one real system you built and can discuss in detail.',
    },
    {
      q: 'How important is networking for cloud engineering?',
      a: 'It is the foundation. Without it you are copying configurations rather than reasoning about them, and connectivity problems — a large share of real incidents — become guesswork instead of diagnosis.',
    },
    {
      q: 'Is cloud engineering being replaced by managed services?',
      a: 'The work moves up the stack rather than disappearing. Managed services remove undifferentiated setup and increase the value of architecture, cost control, security and reliability judgement.',
    },
    {
      q: 'How many cloud services do I actually need to know?',
      a: 'Six categories cover the overwhelming majority of real work: compute, storage, networking, identity, managed databases and monitoring. Knowing those properly beats touching thirty.',
    },
    {
      q: 'What single habit prevents the worst self-inflicted incidents?',
      a: 'Reading the plan before applying it, and treating any proposal to replace rather than update a stateful resource as a stop condition until you understand why.',
    },
  ],
  related: ['devops-engineer-roadmap', 'data-engineer-roadmap', 'cybersecurity-roadmap'],
  references: [
    {
      title: 'Kubernetes concepts',
      url: 'https://kubernetes.io/docs/concepts/',
      publisher: 'Kubernetes',
      note: 'Start here rather than with manifests, so the abstractions make sense.',
    },
  ],
};

export default post;
