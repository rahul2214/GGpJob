import { Star, Crown, Rocket } from "lucide-react";

export const RECRUITER_PLANS = [
  {
    id: "basic",
    name: "Basic Plan",
    price: 19, // USD Base
    originalPrice: 49,
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
    price: 49, // USD Base
    originalPrice: 99,
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
    price: 99, // USD Base
    originalPrice: 199,
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
    price: 3, // USD Base
    perCredit: 0.3,
    description: "Perfect for a quick application boost.",
    icon: Rocket,
    color: "sky"
  },
  {
    id: "popular_pack",
    name: "Popular Pack",
    credits: 60,
    price: 9, // USD Base
    perCredit: 0.15,
    description: "Our best value pack for active applicants.",
    icon: Star,
    color: "amber",
    popular: true
  },
  {
    id: "pro_pack",
    name: "Pro Pack",
    credits: 150,
    price: 19, // USD Base
    perCredit: 0.12,
    description: "Maximum credits for aggressive job hunting.",
    icon: Rocket,
    color: "indigo"
  }
];

