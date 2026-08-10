const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const MNC_JOBS = [
  {
    title: "Principal Cloud Solutions Architect — Enterprise Azure",
    company_name: "Microsoft",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo_%282012%29.svg",
    company_website: "https://www.microsoft.com",
    company_linkedin_url: "https://www.linkedin.com/company/microsoft",
    company_overview: "Microsoft Corporation is a global technology MNC enabling digital transformation for the intelligent cloud and intelligent edge era.",
    company_rating: 4.8,
    job_link: "https://careers.microsoft.com/us/en/job/1684920/Principal-Cloud-Solutions-Architect",
    salary_min: 175000,
    salary_max: 240000,
    salary_currency: "USD",
    experience_min: 7,
    experience_max: 15,
    country: "United States",
    state: "Washington",
    city: "Redmond",
    address: "One Microsoft Way, Redmond, WA 98052",
    remote_type: "Hybrid",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 3,
    description: "Microsoft is hiring a Principal Cloud Solutions Architect to design resilient, multi-region Azure cloud architectures for Fortune 500 enterprise clients.",
    sections: [
      {
        title: "Role Impact & Key Responsibilities",
        content: "• Architect scalable, high-availability cloud infrastructure on Microsoft Azure for enterprise customers.\n• Lead technical design reviews for cloud migration, microservices decomposition, and disaster recovery strategies."
      },
      {
        title: "Technical Requirements & Stack",
        content: "• 7+ years of architectural experience with Azure, AWS, or GCP cloud platforms.\n• Mastery of Kubernetes (AKS), Docker, Terraform, Bicep, and Infrastructure-as-Code."
      }
    ],
    required_skills: ["Azure", "Kubernetes", "Terraform", "C#", "Cloud Architecture"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Senior Staff AI & LLM Systems Engineer",
    company_name: "Google",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    company_website: "https://about.google",
    company_linkedin_url: "https://www.linkedin.com/company/google",
    company_overview: "Google LLC is an American multinational technology company focusing on search engine technology, cloud computing, AI, and consumer electronics.",
    company_rating: 4.9,
    job_link: "https://careers.google.com/jobs/results/148290381023019/Senior-Staff-AI-Engineer",
    salary_min: 190000,
    salary_max: 260000,
    salary_currency: "USD",
    experience_min: 6,
    experience_max: 12,
    country: "United States",
    state: "California",
    city: "Mountain View",
    address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043",
    remote_type: "Hybrid",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 2,
    description: "Google Core AI & DeepMind engineering teams are looking for a Senior Staff AI & LLM Systems Engineer to build distributed training pipelines and TPU cluster orchestrators powering Gemini models.",
    sections: [
      {
        title: "Responsibilities",
        content: "• Design distributed training infrastructure scaling to tens of thousands of TPU v5e / Nvidia H100 accelerators.\n• Optimize LLM inference latency, memory bandwidth, and quantization algorithms (vLLM, TensorRT-LLM)."
      }
    ],
    required_skills: ["PyTorch", "JAX", "C++", "Python", "LLM", "Distributed Systems"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Lead Full Stack Engineer — Global Payments Platform",
    company_name: "Amazon Web Services (AWS)",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    company_website: "https://aws.amazon.com",
    company_linkedin_url: "https://www.linkedin.com/company/amazon-web-services",
    company_overview: "Amazon Web Services (AWS) provides on-demand cloud computing platforms and APIs to individuals, companies, and governments globally.",
    company_rating: 4.7,
    job_link: "https://amazon.jobs/en/jobs/2591029/Lead-Full-Stack-Engineer",
    salary_min: 135000,
    salary_max: 185000,
    salary_currency: "USD",
    experience_min: 5,
    experience_max: 10,
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    address: "AWS Commerce Hub, Bagmane World Technology Center, Bengaluru",
    remote_type: "Hybrid",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 4,
    description: "AWS Payments & Billing team in Bengaluru is seeking a Lead Full Stack Engineer to drive low-latency checkout systems and multi-currency processing handling 50,000+ RPS with 99.999% reliability.",
    sections: [
      {
        title: "Key Responsibilities",
        content: "• Lead full-stack implementation using React, Next.js, Java, and AWS native services.\n• Architect idempotent transaction processing handling 50,000+ requests per second."
      }
    ],
    required_skills: ["React", "TypeScript", "Java", "AWS", "DynamoDB", "Node.js"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Staff Machine Learning Infrastructure Engineer",
    company_name: "Meta",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    company_website: "https://www.meta.com",
    company_linkedin_url: "https://www.linkedin.com/company/meta",
    company_overview: "Meta builds technologies that help people connect, find communities, and grow businesses (Instagram, WhatsApp, Threads).",
    company_rating: 4.8,
    job_link: "https://www.metacareers.com/jobs/9281039581023/Staff-ML-Infrastructure-Engineer",
    salary_min: 180000,
    salary_max: 250000,
    salary_currency: "USD",
    experience_min: 6,
    experience_max: 14,
    country: "United States",
    state: "California",
    city: "Menlo Park",
    address: "1 Hacker Way, Menlo Park, CA 94025",
    remote_type: "Remote",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 2,
    description: "Meta AI Infrastructure team is building next-generation recommendation engines and open Llama models. We are looking for a Staff ML Infrastructure Engineer to optimize distributed GPU cluster utilization.",
    sections: [
      {
        title: "What You Will Do",
        content: "• Optimize PyTorch core compiler passes (TorchDynamo, Inductor) for training Llama 3+ family models.\n• Design automated fault-tolerance mechanisms for 32k+ H100 GPU clusters."
      }
    ],
    required_skills: ["PyTorch", "C++", "Python", "MLOps", "Distributed Systems", "GPU Clusters"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Senior Backend Payments & Treasury Engineer",
    company_name: "Stripe",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    company_website: "https://stripe.com",
    company_linkedin_url: "https://www.linkedin.com/company/stripe",
    company_overview: "Stripe is a financial infrastructure platform for businesses. Millions of companies use Stripe to accept payments and manage financial operations.",
    company_rating: 4.9,
    job_link: "https://stripe.com/jobs/listing/senior-backend-payments-engineer/581092",
    salary_min: 160000,
    salary_max: 220000,
    salary_currency: "USD",
    experience_min: 4,
    experience_max: 9,
    country: "United States",
    state: "California",
    city: "San Francisco",
    address: "354 Oyster Point Blvd, South San Francisco, CA 94080",
    remote_type: "Remote",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 3,
    description: "Stripe is building economic infrastructure for the internet. As a Senior Backend Payments Engineer, you will design ledger systems handling hundreds of billions of dollars in volume across 45+ countries.",
    sections: [
      {
        title: "Responsibilities",
        content: "• Write clean, highly testable Ruby, Go, or Java code running on Stripe distributed infrastructure.\n• Build zero-downtime financial ledger systems with multi-currency reconciliation."
      }
    ],
    required_skills: ["Ruby", "Go", "Java", "PostgreSQL", "Distributed Systems", "API Design"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Lead iOS & Systems Performance Engineer",
    company_name: "Apple",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    company_website: "https://www.apple.com",
    company_linkedin_url: "https://www.linkedin.com/company/apple",
    company_overview: "Apple Inc. is an American multinational technology company headquartered in Cupertino, California, that designs consumer electronics, software, and services.",
    company_rating: 4.8,
    job_link: "https://jobs.apple.com/en-us/details/200492810/Lead-iOS-Systems-Performance-Engineer",
    salary_min: 170000,
    salary_max: 235000,
    salary_currency: "USD",
    experience_min: 5,
    experience_max: 11,
    country: "United States",
    state: "California",
    city: "Cupertino",
    address: "One Apple Park Way, Cupertino, CA 95014",
    remote_type: "On-site",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 2,
    description: "Join Apple's Interactive Media & iOS Systems Engineering group. You will lead low-level Swift & C++ performance optimization for iOS, macOS, and visionOS operating system frameworks.",
    sections: [
      {
        title: "Core Duties",
        content: "• Optimize rendering pipelines, Metal graphics performance, and memory management for Apple Silicon.\n• Debug system-level bottlenecks using Instruments, LLDB, and custom kernel tracing tools."
      }
    ],
    required_skills: ["Swift", "C++", "Metal", "iOS", "visionOS", "Apple Silicon"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Principal DevOps & Kubernetes Platform Specialist",
    company_name: "Salesforce",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/f/f9/Salesforce.com_logo.svg",
    company_website: "https://www.salesforce.com",
    company_linkedin_url: "https://www.linkedin.com/company/salesforce",
    company_overview: "Salesforce is the global leader in Customer Relationship Management (CRM), empowering companies to connect with their customers in a whole new way.",
    company_rating: 4.6,
    job_link: "https://salesforce.wd1.myworkdayjobs.com/External_Career_Site/job/Hyderabad/Principal-DevOps-Engineer_JR198203",
    salary_min: 130000,
    salary_max: 175000,
    salary_currency: "USD",
    experience_min: 6,
    experience_max: 12,
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    address: "Salesforce Tower, DivyaSree Orion, Gachibowli, Hyderabad",
    remote_type: "Remote",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 3,
    description: "Salesforce Hyperforce team in Hyderabad is hiring a Principal DevOps Specialist to automate Kubernetes cluster orchestration, GitOps deployment pipelines, and zero-trust mesh networking across AWS and GCP infrastructure.",
    sections: [
      {
        title: "Key Responsibilities",
        content: "• Manage multi-tenant Kubernetes clusters running 100,000+ microservices on Hyperforce.\n• Build automated CI/CD pipelines using Spinnaker, ArgoCD, Terraform, and Helm."
      }
    ],
    required_skills: ["Kubernetes", "DevOps", "ArgoCD", "Terraform", "AWS", "GCP"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Senior Data Engineer — Global Streaming Analytics",
    company_name: "Netflix",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    company_website: "https://www.netflix.com",
    company_linkedin_url: "https://www.linkedin.com/company/netflix",
    company_overview: "Netflix is one of the world's leading entertainment services with over 260 million paid memberships in over 190 countries.",
    company_rating: 4.8,
    job_link: "https://jobs.netflix.com/jobs/281093849/Senior-Data-Engineer",
    salary_min: 200000,
    salary_max: 280000,
    salary_currency: "USD",
    experience_min: 5,
    experience_max: 10,
    country: "United States",
    state: "California",
    city: "Los Gatos",
    address: "121 Albright Way, Los Gatos, CA 95032",
    remote_type: "Hybrid",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 2,
    description: "Netflix Data Platform team is seeking a Senior Data Engineer to design real-time streaming data pipelines processing trillions of events per day using Apache Flink, Apache Spark, Iceberg, and AWS.",
    sections: [
      {
        title: "Role Scope",
        content: "• Architect real-time streaming telemetry pipelines supporting content recommendation and streaming quality metrics.\n• Optimize Apache Iceberg data lake storage format for query performance."
      }
    ],
    required_skills: ["Apache Spark", "Apache Flink", "Python", "Scala", "AWS", "Trino"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Autopilot Embedded Software & Control Engineer",
    company_name: "Tesla",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png",
    company_website: "https://www.tesla.com",
    company_linkedin_url: "https://www.linkedin.com/company/tesla-motors",
    company_overview: "Tesla accelerates the world's transition to sustainable energy through electric vehicles, solar panels, and integrated renewable energy solutions.",
    company_rating: 4.6,
    job_link: "https://www.tesla.com/careers/search/job/autopilot-embedded-software-engineer-219403",
    salary_min: 155000,
    salary_max: 215000,
    salary_currency: "USD",
    experience_min: 4,
    experience_max: 10,
    country: "United States",
    state: "Texas",
    city: "Austin",
    address: "1 Tesla Road, Austin, TX 78725",
    remote_type: "On-site",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 3,
    description: "Tesla Autopilot & Full Self-Driving (FSD) team is seeking an Embedded Software Engineer to write hard real-time C++ control software for onboard AI computers, sensor fusion modules, and drive-by-wire actuators.",
    sections: [
      {
        title: "Responsibilities",
        content: "• Write ultra-low latency C++ embedded firmware running on Tesla FSD Computer.\n• Implement safety-critical automotive control loops certified for ISO 26262 functional safety."
      }
    ],
    required_skills: ["C++", "Embedded C", "Real-Time OS", "CAN Bus", "Autonomous Driving"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  },

  {
    title: "Senior UX Architect & Design Systems Lead",
    company_name: "Adobe",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Adobe_Systems_logo_2020.svg",
    company_website: "https://www.adobe.com",
    company_linkedin_url: "https://www.linkedin.com/company/adobe",
    company_overview: "Adobe is the global leader in digital media and digital marketing solutions, behind Photoshop, Illustrator, Acrobat, and Firefly generative AI.",
    company_rating: 4.8,
    job_link: "https://adobe.wd5.myworkdayjobs.com/external_experienced/job/San-Jose/Senior-UX-Architect_R139201",
    salary_min: 145000,
    salary_max: 195000,
    salary_currency: "USD",
    experience_min: 5,
    experience_max: 12,
    country: "United States",
    state: "California",
    city: "San Jose",
    address: "345 Park Ave, San Jose, CA 95110",
    remote_type: "Remote",
    employment_type: "Full-Time",
    visa_sponsorship: true,
    status: "active",
    vacancies: 2,
    description: "Adobe Creative Cloud & Spectrum Design System team is hiring a Senior UX Architect to shape the next generation of AI-assisted design tools across web, desktop, and mobile platforms.",
    sections: [
      {
        title: "What You Will Craft",
        content: "• Design accessible, modular Spectrum design system components for millions of creative professionals.\n• Define UX guidelines for Firefly generative AI creation workflows."
      }
    ],
    required_skills: ["Figma", "UX Architecture", "Design Systems", "User Research"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    app_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];

async function seedMncJobsToSupabase() {
  console.log("Seeding MNC jobs into Supabase 'jobs' table...");

  let insertedCount = 0;
  for (const job of MNC_JOBS) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([job])
      .select('id, title, company_name');

    if (error) {
      console.error(`Error inserting "${job.title}" (${job.company_name}):`, error.message);
    } else {
      insertedCount++;
      console.log(`✓ Inserted job #${data[0].id}: "${data[0].title}" at ${data[0].company_name}`);
    }
  }

  console.log(`\n🎉 SUCCESS! Inserted ${insertedCount}/${MNC_JOBS.length} MNC jobs into Supabase DB!`);
}

seedMncJobsToSupabase();
