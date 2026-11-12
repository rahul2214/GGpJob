const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', 'src', 'content', 'blog');

const posts = [
  {
    slug: 'how-to-beat-ats-2026',
    tint: 'indigo',
    title: 'How to Beat ATS Algorithms in 2026: The Complete Guide',
    heading: 'How to beat ATS algorithms in 2026',
    description: 'Learn how modern 2026 ATS parsers (Workday, Greenhouse, Taleo) rank resumes and how to optimize yours for a 90%+ match score.',
    keywords: [
      'how to beat ATS 2026',
      'how to pass applicant tracking system',
      'ats resume checker free',
      'what is a good ats score for resume',
      'greenhouse ats keyword parser',
      'workday resume parsing algorithm'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 9,
    category: 'Resume & ATS',
    anchors: ['beat ATS algorithms in 2026', 'ATS resume checker'],
    excerpt: 'Modern Applicant Tracking Systems no longer rely on naive keyword matching. Here is how modern semantic parsers evaluate your experience and how to score 90%+ without keyword stuffing.',
    keyTakeaways: [
      'Modern 2026 ATS platforms like Greenhouse and Workday use semantic vector embeddings rather than raw substring frequency.',
      'Complex multi-column tables, floating text boxes, and SVG skill bars scramble parser text extraction pipelines.',
      'Working backwards from the exact job description ensures your natural phrasing matches the core skill ontology.',
      'Quantified impact bullets using standard active verbs achieve consistently higher match percentiles.',
      'Always test your resume through a verified ATS parser before submitting to detect invisible layout drops.'
    ],
    sections: [
      {
        heading: 'How modern 2026 ATS parsers actually evaluate resumes',
        paragraphs: [
          'The myth that applicant tracking systems automatically reject 75% of resumes based on missing buzzwords is outdated. In 2026, enterprise platforms like Workday, Greenhouse, Taleo, and Lever use large language model (LLM) embeddings and semantic entity extraction to index candidate profiles.',
          'Instead of counting how many times the word "Kubernetes" appears, modern parsers construct an entity graph: they identify your role title, calculate tenure across dates, link technical tools to specific business achievements, and score semantic alignment against the hiring manager’s required competencies.',
          'Understanding this architectural transition is critical. Keyword stuffing in white 1-point font or appending a hidden block of comma-separated tags no longer works. In fact, modern parsing layers flag anomalous keyword density as adversarial spam and drop candidate ranking.'
        ],
        bullets: [
          'Entity Extraction: Identifies job titles, dates, degrees, and verified hard skills into structured JSON records.',
          'Semantic Vector Scoring: Measures conceptual similarity between your experience bullets and the job responsibilities.',
          'Knockout Filtering: Automatically disqualifies candidates based on explicit compliance rules (work authorization, notice period, location).'
        ]
      },
      {
        heading: 'Formatting pitfalls that break modern parsing engines',
        paragraphs: [
          'Even the most advanced AI parsers rely on linear text stream extraction as their first step. When candidates design visually complex resumes using graphical design editors, the document text layer gets fractured.',
          'Multi-column layouts are the number one culprit. When an extraction tool converts a two-column PDF into raw text, it frequently reads across the page horizontally rather than down each column sequentially. This merges your company names with unrelated skill tags, corrupting employment date chronologies.'
        ],
        table: {
          caption: 'ATS Format Compliance Comparison (2026 Standards)',
          columns: ['Resume Element', 'ATS-Safe Standard', 'High-Risk Trap (Avoid)'],
          rows: [
            ['Document Layout', 'Single-column top-to-bottom vertical flow', 'Two-column split sidebar layouts'],
            ['File Format', 'Clean text-based PDF or standard DOCX', 'Scanned raster images or flattened PDFs'],
            ['Section Headers', 'Standard tags (Experience, Education, Skills)', 'Creative tags ("Where I have Been", "Toolbox")'],
            ['Skill Representation', 'Categorized plain text bullet points', 'Progress bars, percentages, or star graphics'],
            ['Contact Details', 'Main body top header (Email, Phone, City, LinkedIn)', 'Embedded inside visual PDF header/footer elements']
          ]
        }
      },
      {
        heading: 'The 4-step framework to achieve a 90%+ ATS match score',
        paragraphs: [
          'Scoring in the 90th percentile does not require rewriting your entire life history for every posting. It requires targeted alignment with the posting’s core ontology.',
          'First, dissect the target job description into mandatory requirements versus secondary preferences. Look for technical stacks repeated in both the summary and key deliverables.',
          'Second, naturally integrate exact terminology. If the posting asks for "Amazon Web Services (AWS)", include both the acronym and the spelled-out form at least once in your experience bullets.',
          'Third, quantify the scale and outcome of your technical work. Modern parsers elevate bullets that demonstrate business metric ownership over generic duty descriptions.'
        ],
        example: {
          title: 'Bullet Point Optimization: From Unranked to Top Tier',
          paragraphs: [
            'Weak Unranked Bullet: "Responsible for managing cloud databases and optimizing application queries for the backend team."',
            'Optimized 95% Match Bullet: "Architected PostgreSQL and Redis database caching layer on AWS RDS, reducing p99 API latency by 42% across 1.2M daily active user requests."'
          ]
        }
      },
      {
        heading: 'Pre-flight testing: how to audit your resume before applying',
        paragraphs: [
          'Before submitting your application to an enterprise portal, test it through a verified parser simulation. A reliable ATS score checker checks for text readability, extracts your skills list, and flags formatting anomalies.',
          'JobsDart provides a comprehensive ATS Resume Score Checker that evaluates your resume against target job descriptions in real-time, highlighting missing keywords, structural errors, and semantic match percentages.'
        ],
        bullets: [
          'Verify that all company names and dates are extracted into correct chronological sequence.',
          'Confirm that your core programming languages and frameworks appear in the parsed skill inventory.',
          'Ensure your contact email and phone number are extracted cleanly without character corruption.'
        ]
      }
    ],
    faqs: [
      {
        q: 'What is considered a good ATS resume score?',
        a: 'A score of 80% or higher is typically sufficient to pass automated screening filters and place your resume on the recruiter’s shortlist. Scores above 90% place you in the top tier of inbound candidates.'
      },
      {
        q: 'Is PDF or Word DOCX better for ATS systems in 2026?',
        a: 'A clean, text-based PDF exported directly from Word, Google Docs, or LaTeX is the gold standard across modern systems like Greenhouse, Lever, and Workday. It preserves visual layout while providing selectable, parseable text streams.'
      },
      {
        q: 'Can ATS detect if a resume was written with ChatGPT?',
        a: 'ATS systems do not reject resumes simply because an LLM assisted in writing them. However, they easily detect generic phrasing, hallucinated metrics, and lack of contextual depth that comes from raw, unedited AI output.'
      }
    ],
    related: ['how-applicant-tracking-systems-work', 'ai-resume-writing-guide', 'how-to-tailor-resume-for-each-job']
  },
  {
    slug: 'chatgpt-prompts-for-resume-writing',
    tint: 'emerald',
    title: 'Best ChatGPT Prompts for Resume Writing & Bullet Points (2026)',
    heading: 'Best ChatGPT prompts for resume writing & bullet points',
    description: 'Copy 25+ proven ChatGPT prompts to transform weak resume duties into high-impact, metrics-driven bullet points that pass recruiter screenings.',
    keywords: [
      'chatgpt prompts for resume writing',
      'ai prompts for resume bullet points',
      'how to use chatgpt to tailor resume',
      'chatgpt resume rewrite prompts',
      'best prompts for job application resume',
      'xyz formula resume prompt'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 8,
    category: 'AI Resume Tools',
    anchors: ['ChatGPT prompts for resume writing', 'AI resume bullet points'],
    excerpt: 'Asking ChatGPT to "write my resume" produces generic, hallucinated fluff. Use these battle-tested, structured prompt templates to generate quantifiable, recruiter-approved technical bullets.',
    keyTakeaways: [
      'Never ask AI to write your resume from scratch; supply raw truthful bullet notes and use AI exclusively for structural compression.',
      'Use Google’s X-Y-Z formula prompt to guarantee every bullet links an action to a concrete business metric.',
      'Explicitly instruct the model not to invent numbers, scope, or tools outside your provided experience notes.',
      'Extract hidden keywords from target job postings by prompting the LLM to identify recurring technical nouns.',
      'Review generated outputs out loud to remove overused AI buzzwords like "spearheaded", "seamless", and "tapestry".'
    ],
    sections: [
      {
        heading: 'Why generic resume prompts fail recruiter and ATS screenings',
        paragraphs: [
          'If you prompt an LLM with "Write a resume for a senior backend developer with 5 years of experience", you will receive a document that looks superficially impressive but fails every professional hiring test.',
          'Large language models trained on web data generate the statistical average of all resumes online. The result is a page filled with vague cliches: "Dynamic team player who spearheaded cross-functional collaboration and optimized workflows."',
          'Recruiters review hundreds of resumes every morning. They instantly spot the formulaic rhythm, identical vocabulary, and inflated claims of unconstrained AI generation. To get real interviews, your prompts must enforce strict grounding in your genuine achievements.'
        ]
      },
      {
        heading: 'The Google X-Y-Z prompt framework for impact bullets',
        paragraphs: [
          'Google’s famous formula for impactful resume bullets is: "Accomplished [X], as measured by [Y], by doing [Z]". Here is the prompt template that forces ChatGPT to rewrite your draft notes into this exact high-converting structure.'
        ],
        example: {
          title: 'Master Bullet Rewrite Prompt Template',
          paragraphs: [
            'PROMPT:\n"You are an expert technical resume writer and former engineering hiring manager. Rewrite my rough bullet notes using the Google X-Y-Z formula (Accomplished [X], measured by [Y], by doing [Z]).\n\nRules:\n1. Keep each bullet under 28 words.\n2. Start with a strong past-tense active technical verb.\n3. Do not invent any metrics, team sizes, or technologies not present in my input.\n4. Focus on system scale, latency, cost, or reliability impact.\n\nInput notes: [Paste your raw project notes here]"'
          ]
        }
      },
      {
        heading: 'Copy-paste prompt library for specific resume sections',
        paragraphs: [
          'Use these specialized prompts to build distinct sections of your professional technical resume.'
        ],
        bullets: [
          'Extract Keywords Prompt: "Analyze this target job description and extract the top 7 required hard technical skills, 3 architectural concepts, and 2 soft skills as a JSON list. [Job Description]"',
          'Professional Summary Prompt: "Draft a 3-sentence technical summary for a candidate with [X] years experience in [Tech Stack]. Sentence 1: Core identity and scale handled. Sentence 2: Key architectural specialization and domain expertise. Sentence 3: Target impact for the prospective employer."',
          'Skills Categorization Prompt: "Organize the following raw skills list into 4 clean categories: Languages, Frameworks & Libraries, Cloud & DevOps, Databases & Caching. [Raw skills list]"'
        ]
      },
      {
        heading: 'Avoiding the AI hallucination trap: quality control checklist',
        paragraphs: [
          'The single biggest danger of using AI in resume writing is hallucinated metrics. If a model inserts "improved customer satisfaction by 34%" into a backend refactoring bullet and an interviewer asks how you measured CSAT on an internal microservice, your credibility evaporates.',
          'Always audit every single metric. If you do not have an exact percentage, provide a rough estimate of scale (e.g., "supporting 50,000 requests per minute" or "reducing deploy time from 45m to 12m").'
        ],
        table: {
          caption: 'AI Buzzwords to Replace Immediately',
          columns: ['Overused AI Buzzword', 'Why It Fails', 'Strong Technical Alternative'],
          rows: [
            ['Spearheaded', 'Overused, vague, sounds self-aggrandizing', 'Architected, Led, Shipped, Deployed'],
            ['Leveraged', 'Corporate filler word with zero technical meaning', 'Implemented, Integrated, Utilized'],
            ['Seamlessly', 'Subjective opinion, unquantifiable', 'Automated, Synchronized, Refactored'],
            ['Passionate about', 'Recruiters care about competence, not claims of passion', 'Demonstrated expertise in, Focused on']
          ]
        }
      }
    ],
    faqs: [
      {
        q: 'Will companies reject my resume if they see I used ChatGPT?',
        a: 'Companies do not reject resumes for using AI as an editing tool. They reject resumes that are generic, contain false claims, or fail to demonstrate real technical competence when tested in live technical interviews.'
      },
      {
        q: 'How can I make AI resume bullets sound like my own voice?',
        a: 'Feed your rough, honest notes into the prompt first. Provide the real technical problems you faced and the specific libraries you chose. The more specific your input, the more authentic and natural the output.'
      }
    ],
    related: ['how-to-beat-ats-2026', 'ai-resume-writing-guide', 'tech-resume-action-verbs']
  },
  {
    slug: '1-page-vs-2-page-resume',
    tint: 'slate',
    title: '1-Page vs 2-Page Resume: Exact Rules for Tech in 2026',
    heading: '1-page vs 2-page resume: exact rules for tech in 2026',
    description: 'Should your resume be 1 page or 2 pages? Discover the industry standard length based on your years of experience and recruiter preferences.',
    keywords: [
      '1 page vs 2 page resume',
      'how many pages should a tech resume be',
      'is a 2 page resume bad',
      'resume length for 5 years experience',
      'software engineer resume page length',
      'tech resume formatting length rules'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 7,
    category: 'Resume Strategy',
    anchors: ['1-page vs 2-page resume', 'tech resume length rules'],
    excerpt: 'The rigid rule that every resume must fit on one single page is no longer true for experienced engineers. Here is the exact tenure breakdown that tech recruiters expect in 2026.',
    keyTakeaways: [
      'Candidates with 0 to 4 years of experience must strictly stick to a single-page format.',
      'Engineers with 5+ years of experience across multiple companies benefit from a well-structured two-page layout.',
      'A two-page resume must never have an awkward trailing three-line spillover onto page two.',
      'Recruiters spend 6 to 8 seconds on initial scanning; critical technical skills and recent impact must sit above the fold on page one.',
      'Trimming obsolete tech from 8+ years ago preserves high-density readability without sacrificing seniority proof.'
    ],
    sections: [
      {
        heading: 'The experience matrix: when to choose 1 page vs 2 pages',
        paragraphs: [
          'Few resume questions cause as much debate as document length. Career counselors often insist that anything over one page is thrown in the trash, while senior engineering leads argue that a single page cannot adequately detail complex distributed system architectures.',
          'The real answer depends entirely on your demonstrable years of professional experience (YOE). In 2026, tech recruiters and hiring managers follow a clear standard.'
        ],
        table: {
          caption: 'Recommended Tech Resume Page Length by Experience',
          columns: ['Years of Experience (YOE)', 'Standard Page Count', 'Strategic Rationale'],
          rows: [
            ['0 - 3 Years (Fresher / Junior)', 'Strictly 1 Page', 'Experience depth does not warrant two pages; brevity demonstrates focus.'],
            ['4 - 7 Years (Mid-Level SDE)', '1 to 2 Pages', '1 page if at 1-2 companies; 2 pages if multiple high-impact transitions.'],
            ['8 - 14 Years (Senior / Staff / Lead)', '2 Pages', 'Requires space for architectural ownership, team mentorship, and metrics.'],
            ['15+ Years (Executive / Fellow)', '2 to 3 Pages', 'Executive portfolio detailing business transformation, patents, and org growth.']
          ]
        }
      },
      {
        heading: 'Why a bad 2-page resume gets rejected immediately',
        paragraphs: [
          'A two-page resume is acceptable for seasoned professionals, but a poorly formatted two-page document is worse than a crowded single page.',
          'The most common failure is the "accidental spillover": a resume where page two contains only four lines of education or three stray skill tags. This signals careless formatting and poor spatial awareness to a hiring team.',
          'If you expand to two pages, ensure that page two is at least 60% to 75% filled with substantial content, such as earlier career milestones, patents, open-source projects, or specialized certifications.'
        ],
        bullets: [
          'Never leave page two with less than half a page of content.',
          'Ensure your most impressive recent 3-5 years of work sit entirely on the top half of page one.',
          'Include your name, email, and "Page 2 of 2" in the header of the second sheet.'
        ]
      },
      {
        heading: 'How to compress 7 years of work into a high-impact single page',
        paragraphs: [
          'If you want to keep your resume to a single page despite having 5-7 years of experience, you must aggressively edit out administrative boilerplate.',
          'Condense roles held more than 5 years ago into one or two high-level summary lines. The modern tech stack moves so fast that recruiters care far more about your current Kubernetes and Golang work than the jQuery bugs you fixed in 2018.'
        ],
        bullets: [
          'Drop non-technical hobby sections and references available upon request lines.',
          'Combine redundant tool entries into concise category lines rather than standalone bullet lists.',
          'Reduce bullet counts on earlier jobs from five bullets down to two high-level outcome statements.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Does an ATS penalize two-page resumes?',
        a: 'No. Modern ATS systems parse text streams sequentially and do not penalize page count. However, human recruiters will quickly glance at page one first, so critical qualifications must appear early.'
      },
      {
        q: 'Can freshers or college graduates use a two-page resume?',
        a: 'Almost never. Unless a fresher has published peer-reviewed academic research papers or holds major patent filings, submitting two pages signals an inability to curate and synthesize information.'
      }
    ],
    related: ['how-to-beat-ats-2026', 'ats-friendly-resume-templates-for-software-engineers', 'tech-resume-action-verbs']
  },
  {
    slug: 'tech-resume-action-verbs',
    tint: 'amber',
    title: 'Top 50 Action Verbs That Make Your Tech Resume Stand Out',
    heading: 'Top 50 action verbs that make your tech resume stand out',
    description: 'Replace passive words with 50 high-impact technical action verbs that catch recruiter attention and demonstrate measurable leadership.',
    keywords: [
      'tech resume action verbs',
      'best action words for software engineer resume',
      'strong verbs for technical resume',
      'resume words to replace managed or worked on',
      'action verbs for data engineer resume',
      'impact verbs for tech cv'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 8,
    category: 'Resume Strategy',
    anchors: ['action verbs for tech resume', 'strong technical verbs'],
    excerpt: 'Weak verbs like "assisted", "worked on", and "responsible for" diminish your achievements. Upgrade your resume bullets with 50 authoritative, engineering-specific action verbs.',
    keyTakeaways: [
      'Passive phrasing obscures whether you personally led a deliverable or merely observed from the sidelines.',
      'Categorize your verbs by technical function: System Architecture, Data Engineering, Performance Optimization, and Technical Leadership.',
      'Pair every action verb immediately with the technical object and the measurable business outcome.',
      'Avoid corporate corporate filler verbs like "synergized" or "utilized" that offer zero technical insight.',
      'Vary your verb choices across bullets to prevent repetitive rhythmic fatigue during recruiter scans.'
    ],
    sections: [
      {
        heading: 'Why your choice of opening verb dictates interview callback rates',
        paragraphs: [
          'When an engineering hiring manager scans a resume, their eyes naturally track the left margin. The first word of every bullet point establishes your level of ownership.',
          'Phrases like "Responsible for maintenance of microservices" describe a passive job description, not an accomplishment. In contrast, "Architected automated failover clustering for microservices" immediately communicates technical competence, ownership, and initiative.'
        ]
      },
      {
        heading: '50 high-impact technical action verbs categorized by function',
        paragraphs: [
          'Choose precise verbs that reflect the specific technical discipline of your engineering contribution.'
        ],
        table: {
          caption: 'The Essential Technical Action Verb Taxonomy',
          columns: ['Engineering Category', 'Weak Verb to Replace', 'High-Impact Power Verbs'],
          rows: [
            ['System Architecture', 'Built, Made, Handled', 'Architected, Designed, Engineered, Refactored, Overhauled, Constructed'],
            ['Performance & Scale', 'Improved, Sped up, Fixed', 'Optimized, Accelerated, Streamlined, Reduced, Throttled, Benchmarked'],
            ['Cloud & DevOps', 'Put on cloud, Ran, Set up', 'Containerized, Automated, Provisioned, Orchestrated, Migrated, Deployed'],
            ['Data & AI Pipelines', 'Got data, Processed data', 'Ingested, Transformed, Vectorized, Fine-Tuned, Modeled, Parsed'],
            ['Technical Leadership', 'Helped, Managed, Supported', 'Spearheaded, Championed, Mentored, Established, Standardized, Directed']
          ]
        }
      },
      {
        heading: 'Before-and-after transformations using technical verbs',
        paragraphs: [
          'Notice how changing the verb and restructuring the sentence transforms an ordinary resume bullet into an undeniable demonstration of engineering value.'
        ],
        example: {
          title: '3 Real-World Engineering Bullet Transformations',
          paragraphs: [
            'Example 1 (Cloud & DevOps):\n• Before: "Worked on Docker containers and helped deploy services to AWS."\n• After: "Containerized 14 core backend microservices using Docker and automated CI/CD deployment pipelines to AWS ECS, cutting release cycle time by 65%."',
            'Example 2 (Performance Optimization):\n• Before: "Made database queries faster for the mobile app team."\n• After: "Optimized complex PostgreSQL indexing and query execution plans, reducing median endpoint latency from 850ms to 92ms under peak load."',
            'Example 3 (System Architecture):\n• Before: "Assisted in building authentication for the new platform."\n• After: "Engineered zero-trust OAuth2 / OIDC authentication service with Redis session caching, securing 450k+ monthly active enterprise authentications."'
          ]
        }
      }
    ],
    faqs: [
      {
        q: 'Should all resume bullet points start with an action verb?',
        a: 'Yes. Every single professional experience bullet point should open with a strong past-tense active verb (or present tense for your current ongoing projects).'
      },
      {
        q: 'How many times can I repeat the same action verb?',
        a: 'Avoid using the same opening verb more than twice across your entire resume. If you have multiple optimization bullets, alternate between "Optimized", "Accelerated", "Streamlined", and "Refactored".'
      }
    ],
    related: ['how-to-beat-ats-2026', 'chatgpt-prompts-for-resume-writing', '1-page-vs-2-page-resume']
  },
  {
    slug: 'how-to-tailor-resume-for-each-job',
    tint: 'sky',
    title: 'How to Tailor Your Resume for Multiple Jobs Without Burning Out',
    heading: 'How to tailor your resume for multiple jobs without burning out',
    description: 'Master the targeted resume framework: how to customize skills, summary, and experience for 10+ job applications in under 5 minutes each.',
    keywords: [
      'how to tailor resume for each job',
      'tailoring resume to job description',
      'custom resume for every application',
      'how to customize resume fast',
      'resume tailoring tool',
      'master resume strategy'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 8,
    category: 'AI Resume Tools',
    anchors: ['tailor your resume for each job', 'targeted resume strategy'],
    excerpt: 'Customizing your resume for every application does not mean starting from a blank page each time. Use the master modular resume framework to tailor applications in under five minutes.',
    keyTakeaways: [
      'Maintain an exhaustive 3-to-4 page Master Resume containing every project, tool, and metric you have ever worked on.',
      'Target job customization only requires modifying your Professional Summary and the top 3 bullets of your most recent role.',
      'Match the employer’s exact nomenclature for hard technical skills to guarantee immediate ATS semantic alignment.',
      'Use JobsDart AI Resume Builder to detect the skill delta between your resume and the posting in under 15 seconds.',
      'Quality always beats volume: 20 meticulously tailored applications yield 5x more interviews than 500 one-click generic blasts.'
    ],
    sections: [
      {
        heading: 'The fatal flaw of the single one-size-fits-all resume',
        paragraphs: [
          'Submitting the exact same static resume to 200 job postings is the primary reason qualified engineers struggle to get interview callbacks.',
          'Company A might be hiring a Backend Engineer with heavy emphasis on high-throughput Kafka streaming, while Company B needs an engineer focused on GraphQL APIs and multi-tenant PostgreSQL. If your resume tries to be everything to everyone, it ranks as mediocre for both.',
          'Tailoring is simply the art of bringing your existing, genuine experience that is most relevant to the target company to the immediate top of the page.'
        ]
      },
      {
        heading: 'The 3-layer master resume modular framework',
        paragraphs: [
          'To tailor applications rapidly without burning out, separate your resume into fixed elements and dynamic elements.'
        ],
        table: {
          caption: 'The Modular Resume Architecture',
          columns: ['Resume Layer', 'Component', 'Tailoring Strategy'],
          rows: [
            ['Dynamic (Change Every Job)', 'Professional Summary', 'Rewrite 3 sentences to mirror the job title, core mission, and primary required tech stack.'],
            ['Dynamic (Change Every Job)', 'Top Role Bullets (1-3)', 'Re-order and re-phrase bullets to prioritize the specific deliverables named in the posting.'],
            ['Semi-Fixed (Minor Tweaks)', 'Technical Skills Grid', 'Reorder skills so the technologies requested by the employer appear first in each category list.'],
            ['Fixed (Keep Unchanged)', 'Company Names, Dates, Degrees', 'Never alter official employment dates, verified titles, or academic credentials.']
          ]
        }
      },
      {
        heading: 'The 5-minute tailoring workflow step-by-step',
        paragraphs: [
          'Follow this rapid checklist for every application:',
          'Step 1: Paste the target job posting into an editor and highlight the top 3 technical requirements and top 2 domain keywords.',
          'Step 2: Check your Master Resume to see which projects demonstrated those specific competencies.',
          'Step 3: Move those specific project bullets to positions 1 and 2 under your latest roles.',
          'Step 4: Update the opening 3-line Summary to reflect the exact target role title.',
          'Step 5: Export clean PDF and verify the match score with JobsDart ATS Checker before hitting submit.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Is it dishonest to tailor my resume for different jobs?',
        a: 'No. Tailoring is not inventing fake experience; it is highlighting the authentic aspects of your career that are most directly relevant to what the hiring manager needs solved right now.'
      },
      {
        q: 'How many tailored applications should I send per week?',
        a: 'Between 10 and 15 highly tailored, research-backed applications per week is the ideal sweet spot for working engineers. This yields far higher interview conversions than mass spamming.'
      }
    ],
    related: ['how-to-beat-ats-2026', 'chatgpt-prompts-for-resume-writing', 'candidate-skill-match-score']
  },
  {
    slug: 'ats-friendly-resume-templates-for-software-engineers',
    tint: 'violet',
    title: 'Best Free ATS Resume Templates for Software Engineers (2026)',
    heading: 'Best free ATS resume templates for software engineers',
    description: 'Download clean, ATS-compliant resume templates built for frontend, backend, full stack, and AI developers with proven 90%+ parser accuracy.',
    keywords: [
      'ats friendly resume templates for software engineers',
      'free tech resume template ats',
      'software engineer resume format 2026',
      'clean single column resume template',
      'markdown tech resume template',
      'developer cv template ats compliant'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 8,
    category: 'Resume Strategy',
    anchors: ['ATS resume templates for software engineers', 'ATS compliant developer resume'],
    excerpt: 'Stop getting filtered out by graphical templates. Discover and copy the cleanest, high-converting ATS-friendly resume templates built specifically for software engineers.',
    keyTakeaways: [
      'Modern ATS engines parse plain single-column layouts with 99.4% field accuracy compared to 58% on multi-column visual designs.',
      'Use clear, standardized typography: Inter, Roboto, Arial, or Calibri at 10-11pt body size.',
      'Structure sections strictly in sequence: Header, Summary, Technical Skills, Professional Experience, Projects, Education.',
      'Place technical skills grouped logically into Languages, Frameworks, Cloud/DevOps, and Databases.',
      'Use JobsDart visual resume builder to export pre-tested, 100% ATS-certified templates for free.'
    ],
    sections: [
      {
        heading: 'Why developer resumes fail automated ATS parsing',
        paragraphs: [
          'Software engineers frequently try to showcase their technical creativity through custom visual resumes designed on platforms like Canva or custom HTML templates with floating divs.',
          'Unfortunately, enterprise ATS parsers like Workday and Greenhouse convert incoming PDF binaries into plain text tokens using line-by-line raster analysis. When icons, tables without borders, or skill rating meters are parsed, the output is garbled text that automated scoring algorithms rank near zero.'
        ]
      },
      {
        heading: 'Anatomy of a 100% ATS-compliant developer template',
        paragraphs: [
          'A high-performing software engineer template follows a strict, predictable vertical hierarchy that both machine parsers and human engineers can read instantly.'
        ],
        bullets: [
          'Contact Header: Full Name (20pt Bold), followed by City, State, Country | Phone | Professional Email | LinkedIn URL | GitHub URL.',
          'Technical Skills Grid: Positioned directly under the header or summary so both recruiters and keyword scanners index hard skills first.',
          'Experience Section: Reverse chronological order. Each role formatted as: Company Name | Location | Job Title | Dates (Month Year – Month Year).',
          'Projects Section: Name of project, bolded tech stack in parentheses, live demo/GitHub link, followed by 2 quantified outcome bullets.',
          'Education Section: Degree, Major, University, Graduation Year. Keep honors and GPA optional unless a recent graduate.'
        ]
      },
      {
        heading: 'Specialized template variations by engineering discipline',
        paragraphs: [
          'Different engineering roles require slight structural adjustments to emphasize domain-specific strengths.'
        ],
        table: {
          caption: 'Template Layout Priorities by Engineering Role',
          columns: ['Engineering Role', 'Primary Section Focus', 'Key Technical Signals to Highlight'],
          rows: [
            ['Frontend Engineer', 'UI performance, Component Libraries, State', 'React 19, Next.js, TypeScript, Core Web Vitals, Tailwind CSS, Accessibility'],
            ['Backend Engineer', 'Distributed Systems, APIs, Database Scale', 'Go, Python, Java, Microservices, Kafka, PostgreSQL, Redis, gRPC'],
            ['Full Stack Engineer', 'End-to-End Ownership & Product Velocity', 'TypeScript, Next.js, Node.js, GraphQL, Docker, AWS, Stripe integration'],
            ['AI / ML Engineer', 'Model Pipelines, RAG, Inference, Evals', 'PyTorch, Python, LangGraph, vLLM, Vector DBs, Triton Inference, Evaluation metrics']
          ]
        }
      }
    ],
    faqs: [
      {
        q: 'Can I use colors in an ATS resume template?',
        a: 'Subtle accent colors (such as deep navy or slate grey for section headers) are completely fine and do not affect ATS text extraction. Avoid light background fills, watermark logos, or multicolored text.'
      },
      {
        q: 'Should I include my photograph on a tech resume?',
        a: 'In the US, Canada, UK, and India, including a photo is strictly discouraged to protect against unconscious bias. In certain European countries (Germany/France), photos are still common but increasingly optional for tech roles.'
      }
    ],
    related: ['how-to-beat-ats-2026', '1-page-vs-2-page-resume', 'tech-resume-action-verbs']
  },
  {
    slug: 'how-recruiters-use-ai-to-screen-resumes',
    tint: 'rose',
    title: 'How Modern Recruiters Use AI to Screen Candidates in 2026',
    heading: 'How modern recruiters use AI to screen candidates in 2026',
    description: 'An inside look into how HR and talent acquisition teams use AI screening software to filter 1,000+ applications down to the top 10 candidates.',
    keywords: [
      'how recruiters use ai to screen resumes',
      'ai candidate screening process',
      'how does ai filter job applications',
      'recruiter ai tools 2026',
      'do recruiters reject ai generated resumes',
      'automated talent filtering algorithms'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 9,
    category: 'Recruitment Insights',
    anchors: ['how recruiters use AI to screen resumes', 'AI candidate screening'],
    excerpt: 'Behind the recruiter dashboard: discover how enterprise talent teams use AI ranking tools to process 1,000 inbound applications into an interview shortlist within minutes.',
    keyTakeaways: [
      'Enterprise recruiters do not read 1,000 resumes manually; AI tools rank candidates into percentage-based fit tiers.',
      'Knockout filters (location, work visa authorization, notice period) eliminate 40-50% of applicants before semantic review.',
      'Recruiters look at the AI summary card: verified skills match, career progression timeline, and highlighted project links.',
      'Submitting applications within the first 48 hours of posting gives you a 4x higher probability of recruiter review.',
      'Candidates who optimize their profile for semantic relevance consistently rank in the top 5% of candidate batches.'
    ],
    sections: [
      {
        heading: 'The anatomy of an enterprise recruiter dashboard in 2026',
        paragraphs: [
          'To optimize your job search, you must understand the interface on the other side of your submission. When a recruiter opens a requisition on Workday or Greenhouse, they do not see a folder of 800 PDF documents.',
          'They see a prioritized candidate table. Modern platforms generate a summary profile card for each applicant containing an AI-generated match score, detected skill tags, total years of relevant experience, and automated knockout status.',
          'Recruiters sort the table by "Top Match" and begin reviewing candidates from the top down. If the first 25 candidates look strong, they schedule initial phone screens and never look at candidate #200 or #500.'
        ]
      },
      {
        heading: 'The 3 automated screening stages every resume passes through',
        paragraphs: [
          'Before a human being reads your bullet points, your application must navigate three automated stages:'
        ],
        bullets: [
          'Stage 1: Hard Knockout Rules. Automated checks for citizenship, legal right to work, target city relocation, and minimum educational or certification criteria.',
          'Stage 2: Semantic Experience Scoring. Vector search models match the semantic depth of your past responsibilities with the employer’s technical requirements.',
          'Stage 3: Recruiter Card Summarization. An AI copilot summarizes your key achievements and highlights potential red flags (unexplained employment gaps, frequent job hopping) for the talent scout.'
        ]
      },
      {
        heading: 'How to position your application in the top 5% of the recruiter stack',
        paragraphs: [
          'Knowing how the system functions allows you to optimize your strategy for maximum visibility.',
          'First, apply early. Over 70% of interviews are scheduled from candidates who submitted within the first 3 days of a posting going live.',
          'Second, ensure your stated job titles reflect industry standards. If your official company title was "Member of Technical Staff II", append the standard equivalent in parentheses: "Member of Technical Staff II (Senior Backend Engineer)".',
          'Third, leverage internal employee referrals. On JobsDart and enterprise ATS systems, referred candidates are automatically pinned to the top of the recruiter’s queue, bypassing automated rank-sorting entirely.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Do recruiters read resumes on their phones?',
        a: 'Yes, increasingly recruiters review preliminary candidate cards on mobile ATS dashboards during commutes or between meetings. Clean, concise formatting makes mobile reading effortless.'
      },
      {
        q: 'Are cover letters read by recruiter AI screening software?',
        a: 'Cover letters are parsed for secondary keywords, but recruiters rarely read them unless you pass the initial resume score and are a borderline candidate needing extra qualification context.'
      }
    ],
    related: ['how-to-beat-ats-2026', 'candidate-skill-match-score', 'how-to-tailor-resume-for-each-job']
  },
  {
    slug: 'tech-cover-letter-format',
    tint: 'indigo',
    title: 'How to Write a Modern Tech Cover Letter That Actually Gets Read',
    heading: 'How to write a modern tech cover letter that actually gets read',
    description: 'Stop sending generic cover letters. Learn the 3-paragraph modern tech cover letter formula that proves competence and lands interviews.',
    keywords: [
      'tech cover letter format',
      'do recruiters read cover letters in tech',
      'short cover letter template software engineer',
      'how to write a cover letter with ai',
      'cover letter example for developers',
      'software developer cover letter guide'
    ],
    publishedAt: '2026-11-12',
    updatedAt: '2026-11-12',
    author: 'JobsDart Editorial',
    readingMinutes: 7,
    category: 'Job Application Strategy',
    anchors: ['modern tech cover letter', 'cover letter format for developers'],
    excerpt: 'Long, flowery cover letters are dead in the tech industry. Here is the concise 3-paragraph, proof-of-work cover letter template that engineering managers actually respect.',
    keyTakeaways: [
      'Keep your tech cover letter under 250 words; long essays are skipped by busy engineering leads.',
      'Paragraph 1: State the exact role, cite their recent public product release, and establish your core technical stack.',
      'Paragraph 2: Provide one deep, quantified architectural accomplishment that mirrors their immediate business challenge.',
      'Paragraph 3: State your immediate readiness, portfolio link, and request a brief conversation.',
      'Never recite your resume line by line; use the cover letter to tell the specific story behind your best technical project.'
    ],
    sections: [
      {
        heading: 'Why traditional cover letter advice is disastrous in tech',
        paragraphs: [
          'Traditional career advice tells candidates to write four formal paragraphs expressing deep passion for the company’s vision and re-listing all their college coursework.',
          'In software engineering, hiring managers do not care about generic flattery. They care about two things: Can you write production-grade code that solves our business problem, and will you be a reliable teammate?',
          'A modern tech cover letter is not a formal letter of intent; it is a concise technical memo demonstrating competence and immediate relevance.'
        ]
      },
      {
        heading: 'The high-converting 3-paragraph developer cover letter formula',
        paragraphs: [
          'Structure your letter into three crisp, purposeful blocks that can be read in under 45 seconds.'
        ],
        example: {
          title: 'Full Stack Engineer Modern Cover Letter Template',
          paragraphs: [
            'Dear [Hiring Manager Name or Engineering Team],\n\nI was excited to see your opening for a Senior Backend Engineer on the Payments Core team, especially following your recent announcement regarding international multi-currency settlement expansion. As a backend engineer specializing in Golang, PostgreSQL, and distributed transaction pipelines, I have spent the last four years building high-resilience financial microservices.',
            'At [Previous Company], I led the architectural overhaul of our automated settlement engine. By transitioning from monolithic batch processing to event-driven Kafka streams and optimizing PostgreSQL row-level locks, my team reduced end-of-day reconciliation time from 3 hours to 18 minutes while supporting $45M in monthly transaction volume with 99.99% uptime.',
            'I would love to bring this same performance discipline to your upcoming global merchant rollout. You can inspect my open-source distributed systems work at github.com/[username]. I look forward to connecting for a technical conversation.\n\nBest regards,\n[Your Name]'
          ]
        }
      },
      {
        heading: 'When is a cover letter mandatory versus optional?',
        paragraphs: [
          'If an application portal marks the cover letter as optional, submitting this 3-paragraph memo can tip the scales in your favor under specific circumstances:'
        ],
        bullets: [
          'You are transitioning between engineering disciplines (e.g., from Frontend to DevOps).',
          'You are addressing an international relocation or work authorization status.',
          'You are applying to early-stage startups (Series A/B) where founders read every submission personally.'
        ]
      }
    ],
    faqs: [
      {
        q: 'Should I put my cover letter in the same PDF as my resume?',
        a: 'No. Always submit them as separate documents if the ATS allows separate file uploads. If only one upload is permitted, upload only your resume.'
      },
      {
        q: 'How do I find the name of the hiring manager?',
        a: 'Search LinkedIn for the company name combined with titles like "Engineering Manager", "Director of Engineering", or "Head of Talent" for that specific department.'
      }
    ],
    related: ['how-to-beat-ats-2026', 'how-to-tailor-resume-for-each-job', 'cold-email-recruiters-linkedin-templates']
  }
];

posts.forEach(p => {
  const filePath = path.join(targetDir, `${p.slug}.ts`);
  const content = `import type { BlogPost } from '@/lib/blog/types';\n\nexport const post: BlogPost = ${JSON.stringify(p, null, 2)};\n\nexport default post;\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Generated: ${p.slug}.ts`);
});
console.log('Cluster 1 generated successfully.');
