import { Star, Crown, Search } from "lucide-react";

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
