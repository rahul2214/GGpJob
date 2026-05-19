import { Star, Crown, Search, Rocket, Zap } from "lucide-react";

export const RECRUITER_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 199,
    originalPrice: 499,
    description: "Essential verification for new recruiters.",
    icon: Star,
    color: "emerald",
    features: [
      "Post 1 job",
      "300 applications per job",
      "30-day job validity",
      "30-day application access",
      "Verified recruiter badge"
    ]
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: 1499,
    originalPrice: 4999,
    description: "Maximum reach and full portal access.",
    icon: Crown,
    color: "amber",
    popular: true,
    features: [
      "Post up to 10 jobs",
      "Unlimited applications",
      "30-day job validity",
      "90-day application access",
      "1-month Talent Search access",
      "Priority dashboard placement"
    ]
  },
  {
    id: "pro",
    name: "Pro Recruitment",
    price: 4999,
    originalPrice: 9999,
    description: "The ultimate hiring suite for power recruiters.",
    icon: Crown,
    color: "indigo",
    features: [
      "Post up to 50 jobs",
      "Unlimited applications",
      "90-day job validity",
      "180-day application access",
      "Full Talent Search access",
      "Priority Support & Verified Status"
    ]
  },
  {
    id: "talent",
    name: "Talent Search",
    price: 499,
    originalPrice: 1999,
    description: "Powerful tools to find candidates directly.",
    icon: Search,
    color: "sky",
    features: [
      "1-month database access",
      "Advanced search filters",
      "View full candidate profiles",
      "Direct contact info access",
      "Saved searches & alerts"
    ]
  }
];

export const JOB_SEEKER_PLANS = [
  {
    id: "free",
    name: "Free Plan",
    price: 0,
    description: "Best for new users, students & first-time jobseekers.",
    icon: Star,
    color: "emerald",
    features: [
      "5 Referral applications/month",
      "2 Active pending referrals",
      "Unlimited Standard job applies",
      "2 Credits included/month"
    ]
  },
  {
    id: "jobseeker_basic",
    name: "Basic Plan",
    price: 299,
    originalPrice: 599,
    description: "Best for active entry-level applicants.",
    icon: Zap,
    color: "amber",
    features: [
      "10 Referral applications/month",
      "3 Active pending referrals",
      "10 Referral unlocks/month",
      "4 Credits included/month",
      "Priority visibility & App insights",
      "Faster employee visibility"
    ]
  },
  {
    id: "jobseeker_premium",
    name: "Premium Plan",
    price: 499,
    originalPrice: 999,
    description: "Best for active jobseekers & regular applicants.",
    icon: Search,
    color: "sky",
    popular: true,
    features: [
      "25 Referral applications/month",
      "5 Active pending referrals",
      "20 Referral unlocks/month",
      "20 Credits included/month",
      "Priority visibility & App insights",
      "Faster employee visibility"
    ]
  },
  {
    id: "jobseeker_pro",
    name: "Pro Plan",
    price: 999,
    originalPrice: 1999,
    description: "Best for serious professionals & aggressive job seekers.",
    icon: Rocket,
    color: "indigo",
    features: [
      "75 Referral applications/month",
      "10 Active pending referrals",
      "60 Referral unlocks/month",
      "60 Credits included/month",
      "High Priority visibility & Chat",
      "AI resume optimization",
      "Faster referral processing"
    ]
  }
];

export const CREDIT_PACKS = [
  {
    id: "mini",
    name: "Mini Pack",
    credits: 10,
    price: 149,
    perCredit: 14.9,
    description: "Perfect for a quick referral unlock.",
    icon: Rocket,
    color: "sky"
  },
  {
    id: "basic_pack",
    name: "Basic Pack",
    credits: 25,
    price: 299,
    perCredit: 11.9,
    description: "The essential credit boost for jobseekers.",
    icon: Search,
    color: "emerald"
  },
  {
    id: "popular_pack",
    name: "Popular Pack",
    credits: 60,
    price: 549,
    perCredit: 9.1,
    description: "Our best value pack for active applicants.",
    icon: Star,
    color: "amber",
    popular: true
  },
  {
    id: "pro_pack",
    name: "Pro Pack",
    credits: 150,
    price: 1299,
    perCredit: 8.6,
    description: "Maximum credits for aggressive job hunting.",
    icon: Rocket,
    color: "indigo"
  }
];
