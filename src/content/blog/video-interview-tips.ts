import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'video-interview-tips',
  tint: 'sky',
  title: 'Video Interview Tips: How to Ace Zoom, Teams and Google Meet Interviews',
  heading: 'Video interview tips that make you look and sound prepared',
  description:
    'A complete checklist for online job interviews: tech setup, camera and lighting, what to wear, body language on screen, one-way recorded interviews, and what to do when something goes wrong.',
  keywords: [
    'video interview tips',
    'zoom interview tips',
    'virtual interview tips',
    'online interview preparation',
    'one way video interview',
  ],
  publishedAt: '2026-10-29',
  updatedAt: '2026-10-29',
  author: 'JobsDart Editorial',
  readingMinutes: 6,
  category: 'Interviews',
  anchors: ['video interview', 'virtual interview'],
  excerpt:
    'Most first-round interviews now happen on video. Small details — camera height, lighting, audio and where you look — shape the impression you make before you answer a single question.',
  keyTakeaways: [
    'Test the exact platform, link, camera and microphone at least a day before.',
    'Put the camera at eye level, face a window or lamp, and use headphones with a mic.',
    'Look at the camera when you speak and at the screen when you listen.',
    'For recorded one-way interviews, practise with a timer because you often get one attempt.',
  ],
  sections: [
    {
      heading: 'Technical setup checklist',
      paragraphs: [],
      bullets: [
        'Install and update the platform (Zoom, Microsoft Teams, Google Meet) the day before',
        'Use a laptop or desktop rather than a phone; plug in the charger',
        'Close other apps and browser tabs, and turn off notifications',
        'Use wired headphones or earbuds with a microphone to avoid echo',
        'Have the interviewer\'s phone number or email ready in case the call drops',
        'Join two to three minutes early, not ten',
      ],
    },
    {
      heading: 'Camera, lighting and background',
      paragraphs: [
        'Raise your laptop on books so the camera is at eye level, and sit so your head and shoulders fill the upper half of the frame. Face a window or put a lamp behind the screen; light behind you turns you into a silhouette.',
        'A tidy, plain background is best. Use a subtle blur if your space is busy, but avoid novelty virtual backgrounds that distort your outline.',
      ],
    },
    {
      heading: 'Body language on screen',
      paragraphs: [
        'On video, eye contact means looking at the camera lens. Many people place a small sticky note next to the lens as a reminder. Nod and smile while listening, since small reactions are harder to see on screen, and pause a beat before answering to avoid talking over the interviewer when there is lag.',
      ],
    },
    {
      heading: 'One-way recorded video interviews',
      paragraphs: [
        'Some employers use platforms where you record answers to on-screen questions with no live interviewer. You usually get 30 seconds to two minutes of thinking time and a fixed answer length.',
      ],
      bullets: [
        'Use the practice question the platform offers',
        'Keep a few bullet notes out of view of the camera, but do not read them',
        'Use the STAR structure and aim to finish 10–15 seconds before the timer',
        'Treat it like a live interview: same clothes, setup and energy',
      ],
    },
    {
      heading: 'If something goes wrong',
      paragraphs: [
        'Technology fails for everyone. If your video freezes, say so calmly, rejoin, and offer to repeat your last point. If the connection is unusable, suggest switching to a phone call. Interviewers judge how you handle the problem, not the problem itself.',
      ],
    },
  ],
  faqs: [
    { q: 'What should I wear to a video interview?', a: 'Dress as you would for an in-person interview at that company, at least from the waist up. Solid colours usually look better on camera than busy patterns.' },
    { q: 'Can I use notes in a video interview?', a: 'A few short bullet points are fine, but avoid reading. Interviewers can tell when your eyes move across a script.' },
    { q: 'Is it okay to have a virtual background?', a: 'A plain blur is acceptable. A real, tidy background is better, and novelty backgrounds can look unprofessional.' },
  ],
  related: [
    'star-method-interview-answers',
    'questions-to-ask-at-the-end-of-an-interview',
    'best-ai-mock-interview-tools',
  ],
};

export default post;
