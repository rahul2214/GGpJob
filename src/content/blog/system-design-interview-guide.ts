import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'system-design-interview-guide',
  tint: 'indigo',
  title: 'System Design Interview Guide: Framework, Concepts and Practice Questions',
  heading: 'How to approach a system design interview',
  description:
    'A step-by-step framework for system design interviews, the core concepts you must know (caching, load balancing, databases, queues, sharding), and common practice questions like designing a URL shortener or chat app.',
  keywords: [
    'system design interview',
    'system design interview questions',
    'how to prepare for system design interview',
    'system design basics',
    'design a url shortener',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Interviews',
  anchors: ['system design interview', 'system design'],
  excerpt:
    'System design interviews test how you reason about trade-offs, not whether you know one correct answer. A repeatable framework and a solid grip on a dozen building blocks will carry you through most questions.',
  keyTakeaways: [
    'Start by clarifying requirements and scale; most weak answers skip this.',
    'Follow a fixed order: requirements, estimates, API, data model, high-level design, deep dive, trade-offs.',
    'Know the core building blocks: load balancers, caches, SQL vs NoSQL, queues, sharding, replication and CDNs.',
    'Talk through trade-offs out loud; the interviewer scores your reasoning.',
  ],
  sections: [
    {
      heading: 'A seven-step framework for 45 minutes',
      paragraphs: ['Use the same structure every time so you never freeze on where to start.'],
      table: {
        caption: 'System design interview framework with suggested timings',
        columns: ['Step', 'What to cover', 'Time'],
        rows: [
          ['1. Requirements', 'Functional features, non-functional needs (latency, availability, consistency), what is out of scope', '5 min'],
          ['2. Estimates', 'Users, requests per second, read/write ratio, storage growth', '3–5 min'],
          ['3. API', 'Main endpoints and their inputs and outputs', '3–5 min'],
          ['4. Data model', 'Entities, relationships, choice of database', '5 min'],
          ['5. High-level design', 'Clients, load balancer, services, databases, caches, queues', '10 min'],
          ['6. Deep dive', 'One or two components in detail: scaling, failure handling, hot spots', '10–15 min'],
          ['7. Trade-offs and wrap-up', 'Bottlenecks, alternatives, what you would improve with more time', '3–5 min'],
        ],
      },
    },
    {
      heading: 'Core concepts you must know',
      paragraphs: [],
      bullets: [
        'Horizontal vs vertical scaling, and stateless services behind a load balancer',
        'Caching layers (CDN, application cache such as Redis), cache invalidation and TTLs',
        'SQL vs NoSQL: transactions and joins versus flexible schema and horizontal scale',
        'Replication (leader–follower) for read scaling and availability',
        'Sharding/partitioning and choosing a shard key to avoid hot spots',
        'Message queues and event streams for asynchronous work (e.g., Kafka, RabbitMQ, SQS)',
        'Consistency models and the CAP trade-off in distributed systems',
        'Rate limiting, idempotency and retries with backoff',
        'Monitoring: metrics, logs, tracing and alerting',
      ],
    },
    {
      heading: 'Worked outline: design a URL shortener',
      paragraphs: [
        'Requirements: create a short link from a long URL, redirect quickly, optional expiry and analytics. Reads far outnumber writes, so optimise for fast redirects.',
        'Design: a write API generates a unique short code (base62 encoding of an ID from a distributed ID generator, or a hash with collision checks) and stores code → URL in a key-value store. Redirects check a cache first, then the database, and return an HTTP 301 or 302. Analytics events go to a queue so they never slow the redirect.',
        'Trade-offs to discuss: 301 is cache-friendly but hides repeat clicks from analytics; 302 keeps analytics accurate. Pre-generating codes avoids collisions but needs a coordination service.',
      ],
    },
    {
      heading: 'Common practice questions',
      paragraphs: [],
      bullets: [
        'Design a URL shortener',
        'Design a chat application like WhatsApp',
        'Design a news feed',
        'Design a rate limiter',
        'Design a ride-sharing service',
        'Design a video streaming platform',
        'Design a notification system',
        'Design a job search or recommendation system',
      ],
    },
  ],
  practicalSteps: [
    { step: 1, title: 'Learn the building blocks', description: 'Spend the first week on caching, databases, queues, replication and sharding.' },
    { step: 2, title: 'Practise the framework', description: 'Design one system every two days using the seven steps, out loud, against a timer.' },
    { step: 3, title: 'Study real architectures', description: 'Read engineering blogs and open-source design primers to see real trade-offs.' },
    { step: 4, title: 'Do mock interviews', description: 'Practise with a peer or an AI mock interviewer who asks follow-up questions.' },
  ],
  faqs: [
    { q: 'Do junior engineers get system design interviews?', a: 'Many companies use lighter versions for juniors, focusing on API and data model design. Full distributed-system questions are more common from mid-level upward.' },
    { q: 'Is there a correct answer?', a: 'No. Interviewers assess how you gather requirements, make reasonable choices and explain trade-offs.' },
    { q: 'How long does it take to prepare?', a: 'With a programming background, three to six weeks of regular practice is typical to feel confident.' },
  ],
  related: [
    'how-to-prepare-for-a-technical-interview-in-7-days',
    'backend-developer-roadmap',
    'sql-interview-questions',
  ],
  references: [
    { title: 'The System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', publisher: 'GitHub', note: 'A widely used open-source guide to large-scale system design concepts.' },
    { title: 'Kubernetes Concepts', url: 'https://kubernetes.io/docs/concepts/', publisher: 'Kubernetes', note: 'Official explanation of how modern services are deployed and scaled.' },
  ],
};

export default post;
