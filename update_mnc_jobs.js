const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const ENRICHED_JOBS = [
  {
    id: 137,
    job_link: "https://careers.google.com/jobs/results/137-senior-staff-software-engineer-ai-infrastructure",
    location: "Mountain View, California, United States",
    company_website: "https://cloud.google.com",
    company_linkedin_url: "https://www.linkedin.com/company/google-cloud",
    company_overview: "Google Cloud provides organizations with leading infrastructure, platform capabilities and industry solutions.",
    address: "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA",
    contact_email: "cloud-recruiting@google.com",
    sections: [
      { title: "Key Responsibilities", items: ["Lead architecture for large-scale distributed AI training clusters", "Optimize GPU/TPU cluster performance for Gemini foundation models", "Collaborate with Google Research & DeepMind teams"] },
      { title: "Minimum Qualifications", items: ["Bachelor's or Master's degree in CS or equivalent practical experience", "6+ years of experience in distributed systems or machine learning infrastructure"] }
    ]
  },
  {
    id: 138,
    job_link: "https://careers.microsoft.com/us/en/job/138-principal-cloud-solutions-architect",
    location: "Bengaluru, Karnataka, India",
    company_website: "https://www.microsoft.com",
    company_linkedin_url: "https://www.linkedin.com/company/microsoft",
    company_overview: "Microsoft enables digital transformation for the era of an intelligent cloud and an intelligent edge.",
    address: "Prestige Ferns Galaxy, Outer Ring Rd, Bengaluru, Karnataka 560103",
    contact_email: "india-careers@microsoft.com",
    sections: [
      { title: "Key Responsibilities", items: ["Drive enterprise cloud architecture for Fortune 500 Asia-Pacific accounts", "Partner with C-level executives on multi-region Azure deployments", "Ensure strict data privacy, governance, and zero-trust security compliance"] },
      { title: "Minimum Qualifications", items: ["8+ years of technical enterprise cloud solution design", "Proven track record with Azure, AWS, or GCP migration at scale"] }
    ]
  },
  {
    id: 139,
    job_link: "https://stripe.com/jobs/listing/139-lead-frontend-engineer-react-nextjs",
    location: "London, Greater London, United Kingdom",
    company_website: "https://stripe.com",
    company_linkedin_url: "https://www.linkedin.com/company/stripe",
    company_overview: "Stripe is a financial infrastructure platform for businesses. Millions of companies use Stripe to accept payments and grow.",
    address: "2 City Walk, London EC1V 9DX, United Kingdom",
    contact_email: "jobs-london@stripe.com",
    sections: [
      { title: "Key Responsibilities", items: ["Build high-conversion checkout UI components used by millions of shoppers", "Architect frontend performance benchmarking and web vitals tracking", "Design micro-frontend systems with TypeScript and Next.js"] },
      { title: "Minimum Qualifications", items: ["5+ years of deep expertise in React, Next.js, and modern CSS", "Passion for slick animations, accessibility, and high performance"] }
    ]
  },
  {
    id: 140,
    job_link: "https://www.metacareers.com/v2/jobs/140-senior-data-scientist-llm-researcher",
    location: "New York, NY, United States",
    company_website: "https://about.meta.com",
    company_linkedin_url: "https://www.linkedin.com/company/meta",
    company_overview: "Meta builds technologies that help people connect, find communities, and grow businesses.",
    address: "50 Hudson Yards, New York, NY 10001, USA",
    contact_email: "ai-careers@meta.com",
    sections: [
      { title: "Key Responsibilities", items: ["Train and evaluate Llama open foundation models on massive datasets", "Develop novel fine-tuning algorithms (RLHF, DPO) for reasoning models", "Publish findings at top AI conferences (NeurIPS, ICML, ACL)"] },
      { title: "Minimum Qualifications", items: ["PhD or Master's degree in Machine Learning, CS, or Statistics", "Strong publication record or hands-on LLM pre-training experience"] }
    ]
  },
  {
    id: 141,
    job_link: "https://amazon.jobs/en/jobs/141-full-stack-engineer-global-payments",
    location: "Hyderabad, Telangana, India",
    company_website: "https://aws.amazon.com",
    company_linkedin_url: "https://www.linkedin.com/company/amazon-web-services",
    company_overview: "AWS is the world's most comprehensive and broadly adopted cloud platform, offering over 200 fully featured services.",
    address: "AWS Tower, Financial District, Nanakramguda, Hyderabad, Telangana 500032",
    contact_email: "aws-india-recruiting@amazon.com",
    sections: [
      { title: "Key Responsibilities", items: ["Develop resilient payment gateway integration microservices on AWS Lambda", "Build intuitive real-time billing analytics dashboards in React", "Maintain 99.999% uptime for global AWS invoice processing"] },
      { title: "Minimum Qualifications", items: ["3+ years of professional full stack software development experience", "Proficiency in Java, React, Node.js, and AWS cloud ecosystem"] }
    ]
  }
];

async function updateMncJobs() {
  console.log("Updating MNC jobs with Job Link, Location, Overview & Responsibilities...");

  for (const job of ENRICHED_JOBS) {
    const { data, error } = await supabase.from('jobs').update({
      job_link: job.job_link,
      company_website: job.company_website,
      company_linkedin_url: job.company_linkedin_url,
      company_overview: job.company_overview,
      address: job.address,
      sections: job.sections
    }).eq('id', job.id).select();

    if (error) {
      console.error(`Error updating job ID ${job.id}:`, error.message);
    } else {
      console.log(`✓ Successfully updated job ID ${job.id} with URL: ${job.job_link}`);
    }
  }

  console.log("MNC Job update finished!");
}

updateMncJobs();
