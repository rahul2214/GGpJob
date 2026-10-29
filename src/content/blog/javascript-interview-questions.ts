import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'javascript-interview-questions',
  tint: 'amber',
  title: 'Top JavaScript Interview Questions and Answers (2026)',
  heading: 'JavaScript interview questions and answers',
  description:
    'Common JavaScript interview questions on closures, hoisting, this, promises, async/await, the event loop, prototypes and ES6+ features, with short answers and code examples.',
  keywords: [
    'javascript interview questions',
    'javascript interview questions for freshers',
    'closures interview question',
    'event loop javascript interview',
    'promises async await interview',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  anchors: ['JavaScript interview questions'],
  excerpt:
    'Frontend and full-stack interviews test the same JavaScript fundamentals: scope, closures, this, asynchronous code and the event loop. Understand these well and framework questions become much easier.',
  keyTakeaways: [
    'Explain closures, hoisting and scope with a small code example, not just a definition.',
    'Know how the event loop orders synchronous code, microtasks (promises) and macrotasks (timers).',
    'Understand how "this" is determined, and why arrow functions behave differently.',
    'Be ready to write debounce, a promise-based delay, and array methods like map and reduce.',
  ],
  sections: [
    {
      heading: 'Fundamentals',
      paragraphs: [],
      table: {
        caption: 'Core JavaScript interview questions with short answers',
        columns: ['Question', 'Short answer'],
        rows: [
          ['var vs let vs const?', 'var is function-scoped and hoisted as undefined; let and const are block-scoped and in the temporal dead zone until declared; const cannot be reassigned.'],
          ['What is hoisting?', 'Declarations are processed before code runs, so functions and var variables can be referenced before their line.'],
          ['What is a closure?', 'A function that remembers variables from the scope where it was created, even after that scope has finished.'],
          ['== vs ===?', '== converts types before comparing; === compares value and type, and is preferred.'],
          ['null vs undefined?', 'undefined means a value was never assigned; null is an intentional empty value.'],
          ['How is "this" decided?', 'By how a function is called: method call, plain call, new, or explicit call/apply/bind. Arrow functions take "this" from the surrounding scope.'],
          ['What is prototypal inheritance?', 'Objects inherit properties through a prototype chain; classes are syntax on top of this model.'],
        ],
      },
    },
    {
      heading: 'Asynchronous JavaScript and the event loop',
      paragraphs: [
        'JavaScript runs on a single thread. Synchronous code runs first, then the event loop processes queued work: all microtasks (promise callbacks, queueMicrotask) run before the next macrotask (setTimeout, I/O events).',
      ],
      example: {
        title: 'Classic output-order question',
        paragraphs: [
          'console.log("A"); setTimeout(() => console.log("B"), 0); Promise.resolve().then(() => console.log("C")); console.log("D");',
          'Output: A, D, C, B — synchronous logs first, then the promise microtask, then the timer.',
        ],
      },
    },
    {
      heading: 'Common coding tasks',
      paragraphs: [],
      bullets: [
        'Write a debounce or throttle function',
        'Implement a sleep helper: const sleep = ms => new Promise(r => setTimeout(r, ms));',
        'Flatten a nested array without using flat()',
        'Implement Promise.all from scratch',
        'Deep-clone an object (and explain structuredClone)',
        'Group an array of objects by a key using reduce',
      ],
    },
    {
      heading: 'Modern JavaScript features',
      paragraphs: [
        'Expect questions on destructuring, spread and rest, optional chaining (?.), nullish coalescing (??), modules (import/export), Map and Set, and async iteration. For TypeScript roles, be ready to explain interfaces versus types and generics.',
      ],
    },
  ],
  faqs: [
    { q: 'Do I need to know a framework for JavaScript interviews?', a: 'Most frontend roles test React or another framework too, but strong JavaScript fundamentals are what interviewers check first.' },
    { q: 'How do I prepare for output-based questions?', a: 'Practise predicting outputs for hoisting, closures in loops, this binding and event-loop ordering, then run the code to check yourself.' },
  ],
  related: [
    'react-interview-questions',
    'frontend-developer-roadmap',
    'how-to-become-a-software-engineer',
  ],
  references: [
    { title: 'JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide', publisher: 'MDN Web Docs', note: 'The most complete free reference for JavaScript language features.' },
    { title: 'The event loop', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Event_loop', publisher: 'MDN Web Docs', note: 'Explains how JavaScript schedules tasks and microtasks.' },
  ],
};

export default post;
