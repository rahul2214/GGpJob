const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing SUPABASE credentials in .env");
  process.exit(1);
}

const supabase = createClient(url, key);

const JOB_SKILLS_MAP = [
  { id: 137, skills: ["Python", "TensorFlow", "Kubernetes", "C++", "Distributed Systems"] },
  { id: 138, skills: ["Azure", "System Architecture", "Microservices", "Security", "C#"] },
  { id: 139, skills: ["React", "TypeScript", "Next.js", "GraphQL", "Web Performance"] },
  { id: 140, skills: ["PyTorch", "NLP", "Large Language Models", "Python", "Deep Learning"] },
  { id: 141, skills: ["Java", "React", "AWS Lambda", "DynamoDB", "Node.js"] }
];

async function resolveSkills() {
  console.log("Resolving skill PKs and updating jobs table...");

  for (const item of JOB_SKILLS_MAP) {
    const skillPks = [];
    for (const skillName of item.skills) {
      // Check if skill exists in skills table
      let { data: existing } = await supabase.from('skills').select('id').ilike('name', skillName).maybeSingle();
      if (!existing) {
        // Insert new skill
        const { data: newSkill } = await supabase.from('skills').insert({ name: skillName }).select('id').single();
        if (newSkill) existing = newSkill;
      }
      if (existing) {
        skillPks.push(existing.id);
      }
    }

    // Update job with skill_pks and required_skills TEXT[]
    const { error } = await supabase.from('jobs').update({
      skill_pks: skillPks,
      required_skills: item.skills
    }).eq('id', item.id);

    if (error) {
      console.error(`Error updating job ID ${item.id}:`, error.message);
    } else {
      console.log(`✓ Job ID ${item.id} updated with skill PKs: [${skillPks.join(', ')}] and names: [${item.skills.join(', ')}]`);
    }
  }

  console.log("Skill resolution complete!");
}

resolveSkills();
