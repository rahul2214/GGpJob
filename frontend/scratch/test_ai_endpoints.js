const fetch = require('node-fetch');

async function testGenerate() {
  console.log('--- TESTING AI RESUME GENERATION ---');
  const payload = {
    contactInfo: {
      name: "Rahul Naik",
      email: "rahul@example.com",
      phone: "9876543210",
      linkedinUrl: "https://linkedin.com/in/rahulnaik",
      githubUrl: "https://github.com/rahulnaik"
    },
    templateType: "Software Engineer",
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    experience: [
      {
        company: "Tech Corp",
        role: "Frontend Engineer",
        startDate: "Jan 2023",
        endDate: "Present",
        description: "Built the main user dashboard using React and Tailwind CSS. Reduced page load times by optimized rendering."
      }
    ],
    projects: [
      {
        name: "JobsDart Referral Platform",
        techStack: "Next.js, Supabase, Tailwind CSS",
        description: "Implemented referral verification systems and real-time candidate notifications."
      }
    ],
    education: [
      {
        institution: "B.Tech in Computer Science",
        degree: "State University",
        year: "2022"
      }
    ]
  };

  try {
    const res = await fetch('http://localhost:9002/api/resume/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    console.log('Status:', res.status);
    const data = await res.json();
    if (res.ok) {
      console.log('Success! Generated Resume Output:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('Error Response:', data);
    }
  } catch (error) {
    console.error('Fetch Error:', error.message);
  }
}

testGenerate();
