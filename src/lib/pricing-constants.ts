import { Star, Crown, Rocket } from "lucide-react";

export const RECRUITER_PLANS = [
  {
    id: "basic_plan",
    name: "Basic Plan",
    price: 0,
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
    price: 0,
    description: "Maximum reach and full portal access.",
    icon: Crown,
    color: "amber",
    popular: true,
    features: [
      "Post up to 10 jobs",
      "Unlimited applications",
      "30-day job validity",
      "90-day application access",
      "Priority dashboard placement"
    ]
  },
  {
    id: "pro",
    name: "Pro Recruitment",
    price: 0,
    description: "The ultimate hiring suite for power recruiters.",
    icon: Crown,
    color: "indigo",
    features: [
      "Post up to 50 jobs",
      "Unlimited applications",
      "90-day job validity",
      "180-day application access",
      "Priority Support & Verified Status"
    ]
  }
];

export const CREDIT_PACKS = [
  {
    id: "mini",
    name: "Mini Pack",
    credits: 10,
    price: 0,
    perCredit: 0,
    description: "Perfect for a quick application boost.",
    icon: Rocket,
    color: "sky"
  },
  {
    id: "popular_pack",
    name: "Popular Pack",
    credits: 60,
    price: 0,
    perCredit: 0,
    description: "Our best value pack for active applicants.",
    icon: Star,
    color: "amber",
    popular: true
  },
  {
    id: "pro_pack",
    name: "Pro Pack",
    credits: 150,
    price: 0,
    perCredit: 0,
    description: "Maximum credits for aggressive job hunting.",
    icon: Rocket,
    color: "indigo"
  }
];

export const JOB_SEEKER_PLANS = CREDIT_PACKS;

