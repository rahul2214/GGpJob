import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'dotnet-developer-interview-questions',
  tint: 'indigo',
  title: '.NET Developer Interview Questions and How to Answer Them',
  heading: '.NET developer interview questions',
  description:
    'The async, memory, LINQ and design questions .NET interviews ask, the outdated answers that get candidates marked down, and how to prepare efficiently.',
  keywords: [
    'dotnet developer interview questions',
    'c# interview questions',
    'async await interview questions',
    'net core interview questions',
    'entity framework interview',
    'c# memory management interview',
    'dotnet interview preparation',
    'senior c# interview',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'Interviews',
  excerpt:
    'The most common way to fail a .NET interview is not ignorance. It is answering with C# from a decade ago and not realising the language moved.',
  sections: [
    {
      heading: 'The dated-answer problem',
      paragraphs: [
        'Interviewers for .NET roles are specifically listening for whether your knowledge is current. The ecosystem changed substantially — nullable reference types, pattern matching, records, minimal APIs — and a candidate answering as though none of that happened reads as someone who stopped learning.',
        'This matters more than in some ecosystems because so much .NET work is on long-lived codebases. The concern is not that you have maintained old code; it is whether you know what the modern equivalent would be.',
      ],
    },
    {
      heading: 'Async and await, asked properly',
      paragraphs: [
        'Nearly every .NET interview covers async. The shallow answer — that it makes things run in the background — is wrong and gets caught immediately. Async is about not blocking a thread while waiting on input or output; it does not by itself make anything parallel.',
        'Be ready for the common mistakes: blocking on a task with `.Result` or `.Wait()` and the deadlock that can cause, `async void` outside an event handler, and forgetting to await so exceptions vanish. Naming these unprompted signals real experience.',
      ],
      bullets: [
        'Why async helps with I/O and does nothing for CPU-bound work',
        'What `.Result` and `.Wait()` can deadlock, and why',
        'Why `async void` is a trap outside event handlers',
        'What happens to an exception in a task nobody awaited',
        'When `ConfigureAwait(false)` matters, and where it no longer does',
      ],
    },
    {
      heading: 'Memory and value semantics',
      paragraphs: [
        'Expect questions about the stack and heap, value versus reference types, boxing, and garbage collection generations. These are asked less for trivia than to see whether you can reason about allocation in a hot path.',
        'The strong answer connects it to something real: why a struct in a tight loop avoids allocations, or why string concatenation in a loop is a problem and what you would use instead. Definitions without a consequence read as revision.',
      ],
    },
    {
      heading: 'LINQ and Entity Framework',
      paragraphs: [
        'The classic question is deferred execution — why nothing runs until you enumerate, and what happens if you enumerate twice. Closely related is `IEnumerable` versus `IQueryable`, which is really a question about where the work happens.',
        'That distinction is the one that matters in production: filtering an `IEnumerable` pulls the whole table into memory first, while an `IQueryable` translates the filter into SQL. Being able to explain a real performance incident caused by that confusion is a strong answer.',
      ],
    },
    {
      heading: 'Design and dependency injection',
      paragraphs: [
        'Service lifetimes come up constantly, usually as a bug: what goes wrong when a scoped service is captured by a singleton. Being able to explain the captured-dependency problem rather than just listing the three lifetimes is what is being checked.',
        'Expect broader design questions too — where you would put business logic, how you would test something coupled to a database, how you keep controllers thin. Opinions are fine here as long as you can defend the trade-off.',
      ],
    },
    {
      heading: 'Preparing efficiently',
      paragraphs: [
        'Spend most preparation on async and on EF query behaviour. Between them they account for a large share of questions and an even larger share of real production incidents, which is why interviewers keep returning to them.',
        'Prepare one performance story: something that was slow, how you found the cause, what you changed and what the number became. That single story answers a surprising number of technical and behavioural questions at once.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is the most commonly asked .NET interview topic?',
      a: 'Async and await — what it does, what it does not, and the mistakes it invites. It accounts for a large share of both interview questions and real production incidents.',
    },
    {
      q: 'Does async make my code run in parallel?',
      a: 'No. It frees a thread while waiting on input or output. It does nothing for CPU-bound work, and saying otherwise is one of the fastest ways to be marked down.',
    },
    {
      q: 'What is the difference between IEnumerable and IQueryable?',
      a: 'Where the work happens. Filtering an IQueryable translates into SQL and runs in the database; filtering an IEnumerable pulls the rows into memory first. Confusing them is a classic production performance bug.',
    },
    {
      q: 'How do I show my C# knowledge is current?',
      a: 'Use modern constructs naturally — nullable reference types, pattern matching, records — and be able to say what problem each solved. Answering as if the language stopped a decade ago is a common reason candidates are passed over.',
    },
  ],
  related: ['dotnet-10-csharp-14', 'backend-developer-roadmap', 'devops-interview-questions'],
};

export default post;
