import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'how-to-build-reliable-browser-automation',
  tint: 'sky',
  title: 'How to Build Reliable Browser Automation for AI Agents',
  heading: 'Reliable browser automation',
  description:
    'The practices that make browser automation dependable: waiting correctly, re-reading state, resilient selection, and treating every action as unverified until checked.',
  keywords: [
    'reliable browser automation',
    'flaky automation fix',
    'playwright waiting strategy',
    'browser agent stability',
    'automation retry patterns',
    'stale element handling',
    'robust web automation',
    'automation verification',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 9,
  category: 'AI Engineering',
  excerpt:
    'Almost every flaky automation bug is the same bug: acting on a page that has moved on since you looked at it.',
  sections: [
    {
      heading: 'The root cause of flakiness',
      paragraphs: [
        'Automation reads the page, decides, then acts. Between reading and acting the page can change — a script finished, a request resolved, a component re-rendered — and the action lands somewhere that no longer means what it meant.',
        'Nearly every intermittent failure reduces to this. Once you see it that way the fixes stop being superstition and become a small set of disciplines.',
      ],
    },
    {
      heading: 'Never sleep; wait for a condition',
      paragraphs: [
        'A fixed delay is a guess that is simultaneously too long on a fast run and too short on a slow one. It makes the suite slow *and* flaky, which is an impressive combination.',
        'Wait for the thing you actually need: this element is visible, this request has settled, this text has changed. When you cannot express the condition, that is a sign the page has no observable signal for what you are waiting on — and the fix is to find one, not to add seconds.',
      ],
      bullets: [
        'Wait for visibility and interactability, not just presence in the DOM',
        'Wait for network idle where the framework hydrates late',
        'Wait for a change from the previous state, not an absolute state',
        'Never a bare sleep — it hides the condition you should be asserting',
      ],
    },
    {
      heading: 'Re-read after every action',
      paragraphs: [
        'A snapshot of the page is stale the moment you act on it. Element handles captured before a click may point at nodes that have been replaced, and a form may have grown conditional fields that did not exist a second ago.',
        'Take a fresh view after every action rather than reusing the previous one. For agents this is doubly important, because the model reasons about the snapshot it was given and will confidently continue against a page that has moved on.',
      ],
    },
    {
      heading: 'Select on meaning, not on structure',
      paragraphs: [
        'Selectors tied to class names and positions break on every redesign. Selectors tied to what a thing is — its role and accessible name, a stable test identifier, the label text a user reads — survive.',
        'This is the same property that makes a page accessible, which is a useful heuristic: automation that is hard to write reliably is usually automating a page that is hard to use with a screen reader.',
      ],
    },
    {
      heading: 'Treat every action as unverified',
      paragraphs: [
        'Filling a field is not the same as the field holding the value. Clicking submit is not the same as the submission happening. Automation that assumes the action worked produces runs that silently do nothing.',
        'Assert the consequence: read the field back, wait for the confirmation, check the URL changed. This is the single practice that separates automation you can leave running from automation you have to watch.',
      ],
    },
    {
      heading: 'Capture enough to diagnose',
      paragraphs: [
        'When a run fails in an environment you were not watching, the only things that help are a screenshot at the moment of failure, the page snapshot the agent was reasoning about, and a trace of the actions leading up to it.',
        'Capture them on failure automatically. Reproducing a flaky browser failure without artefacts is close to impossible, and an hour spent on this instrumentation repays itself the first time something breaks overnight.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Why is my browser automation flaky?',
      a: 'Almost always because it acts on a page that changed between reading and acting. Fixed sleeps, stale element handles and structure-based selectors are the three usual expressions of that one cause.',
    },
    {
      q: 'Why are fixed sleeps bad?',
      a: 'A fixed delay is too long on fast runs and too short on slow ones, so it makes the suite both slow and flaky. Wait for an observable condition instead.',
    },
    {
      q: 'What makes a selector resilient?',
      a: 'Selecting on meaning — role, accessible name, label text or a stable test id — rather than on class names or position. Structure changes with every redesign; meaning rarely does.',
    },
    {
      q: 'What should be captured when automation fails?',
      a: 'A screenshot at the failure, the page snapshot the agent was reasoning about, and a trace of preceding actions. Without them, a flaky overnight failure is close to impossible to reproduce.',
    },
  ],
  related: ['how-to-test-an-ai-browser-agent', 'how-ai-agents-understand-web-pages', 'how-to-build-reliable-ai-agents'],
};

export default post;
