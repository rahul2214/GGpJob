# 📘 JobsDart - Comprehensive Developer Manual & Architecture Guide

Welcome to the **JobsDart** developer documentation. This manual provides an in-depth architectural overview, database schema guide, and feature reference for maintaining and extending the JobsDart platform.

---

## 🏛️ 1. Architecture Overview

JobsDart is a premium, multi-role recruitment and employee referral marketplace built on modern web technologies:
- **Frontend / Framework**: Next.js (App Router) with TypeScript, Tailwind CSS, and Framer Motion for rich animations and glassmorphism UI.
- **Backend / Authentication**: Supabase (PostgreSQL) with Row-Level Security (RLS) and direct Supabase Service Role administrative SDK integration for secure backend operations.
- **Roles & Permissions**:
  - `Job Seeker` (`role_id = 1`): Explores opportunities, purchases application credits, applies to listings, and unlocks recruiter contact details.
  - `Recruiter` (`role_id = 2`): Posts verified employer jobs, manages applicants, unlocks candidate profiles, and purchases job listing packages.
  - `Employee / Insider` (`role_id = 3`): Posts insider referral jobs from their verified company, earns XP and cash rewards upon successful milestones, and tracks dynamic referral tiers.
  - `Admin` (`role_id = 4`): Oversees platform integrity, reviews withdrawal requests, manages master domain/company listings, and monitors analytics.

---

## 💾 2. Core Schema & Data Models

### `employees` Table
Stores verified company insider profiles with robust gamification and quota tracking fields.
```sql
TABLE public.employees (
  id bigint generated always as identity primary key,
  uuid uuid unique not null references auth.users(id) on delete cascade,
  role_id smallint references roles(id),
  name text, email text, phone text, designation text, department text,
  company_name text, company_logo text, company_website text,
  trust_score integer default 50 check (trust_score >= 0 and trust_score <= 100),
  xp integer default 0, level integer default 1,
  verified_referrals_count integer default 0,
  interviews_count integer default 0,
  hires_count integer default 0,
  rewards_balance numeric default 0,
  milestones_achieved jsonb default '[]',
  badge_ids jsonb default '[]',
  job_post_limit integer default 5,
  jobs_posted_this_month integer default 0,
  next_jobs_reset_at timestamp with time zone default now()
);
```
*Key Index*: `idx_employees_next_jobs_reset` on `next_jobs_reset_at` to optimize monthly quota verification.

### `jobs` Table
Stores recruiter postings and employee referral opportunities.
- **Referral Jobs**: Identified by `is_referral = true` or `employee_pk is not null`. Automatically assigned a 14-day validity window (`expires_at`, `app_expires_at`) and capped at exactly `100` applications.
- **Recruiter Jobs**: Governed by recruiter subscription pricing tiers (30-90 days validity).

### `applications` Table
Stores jobseeker applications submitted to listings.
- **Status Codes**: `1` (Applied / Pending Review), `2` (Under Review / Shortlisted), `3` (Interviewing), `4` (Offered / Hired), `12` (Rejected).
- **`is_unlocked`**: Boolean indicating if the employer/employee unlocked the applicant's resume and contact info.

### `payouts` Table
Tracks monetary transactions, wallet withdrawals, and platform earnings.
- **System Earnings**: Isolated under record ID `1` (`method = 'system'`) to track platform service fees and revenue.

---

## 🚀 3. Key Feature Specifications & Workflows

### A. Employee Referral Quotas & Self-Healing Monthly Resets
To maintain premium job listing quality, employee referral postings are subject to rigorous limits:
- **Monthly Limit**: Max 5 referral jobs per month.
- **Job Validity**: Exactly 14 days active listing window.
- **Application Cap**: Exactly 100 applications per referral job.
- **Self-Healing Quota Reset**:
  Instead of running external server cron jobs, JobsDart implements a highly reliable, proactive self-healing mechanism operating on `next_jobs_reset_at`:
  1. Whenever an employee profile is retrieved via `GET /api/users` or `GET /api/users/[id]`, or when an employee posts a job (`POST /api/jobs`), the backend checks if `now() >= next_jobs_reset_at`.
  2. If the threshold is reached or passed, the server instantly resets `jobs_posted_this_month: 0` in the response and updates `next_jobs_reset_at` to the 1st of the following month (e.g., `Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0)`), committing the reset asynchronously to the database.
  3. The `EmployeeDashboard` UI directly displays `jobsPostedThisMonth` alongside the beautifully formatted reset date (e.g. `Resets Jun 1, 2026`).

### B. Unlocked Candidate Rejection Restrictions & Credit Refunds
Ensures complete fairness and trust in application credit expenditures:
- **Rejection Protection**: Once an employer or employee unlocks a candidate (`is_unlocked = true`), the candidate **cannot** be rejected (`status = 12`). The frontend review UI (`src/app/jobs/[id]/applications/page.tsx`) hides the rejection button, and the backend route (`/api/applications/[id]/status`) strictly enforces a `403 Forbidden` error if a rejection is attempted on an unlocked record.
- **Automated Credit Refund**: When a candidate is rejected *prior* to being unlocked, or if rejected directly by an admin, the backend invokes the `refundCredits` workflow. The jobseeker's credit balance is automatically restored by `2` credits, and an audit notification (`type: 'credit_refund'`) is posted to their activity feed.

### C. Dynamic Gamification & Tiered Milestones
Insider employees earn XP, levels, badges, and instant cash rewards for driving successful referrals:
- **Dynamic Tier Calculation**: Tiers for Verified Referrals (20/50/100), Verified Interviews (10/25/50), and Hires (5/15/30) dynamically evaluate active progress. Completed tiers transition seamlessly to the next milestone level until the supreme "All Unlocked 👑" status is achieved.
- **Trust Score Governance**: Trust Score ranges between `0` and `100`. If an employee's score drops below 60, certain high-value wallet payouts are flagged as `Pending Review` for manual administrative oversight to prevent abuse.

### D. Admin Payout Review & System Balance Isolation
The Admin Payouts Dashboard (`/admin/payouts`) provides granular control over user withdrawal requests:
- **System Revenue Exclusion**: All system earnings (record ID `1`) are isolated in the top aggregate revenue cards but are completely filtered out of the withdrawal approval table. This prevents any accidental modification or withdrawal of platform operational revenue.

### E. Form Standards: Yearly Net Salary
All employer and employee job listing forms (`JobForm` and `ReferralForm`) standardize compensation inputs to **Yearly Net Salary (Optional)** with calibrated placeholder examples (e.g., `₹6,00,000 - ₹12,00,000`) for absolute clarity.

---

## 🛠️ 4. Development & Maintenance Commands

### Validating TypeScript Type Integrity
Before committing any changes or creating production builds, always verify TypeScript type safety across the entire Next.js application router codebase:
```bash
npx tsc --noEmit
```

### Running the Local Development Server
```bash
npm run dev
```

### Running Database Migrations
Any DDL modifications (e.g., new columns or tables) should be authored in standalone `.sql` migration scripts in the `supabase/` directory and executed directly in the Supabase SQL Editor.

---

**JobsDart Engineering Team**  
*Built for High-Speed, Premium Career Connections.*
