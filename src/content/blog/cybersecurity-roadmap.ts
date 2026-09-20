import type { BlogPost } from '@/lib/blog/types';

export const post: BlogPost = {
  slug: 'cybersecurity-roadmap',
  tint: 'rose',
  title: 'Cybersecurity Roadmap 2026: A Realistic Path In',
  heading: 'Cybersecurity roadmap',
  description:
    'How to enter cybersecurity in 2026: the fundamentals that matter, which specialisation to choose, what certifications are worth it, and why entry level is hard.',
  keywords: [
    'cybersecurity roadmap',
    'cybersecurity roadmap 2026',
    'how to get into cybersecurity',
    'cybersecurity career path',
    'entry level cybersecurity jobs',
    'soc analyst path',
    'cybersecurity certifications',
    'cybersecurity skills',
  ],
  publishedAt: '2026-09-19',
  updatedAt: '2026-09-19',
  author: 'JobsDart Editorial',
  readingMinutes: 10,
  category: 'Career Roadmaps',
  anchors: ['cybersecurity career', 'security fundamentals'],
  excerpt:
    'Security has a shortage of senior people and a surplus of applicants for junior roles. Understanding that shape is the difference between a plan and frustration.',
  keyTakeaways: [
    'The shortage is at senior level; entry-level roles are heavily contested.',
    'Entering via an adjacent technical role and moving internally beats the external queue substantially.',
    'Fundamentals first — people who skip to attack techniques can run a tool and not explain the result.',
    'Certifications matter more here than in most fields, but hands-on ones carry far more weight.',
    'Write-ups are the currency of the field: a few clear honest ones outperform course certificates.',
  ],
  sections: [
    {
      heading: 'The uncomfortable truth about entry level',
      paragraphs: [
        'You will read constantly that there is a cybersecurity skills shortage. There is — at senior level. Entry-level security roles are heavily contested, because the field attracts far more newcomers than it creates junior positions.',
        'This matters because it determines strategy. Applying to a hundred entry-level security roles with no differentiator competes against hundreds of similar applications. Entering via an adjacent technical role and moving across internally is slower on paper and considerably faster in practice.',
        'The reason is structural rather than unfair. Security work requires judgement about systems, and most organisations would rather grow that from someone who already administers their systems than hire it unproven from outside.',
      ],
    },
    {
      heading: 'Fundamentals before security',
      paragraphs: [
        'You cannot secure what you do not understand. The most common weakness in security newcomers is jumping to attack techniques without a working model of the systems being attacked. It produces people who can run a tool and cannot explain a result.',
        'Build the technical base first. Networking, operating systems, and enough scripting to automate and to read someone else’s code. This is unglamorous and it is the difference between a candidate who progresses and one who stalls at the first technical interview.',
        'A blunt self-test: can you explain, without notes, what happens between typing a URL and seeing a page — DNS, TCP, TLS, request, response, rendering? Nearly every web security concept attaches to a step in that sequence, and gaps in it show up immediately under questioning.',
      ],
      bullets: [
        'Networking — protocols, routing, DNS, TLS, and reading a packet capture',
        'Linux and Windows administration, including permissions and logging',
        'Scripting in Python or PowerShell, at automation level',
        'How web applications work — requests, sessions, authentication',
        'Basic cloud architecture, since most environments are now cloud or hybrid',
      ],
    },
    {
      heading: 'Choose a direction early enough to go deep',
      paragraphs: [
        'Security is several distinct careers. Generalist knowledge helps you begin, but specialisation is what gets you hired and paid. Choose based on what you enjoy doing repeatedly, because each involves very different days.',
        'Defensive roles are the most common entry point and give the broadest view of how organisations actually operate. Offensive roles are more sought after and correspondingly harder to enter directly. Application security has the strongest demand relative to supply, particularly for people who can code.',
        'Be honest about the daily texture rather than the job title. Security operations involves a queue and shift patterns; penetration testing involves report writing far more than most newcomers expect; governance involves meetings and documents. All three are good jobs for different people.',
      ],
      bullets: [
        'Security operations — detection, triage, incident response',
        'Penetration testing and red teaming',
        'Application security — securing software as it is built',
        'Cloud security — identity, configuration and workload protection',
        'Governance, risk and compliance — policy, audit and assurance',
        'Digital forensics and incident response',
      ],
      table: {
        caption: 'Specialisations by entry difficulty and best route in',
        columns: ['Specialisation', 'Entry difficulty', 'Best route in'],
        rows: [
          ['Security operations', 'Moderate', 'Help desk or sysadmin'],
          ['Application security', 'Moderate', 'Software development'],
          ['Cloud security', 'Moderate', 'Cloud or platform engineering'],
          ['Governance and compliance', 'Lower', 'Audit, risk, legal'],
          ['Penetration testing', 'High', 'SOC or development, plus write-ups'],
          ['Forensics and IR', 'High', 'SOC experience first'],
        ],
      },
    },
    {
      heading: 'Certifications that carry weight',
      paragraphs: [
        'Certifications matter more in security than in most technical fields, partly because regulated employers require them and partly because the field lacks other standard signals. But their value is uneven and the marketing around them is relentless.',
        'One foundational certification establishes baseline credibility. A practical, hands-on certification in your chosen specialisation is worth considerably more than several multiple-choice ones, because it demonstrates capability rather than recall.',
        'Check the job postings you actually want before committing money and months. Requirements differ sharply by sector and country, and it is entirely possible to earn a well-regarded credential that no employer in your target market asks for.',
      ],
    },
    {
      heading: 'Home lab and public evidence',
      paragraphs: [
        'Build an environment you can break. Vulnerable machines, a small network, logging that you configured yourself. The specific value is that you will have seen what an attack looks like in logs, which is exactly what a defensive interview probes.',
        'Practise on legal platforms, document what you did, and write it up clearly. Write-ups are the standard currency of the field. A handful of clear, honest ones demonstrating methodical thinking will do more for you than any course completion certificate.',
        'Include the attempts that failed and why. Methodical elimination is what the work consists of, and a write-up that only shows the successful path suggests either luck or a walkthrough followed.',
      ],
      bullets: [
        'A lab where you both attack and defend, so you see both views',
        'Capture-the-flag and deliberately vulnerable practice platforms',
        'Written reports in professional format, not just screenshots',
        'Only ever systems you own or are explicitly permitted to test',
      ],
    },
    {
      heading: 'What interviews actually probe',
      paragraphs: [
        'Technical interviews in security are less about tool knowledge than newcomers expect and more about reasoning. Expect to be handed a scenario — an alert, a log extract, a described architecture — and asked what you would check and in what order.',
        'What interviewers are listening for is structure: forming a hypothesis, naming the evidence that would confirm or eliminate it, and knowing when to escalate. Candidates who list tools without a method interview poorly regardless of how many they know.',
        'You will also be asked something you do not know. Saying so and describing how you would find out is the correct answer, and a confident wrong one is a far worse signal here than in most disciplines.',
      ],
    },
    {
      heading: 'The realistic entry routes',
      paragraphs: [
        'Very few people walk straight into security from outside technology. The routes that consistently work are lateral: help desk or system administration into security operations, software development into application security, networking into network or cloud security.',
        'If you are already in a technical role, the internal move is the highest-probability path available to you. Volunteer for security-adjacent work, build a relationship with the security team, and become the obvious candidate when a role opens. That beats the external application queue by a wide margin.',
        'The internal route has a second advantage nobody mentions: you arrive already knowing the systems, the people and the politics. New external hires spend their first six months acquiring exactly that, which is why internal candidates are so often preferred.',
      ],
    },
  ],
  faqs: [
    {
      q: 'Can I get into cybersecurity with no IT experience?',
      a: 'It is possible but genuinely difficult, because entry-level security roles are heavily contested. Most successful entrants come through an adjacent technical role — support, administration, networking or development — and move across.',
    },
    {
      q: 'Which cybersecurity certification should I start with?',
      a: 'One foundational certification to establish baseline credibility, then a practical hands-on certification in your chosen specialisation. Hands-on credentials demonstrate capability in a way multiple-choice exams do not.',
    },
    {
      q: 'Is a degree required for cybersecurity?',
      a: 'Not usually, though it helps in government, defence and some regulated sectors. Demonstrated capability through a lab, write-ups and practical certifications carries substantial weight in most of the private sector.',
    },
    {
      q: 'Which cybersecurity specialisation has the best prospects?',
      a: 'Application security and cloud security currently have the strongest demand relative to supply, particularly for candidates who can code. Security operations remains the most accessible entry point and gives the broadest foundation.',
    },
    {
      q: 'What do security interviews actually test?',
      a: 'Reasoning rather than tool knowledge. You are given a scenario and assessed on forming a hypothesis, naming the evidence that would confirm it, and knowing when to escalate.',
    },
    {
      q: 'Why is the internal move so much easier?',
      a: 'Because you already know the systems, the people and the politics. External hires spend their first six months acquiring exactly that, which is why internal candidates are preferred so consistently.',
    },
  ],
  related: ['cybersecurity-interview-questions', 'ai-security-jobs', 'how-to-become-an-ai-security-engineer'],
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
