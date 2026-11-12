import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  "slug": "system-design-interview-cheatsheet-2026",
  "title": "System Design Interview Cheatsheet (2026): Frameworks & Trade-offs",
  "heading": "System Design Interview Cheatsheet (2026): Frameworks, Formulas & Trade-offs",
  "description": "The definitive system design cheatsheet for SDE-2, Senior, and Staff engineering interviews. Back-of-the-envelope math, distributed patterns, and failure modes.",
  "keywords": [
    "system design interview cheatsheet 2026",
    "back of the envelope math system design",
    "system design framework sde 2",
    "distributed systems interview trade offs",
    "cap theorem system design interview"
  ],
  "publishedAt": "2026-03-18T08:00:00.000Z",
  "updatedAt": "2026-03-18T08:00:00.000Z",
  "author": "Aditya Verma",
  "readingMinutes": 15,
  "category": "Interviews",
  "tint": "sky",
  "excerpt": "System design interviews are not about drawing boxes on a whiteboard. They are about navigating scale, trade-offs, and failure boundaries. Here is the ultimate 45-minute architectural cheatsheet.",
  "keyTakeaways": [
    "Master the 4-step interview rhythm: Requirements (5m), High-Level Architecture (10m), Deep Dives & Bottlenecks (20m), and Failure Modes (10m).",
    "Memorize 2026 back-of-the-envelope latency and storage numbers: SSD random read (~100μs), cross-region round trip (~150ms).",
    "Always drive the conversation by clarifying functional vs non-functional requirements (Availability, Latency, Consistency, Fault Tolerance).",
    "Modern system design rounds evaluate AI/LLM integration: token caching, streaming, rate limiting, and vector store sharding.",
    "JobsDart’s Candidate Skill Match benchmarks your systems architecture readiness against top GCC expectations."
  ],
  "anchors": [
    "The 45-Minute 4-Step Framework",
    "Back-of-the-Envelope Math Cheatsheet",
    "Core Distributed Systems Trade-offs",
    "Database Selection Decision Tree",
    "Deep Dives: Caching, Sharding & Queues"
  ],
  "sections": [
    {
      "heading": "The 45-Minute 4-Step System Design Framework",
      "paragraphs": [
        "In a 45-minute system design interview, getting lost in minor details too early is fatal. Keep strict control of the clock with this battle-tested 4-step sequence."
      ],
      "table": {
        "rows": [
          [
            "Phase 1: Scope & Clarification",
            "5 - 7 Mins",
            "Ask clarifying questions, define functional scope (limit to 3 core features), quantify DAU/QPS",
            "Functional & Non-Functional Requirements List"
          ],
          [
            "Phase 2: High-Level Design",
            "10 - 12 Mins",
            "Draw end-to-end data flow: Client -> CDN -> API Gateway -> App Server -> Database -> Cache",
            "High-Level Architecture Diagram with Core APIs"
          ],
          [
            "Phase 3: Deep Dive & Scale",
            "15 - 20 Mins",
            "Tackle core bottleneck: database partitioning, cache eviction, distributed locking, consistency",
            "Component-specific architecture and schema design"
          ],
          [
            "Phase 4: Bottlenecks & Resilience",
            "5 - 8 Mins",
            "Discuss single points of failure, network partitions, circuit breakers, rate limiting",
            "Disaster recovery and observability strategy"
          ]
        ],
        "columns": [
          "Phase",
          "Duration",
          "Key Actions",
          "Deliverables"
        ],
        "caption": "The 45-Minute 4-Step System Design Framework Overview & Comparison"
      }
    },
    {
      "heading": "Back-of-the-Envelope Math & Numbers Every Engineer Must Know",
      "paragraphs": [
        "Doing accurate mental arithmetic during the first 5 minutes instantly establishes senior credibility."
      ],
      "bullets": [
        "Daily Active Users (DAU) to QPS: 100 Million DAU with 10 requests/day = 1 Billion requests/day. Divided by ~86,400 seconds = ~12,000 QPS average. Peak QPS = ~24,000 to 30,000 QPS (2.5x multiplier).",
        "Storage Calculations: 1 Billion writes/day at 500 bytes per record = 500 GB/day = 182.5 TB/year. A 5-year retention plan requires ~1 Petabyte of storage.",
        "Memory Hierarchy Latencies: L1 cache reference (0.5 ns), RAM access (100 ns), NVMe SSD random read (100 μs), Round trip within same datacenter (0.5 ms), Cross-continental internet round trip (150 ms)."
      ]
    },
    {
      "heading": "Core Distributed Systems Trade-offs (CAP & PACELC)",
      "paragraphs": [
        "Never say \"I will make the system 100% consistent and 100% available with zero latency.\" In distributed computing, trade-offs are mandatory."
      ],
      "table": {
        "rows": [
          [
            "CAP Theorem (Under Partition)",
            "Consistency (CP)",
            "Availability (AP)",
            "Choose CP for financial ledgers, inventory booking. Choose AP for social feeds, chat status."
          ],
          [
            "Communication Protocol",
            "gRPC / HTTP/2 (Binary)",
            "REST / JSON",
            "Choose gRPC for internal microservice-to-microservice traffic. Choose REST for public APIs."
          ],
          [
            "Data Ingestion",
            "Synchronous HTTP API",
            "Asynchronous Message Queue (Kafka)",
            "Use Kafka when high-throughput write surges must be decoupled from database ingestion."
          ],
          [
            "Caching Strategy",
            "Write-Through",
            "Cache-Aside (Lazy Loading)",
            "Write-Through for read-heavy critical data; Cache-Aside for general purpose caching."
          ]
        ],
        "columns": [
          "Trade-off Axis",
          "Choice A",
          "Choice B",
          "When to Choose Which"
        ],
        "caption": "Core Distributed Systems Trade-offs (CAP & PACELC) Overview & Comparison"
      }
    },
    {
      "heading": "Database Selection Decision Tree: SQL vs NoSQL vs NewSQL",
      "paragraphs": [
        "When choosing a data store, justify your decision based on access patterns, transaction guarantees, and scaling characteristics."
      ],
      "bullets": [
        "Relational SQL (PostgreSQL, MySQL): Use when ACID guarantees, complex joins, and financial accuracy are required. Scale reads with replicas and connection poolers (PgBouncer).",
        "Key-Value (Redis, DynamoDB): Use for session state, rate limit counters, user caches, and leaderboard operations requiring sub-5ms lookups.",
        "Document Store (MongoDB): Ideal for unstructured schemas, product catalogs, and rapid prototyping where joins are minimal.",
        "Distributed Wide-Column (Cassandra, ScyllaDB): Tailor-made for massive append-only write workloads (IoT sensor telemetry, audit logs, messaging history) across multiple data centers.",
        "Distributed NewSQL (CockroachDB, Google Spanner): When you need horizontal scaling across geographic regions without sacrificing ACID consistency."
      ]
    },
    {
      "heading": "Designing for Resilience: Circuit Breakers, Retries & Idempotency",
      "paragraphs": [
        "Senior interviewers want to see how your system fails gracefully. Always incorporate: 1) Rate limiting with Redis Token Bucket algorithms, 2) Exponential backoff with jitter on client retries, 3) Circuit breakers (Netflix Hystrix pattern) to prevent cascading microservice collapses, and 4) Distributed idempotency keys on payment endpoints."
      ]
    }
  ],
  "faqs": [
    {
      "q": "How do I handle system design rounds if I have never worked on million-user systems?",
      "a": "Interviewers do not expect you to have personally operated a 50M DAU service. They evaluate whether you understand first-principles engineering: how caching works, how indices operate, and where network bottlenecks occur."
    },
    {
      "q": "Are system design interviews required for SDE-1 (Junior Dev) roles?",
      "a": "Most companies do not conduct full distributed system design rounds for freshers, focusing instead on Object-Oriented Design (LLD). However, Tier-1 product firms increasingly test basic high-level architecture awareness."
    },
    {
      "q": "What are the top 5 systems to practice before interviewing?",
      "a": "1) Design a URL Shortener (TinyURL), 2) Design Twitter/X Newsfeed, 3) Design WhatsApp/Slack Chat, 4) Design YouTube/Netflix Video Streaming, and 5) Design Uber/Ride-Hailing Location Tracking."
    }
  ],
  "related": [
    "star-method-behavioral-interview-questions-and-answers",
    "how-to-negotiate-tech-salary",
    "gcc-jobs-in-india-salary-2026",
    "tier-2-college-to-product-company-roadmap"
  ],
  "authorProfile": {
    "name": "Aditya Verma",
    "role": "Staff Engineer & Open Source Contributor",
    "bio": "Aditya Verma is a Staff Engineer & Open Source Contributor specializing in engineering recruitment and tech careers.",
    "avatarUrl": "/images/authors/aditya-verma.jpg"
  }
};

export default post;
