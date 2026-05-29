import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function getJobIdFromHistory(history: any[]) {
  if (!history || !Array.isArray(history)) return null;
  // Scan from newest to oldest
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.role === "assistant" && msg.content) {
      // Matches standard UUIDs in markdown links: /jobs/91a4fb4c-493a-43df-98fb-c17f6d4cb3a0
      const match = msg.content.match(/\/jobs\/([a-zA-Z0-9-]{36})/i);
      if (match) {
        return match[1];
      }
      // Also match short numeric IDs in markdown links: /jobs/91
      const shortMatch = msg.content.match(/\/jobs\/(\d+)/);
      if (shortMatch) {
        return shortMatch[1];
      }
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, message, pathname, jobContext, action, jobId, history } = body;

    const apiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI API Key is missing. Please configure it in your environment." },
        { status: 500 }
      );
    }

    const isGroq = apiKey.startsWith("gsk_");
    const apiUrl = isGroq
      ? "https://api.groq.com/openai/v1/chat/completions"
      : "https://api.x.ai/v1/chat/completions";
    const apiModel: string = isGroq ? "llama-3.3-70b-versatile" : "grok-2-latest";

    // Resolve activeJobId from body or history context
    let activeJobId = jobId;
    if (!activeJobId && history) {
      activeJobId = getJobIdFromHistory(history);
    }

    // Load job context if jobId/resolved activeJobId provided
    let activeJobContext = jobContext;
    const resolvedJobId = activeJobId || jobId;
    if (resolvedJobId && !activeJobContext) {
      const isUuid = resolvedJobId.includes("-");
      const { data: dbJob } = await supabaseAdmin
        .from("jobs")
        .select("title, company_name, description, is_referral")
        .eq(isUuid ? "uuid" : "id", resolvedJobId)
        .maybeSingle();
      if (dbJob) {
        activeJobContext = {
          title: dbJob.title,
          company: dbJob.company_name,
          description: dbJob.description,
          isReferral: dbJob.is_referral
        };
      }
    }

    // 1. Resolve User details
    let userProfile: any = null;
    let userRole = "Guest";
    let userApplications: any[] = [];
    let appliedJobPks: number[] = [];
    let recentJobs: any[] = [];
    let referralJobs: any[] = [];
    let candidatePool: any[] = [];
    let activeReferrers: any[] = [];

    if (userId) {
      // Query jobseekers, employees, recruiters, and admins in parallel
      const [seekerRes, employeeRes, recruiterRes, adminRes] = await Promise.all([
        supabaseAdmin
          .from("jobseekers")
          .select("*, domain:domains!domain_id(uuid, name), jobseeker_skills(skills(id, name))")
          .eq("uuid", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("employees")
          .select("*")
          .eq("uuid", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("recruiters")
          .select("*")
          .eq("uuid", userId)
          .maybeSingle(),
        supabaseAdmin
          .from("admins")
          .select("*")
          .eq("uuid", userId)
          .maybeSingle(),
      ]);

      if (seekerRes.data) {
        userProfile = seekerRes.data;
        userRole = "Job Seeker";

        // Fetch all applied job pks for this user to exclude them from recommendations
        const { data: appliedApps } = await supabaseAdmin
          .from("applications")
          .select("job_pk")
          .eq("user_pk", userProfile.id);
        if (appliedApps) {
          appliedJobPks = appliedApps.map((a: any) => a.job_pk).filter(Boolean);
        }
      } else if (employeeRes.data) {
        userProfile = employeeRes.data;
        userRole = "Employee";
      } else if (recruiterRes.data) {
        userProfile = recruiterRes.data;
        userRole = "Recruiter";
      } else if (adminRes.data) {
        userProfile = adminRes.data;
        userRole = "Admin";
      }
    }

    // 1.5 Handle programmatical application submission
    const isSubmitAction = action === "submit_application" || 
                           (message && (
                             message.toLowerCase().includes("submit application") || 
                             message.toLowerCase().includes("apply for the job") || 
                             message.toLowerCase() === "apply"
                           ));

    if (isSubmitAction && activeJobId) {
      if (!userProfile) {
        return NextResponse.json({
          message: `🔒 **Authentication Required**: Please sign in as a Job Seeker to apply for jobs directly via chatbot. (Debug: userId=${userId}, userRole=${userRole}, userProfile=${userProfile ? JSON.stringify(userProfile) : 'null'})`,
          suggestions: ["Recommend Jobs"]
        });
      }
      if (userRole !== "Job Seeker") {
        return NextResponse.json({
          message: `⚠️ **Invalid Role**: Only Job Seekers can apply for jobs. (Debug: role=${userRole})`,
          suggestions: ["Recommend Jobs"]
        });
      }

      // Query the job details to check for an external application link
      const isUuid = activeJobId.includes("-");
      const { data: jobToCheck } = await supabaseAdmin
        .from("jobs")
        .select("title, company_name, job_link")
        .eq(isUuid ? "uuid" : "id", activeJobId)
        .maybeSingle();

      if (jobToCheck?.job_link) {
        return NextResponse.json({
          message: `🔗 **External Application Required**:\n\nThe job **${jobToCheck.title}** at **${jobToCheck.company_name}** requires applying directly on the company's website.\n\nPlease click here to apply: [Apply on Company Website](${jobToCheck.job_link})`,
          suggestions: ["Recommend Jobs", "Get a Referral", "Improve Resume"]
        });
      }

      const origin = req.nextUrl.origin;
      try {
        const appRes = await fetch(`${origin}/api/applications`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: activeJobId,
            userId: userProfile.uuid || userProfile.id,
          }),
        });

        const resData = await appRes.json();
        if (appRes.ok) {
          return NextResponse.json({
            message: `🎉 **Success!** Your application for **${activeJobContext?.title || "the job"}** at **${activeJobContext?.company || "slice"}** has been successfully submitted to the database!\n\nYou can track the status in your applications dashboard. Would you like to:`,
            suggestions: ["View Application Status", "Get a Referral", "Recommend Jobs"]
          });
        } else {
          return NextResponse.json({
            message: `⚠️ **Could not submit application:** ${resData.error || "Please try again on the job page."}`,
            suggestions: ["Recommend Jobs", "Improve Resume"]
          });
        }
      } catch (fetchErr: any) {
        console.error("Local applications post error:", fetchErr);
        return NextResponse.json({
          message: `⚠️ **Application Submission Error**: ${fetchErr.message || "Failed to communicate with API."}`,
          suggestions: ["Recommend Jobs"]
        });
      }
    }

    // 2. Load context data based on role/action
    let jobsQuery = supabaseAdmin
      .from("jobs")
      .select(`
        id, uuid, title, company_name, description, is_referral, 
        salary_min, salary_max, experience_min, experience_max, 
        posted_at, expires_at, status, skill_pks, location_pks, domain_pk
      `)
      .eq("status", "active")
      .eq("is_referral", false)
      .gt("expires_at", new Date().toISOString());

    let referralJobsQuery = supabaseAdmin
      .from("jobs")
      .select(`
        id, uuid, title, company_name, description, is_referral, 
        salary_min, salary_max, experience_min, experience_max, 
        posted_at, expires_at, status, skill_pks, location_pks, domain_pk
      `)
      .eq("status", "active")
      .eq("is_referral", true)
      .gt("expires_at", new Date().toISOString());

    if (appliedJobPks.length > 0) {
      jobsQuery = jobsQuery.not("id", "in", `(${appliedJobPks.join(",")})`);
      referralJobsQuery = referralJobsQuery.not("id", "in", `(${appliedJobPks.join(",")})`);
    }

    const [jobsRes, referralJobsRes, locationsRes, domainsRes, skillsRes] = await Promise.all([
      jobsQuery.order("posted_at", { ascending: false }).limit(12),
      referralJobsQuery.order("posted_at", { ascending: false }).limit(6),
      supabaseAdmin.from("locations").select("id, name"),
      supabaseAdmin.from("domains").select("id, name"),
      supabaseAdmin.from("skills").select("id, name"),
    ]);

    const locationMap = new Map(locationsRes.data?.map((l: any) => [l.id, l.name]) || []);
    const domainMap = new Map(domainsRes.data?.map((d: any) => [d.id, d.name]) || []);
    const skillMap = new Map(skillsRes.data?.map((s: any) => [s.id, s.name]) || []);

    if (jobsRes.data) {
      recentJobs = jobsRes.data.map((job: any) => ({
        ...job,
        locations: job.location_pks?.map((id: any) => locationMap.get(id)).filter(Boolean) || [],
        domain: domainMap.get(job.domain_pk) || "N/A",
        skills: job.skill_pks?.map((id: any) => skillMap.get(id)).filter(Boolean) || [],
      }));
    }

    if (referralJobsRes.data) {
      referralJobs = referralJobsRes.data.map((job: any) => ({
        ...job,
        locations: job.location_pks?.map((id: any) => locationMap.get(id)).filter(Boolean) || [],
        domain: domainMap.get(job.domain_pk) || "N/A",
        skills: job.skill_pks?.map((id: any) => skillMap.get(id)).filter(Boolean) || [],
      }));
    }

    // Load applications for job seekers
    if (userRole === "Job Seeker" && userProfile) {
      const { data: apps } = await supabaseAdmin
        .from("applications")
        .select(`
          id, uuid, status_id, applied_at, verification_status,
          job:jobs(title, company_name, is_referral)
        `)
        .eq("user_pk", userProfile.id)
        .order("applied_at", { ascending: false })
        .limit(5);

      if (apps) {
        // Map status IDs to human readable names
        const statusNames: Record<number, string> = {
          1: "Applied",
          2: "Profile Viewed",
          3: "Shortlisted / Accepted",
          4: "Referred",
          5: "Interviewing",
          6: "Offer Received",
          7: "Joined Company",
          8: "Completed",
          9: "Disputed",
          10: "Rejected",
          11: "Not Suitable",
          12: "Referral Unlocked",
        };
        userApplications = apps.map((app: any) => ({
          id: app.uuid,
          jobTitle: app.job?.title,
          company: app.job?.company_name,
          isReferral: app.job?.is_referral,
          status: statusNames[app.status_id] || "Applied",
          appliedAt: app.applied_at,
          verification: app.verification_status,
        }));
      }
    }

    // Load candidates for employees and recruiters
    if (userRole === "Employee" || userRole === "Recruiter") {
      const { data: candidates } = await supabaseAdmin
        .from("jobseekers")
        .select("id, uuid, name, headline, summary, experience_years, jobseeker_skills(skills(id, name))")
        .limit(8);

      if (candidates) {
        candidatePool = candidates.map((c: any) => ({
          id: c.uuid || c.id,
          name: c.name,
          headline: c.headline,
          summary: c.summary,
          experience: `${c.experience_years} Years`,
          skills: c.jobseeker_skills?.map((jsk: any) => jsk.skills?.name).filter(Boolean) || [],
        }));
      }
    }

    // Load admin statistics if user is admin
    let adminStats: any = null;
    if (userRole === "Admin") {
      const [jobsCount, seekersCount, employeesCount, recruitersCount, appsCount] = await Promise.all([
        supabaseAdmin.from("jobs").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("jobseekers").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("employees").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("recruiters").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("applications").select("id", { count: "exact", head: true }),
      ]);
      adminStats = {
        totalJobs: jobsCount.count || 0,
        totalJobSeekers: seekersCount.count || 0,
        totalEmployees: employeesCount.count || 0,
        totalRecruiters: recruitersCount.count || 0,
        totalApplications: appsCount.count || 0,
      };
    }

    // Load active referrers / employees (only those with complete profiles)
    const { data: referrers } = await supabaseAdmin
      .from("employees")
      .select("id, name, company_name, designation")
      .not("company_name", "is", null)
      .neq("company_name", "")
      .not("name", "is", null)
      .neq("name", "")
      .limit(5);
    if (referrers) {
      activeReferrers = referrers;
    }

    // 3. Hard-coded server-side intercept: if user is asking about referral jobs and none exist, return honest response immediately
    const isAskingForReferral = 
      (message && (message.toLowerCase().includes("referral") || message.toLowerCase().includes("refer"))) ||
      action === "get_referral";

    if (isAskingForReferral && referralJobs.length === 0) {
      // Build referrer suggestions from employees with complete profiles
      const qualifiedReferrers = activeReferrers.filter((r: any) => r.name && r.company_name);
      const referrerList = qualifiedReferrers.length > 0
        ? qualifiedReferrers.map((r: any) => {
            const role = r.designation || "Employee";
            const company = r.company_name;
            return `- **${r.name}** — ${role} at **${company}**`;
          }).join("\n")
        : null;

      const noReferralMsg = referrerList
        ? `🔍 **No Active Referral Jobs Found**\n\nThere are currently **no referral jobs** listed on JobsDart. Here are some active referrers on our platform you can connect with:\n\n${referrerList}\n\nVisit the [Referrers Page](/referrers) to explore referral opportunities and connect with referrers. You spend **2 credits** to unlock a referrer chat.`
        : `🔍 **No Active Referral Jobs Found**\n\nThere are currently **no referral jobs** listed on JobsDart.\n\nYou can:\n- Browse our **regular job listings** and apply directly\n- Check back later — referral jobs are posted by companies regularly\n- Use **Mock Interview** prep to stay ready when they do appear`;

      return NextResponse.json({
        message: noReferralMsg,
        suggestions: ["🔍 Recommend Jobs", "🎯 Mock Interview", "📄 Improve Resume & ATS"]
      });
    }

    // 4. Prompt Construction & System Message
    const userSkills = userProfile?.jobseeker_skills?.map((js: any) => js.skills?.name).filter(Boolean) || [];

    const systemPrompt = `You are "Your AI Career & Referral Assistant", a highly capable, career-focused, referral-focused, and ATS-focused specialist on the JobsDart job portal.
Your goal is to help users take action quickly on their career goals.

Context:
- Current Page Path: ${pathname || "Unknown"}
- User Role: ${userRole}
- Logged-in User Profile: ${
      userProfile
        ? JSON.stringify({
            name: userProfile.name,
            headline: userProfile.headline,
            summary: userProfile.summary,
            skills: userSkills,
            experience: `${userProfile.experience_years} Years`,
            workStatus: userProfile.work_status,
            resumeUrl: userProfile.resume_url,
          })
        : "Guest Job Seeker"
    }
- Current Job Detail Context (Active Page): ${activeJobContext ? JSON.stringify(activeJobContext) : "None"}
- Live Active Referral Jobs on Platform: ${referralJobs.length > 0 ? JSON.stringify(referralJobs) : "NONE - There are zero referral jobs on the platform right now."}
- Live Active Regular Jobs on Platform: ${JSON.stringify(recentJobs)}
- Active Referrers/Employees: ${JSON.stringify(activeReferrers)}
- User's Job Applications: ${JSON.stringify(userApplications)}
- Candidates on Platform (for Employee and Recruiter searches): ${JSON.stringify(candidatePool)}
- Admin System Statistics (for Admin role): ${adminStats ? JSON.stringify(adminStats) : "N/A"}

Aesthetic & Behavioral Guidelines:
1. Keep replies concise, highly professional, and action-oriented. Never write long essays. Bullet points, bold headers, and short paragraphs are preferred.
2. ALWAYS provide quick-reply suggestion choices (exactly 3 to 5 items) that follow up naturally on the current action.
3. For Job Seekers:
   - "Find Jobs": Recommend from the live active jobs matching their skills. Provide match percentages and highlight missing skills.
   - "Improve Resume / ATS Score": Provide actionable objective reviews, keywords to include, action verbs, and bullet optimization.
   - "Get Referral": Explain JobsDart's referral process: employees accept referrals -> job seekers spend 2 credits to unlock the chat and referrers submit proof. Suggest relevant referrers or referral jobs from our platform.
   - "Interview Prep": Offer HR/technical mock questions, company prep (e.g. TCS, Infosys, Accenture), or technical quizzes.
4. For Employees (Referrers):
   - "Match Candidates": Suggest top matches from the candidate pool for their requirements.
   - "Fraud Detection / Verification": Guide employees on verifying referral proof, assessing genuine candidate interest, and building their trust scores.
4.5. For Recruiters:
   - "Match Candidates": Suggest top matches from the candidate pool for their job postings.
   - "Optimize Job Post": Help write clearer, more compelling, ATS-friendly job descriptions.
   - "Screen Applicants": Suggest screening questions or evaluation criteria based on job requirements.
4.6. For Admins:
   - "Verify Payouts": Assist in verifying referral proof and confirming payouts.
   - "System Analytics": Summarize platform activity and transaction counts.
5. If recommending, viewing, or applying for a job, ALWAYS provide a markdown link in your message using the job's public uuid: [Apply Here](/jobs/{uuid}) or [View Details](/jobs/{uuid}) to help users take action quickly.
6. Important: You must keep track of context using the conversation history. If the user clicks "Apply for the job", "Get a referral", or asks a follow-up, use the history to determine which job they are referring to and provide the correct action link, e.g. [Apply for the job](/jobs/{uuid}).
7. If action is specified, focus the response primarily on satisfying that specific action.
8. ABSOLUTE RULE — NEVER VIOLATE: JobsDart is a 100% self-contained platform. It is STRICTLY FORBIDDEN to mention, suggest, reference, or imply the existence of any external job platforms such as LinkedIn, Indeed, Glassdoor, Naukri, Shine, or any other third-party site. NEVER say phrases like "referral jobs on other platforms", "explore external platforms", "other job sites", "I can suggest jobs from elsewhere", or any similar language. If data is unavailable (e.g. no referral jobs), say so clearly and only suggest JobsDart-native alternatives (e.g. regular jobs, active referrers, interview prep). Violating this rule by mentioning any external platform is considered a critical error.
9. The output MUST be a JSON object matching this schema:
{
  "message": "<markdown text response>",
  "suggestions": ["<suggestion 1>", "<suggestion 2>", "<suggestion 3>"]
}
Do NOT wrap the response in markdown blocks (e.g., do NOT include \`\`\`json). Just return the raw JSON object.`;

    const userPrompt = action
      ? `User requested action: ${action}. Message: ${message || ""}`
      : message || "Hi, I need help starting my career search.";

    // Construct messages list including system prompts and history
    const chatMessages: any[] = [
      {
        role: "system",
        content: "You are a precise API that returns only valid JSON objects. Never include markdown formatting, code blocks, or explanations in your top-level response."
      },
      {
        role: "system",
        content: systemPrompt
      }
    ];

    if (history && Array.isArray(history)) {
      // Append last 6 turns of history
      const recentHistory = history.slice(-6);
      for (const turn of recentHistory) {
        chatMessages.push({
          role: turn.role === "user" ? "user" : "assistant",
          content: turn.content
        });
      }
    }

    chatMessages.push({
      role: "user",
      content: userPrompt
    });

    // 4. API Call
    let response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel,
        messages: chatMessages,
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn("AI Assistant API Error on primary model:", errorText);

      // Fallback: If primary model fails (e.g. 429 rate limit or 500 error), try llama-3.1-8b-instant
      if (isGroq && apiModel !== "llama-3.1-8b-instant") {
        console.log("Attempting fallback to llama-3.1-8b-instant...");
        response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.1-8b-instant",
            messages: chatMessages,
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
        });
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Assistant API Error after fallback:", errorText);
      return NextResponse.json(
        { error: `AI inference failed: ${response.status}` },
        { status: 500 }
      );
    }

    const aiData = await response.json();
    let content = aiData.choices[0].message.content.trim();

    // Clean up markdown block if the model returned it despite instructions
    content = content.replace(/```json\s*/g, "");
    content = content.replace(/```\s*/g, "");
    content = content.trim();

    const parsedResult = JSON.parse(content);
    return NextResponse.json(parsedResult);
  } catch (error: any) {
    console.error("Assistant API Exception:", error);
    return NextResponse.json(
      {
        message: "I apologize, but I encountered an error connecting to my core services. Please try again in a few moments.",
        suggestions: ["Find Jobs", "Improve Resume", "Get Referral"],
      },
      { status: 200 }
    );
  }
}
