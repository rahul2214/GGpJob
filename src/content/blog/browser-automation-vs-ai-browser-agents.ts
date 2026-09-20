import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'browser-automation-vs-ai-browser-agents',
  tint: 'sky',
  title: 'Browser Automation vs AI Browser Agents',
  heading: 'Scripts or agents?',
  description:
    'When a deterministic script beats an AI browser agent, when it does not, and the hybrid design that gets the reliability of one and the adaptability of the other.',
  keywords: [
    'browser automation vs ai agents',
    'playwright vs ai agent',
    'scripted automation vs llm',
    'when to use browser agent',
    'hybrid browser automation',
    'deterministic vs agentic automation',
    'web automation comparison',
    'automation cost comparison',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 8,
  category: 'AI Engineering',
  anchors: ['browser automation', 'scripted automation'],
  excerpt:
    'The real answer is almost never one or the other. It is a script for the paths you know and an agent for the ones you do not.',
  keyTakeaways: [
    'Scripts fail loudly and agents fail quietly, and that single difference drives every other trade-off.',
    'Cost and latency differ by roughly two orders of magnitude per form, which decides unit economics at volume.',
    'The design that ships is scripts for known paths, an agent for the long tail.',
    'Let the agent write scripts: record what it did so the second encounter is cheap.',
    'Moving to an agent without upgrading verification is how teams get silently wrong runs for months.',
  ],
  sections: [
    {
      heading: 'They fail in opposite ways',
      paragraphs: [
        'A script breaks loudly. A selector stops matching, the run throws, and you know immediately that something changed. The cost is maintenance; the benefit is that you are never wrong without knowing it.',
        'An agent bends. The layout changed, it works out the new arrangement, and the run succeeds — or it half-works out the new arrangement, does something slightly wrong, and the run also succeeds. Adaptability and silent error are the same property viewed from two sides.',
        'Which failure you prefer depends entirely on what the automation touches. For scraping prices, a quietly wrong run costs you a bad number in a dashboard. For submitting a job application, it costs someone an application with the wrong salary expectation in it, sent under their name, with no way to retract it.',
      ],
    },
    {
      heading: 'The cost difference is not marginal',
      paragraphs: [
        'A scripted form fill is a few milliseconds of CPU. An agent doing the same thing is a sequence of model calls, each costing tokens and a second or more of latency. For a form with eight fields that can be two orders of magnitude difference in both.',
        'At small volumes this is irrelevant. At a thousand applications a day it decides whether the product has a viable unit economics, which is why systems that start agentic usually end up scripting their common paths.',
        'Screenshots are what make the gap so wide. A vision-based step sends an image on every observation, and images dominate the token bill in a way a developer reasoning about text prompts consistently underestimates — the first production invoice is where most teams discover this.',
      ],
      bullets: [
        'Script: milliseconds, negligible cost, deterministic, brittle',
        'Agent: seconds per step, token cost per step, adaptive, non-deterministic',
        'Script: breaks visibly when the page changes',
        'Agent: may quietly do the wrong thing instead of breaking',
      ],
      table: {
        caption: 'The two approaches, directly compared',
        columns: ['Property', 'Script', 'Agent'],
        rows: [
          ['Latency per form', 'Under a second', 'Tens of seconds'],
          ['Marginal cost', 'Effectively zero', 'Real, per step'],
          ['Handles a redesign', 'No', 'Usually'],
          ['Handles an unseen form', 'No', 'Yes'],
          ['Reproducible run to run', 'Yes', 'No'],
          ['Failure mode', 'Throws', 'Succeeds incorrectly'],
          ['Debugging', 'Stack trace', 'Transcript archaeology'],
        ],
      },
    },
    {
      heading: 'The hybrid that actually ships',
      paragraphs: [
        'Use a script for the paths you have seen and an agent as the fallback for the ones you have not. Most volume flows through a handful of applicant tracking systems whose forms are stable enough to script; the long tail is where an agent earns its cost.',
        'The refinement that makes this compound: when the agent successfully handles a new form, record what it did as a candidate script. The next hundred times that employer appears, the cheap path handles it. The agent becomes a mechanism for generating scripts rather than a runtime dependency.',
        'Promotion needs a gate, though, or you will cache a mistake. Require the agent to have completed the same form successfully two or three times with a consistent field mapping before the recorded path is trusted, and keep the agent as the fallback for when the promoted script starts throwing.',
      ],
      example: {
        title: 'What the routing looks like',
        paragraphs: [
          'A request arrives for an employer on Greenhouse. The router finds a stored mapping for that ATS, fills the form with a deterministic Playwright script in under a second, verifies the submitted state, and costs nothing beyond compute.',
          'The next request is a bespoke form on a company’s own careers page with no stored mapping. The router hands it to the agent, which reads the form, decides what each field wants, fills it, and — on success — writes the mapping to the store marked unverified.',
          'Two successful runs later the mapping is promoted, and that employer joins the cheap path permanently. Over a few weeks the agent handles a steadily smaller share of traffic while remaining the reason new employers work at all.',
        ],
      },
    },
    {
      heading: 'Deciding which to reach for',
      paragraphs: [
        'The question is not which is better but how much variety you face and how often it changes. Low variety and stability favour scripts overwhelmingly; high variety with no repetition favours agents.',
        'Job applications sit awkwardly in between, which is exactly why the hybrid wins there: a few systems account for most volume, and a long tail accounts for most of the distinct work.',
        'One more factor decides it in borderline cases: who maintains the thing. A script is cheap to run and needs an engineer whenever a page changes; an agent costs more per run and absorbs those changes silently. A small team without capacity for constant selector maintenance can rationally choose the more expensive option.',
      ],
    },
    {
      heading: 'Writing scripts that break less often',
      paragraphs: [
        'Much of the brittleness attributed to scripting is really brittleness in how selectors were written. Targeting a generated class name or a deep CSS path couples the automation to the page’s implementation, which changes constantly; targeting the accessible role and name couples it to what the control is for, which rarely does.',
        'This is why Playwright pushes role and label based locators so hard, and why the accessibility tree is the most stable part of a modern web page to automate against. A field labelled "Email address" tends to stay labelled that through three redesigns.',
        'The practical effect is to narrow the gap. A script written against the accessibility tree survives a substantial share of the changes that would have broken a CSS-selector script, and every change it survives is a case where you did not need the agent at all.',
      ],
      bullets: [
        'Prefer accessible role and name over CSS paths and generated classes',
        'Never target a class that looks machine-generated',
        'Wait on a condition, not a fixed duration',
        'Assert the end state after submitting, not just that the click happened',
      ],
    },
    {
      heading: 'Verification matters more with an agent',
      paragraphs: [
        'Because a script fails loudly, its verification can be light. Because an agent fails quietly, verification is not optional: read the form back after filling, confirm the expected end state, and treat a missing confirmation as a failure rather than assuming success.',
        'Teams that move from scripts to agents and keep their old verification habits are the ones surprised by silently wrong runs months later.',
        'Record enough to reconstruct a run, too. With a script the code tells you what happened; with an agent the code is identical for every run and the only account of what it actually did is the trace you chose to keep — so a screenshot and the field values at submission time are the difference between answering a complaint and guessing.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Is an AI browser agent better than a Playwright script?',
      a: 'Not generally. A script is far faster, far cheaper and deterministic; an agent adapts to change. The right answer for varied work is usually both — scripts for known paths, an agent for the long tail.',
    },
    {
      q: 'Why is an agent so much more expensive?',
      a: 'Every step is a model call costing tokens and a second or more, so an eight-field form can be two orders of magnitude slower and costlier than the scripted equivalent. Screenshots dominate that bill.',
    },
    {
      q: 'How do I combine the two?',
      a: 'Script the common paths, fall back to the agent for unknown ones, and record what the agent did as a candidate script — so each new form becomes cheap after its first encounter.',
    },
    {
      q: 'What changes about testing when moving to an agent?',
      a: 'Verification stops being optional. Scripts fail loudly; agents succeed incorrectly. Read state back after every action and treat a missing confirmation as failure rather than assuming success.',
    },
    {
      q: 'How do I make scripts less brittle in the first place?',
      a: 'Target the accessible role and name rather than CSS paths or generated class names. That couples the script to what a control is for, which changes far less often than how it is styled.',
    },
    {
      q: 'When should a recorded path be promoted to a real script?',
      a: 'After the agent has completed that form successfully two or three times with a consistent field mapping — and keep the agent as the fallback for when the promoted script starts failing.',
    },
  ],
  related: ['what-is-browser-ai', 'playwright-vs-selenium-vs-puppeteer-for-ai-agents', 'how-to-build-reliable-browser-automation'],
  references: [
    {
      title: 'Locators',
      url: 'https://playwright.dev/docs/locators',
      publisher: 'Playwright',
      note: 'Why role- and label-based locators are preferred over CSS paths.',
    },
    {
      title: 'Best Practices',
      url: 'https://playwright.dev/docs/best-practices',
      publisher: 'Playwright',
      note: 'Waiting on conditions, resilient selectors and asserting end state.',
    },
    {
      title: 'ARIA roles',
      url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles',
      publisher: 'MDN Web Docs',
      note: 'The vocabulary a stable accessibility-tree selector is written against.',
    },
  ],
};

export default post;
