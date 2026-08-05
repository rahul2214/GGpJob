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
    title: "Senior Staff Software Engineer — AI & Infrastructure",
    company_name: "Google Cloud",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg",
    country: "United States",
    state: "California",
    city: "Mountain View",
    latitude: 37.422,
    longitude: -122.084,
    remote_type: "hybrid",
    employment_type: "Full-time",
    salary_min: 180000,
    salary_max: 260000,
    salary_currency: "USD",
    experience_min: 6,
    experience_max: 12,
    required_skills: ["Python", "TensorFlow", "Kubernetes", "C++", "Distributed Systems"],
    industry: "Information Technology & AI",
    job_function: "Engineering",
    visa_sponsorship: true,
    work_authorization_requirement: ["United States"],
    languages: ["English"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    company_verification: true,
    company_rating: 4.9,
    description: "Join Google Cloud AI team building next-generation distributed machine learning platforms powering Gemini and enterprise AI models.",
    vacancies: 5,
    status: "active"
  },
  {
    title: "Principal Cloud Solutions Architect",
    company_name: "Microsoft",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg",
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    remote_type: "hybrid",
    employment_type: "Full-time",
    salary_min: 4500000,
    salary_max: 7500000,
    salary_currency: "INR",
    experience_min: 8,
    experience_max: 15,
    required_skills: ["Azure", "System Architecture", "Microservices", "Security", "C#"],
    industry: "Cloud Computing & Enterprise Software",
    job_function: "Architecture",
    visa_sponsorship: false,
    work_authorization_requirement: ["India"],
    languages: ["English", "Hindi"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    company_verification: true,
    company_rating: 4.8,
    description: "Lead enterprise cloud transformation architectures for Azure global customers with high availability and multi-region resilience.",
    vacancies: 3,
    status: "active"
  },
  {
    title: "Lead Frontend Engineer — React & Next.js",
    company_name: "Stripe",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg",
    country: "United Kingdom",
    state: "Greater London",
    city: "London",
    latitude: 51.5074,
    longitude: -0.1278,
    remote_type: "remote",
    employment_type: "Full-time",
    salary_min: 130000,
    salary_max: 175000,
    salary_currency: "GBP",
    experience_min: 5,
    experience_max: 10,
    required_skills: ["React", "TypeScript", "Next.js", "GraphQL", "Web Performance"],
    industry: "Fintech & Global Payments",
    job_function: "Frontend Development",
    visa_sponsorship: true,
    work_authorization_requirement: ["United Kingdom", "European Union"],
    languages: ["English"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    company_verification: true,
    company_rating: 4.9,
    description: "Design and implement world-class checkout and developer portal experiences used by millions of businesses around the globe.",
    vacancies: 4,
    status: "active"
  },
  {
    title: "Senior Data Scientist & LLM Researcher",
    company_name: "Meta",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Meta_Platforms_Inc._logo.svg",
    country: "United States",
    state: "New York",
    city: "New York",
    latitude: 40.7128,
    longitude: -74.006,
    remote_type: "onsite",
    employment_type: "Full-time",
    salary_min: 200000,
    salary_max: 290000,
    salary_currency: "USD",
    experience_min: 4,
    experience_max: 8,
    required_skills: ["PyTorch", "NLP", "Large Language Models", "Python", "Deep Learning"],
    industry: "Artificial Intelligence & Social Tech",
    job_function: "Data Science",
    visa_sponsorship: true,
    work_authorization_requirement: ["United States"],
    languages: ["English"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    company_verification: true,
    company_rating: 4.7,
    description: "Conduct cutting-edge research in generative AI and large language models for Meta AI initiatives.",
    vacancies: 2,
    status: "active"
  },
  {
    title: "Full Stack Engineer — Global Payments",
    company_name: "Amazon Web Services (AWS)",
    company_logo: "https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg",
    country: "India",
    state: "Telangana",
    city: "Hyderabad",
    latitude: 17.385,
    longitude: 78.4867,
    remote_type: "hybrid",
    employment_type: "Full-time",
    salary_min: 3500000,
    salary_max: 5500000,
    salary_currency: "INR",
    experience_min: 3,
    experience_max: 7,
    required_skills: ["Java", "React", "AWS Lambda", "DynamoDB", "Node.js"],
    industry: "Cloud Infrastructure",
    job_function: "Full Stack Development",
    visa_sponsorship: false,
    work_authorization_requirement: ["India"],
    languages: ["English", "Telugu"],
    posted_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    company_verification: true,
    company_rating: 4.8,
    description: "Build robust distributed backend billing microservices and interactive customer billing dashboards on AWS.",
    vacancies: 6,
    status: "active"
  }
];

async function seedMncJobs() {
  console.log("Seeding MNC job postings into Supabase jobs table...");

  for (const job of MNC_JOBS) {
    const { data, error } = await supabase.from('jobs').insert([job]).select();
    if (error) {
      console.error(`Error inserting job "${job.title}":`, error.message);
    } else {
      console.log(`✓ Successfully posted job: "${job.title}" at ${job.company_name} (ID: ${data[0].id})`);
    }
  }

  console.log("MNC Job seeding finished!");
}

seedMncJobs();
