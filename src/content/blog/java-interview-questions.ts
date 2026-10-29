import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'java-interview-questions',
  tint: 'amber',
  title: 'Top Java Interview Questions and Answers for Freshers and Experienced',
  heading: 'Java interview questions and answers',
  description:
    'The most common Java interview questions on OOP, collections, strings, exceptions, multithreading, JVM memory and modern Java features, with concise answers for freshers and experienced developers.',
  keywords: [
    'java interview questions',
    'java interview questions for freshers',
    'core java interview questions',
    'java collections interview questions',
    'java multithreading interview questions',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Interviews',
  anchors: ['Java interview questions'],
  excerpt:
    'Java interviews return to the same core topics again and again: object-oriented design, collections, strings, exceptions, concurrency and the JVM. Here are the questions you are most likely to face, with clear answers.',
  keyTakeaways: [
    'Be fluent in the four OOP principles and able to give real code examples of each.',
    'Know how HashMap works internally and when to use ArrayList, LinkedList, HashSet or TreeMap.',
    'Understand why String is immutable and how equals() and hashCode() work together.',
    'For experienced roles, expect concurrency, JVM memory and garbage collection questions.',
  ],
  sections: [
    {
      heading: 'Core Java and OOP',
      paragraphs: [],
      table: {
        caption: 'Core Java interview questions with short answers',
        columns: ['Question', 'Short answer'],
        rows: [
          ['JDK vs JRE vs JVM?', 'The JVM runs bytecode; the JRE is the JVM plus libraries needed to run programs; the JDK adds compilers and tools to develop them.'],
          ['What are the OOP principles?', 'Encapsulation, inheritance, polymorphism and abstraction.'],
          ['Overloading vs overriding?', 'Overloading: same method name, different parameters, resolved at compile time. Overriding: subclass replaces a parent method, resolved at runtime.'],
          ['Abstract class vs interface?', 'An abstract class can hold state and constructors; an interface defines a contract and, since Java 8, can have default and static methods. A class can implement many interfaces but extend one class.'],
          ['== vs equals()?', '== compares references (or primitive values); equals() compares logical equality as defined by the class.'],
          ['Why is String immutable?', 'For security, thread safety, caching of hash codes and the string pool.'],
          ['final, finally, finalize?', 'final prevents change or inheritance; finally always runs after try/catch; finalize was a deprecated cleanup hook — use try-with-resources instead.'],
        ],
      },
    },
    {
      heading: 'Collections',
      paragraphs: [
        'HashMap stores entries in buckets selected by the key\'s hash code. Collisions are stored in a linked list that converts to a balanced tree when a bucket gets large. That is why keys must implement equals() and hashCode() consistently: equal objects must return the same hash code.',
      ],
      bullets: [
        'ArrayList: fast random access, slower inserts in the middle',
        'LinkedList: fast inserts and removals at the ends, slow random access',
        'HashSet / HashMap: unordered, average O(1) lookups',
        'TreeSet / TreeMap: sorted, O(log n) operations',
        'ConcurrentHashMap: thread-safe map without locking the whole table',
      ],
    },
    {
      heading: 'Exceptions and multithreading',
      paragraphs: [],
      bullets: [
        'Checked vs unchecked exceptions: checked must be declared or handled; unchecked (RuntimeException) need not be',
        'Thread vs Runnable vs Callable: Callable can return a result and throw checked exceptions',
        'synchronized vs ReentrantLock: locks offer timeouts, fairness and tryLock',
        'volatile guarantees visibility of changes across threads but not atomicity',
        'ExecutorService manages thread pools; CompletableFuture composes asynchronous tasks',
        'Virtual threads (Java 21) make it cheap to run very large numbers of concurrent tasks',
      ],
    },
    {
      heading: 'JVM memory and modern Java',
      paragraphs: [
        'Objects live on the heap, method calls and local variables on the stack. Garbage collectors such as G1 and ZGC reclaim unreachable objects; a memory leak in Java usually means objects are still referenced, often from static collections or caches.',
        'Modern Java questions often cover lambdas and streams, Optional, records, sealed classes, pattern matching for switch and virtual threads.',
      ],
    },
  ],
  faqs: [
    { q: 'Which Java version should I prepare for?', a: 'Know Java 8 fundamentals well and be familiar with features up to the latest long-term-support release, such as records and virtual threads.' },
    { q: 'Do Java interviews include Spring Boot?', a: 'For backend roles, yes. Expect questions on dependency injection, REST controllers, JPA and configuration.' },
  ],
  related: [
    'backend-developer-roadmap',
    'system-design-interview-guide',
    'python-vs-java-vs-javascript-which-to-learn-in-2026',
  ],
  references: [
    { title: 'Learn Java', url: 'https://dev.java/learn/', publisher: 'Dev.java', note: 'Official Java learning path from the OpenJDK community and Oracle.' },
  ],
};

export default post;
