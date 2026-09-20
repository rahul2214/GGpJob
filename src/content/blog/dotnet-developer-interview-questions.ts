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
  anchors: ['.NET interview', 'async and await'],
  excerpt:
    'The most common way to fail a .NET interview is not ignorance. It is answering with C# from a decade ago and not realising the language moved.',
  keyTakeaways: [
    'Interviewers are specifically listening for whether your knowledge is current.',
    'Async frees a thread while waiting on input or output — it does not make anything parallel.',
    'The IEnumerable versus IQueryable distinction is really about where the work happens.',
    'Service lifetime questions are usually about the captured-dependency problem, not the definitions.',
    'Async and EF query behaviour account for most questions and most real production incidents.',
  ],
  sections: [
    {
      heading: 'The dated-answer problem',
      paragraphs: [
        'Interviewers for .NET roles are specifically listening for whether your knowledge is current. The ecosystem changed substantially — nullable reference types, pattern matching, records, minimal APIs — and a candidate answering as though none of that happened reads as someone who stopped learning.',
        'This matters more than in some ecosystems because so much .NET work is on long-lived codebases. The concern is not that you have maintained old code; it is whether you know what the modern equivalent would be.',
        'The comfortable way to demonstrate it is to name the problem each feature solved rather than the feature. Saying that nullable reference types moved a whole class of runtime failure into the compiler shows understanding; listing features shows you read a release note.',
      ],
    },
    {
      heading: 'Async and await, asked properly',
      paragraphs: [
        'Nearly every .NET interview covers async. The shallow answer — that it makes things run in the background — is wrong and gets caught immediately. Async is about not blocking a thread while waiting on input or output; it does not by itself make anything parallel.',
        'Be ready for the common mistakes: blocking on a task with `.Result` or `.Wait()` and the deadlock that can cause, `async void` outside an event handler, and forgetting to await so exceptions vanish. Naming these unprompted signals real experience.',
        'The scaling consequence is the part worth adding. Blocking a thread pool thread while waiting on a database call means the pool exhausts under load, and the service becomes unresponsive while doing almost no work — which is the real reason the guidance exists.',
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
        'Boxing is the one to be precise about. Being able to say where it happens silently — putting a value type into an untyped collection, or an interface call on a struct — and why that matters in a loop running millions of times is a concrete answer where most give an abstract one.',
      ],
    },
    {
      heading: 'LINQ and Entity Framework',
      paragraphs: [
        'The classic question is deferred execution — why nothing runs until you enumerate, and what happens if you enumerate twice. Closely related is `IEnumerable` versus `IQueryable`, which is really a question about where the work happens.',
        'That distinction is the one that matters in production: filtering an `IEnumerable` pulls the whole table into memory first, while an `IQueryable` translates the filter into SQL. Being able to explain a real performance incident caused by that confusion is a strong answer.',
        'The other EF question worth preparing is the query issued once per row of a previous result. It is the most common performance defect in data access code, it is invisible until you look at the generated SQL, and naming it on sight signals someone who has profiled a slow endpoint rather than read about one.',
      ],
      table: {
        caption: 'The answer that gets marked down, and the one that does not',
        columns: ['Question', 'Marked down', 'Strong'],
        rows: [
          ['What does async do?', 'Runs it in the background', 'Frees the thread while waiting on I/O'],
          ['IEnumerable vs IQueryable', 'One is for databases', 'Decides whether filtering runs in SQL or memory'],
          ['Why avoid .Result?', 'It is bad practice', 'It can deadlock and it blocks a pool thread'],
          ['Service lifetimes', 'Lists the three', 'Explains capturing a scoped one in a singleton'],
          ['Struct vs class', 'Value versus reference', 'Allocation behaviour in a hot loop'],
          ['Is your C# current?', 'Describes old patterns', 'Names the problem each new feature solved'],
        ],
      },
    },
    {
      heading: 'Design and dependency injection',
      paragraphs: [
        'Service lifetimes come up constantly, usually as a bug: what goes wrong when a scoped service is captured by a singleton. Being able to explain the captured-dependency problem rather than just listing the three lifetimes is what is being checked.',
        'Expect broader design questions too — where you would put business logic, how you would test something coupled to a database, how you keep controllers thin. Opinions are fine here as long as you can defend the trade-off.',
        'The database-coupling question has a trap in it. Answering that you would mock the data context is acceptable; answering that you would prefer an integration test against a real database for query-heavy logic, because mocking the query provider tests your mock rather than your query, is better and shows you know what the test is worth.',
      ],
    },
    {
      heading: 'The coding exercise',
      paragraphs: [
        'Many .NET loops include a small implementation task, often with a deliberate concurrency or resource angle — a cache, a rate limiter, something reading a file. What is assessed is disposal, error handling and whether you noticed the shared state.',
        'Use `using` and dispose properly without being reminded, and say why. Resource handling is one of the clearest seniority signals in this ecosystem and it costs nothing to demonstrate.',
        'If the task involves anything shared across requests, say the word thread-safe out loud and explain your choice even if you pick the simple option. Recognising the concern and deciding deliberately is scored well above silently getting away with it.',
      ],
      example: {
        title: 'The IQueryable mistake that ships',
        paragraphs: [
          'Code under review: a repository method returns `IEnumerable<Order>` from `context.Orders`, and the calling service then filters it by customer and date before taking the first twenty.',
          'What actually happens: the moment the method returns an `IEnumerable`, the query is materialised. Every order in the table is loaded into memory, and the filtering happens in the application. It is fast in development with two hundred rows and fails badly at two million.',
          'The fix is to return `IQueryable<Order>` so the filter composes into the SQL, or — better for a repository boundary — to accept the filter parameters in the method and return the already-filtered result. The second keeps the query concern inside the data layer rather than leaking an open query out of it.',
          'Being able to describe this, including the trade-off about leaking `IQueryable` past the repository boundary, is a stronger answer than reciting the definition of deferred execution.',
        ],
      },
    },
    {
      heading: 'Preparing efficiently',
      paragraphs: [
        'Spend most preparation on async and on EF query behaviour. Between them they account for a large share of questions and an even larger share of real production incidents, which is why interviewers keep returning to them.',
        'Prepare one performance story: something that was slow, how you found the cause, what you changed and what the number became. That single story answers a surprising number of technical and behavioural questions at once.',
        'Then spend an hour on what changed in the language recently. It is the cheapest way to avoid the dated-answer problem, and being able to mention a feature and the problem it solved leaves an impression out of proportion to the effort.',
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
    {
      q: 'Why is blocking on .Result actually harmful?',
      a: 'Beyond the deadlock risk, it blocks a thread pool thread while waiting on I/O. Under load the pool exhausts and the service becomes unresponsive while doing almost no real work.',
    },
    {
      q: 'How should I answer about testing database code?',
      a: 'Mocking the context is acceptable; preferring an integration test for query-heavy logic is better, because mocking the query provider tests your mock rather than your query.',
    },
  ],
  related: ['dotnet-10-csharp-14', 'backend-developer-roadmap', 'devops-interview-questions'],
  references: [
    {
      title: 'C# documentation',
      url: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
      publisher: 'Microsoft Learn',
      note: 'The language reference, including what each recent feature was introduced to solve.',
    },
  ],
};

export default post;
