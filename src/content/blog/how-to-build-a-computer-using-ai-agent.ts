import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-a-computer-using-ai-agent',
  tint: 'rose',
  title: 'How to Build a Computer-Using AI Agent',
  heading: 'Agents that operate a computer',
  description:
    'What computer use means in practice, how the perception-action loop works at the screen level, the cost and reliability profile, and when to avoid it.',
  keywords: [
    'computer using ai agent',
    'computer use agent',
    'screen based automation',
    'gui agent',
    'vision agent clicking',
    'agent sandboxing',
    'computer use cost',
    'desktop automation ai',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  anchors: ['computer-using agent', 'screen control'],
  excerpt:
    'Operating a screen is the most general form of automation and the most expensive. Use it where nothing else reaches, not as a default.',
  keyTakeaways: [
    'Generality is the only thing it offers over every other approach — it is not faster, cheaper or more reliable.',
    'Budget an order of magnitude more time and cost than DOM-level automation for the same task.',
    'A mis-click raises no error, which makes verification after every action mandatory.',
    'Containment is environmental: a dedicated VM, scoped accounts, restricted egress.',
    'Build it as the fallback in a layered pipeline, never as the default path.',
  ],
  sections: [
    {
      heading: 'What it actually is',
      paragraphs: [
        'A computer-using agent perceives a screen image, decides on a physical action — move the pointer here, click, type this — and repeats. It is not calling an API or reading a DOM; it is doing what a person at a keyboard does.',
        'The appeal is generality. Anything a human can operate is in scope, including software with no API, internal tools nobody will integrate and desktop applications. Nothing else offers that reach.',
        'It is worth being blunt that generality is the whole offer. On every other axis — speed, cost, reliability, debuggability — it is the worst option available, so the question to ask before building one is always whether something cheaper reaches the target.',
      ],
    },
    {
      heading: 'The loop, and why it is slow',
      paragraphs: [
        'Every step costs a screenshot, a model call and an action, then another screenshot to see what happened. A form that a browser agent fills in three DOM operations might take fifteen screen steps, each with latency and image tokens attached.',
        'This is not a tuning problem; it is the shape of the approach. Budget an order of magnitude more time and cost than DOM-level automation for the same task, and let that inform where you use it.',
        'Images are where the budget actually goes, and there are real savings available without changing the approach. Downscaling to the smallest resolution the model can still read accurately, cropping to the active region rather than capturing the full desktop, and skipping the confirmation screenshot on actions that cannot fail all reduce the bill substantially.',
      ],
      table: {
        caption: 'Cost and reliability by layer',
        columns: ['Layer', 'Per action', 'Reliability', 'Available when'],
        rows: [
          ['API call', 'Microseconds', 'Highest', 'A vendor provides one'],
          ['DOM automation', 'Milliseconds', 'High', 'Selectors are stable'],
          ['Browser agent', 'Seconds', 'Moderate', 'It is in a browser'],
          ['Computer use', 'Many seconds', 'Lowest', 'Always'],
        ],
      },
    },
    {
      heading: 'Precision is the failure mode',
      paragraphs: [
        'The recurring error is coordinates: clicking slightly off, missing a small control, hitting the wrong item in a dense list. Unlike a missing DOM element, a mis-click does not raise an error — it does something else, silently.',
        'Mitigations help without eliminating it: verify after every action by re-reading the screen, prefer keyboard navigation over pointer targeting where the interface allows, and treat any unexpected screen state as a stop rather than something to work around.',
        'Display configuration is an underrated source of this. Resolution, scaling factor and window size all shift where a control sits, so an agent that works reliably in development can mis-click consistently on a differently configured machine — which is an argument for fixing the display geometry of the sandbox rather than treating it as incidental.',
      ],
      bullets: [
        'Re-read the screen after every action, without exception',
        'Prefer keyboard navigation to pointer precision',
        'Stop on unexpected state instead of improvising',
        'Never let a mis-click path reach an irreversible control',
        'Fix the sandbox resolution and scaling so geometry is constant',
      ],
    },
    {
      heading: 'Sandbox it properly',
      paragraphs: [
        'An agent with mouse and keyboard control has, by construction, the ability to do anything the logged-in user can. There is no narrowing it by prompt, because it is not calling scoped tools — it is operating the machine.',
        'So the boundary has to be the environment: a dedicated virtual machine or container, with only the applications and accounts the task requires, network egress restricted to the sites it needs, and no access to anything else the user owns.',
        'Egress restriction deserves the most attention because exfiltration is the goal of most injection attempts, and text on screen is input to this agent. A document or web page it reads can contain instructions, and an allow-list of two hosts turns a successful injection into a failed one regardless of how convincing the text was.',
      ],
    },
    {
      heading: 'What you must record to debug it',
      paragraphs: [
        'With a script, the code tells you what happened. With a computer-use agent the code is identical on every run, and the only account of what it did is what you chose to record — so an incomplete trace means an unanswerable question.',
        'Record the screenshot before each action, the action taken with its coordinates, the model’s stated reason, and the screenshot after. That is heavy, and it is the difference between explaining an incident and guessing about it.',
        'Session video is worth the storage for anything touching a real account. It is also the artefact that makes a mis-click comprehensible in ten seconds when a transcript of coordinates would take twenty minutes to reconstruct.',
      ],
      bullets: [
        'Before and after screenshots for every action',
        'The action, its coordinates and the stated reason',
        'A session recording for anything touching a real account',
        'A retention policy, since these traces contain everything on screen',
      ],
    },
    {
      heading: 'Use it as a last resort',
      paragraphs: [
        'For job applications, most of the work has better paths. An API is best, a DOM-level browser agent is next, and screen control is what remains when a site genuinely cannot be driven any other way — a canvas-rendered form, a desktop client, a portal that actively resists automation.',
        'Build the pipeline so the expensive path is a fallback rather than the default. Teams that start with computer use because it demos well end up with something slow, costly and hard to debug for tasks a simpler layer handled.',
        'Treat it as a bridge rather than an architecture. It is how you automate the system that will be replaced in three years and has to keep working until then, and anything that graduates to real volume deserves a proper integration instead.',
      ],
    },
  ],
  faqs: [
    {
      q: 'What is a computer-using AI agent?',
      a: 'One that perceives a screen image and acts physically — move the pointer, click, type — rather than calling an API or reading a DOM. Its appeal is that anything a person can operate is in scope.',
    },
    {
      q: 'Why is computer use so expensive?',
      a: 'Every step costs a screenshot, a model call, an action and another screenshot. A form taking three DOM operations may take fifteen screen steps. Budget an order of magnitude more time and cost.',
    },
    {
      q: 'What is the main reliability risk?',
      a: 'Mis-clicks. Unlike a missing DOM element, clicking slightly off raises no error — it silently does something else. Verify after every action and keep mis-click paths away from irreversible controls.',
    },
    {
      q: 'How do I contain a computer-using agent?',
      a: 'Through the environment, not the prompt. A dedicated VM or container with only the needed applications and accounts, and network egress limited to the sites the task requires.',
    },
    {
      q: 'How can I reduce the token cost without changing approach?',
      a: 'Downscale screenshots to the smallest readable resolution, crop to the active region instead of the full desktop, and skip confirmation captures on actions that cannot fail.',
    },
    {
      q: 'What has to be logged?',
      a: 'Before and after screenshots, the action with coordinates, and the stated reason — plus session video for real accounts. The code is identical every run, so the trace is the only record.',
    },
  ],
  related: ['what-is-computer-using-ai', 'how-to-build-an-ai-browser-agent-for-job-applications', 'ai-agent-security-permissions-sandboxing'],
};

export default post;
