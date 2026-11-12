import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  "slug": "job-search-tracker-template",
  "tint": "emerald",
  "title": "How to Build a Job Search CRM: Track Applications, Follow-ups & Offers",
  "heading": "How to build a job search crm: track applications, follow-ups & offers",
  "description": "Stop losing track of your applications. Learn how to build a high-performance job search tracker with status boards, follow-up dates, and salary metrics.",
  "keywords": [
    "job search tracker template",
    "how to track job applications",
    "job search crm spreadsheet",
    "best tools to track job applications",
    "following up on job application timeline",
    "job search metrics funnel"
  ],
  "publishedAt": "2026-11-12",
  "updatedAt": "2026-11-12",
  "author": "JobsDart Editorial",
  "readingMinutes": 7,
  "category": "Productivity",
  "anchors": [
    "job search tracker template",
    "job application CRM"
  ],
  "excerpt": "Applying to dozens of companies without a tracking system leads to missed follow-ups and awkward interview calls. Here is how to build a high-converting job search CRM.",
  "keyTakeaways": [
    "Job hunting is a sales pipeline: tracking metrics transforms an emotional process into an analytical, optimizable workflow.",
    "Key columns every tracker must include: Company, Role, Job URL, Resume Version Used, Salary Range, Date Applied, and Next Action.",
    "Automate follow-up cadence: Day 5 post-application outreach, Day 2 post-interview thank you, and Day 7 decision follow-up.",
    "Monitor conversion rates across stages: if applications do not lead to screens, your resume needs work; if screens fail, behavioral prep is required.",
    "Use JobsDart’s built-in application dashboard to track status, deadlines, and direct recruiter links in one place."
  ],
  "sections": [
    {
      "heading": "Why successful candidates treat job search like an enterprise CRM",
      "paragraphs": [
        "When you apply to multiple tech companies simultaneously, confusion happens quickly. A recruiter calls from an unknown number asking about your application, and you cannot remember which stack they use or which version of your resume you submitted.",
        "Top candidates treat their search like an enterprise sales pipeline. By systematically tracking each lead, follow-up dates, and recruiter contact info, you ensure you never drop an opportunity."
      ]
    },
    {
      "heading": "The 7 essential columns of a high-performance job tracker",
      "paragraphs": [
        "Whether you use Notion, Google Sheets, or JobsDart’s built-in dashboard, ensure your system includes these core data points:"
      ],
      "table": {
        "caption": "Job Search CRM Data Schema",
        "columns": [
          "Field Name",
          "Description & Purpose",
          "Example Entry"
        ],
        "rows": [
          [
            "Company & Role",
            "Name of employer and exact job title applied for",
            "Stripe – Senior Backend Engineer"
          ],
          [
            "Date Applied",
            "Timestamp of application submission",
            "2026-10-14"
          ],
          [
            "Status",
            "Pipeline stage (Bookmarked, Applied, Screening, Offer)",
            "Screening Scheduled"
          ],
          [
            "Resume Version",
            "Identifies which tailored PDF version was sent",
            "Resume_Stripe_Golang_v2.pdf"
          ],
          [
            "Salary / Compensation",
            "Target compensation discussed or listed on posting",
            "$160,000 - $185,000 USD"
          ],
          [
            "Recruiter Contact",
            "Name and LinkedIn/Email of primary recruiter",
            "Sarah Jenkins (sjenkins@stripe.com)"
          ],
          [
            "Next Follow-Up Date",
            "Strict calendar deadline for sending an update message",
            "2026-10-21 (Day 7 Follow-Up)"
          ]
        ]
      }
    },
    {
      "heading": "Diagnosing your job search funnel with conversion metrics",
      "paragraphs": [
        "Tracking applications allows you to identify exactly where your job search pipeline is leaking:",
        "Leak 1: 50 Applications -> 0 Recruiter Screens. Diagnosis: Your resume is failing ATS filters or missing primary hard technical keywords. Fix: Use JobsDart ATS Checker.",
        "Leak 2: 10 Recruiter Screens -> 1 Technical Interview. Diagnosis: Weak communication of your background or misaligned salary expectations. Fix: Practice your 2-minute elevator pitch.",
        "Leak 3: 5 Technical Interviews -> 0 Offers. Diagnosis: Struggling with live system design, LeetCode algorithms, or STAR behavioral questions. Fix: Intensive mock interview practice."
      ]
    }
  ],
  "faqs": [
    {
      "q": "How many days should I wait before following up on an application?",
      "a": "Five to seven business days is the industry standard. If you have not heard back after one week, send a polite 3-sentence inquiry to the talent acquisition manager on LinkedIn."
    },
    {
      "q": "Does JobsDart automatically track my applications?",
      "a": "Yes. Every job you apply to or bookmark on JobsDart is automatically added to your personal candidate dashboard with status tracking and deadline reminders."
    }
  ],
  "related": [
    "how-to-tailor-resume-for-each-job",
    "cold-email-recruiters-linkedin-templates",
    "ai-auto-apply-vs-targeted-job-application"
  ]
};

export default post;
