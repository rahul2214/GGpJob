# Developer Manual: CareerConnect Job Portal

This document provides a comprehensive technical overview of the CareerConnect (formerly Veltria) Job Portal. It covers the architecture, core systems, and development workflows.

---

## 1. Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS, ShadCN UI, Framer Motion (Animations)
- **Backend/Database**: **Supabase** (PostgreSQL, Auth, R2-compatible Storage)
- **Realtime/Notifications**: Supabase Realtime
- **Payments**: Razorpay Integration
- **Email**: Resend API
- **State Management**: React Context API (`UserProvider`)

---

## 2. Core Systems & Logic

### 2.1 The Referral Lifecycle
The platform revolves around verified employee referrals. A typical application follows this flow:

1. **Applied**: Jobseeker applies for a referral job.
2. **Accepted**: The referring Employee reviews the profile and clicks "Accept" if they find the candidate suitable.
3. **Unlocked**: The Jobseeker accepts the referral interest and spends **2 Credits** to unlock the referral.
4. **Referred**: The Employee submits proof of the actual referral (screenshot/link).
5. **Interviewing**: Jobseeker uploads proof of interview invite; Employee verifies it.
6. **Offer Received**: Jobseeker uploads proof of offer letter; Employee verifies it.
7. **Joined Company**: Jobseeker uploads proof of joining (ID card/Appointment letter); Employee verifies it.
8. **Completed**: Final verification triggers the highest rewards.

### 2.2 Dual Credit System (Jobseekers)
Jobseekers use a dual-layer credit system to unlock referrals:
- **Subscription Credits**: Monthly recurring credits (reset based on plan).
- **Purchased Credits**: Top-up credits that never expire.
- **Consumption Logic**: The `consume_credits` RPC prioritizes Subscription credits before using Purchased credits.

### 2.3 Gamification Engine (Employees)
Located in `src/lib/gamification-logic.ts`, this system rewards employees for successful referrals:
- **XP Points**: Awarded for actions like Job Posting (+5), Candidate Unlock (+10), Interview Verified (+30), and Successful Hire (+65).
- **Leveling System**: Users level up as they accumulate XP. Higher levels unlock larger milestone bonuses.
- **Milestones**: Fixed rewards (XP + Cash) for reaching counts (e.g., "Connector" badge for 20 verified referrals).
- **Trust Score**: A metric (0-100) representing user reliability. Verification failures or disputes penalize this score.

---

## 3. Project Structure

```text
src/
├── app/
│   ├── api/                # Next.js API Routes (Serverless)
│   │   ├── applications/   # Verification, Status, and Proof logic
│   │   ├── jobs/           # Job posting and searching
│   │   └── users/          # Profile management
│   ├── admin/              # Admin Dashboard & Management
│   ├── jobseeker/          # Jobseeker-specific routes (Plans, Dashboard)
│   ├── company/            # Employee/Recruiter registration & portal
│   └── applications/       # Jobseeker's application tracking UI
├── components/
│   ├── dashboards/         # Employee & Jobseeker custom dashboards
│   ├── ui/                 # Reusable ShadCN components
│   └── rewards/            # Redemption and Wallet components
├── lib/
│   ├── gamification-logic.ts # Centralized XP and Milestone logic
│   ├── supabase-admin.ts   # Service-role client for backend operations
│   └── types.ts            # Global TypeScript definitions
└── contexts/
    └── user-context.tsx    # Auth session and profile persistence
```

---

## 4. Database Schema (Supabase)

### Key Tables:
- **`jobseekers`**: Profiles, credits, resume links.
- **`employees`**: XP, Level, Trust Score, Wallet Balance.
- **`jobs`**: Core job data. `employee_pk` links to the poster.
- **`applications`**: Tracks the link between user and job.
  - `status_id`: Controls UI workflow (1-12).
  - `verification_status`: `none`, `pending`, `verified`, `disputed`.
- **`notifications`**: System-wide activity logs and user alerts.

---

## 5. Development Workflows

### Setup
1. Clone repository and run `npm install`.
2. Configure `.env` with Supabase URL, Anon Key, and Service Role Key.
3. Ensure R2 Storage (Cloudflare) keys are configured for file uploads.

### Adding New Features
- **UI Components**: Use ShadCN (`npx shadcn-ui@latest add [component]`).
- **Database Changes**: Apply SQL migrations in Supabase Studio.
- **New Statuses**: Update `application_statuses` table and the `StatusBadge` in `src/app/applications/page.tsx`.

---

## 6. Verification & Disputes
If a jobseeker or employee disputes a verification:
1. Status moves to **Disputed** (ID: 11).
2. Trust Score of the offending party is penalized (usually -50 points).
3. Admin intervention is required via the Admin Panel to resolve the case.

---

*Last Updated: May 2026*
