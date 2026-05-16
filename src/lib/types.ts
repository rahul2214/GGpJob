
export type Role = "Job Seeker" | "Recruiter" | "Employee" | "Admin" | "Super Admin";

export interface User {
  id: number;     // Numeric Primary Key
  uuid: string;   // Public UUID (links to auth.users)
  pk?: number;    // Alias for numeric primary key
  name: string;
  email: string;
  phone?: string;
  role: Role;
  roleId?: number;
  headline?: string;
  summary?: string;
  locationId?: string;
  domainId?: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  notificationLastViewedAt?: string;
  // Personal Details
  gender?: string;
  maritalStatus?: string;
  dateOfBirth?: string;
  category?: string;
  // Diversity and Inclusion
  disabilityStatus?: string;
  militaryExperience?: string;
  careerBreak?: string;
  // Joined fields
  location?: string;
  // Basic Info Extended
  workStatus?: 'Fresher' | 'Experienced';
  experienceYears?: number;
  experienceMonths?: number;
  currentCity?: string;
  currentArea?: string;
  annualSalary?: number;
  expectedSalary?: number;
  salaryBreakdown?: 'Fixed' | 'Fixed + Variable' | 'Fixed + Variable + Stocks' | 'Fixed + Stocks';
  noticePeriod?: '15 Days or less' | '1 Month' | '2 Months' | '3 Months' | 'More than 3 Months' | 'Serving Notice Period';

  isPaid?: boolean;
  planType?: 'none' | 'basic' | 'premium' | 'talent' | 'pro';
  planExpiresAt?: string;
  talentSearchExpiresAt?: string;
  // Profile completion stats
  profileStats?: {
    hasEducation: boolean;
    hasEmployment: boolean;
    hasSkills: boolean;
    hasProjects: boolean;
    hasLanguages: boolean;
    hasSummary: boolean;
  };
  // Relational data
  // Company/Recruiter Fields
  companyName?: string;
  companyLogo?: string;
  companyWebsite?: string;
  companySizeId?: string; // Relation to company_sizes table
  companySize?: string;   // Label (joined from companySizeId)
  companyOverview?: string;
  companyAddress?: string;
  companyLinkedinUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  designation?: string;
  education?: Education[];
  experience?: Employment[];
  projects?: Project[];
  languages?: Language[];
  skills?: MasterSkill[];
  skillIds?: string[];
  credits?: number;  // For Job Seekers (Legacy Total)
  subscriptionCredits?: number;
  purchasedCredits?: number;
  subscriptionAllowance?: number;
  nextCreditResetAt?: string;
  rewards?: number;  // For Employees
  trustScore?: number; // Starting at 100
  xp?: number;
  level?: number;
  rewardsBalance?: number;
  verifiedReferralsCount?: number;
  interviewsCount?: number;
  hiresCount?: number;
  milestonesAchieved?: string[];
  badges?: string[];
}

export interface JobType {
  id: number;
  uuid: string;
  name: "Full-time" | "Part-time" | "Contract" | "Internship" | "Walk-in Interview";
}

export interface WorkplaceType {
  id: number;
  uuid: string;
  name: "On-site" | "Hybrid" | "Remote";
}

export interface Location {
  id: number;
  uuid: string;
  name: string;
  country?: string;
}

export interface Job {
  id: number;
  uuid: string;
  pk?: number;
  jobId?: string;
  title: string;
  companyName: string;
  locationId?: string; // Legacy single field (UUID)
  locationIds: string[]; // Support for multiple locations (UUIDs)
  locationPks?: number[]; // Support for multiple locations (BIGINTs)
  jobTypeId: string;     // Legacy (UUID)
  jobTypePk?: number;    // BIGINT
  workplaceTypeId?: string; // UUID
  workplaceTypePk?: number; // BIGINT
  salaryMin?: number;
  salaryMax?: number;
  description: string;
  postedAt: Date | string;
  minExperience?: number;
  maxExperience?: number;
  domainId?: string;     // UUID
  domainPk?: number;      // BIGINT
  job_role?: string;
  isReferral?: boolean;
  recruiterId?: string;  // UUID
  recruiterPk?: number;   // BIGINT
  employeeId?: string;   // UUID
  employeePk?: number;    // BIGINT
  jobLink?: string;
  vacancies?: number;
  companyLogo?: string;
  companyOverview?: string;
  companyWebsite?: string;
  companySizeId?: string;
  companySize?: string;
  companyLinkedinUrl?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  isConsultancy?: boolean;
  requirements?: string[];
  requiredSkills?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  sections?: { title: string; items: string[] }[];
  benefits?: string[];
  benefitIds?: string[]; // BIGINTs or UUIDs depending on migration state
  skillIds?: string[];   // UUIDs
  skillPks?: number[];   // BIGINTs
  // Joined fields
  location?: string;
  locations?: string[];
  type?: string;
  workplaceType?: string;
  experienceLevel?: string;
  domain?: string;
  applicantCount?: number;
  selectedApplicantCount?: number;
  referredApplicantCount?: number;
  hiredApplicantCount?: number;
  expiresAt?: string;
  appExpiresAt?: string;
  maxApplies?: number;
  creditsRequired?: number;
  referralStrength?: 'Basic' | 'Strong' | 'Direct HR';
  referralCapacity?: number;
}

export interface ApplicationStatus {
  id: number;
  name: "Applied" | "Profile Viewed" | "Not Suitable" | "Selected" | "Accepted" | "Referred" | "Interviewing" | "Offer Received" | "Hired";
}

export interface Application {
  id: number;
  uuid: string;
  jobId: string;   // UUID
  jobPk?: number;  // BIGINT
  jobTitle?: string;
  companyName?: string;
  userId: string;  // UUID
  userPk?: number; // BIGINT
  statusId: number;
  appliedAt: Date | string;
  rating?: number;
  feedback?: string;
  // Joined fields
  statusName?: ApplicationStatus['name'];
  applicantName?: string;
  applicantEmail?: string;
  applicantHeadline?: string;
  applicantId?: string; // UUID
  applicantPk?: number;  // BIGINT
  applicantSkills?: string;
  applicantResumeUrl?: string;
  applicantSummary?: string;
  applicantWorkStatus?: string;
  applicantExperience?: string;
  applicantLocation?: string;
  applicantPlanType?: 'none' | 'basic' | 'premium' | 'talent' | 'pro';
  
  // Job Extended details
  jobSalaryMin?: number;
  jobSalaryMax?: number;
  jobLocation?: string;
  jobType?: string;
  jobIsReferral?: boolean;
  posterName?: string;
  posterEmail?: string;

  // Verification System
  proofUrl?: string;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'disputed';
  verificationExpiresAt?: string;
  disputeReason?: string;
  isUnlocked?: boolean;
  internalReferralId?: string;
}

export interface Domain {
  id: number;
  uuid: string;
  name: string;
}

export interface CompanySize {
  id: number;
  uuid: string;
  name: string;
}

export interface Education {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    institution: string;
    degree: string;
    fieldOfStudy?: string;
    grade?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    isCurrent?: boolean;
}

export interface Project {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    name: string;
    description?: string;
    url?: string;
    startDate?: string;
    endDate?: string;
    isCurrent?: boolean;
}

export interface Employment {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    company: string;
    title: string;
    employmentType?: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
    location?: string;
    startDate?: string;
    endDate?: string;
    description?: string;
    isCurrent?: boolean;
}

export interface Language {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    language: string;
    proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Native';
}

export interface Skill {
    id: number;
    uuid: string;
    userId: string; // UUID
    userPk?: number; // BIGINT
    name: string;
    proficiencyLevel?: 'beginner' | 'intermediate' | 'expert';
    yearsExperience?: number;
}

export interface MasterSkill {
    id: number;
    uuid: string;
    name: string;
}

export interface PortalFeedback {
    id: string; // Changed to string for Firestore ID
    userId: string; // Changed to string for Firestore UID
    rating: number;
    feedback?: string;
    submittedAt: string;
    // Joined fields
    userName?: string;
    userEmail?: string;
}

export interface PersonalDetails {
    id?: string | number;
    userPk?: number;
    gender?: string;
    maritalStatus?: string;
    dateOfBirth?: string;
    category?: string;
    disabilityStatus?: string;
    militaryExperience?: string;
    careerBreak?: string;
}
