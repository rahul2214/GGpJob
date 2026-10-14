import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  "slug": "how-to-build-a-github-portfolio-that-recruiters-notice",
  "tint": "emerald",
  "title": "How to Build a GitHub Portfolio That Recruiters Notice in 2026",
  "heading": "How to build a GitHub portfolio that recruiters notice",
  "description": "Transform your GitHub profile into a job-landing portfolio in 2026: profile README optimization, pinned repositories, commit history, and showcase architecture.",
  "keywords": [
    "GitHub portfolio for jobs",
    "how to build GitHub portfolio",
    "GitHub profile for software engineer",
    "developer portfolio 2026",
    "GitHub recruiter tips"
  ],
  "publishedAt": "2026-10-14",
  "updatedAt": "2026-10-14",
  "author": "JobsDart Editorial",
  "readingMinutes": 8,
  "category": "Freshers & Students",
  "anchors": [
    "GitHub portfolio for jobs",
    "how to build a GitHub portfolio"
  ],
  "excerpt": "Engineering managers look at GitHub profiles to verify coding habits, architectural taste, and documentation discipline. Here is how to turn your repositories into recruiter magnets.",
  "keyTakeaways": [
    "A curated profile README with pinned flagship repositories creates an immediate visual proof of technical competence.",
    "Quality of commits and readable commit messages matter more than artificial green activity wall-gardening.",
    "Every flagship repository must feature an interactive demo GIF, a live HTTPS URL, and architectural trade-off notes.",
    "Archive or hide abandoned tutorial clones to prevent diluting your high-value engineering builds."
  ],
  "sections": [
    {
      "heading": "What engineering managers actually look for on your GitHub",
      "paragraphs": [
        "When an engineering lead clicks the GitHub link on your resume, they are not grading how many hundreds of commits you have made. They look for specific behavioral signals: Do you write clean, communicative commit messages? Do you document your systems so others can run them? Do you organize code into modular layers, or is everything dumped into a single 2,000-line file?",
        "A messy GitHub profile filled with 25 unfinished forks and half-completed tutorial clones creates a perception of disorganized effort. In contrast, a profile featuring three deeply polished, documented repositories with continuous integration badges immediately places you ahead of 90% of applicants."
      ],
      "bullets": [
        "Signal 1: High-clarity documentation with architectural intent and setup instructions",
        "Signal 2: Meaningful commit history demonstrating iterative problem solving",
        "Signal 3: Automated tests and continuous integration workflows (GitHub Actions)",
        "Signal 4: Clean directory structure following standard framework conventions"
      ]
    },
    {
      "heading": "The 4 essential components of a high-converting profile",
      "paragraphs": [
        "Follow this blueprint to optimize your public GitHub presence."
      ],
      "table": {
        "caption": "GitHub Profile Optimization Checklist",
        "columns": [
          "Component",
          "What Recruiters Notice",
          "Actionable Fix"
        ],
        "rows": [
          [
            "Profile README",
            "Top summary, primary stack icons, and featured projects",
            "Create username/username repository with concise markdown highlighting core competencies"
          ],
          [
            "Pinned Repositories",
            "Your 2 to 4 strongest engineering projects",
            "Pin only repositories that have clean code, live demos, and passing tests"
          ],
          [
            "Repository READMEs",
            "First visual impression of project quality",
            "Include a 5-second demo GIF, tech stack badges, architectural diagrams, and trade-offs"
          ],
          [
            "Commit History",
            "Daily development discipline and collaboration style",
            "Write conventional commits (e.g., \"feat: add JWT auth middleware\" instead of \"fixed stuff\")"
          ]
        ]
      }
    },
    {
      "heading": "README template for flagship repositories",
      "paragraphs": [
        "Every pinned project should follow this standardized, professional README format."
      ],
      "bullets": [
        "Header: Project Name with a one-sentence value proposition and live demo badge",
        "Demo Preview: Embedded GIF or screenshot displaying the application in active use",
        "Key Features: Bulleted breakdown of technical capabilities (not generic descriptions)",
        "System Architecture: Diagram or list illustrating client-server-database data flow",
        "Local Development Setup: Three simple shell commands to clone, configure env variables, and run locally",
        "Automated Tests: Command to run unit and integration test suites"
      ]
    }
  ],
  "faqs": [
    {
      "q": "Do recruiters care about the GitHub contribution graph (green squares)?",
      "a": "While a consistent green graph shows discipline, experienced hiring managers easily spot automated script-padding. Two quality repositories with detailed commits carry far more weight than artificial daily streaks."
    },
    {
      "q": "Should I make my student repositories private?",
      "a": "Make messy, unfinished, or direct homework assignment clones private. Keep your best 3 to 6 production-ready repositories public and pinned."
    }
  ],
  "related": [
    "best-projects-for-computer-science-fresher-resume",
    "how-to-get-a-job-as-a-fresher-with-no-experience",
    "best-resume-format-for-freshers-with-no-experience"
  ],
  "references": [
    {
      "title": "GitHub Docs: Managing Your Profile README",
      "url": "https://github.com",
      "publisher": "GitHub",
      "note": "Official documentation for personalizing your developer profile and pinning repositories."
    },
    {
      "title": "W3C Web Standards for Developer Documentation",
      "url": "https://www.w3.org",
      "publisher": "W3C",
      "note": "Guidelines for semantic markup, readable text structure, and documentation clarity."
    }
  ]
};

export default post;
