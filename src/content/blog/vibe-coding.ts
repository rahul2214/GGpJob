import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'vibe-coding',
  tint: 'indigo',
  title: 'Vibe Coding in 2026: What It Is and Where It Breaks',
  heading: 'Vibe coding, honestly assessed',
  description:
    'Vibe coding means describing what you want and letting AI write it. Here is where it genuinely works, where it quietly fails, and what it means for developer careers.',
  keywords: [
    'vibe coding',
    'what is vibe coding',
    'vibe coding 2026',
    'ai coding assistant',
    'ai generated code',
    'vibe coding jobs',
    'is vibe coding good',
    'ai pair programming',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['vibe coding', 'AI-generated code'],
  excerpt:
    'Describing software instead of typing it is real and genuinely fast. It is also where a specific kind of debt accumulates. Both things are true, and the difference is where you use it.',
  keyTakeaways: [
    'It works where being wrong is cheap and feedback is immediate — prototypes, glue code, unfamiliar syntax.',
    'The failure mode is code that runs, passes a casual check, and is wrong in a way that surfaces later.',
    'What accumulates is comprehension debt: a codebase nobody has read, which costs most during an incident.',
    'Never delegate money, permissions or personal data without reading every line.',
    'The skill that appreciates is judging correctness. Typing was never the bottleneck.',
  ],
  sections: [
    {
      heading: 'What the term actually describes',
      paragraphs: [
        'Vibe coding is building by describing intent and accepting what the model produces, steering by result rather than by reading each line. You judge the output by whether it works, not by whether you would have written it that way.',
        'This is a real change in how software gets made, and dismissing it is as unhelpful as overselling it. Something that turns a two-day prototype into a two-hour one has obvious value. The question worth asking is which two days it can replace.',
        'It is worth separating the practice from the tooling. Using an assistant while reading everything it writes is ordinary modern development. Vibe coding specifically means not reading it, and that distinction is where all the risk sits.',
      ],
    },
    {
      heading: 'Where it genuinely works',
      paragraphs: [
        'It works best where the cost of being wrong is low and the feedback is immediate. Prototypes, throwaway scripts, unfamiliar-library exploration, test scaffolding, one-off data transformations — in all of these you find out quickly if the result is wrong, and nothing downstream depends on the internals.',
        'It also works well as a translator. Describing a regular expression, a SQL window function or a Terraform block you half-remember is faster than looking up syntax you use twice a year. The model is good at the parts you could verify but would rather not retype.',
        'The common property is verifiability. Where you can look at the output and immediately know whether it is right, you get the speed without the risk, because the reading step is replaced by a check that is genuinely cheaper.',
      ],
      bullets: [
        'Prototypes meant to be discarded',
        'Glue code and data wrangling with visible output',
        'Boilerplate where the shape is conventional',
        'Syntax you can verify but do not memorise',
        'Tests for behaviour you can state precisely',
      ],
    },
    {
      heading: 'Where it quietly fails',
      paragraphs: [
        'The failure mode is not code that does not run. It is code that runs, passes a casual check, and is wrong in a way that surfaces later. Off-by-one handling in an edge case nobody tested. A retry that masks a failure rather than reporting it. An authorisation check that looks present but compares the wrong identifier.',
        'These slip through because the reviewing effort scales with the code you did not write. Reading generated code carefully takes nearly as long as writing it, and the whole appeal was not doing that. So it is skipped, and the defect ships.',
        'The risk concentrates in exactly the places you would expect: anything touching money, permissions, personal data, or state that is expensive to correct after the fact.',
      ],
      table: {
        caption: 'Where to let it run, and where to read every line',
        columns: ['Kind of code', 'Approach', 'Why'],
        rows: [
          ['Throwaway prototype', 'Let it run', 'Nothing depends on the internals'],
          ['Data transformation with visible output', 'Let it run', 'Wrong results are immediately obvious'],
          ['Internal tooling', 'Skim, spot-check', 'Failures are contained and recoverable'],
          ['Business logic', 'Read fully', 'Wrong is subtle and ships quietly'],
          ['Auth and permissions', 'Read every line', 'Looks correct while being wrong'],
          ['Payments and billing', 'Read every line, test hard', 'Errors are expensive and public'],
          ['Anything handling personal data', 'Read every line', 'Mistakes are not undoable'],
        ],
      },
    },
    {
      heading: 'The debt it creates is a comprehension debt',
      paragraphs: [
        'Conventional technical debt is code you understand and know is bad. What accumulates here is different: a codebase nobody has read. It can be entirely reasonable code and still leave the team unable to answer why a component behaves as it does under load.',
        'That matters at exactly the wrong moment. Incidents are resolved by people who can hold a system in their head. A team that shipped fast and understands little has borrowed against its own future response time.',
        'It compounds differently from ordinary debt as well. Bad code you understand can be refactored deliberately; code nobody has read cannot even be assessed, because nobody knows which parts are load-bearing.',
      ],
    },
    {
      heading: 'How to get the speed without the debt',
      paragraphs: [
        'The practical compromise most experienced developers land on is to generate freely and review selectively, with the selection decided in advance rather than by how tired you are. Anything on the security, money or data-integrity path is read line by line regardless of how confident the output looks.',
        'Reviewing against behaviour helps more than reviewing against style. Ask what happens when the input is empty, when the call fails halfway, when two of these run at once — those are the questions that surface the defects generated code actually contains.',
        'Tests are worth more here than they were, and slightly different ones. Write them yourself for the properties you care about, rather than generating them from the same description that produced the code, or you are checking the implementation against its own assumptions.',
      ],
      example: {
        title: 'The kind of defect that survives a casual review',
        paragraphs: [
          'Asked to add an ownership check, a model produces something that fetches the record, compares a user id against a field, and throws if they differ. It reads correctly, the tests pass, and it ships.',
          'The field it compared was the record’s created_by rather than its owner_id. For most records these are the same person, so nothing breaks — until a record is transferred, and the original creator retains access to something they should no longer see.',
          'Nothing about the code looks wrong. It is well structured, has an error path, and does what it appears to do. Catching it required knowing the difference between two fields in your own domain, which is exactly the knowledge the model did not have.',
        ],
      },
    },
    {
      heading: 'What this means for developer careers',
      paragraphs: [
        'The skill that appreciates is judgement about correctness — reading code critically, knowing which failure modes matter, deciding what deserves scrutiny. Typing speed was never the bottleneck, and now it is visibly not.',
        'The realistic posture for 2026 is fluent use plus retained standards: generate the first draft, then review it the way you would review a competent stranger who does not know your production constraints. Candidates who can describe that discipline interview far better than those who either refuse the tools or trust them completely.',
        'There is a real concern about how people acquire that judgement now. It was previously built by writing a great deal of mediocre code and watching it fail, and if juniors skip that, the reviewing skill has no obvious way to develop. Reading generated code closely, rather than only running it, is the nearest available substitute.',
      ],
      bullets: [
        'Be fluent with the tools — refusing them reads as incuriosity',
        'Review generated code against your own bar, not the model’s confidence',
        'Never delegate security, money or permissions without reading every line',
        'Be able to explain any code you shipped, whoever typed it',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is vibe coding going to replace developers?',
      a: 'It replaces typing, not judgement. The work that remains is deciding what to build, recognising when generated code is subtly wrong, and owning the result. Those are the parts that were always the job.',
    },
    {
      q: 'Is it safe to use AI-generated code in production?',
      a: 'It is safe where you have read it and understand it. The danger is not the origin of the code but shipping code nobody has reviewed. Apply the same standard you would to a pull request from a capable contributor unfamiliar with your system.',
    },
    {
      q: 'Will employers mind if I use AI to write code?',
      a: 'Most now expect it. What they care about is whether you can explain, debug and defend what you shipped. Being unable to account for code in your own repository is the problem, not having used a tool to draft it.',
    },
    {
      q: 'How do I keep my skills sharp while using AI tools?',
      a: 'Read what it produces rather than only running it, and periodically solve something without assistance to check what has faded. The ability to reason about code you did not write is the skill that keeps compounding.',
    },
    {
      q: 'Should I generate my tests too?',
      a: 'Be careful. Tests generated from the same description that produced the code check the implementation against its own assumptions. Write the ones covering properties you actually care about yourself.',
    },
    {
      q: 'How do I decide what to review carefully?',
      a: 'Decide in advance by category, not by how confident the output looks. Security, money and data-integrity paths get read line by line; prototypes and visible-output transformations do not.',
    },
  ],
  related: ['will-ai-take-my-job', 'ai-engineer-interview-questions', 'full-stack-developer-roadmap'],
  references: [
    {
      title: 'OWASP Top Ten',
      url: 'https://owasp.org/www-project-top-ten/',
      publisher: 'OWASP',
      note: 'The baseline application security risks every engineer is expected to know.',
    },
  ],
};

export default post;
