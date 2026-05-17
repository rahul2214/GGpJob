# 🎯 JobsDart - Premium Career Connection & Referral Marketplace

JobsDart is a next-generation job portal and employee referral platform designed to connect top talent with verified recruiters and insider employees. Built with modern web technologies and robust gamification mechanisms, JobsDart accelerates recruitment while rewarding company insiders for successful candidate referrals.

---

## 📖 Documentation

For a comprehensive guide on the platform's architecture, database schemas, role permissions, and key feature workflows (including self-healing monthly referral quotas, candidate rejection protections, dynamic milestones, and credit refund pipelines), please refer to our official developer guide:

👉 **[JobsDart Developer Manual & Architecture Guide](docs/DEVELOPER_MANUAL.md)**

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Ensure your `.env` file is properly populated with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Verify TypeScript Compilation
Before pushing changes or deploying, verify all TypeScript types:
```bash
npx tsc --noEmit
```

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, Framer Motion
- **Backend & Database**: Supabase, PostgreSQL (RLS enabled), Supabase Admin SDK
- **Styling**: Vanilla CSS utilities & Tailwind glassmorphism design system
