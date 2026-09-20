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
  anchors: ['reliable browser automation', 'flakiness'],
  excerpt:
    'Almost every flaky automation bug is the same bug: acting on a page that has moved on since you looked at it.',
  keyTakeaways: [
    'Reading, deciding and acting happen at three different moments, and the page changes between them.',
    'A fixed sleep is simultaneously too long and too short; wait for a condition.',
    'A snapshot is stale the moment you act on it — take a fresh view every time.',
    'Select on meaning, which survives redesigns that break structure-based selectors.',
    'Assert the consequence of every action, or you get runs that silently do nothing.',
  ],
  sections: [
    {
      heading: 'The root cause of flakiness',
      paragraphs: [
        'Automation reads the page, decides, then acts. Between reading and acting the page can change — a script finished, a request resolved, a component re-rendered — and the action lands somewhere that no longer means what it meant.',
        'Nearly every intermittent failure reduces to this. Once you see it that way the fixes stop being superstition and become a small set of disciplines.',
        'Agents widen the window considerably. A script decides in microseconds; an agent sends a snapshot to a model, waits seconds for a reply and then acts on a page that has had all that time to move, which makes every one of these disciplines more necessary rather than less.',
      ],
    },
    {
      heading: 'Never sleep; wait for a condition',
      paragraphs: [
        'A fixed delay is a guess that is simultaneously too long on a fast run and too short on a slow one. It makes the suite slow *and* flaky, which is an impressive combination.',
        'Wait for the thing you actually need: this element is visible, this request has settled, this text has changed. When you cannot express the condition, that is a sign the page has no observable signal for what you are waiting on — and the fix is to find one, not to add seconds.',
        'Be careful with waiting for the network to fall silent. Analytics, polling and long-lived connections mean many perfectly healthy pages never reach idle, so waiting for the element you need is more reliable than waiting for the page to stop talking.',
      ],
      bullets: [
        'Wait for visibility and interactability, not just presence in the DOM',
        'Wait for network idle where the framework hydrates late',
        'Wait for a change from the previous state, not an absolute state',
        'Never a bare sleep — it hides the condition you should be asserting',
      ],
      table: {
        caption: 'Flaky symptom, actual cause',
        columns: ['Symptom', 'Cause', 'Fix'],
        rows: [
          ['Works locally, fails in CI', 'Timing assumption', 'Wait on a condition'],
          ['Clicks the wrong element', 'Stale handle after re-render', 'Re-read before acting'],
          ['Breaks after a redesign', 'Structural selector', 'Select on role and name'],
          ['Field looks filled, submits empty', 'Framework state not updated', 'Read the value back'],
          ['Submitted with a section blank', 'Conditional field appeared late', 'Re-enumerate after changes'],
          ['Passes, achieves nothing', 'No consequence asserted', 'Check the end state'],
        ],
      },
    },
    {
      heading: 'Re-read after every action',
      paragraphs: [
        'A snapshot of the page is stale the moment you act on it. Element handles captured before a click may point at nodes that have been replaced, and a form may have grown conditional fields that did not exist a second ago.',
        'Take a fresh view after every action rather than reusing the previous one. For agents this is doubly important, because the model reasons about the snapshot it was given and will confidently continue against a page that has moved on.',
        'Re-enumerate the fields rather than only re-reading the ones you knew about. Selecting a country reveals a state dropdown; ticking a box reveals three more questions — and a form that looked complete when first read is not complete after you fill it.',
      ],
    },
    {
      heading: 'Select on meaning, not on structure',
      paragraphs: [
        'Selectors tied to class names and positions break on every redesign. Selectors tied to what a thing is — its role and accessible name, a stable test identifier, the label text a user reads — survive.',
        'This is the same property that makes a page accessible, which is a useful heuristic: automation that is hard to write reliably is usually automating a page that is hard to use with a screen reader.',
        'Let a selector that matches two things fail loudly rather than silently taking the first. Application forms repeat labels across sections — two fields called "Name", one for the candidate and one for a referee — and quietly choosing the first is how a value lands in the wrong place and still reports success.',
      ],
    },
    {
      heading: 'Treat every action as unverified',
      paragraphs: [
        'Filling a field is not the same as the field holding the value. Clicking submit is not the same as the submission happening. Automation that assumes the action worked produces runs that silently do nothing.',
        'Assert the consequence: read the field back, wait for the confirmation, check the URL changed. This is the single practice that separates automation you can leave running from automation you have to watch.',
        'Framework-controlled inputs make this mandatory rather than prudent. A component may accept typed characters visually and never update its own state, so a value plainly on screen is absent from what gets submitted — and only reading the state back detects it.',
        'Require positive evidence of success rather than an absence of errors. A confirmation element, a known success redirect, or the record appearing in the site’s own list are all evidence; nothing having thrown is not.',
      ],
    },
    {
      heading: 'Design for interruption, not just for failure',
      paragraphs: [
        'Long flows are interrupted rather than failed: a session expires, a verification code is required, a page asks for something the automation cannot supply. Treating those as errors produces abandoned work where a pause would have produced a completed application.',
        'Detect the condition by its symptom — a redirect to sign-in, a step that reset, a form rejecting everything — and persist enough state to resume from where it paused rather than from the beginning.',
        'Make restarting safe, because it will happen anyway. An idempotency key checked before acting means a resumed run cannot duplicate a submission, which is the failure an interrupted flow most reliably produces.',
      ],
    },
    {
      heading: 'Capture enough to diagnose',
      paragraphs: [
        'When a run fails in an environment you were not watching, the only things that help are a screenshot at the moment of failure, the page snapshot the agent was reasoning about, and a trace of the actions leading up to it.',
        'Capture them on failure automatically. Reproducing a flaky browser failure without artefacts is close to impossible, and an hour spent on this instrumentation repays itself the first time something breaks overnight.',
        'These artefacts contain whatever was typed into the form, which means personal data. Give them a retention limit and the same access controls as the application records rather than leaving them in a bucket nobody has scoped.',
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
      a: 'Selecting on meaning — role, accessible name, label text or a stable test id — and failing loudly on multiple matches rather than silently taking the first.',
    },
    {
      q: 'What should be captured when automation fails?',
      a: 'A screenshot at the failure, the page snapshot the agent was reasoning about, and a trace of preceding actions — with a retention limit, since they contain personal data.',
    },
    {
      q: 'Why is this harder for agents than for scripts?',
      a: 'The window is wider. A script decides in microseconds; an agent waits seconds for a model reply and then acts on a page that has had all that time to change.',
    },
    {
      q: 'Why can a field look filled and submit empty?',
      a: 'A framework-controlled input can accept typed characters visually without updating its own state. Only reading the value back from state detects it.',
    },
  ],
  related: ['how-to-test-an-ai-browser-agent', 'how-ai-agents-understand-web-pages', 'how-to-build-reliable-ai-agents'],
  references: [
    {
      title: 'Best Practices',
      url: 'https://playwright.dev/docs/best-practices',
      publisher: 'Playwright',
      note: 'Waiting on conditions, resilient locators and asserting end state.',
    },
  ],
};

export default post;
