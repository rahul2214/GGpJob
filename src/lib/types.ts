export type Role = "Job Seeker" | "Recruiter" | "Admin" | "Super Admin";

export interface JobseekerAchievement {
  id?: number;
  jobseekerId?: number;
  jobseekerUuid?: string;
  title: string;
  description?: string;
  issuer?: string;
  dateAchieved?: string;
  createdAt?: string;
}

export interface JobseekerCertification {
  id?: number;
  jobseekerId?: number;
  jobseekerUuid?: string;
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  createdAt?: string;
}

export interface JobseekerPreferredLocation {
  id?: number;
  jobseekerId?: number;
  countryId: number;
  stateProvinceId?: number | null;
  cityId?: number | null;
  countryName?: string;
  stateName?: string;
  cityName?: string;
  formattedLocation?: string;
}

export interface NoticePeriod {
  id: number;
  uuid?: string;
  name: string;
  days?: number;
  display_order?: number;
}

export interface User {
  id: number;     // Numeric Primary Key
  uuid: string;   // Public UUID (links to auth.users)
  pk?: number;    // Alias for numeric primary key
  name: string;
  email: string;
  phone?: string;
  role: Role;
  roleId?: number;
  metadata?: any;
  referralCode?: string;
  referredBy?: number;
  referralCount?: number;
  headline?: string;
  summary?: string;
  locationId?: string;
  resumeUrl?: string;
  profilePhotoUrl?: string;
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
  // Professional
  preferredJobTitles?: string[];
  preferredSalaryMin?: number;
  preferredSalaryMax?: number;
  preferredCurrency?: string;
  remotePreference?: 'remote' | 'hybrid' | 'onsite' | 'any';
  employmentTypes?: string[];
  preferredIndustries?: string[];
  openToRelocate?: boolean;
  openToRelocation?: boolean;
  openWorldwide?: boolean;
  workAuthorization?: string[];
  visaRequirement?: string;
  visaRequirementId?: number;
  workplaceTypeId?: number;
  workplaceType?: string;
  preferredLanguages?: string[];
  workStatus?: 'Fresher' | 'Experienced';
  experienceYears?: number;
  experienceMonths?: number;
  currentCity?: string;
  currentArea?: string;
  annualSalary?: number;
  expectedSalary?: number;
  salaryBreakdown?: 'Fixed' | 'Fixed + Variable' | 'Fixed + Variable + Stocks' | 'Fixed + Stocks';
  noticePeriod?: 'Immediate / Available Now' | '15 Days or less' | '1 Month' | '2 Months' | '3 Months' | 'More than 3 Months' | 'Serving Notice Period' | string;
  noticePeriodId?: number;
  preferredLocations?: string[];

  // Jobseeker Feature Flags
  hasUsedAtsChecker?: boolean;
  has_used_ats_checker?: boolean;
  hasSeenReferralPrompt?: boolean;
  has_seen_referral_prompt?: boolean;
  referralStepDismissed?: boolean;
  referral_step_dismissed?: boolean;
  hasUsedResumeBuilder?: boolean;
  has_used_resume_builder?: boolean;
  referralRewarded?: boolean;
  referral_rewarded?: boolean;
  referralRewardedAt?: string;
  referral_rewarded_at?: string;

  isPaid?: boolean;
  planType?: 'none' | 'basic' | 'premium' | 'pro';
  planExpiresAt?: string;
  /** Recruiter subscription lifecycle: active | expired | cancelled */
  subscriptionStatus?: 'active' | 'expired' | 'cancelled';
  /** End of 7-day grace period after plan expiry */
  gracePeriodEnd?: string;
  // Account soft-delete fields
  isDeleted?: boolean;
  status?: 'active' | 'suspended' | 'deleted';
  deleteRequestedAt?: string;
  deletedAt?: string;
  scheduledDeleteAt?: string;
  country?: string;
  countryId?: number;
  state?: string;
  stateId?: number;
  city?: string;
  cityId?: number;
  jobseekerPreferredLocations?: JobseekerPreferredLocation[];
  // Profile completion stats
  profileStats?: {
    hasEducation: boolean;
    hasEmployment: boolean;
    hasSkills: boolean;
    hasProjects: boolean;
    hasLanguages: boolean;
    hasSummary: boolean;
    hasLocationHierarchy?: boolean;
    hasAchievements?: boolean;
    hasCertifications?: boolean;
    hasPreferredLocations?: boolean;
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
  education?: Education[];
  experience?: Employment[];
  projects?: Project[];
  languages?: Language[];
  achievements?: (JobseekerAchievement | string)[];
  certifications?: (JobseekerCertification | string)[];
  skills?: MasterSkill[];
  skillIds?: string[];
  credits?: number;  // For Job Seekers (Legacy Total)
  totalCredits?: number; // Unified total credits (subscription + purchased)
  subscriptionCredits?: number;
  purchasedCredits?: number;
  subscriptionAllowance?: number;
  nextCreditResetAt?: string;
  rewards?: number;  // For Employees
  trustScore?: number; // Starting at 100
  xp?: number;
  level?: number;
  rewardsBalance?: number; // Deprecated: use credits instead
  verifiedReferralsCount?: number;
  interviewsCount?: number;
  hiresCount?: number;
  milestonesAchieved?: string[];
  badges?: string[];
  jobsPostedThisMonth?: number;
  nextJobsResetAt?: string | null;
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

export interface Job {
  id: number;
  uuid: string;
  pk?: number;
  jobId?: string;
  // 1. Job Title
  title: string;
  // 2. Company Name
  companyName: string;
  company?: string;
  // 3. Country
  country?: string;
  // 4. State
  state?: string;
  // 5. City
  city?: string;
  location?: string;
  // 6. Latitude
  latitude?: number;
  // 7. Longitude
  longitude?: number;
  // 8. Remote Type
  remoteType?: 'remote' | 'hybrid' | 'onsite';
  workplaceType?: string;
  // 9. Employment Type
  employmentType?: string;
  type?: string;
  // 10. Salary Min
  salaryMin?: number;
  minSalary?: number;
  // 11. Salary Max
  salaryMax?: number;
  maxSalary?: number;
  // 12. Salary Currency
  salaryCurrency?: string;
  currency?: string;
  // 13. Experience Min
  minExperience?: number;
  // 14. Experience Max
  maxExperience?: number;
  // 15. Required Skills
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
  // 16. Industry
  industry?: string;
  // 17. Job Function
  jobFunction?: string;
  // 18. Visa Sponsorship
  visaSponsorship?: boolean;
  visa_sponsorship?: boolean;
  // 19. Work Authorization Requirement
  workAuthorizationRequirement?: string[];
  work_authorization_requirement?: string[];
  // 20. Languages
  languages?: string[];
  // 21. Posted Date
  postedAt: Date | string;
  postedDate?: Date | string;
  // 22. Expiry Date
  expiryDate?: Date | string;
  expiresAt?: Date | string;
  appExpiresAt?: string;
  // 23. Company Verification
  companyVerification?: boolean;
  isCompanyVerified?: boolean;
  // 24. Company Rating
  companyRating?: number;

  // Additional metadata & relations
  description: string;
  jobTypeId: string;
  jobTypePk?: number;
  workplaceTypeId?: string;
  workplaceTypePk?: number;
  isReferral?: boolean;
  recruiterId?: string;
  recruiterPk?: number;
  employeeId?: string;
  employeePk?: number;
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
  requirements?: string[];
  responsibilities?: string[];
  qualifications?: string[];
  sections?: { title: string; items?: string[]; content?: string }[];
  benefits?: string[];
  benefitIds?: string[];
  locations?: string[];
  skills?: string[];
  skillIds?: string[];
  skillPks?: number[];
  experienceLevel?: string;
  applicantCount?: number;
  applicationsCount?: number;
  selectedApplicantCount?: number;
  referredApplicantCount?: number;
  hiredApplicantCount?: number;
  maxApplies?: number;
  isApplied?: boolean;
  isSaved?: boolean;
  isBoosted?: boolean;
  planTypeAtPosting?: string;
  createdAt?: Date | string;
  /** Job lifecycle: active | draft | archived | closed | paused */
  status?: 'active' | 'draft' | 'archived' | 'closed' | 'paused' | string;
}

export interface ExperienceLevel {
  id: number;
  uuid: string;
  name: string;
}

export interface ApplicationStatus {
  id: number;
  name: "Applied" | "Profile Viewed" | "Not Suitable" | "Selected" | "Accepted" | "Referred" | "Interviewing" | "Offer Received" | "Hired" | "Completed" | "Disputed" | "Rejected" | "Pending Confirmation" | "Joined Company" | "Under Review" | "Referral Unlocked";
}

export interface Application {
  id: number;
  uuid: string;
  jobId: string;   // UUID
  jobNumericId?: number;
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
  unreadChatCount?: number;

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
  verificationStatus?: 'none' | 'pending' | 'verified' | 'disputed' | 'pending_jobseeker' | 'pending_employee';
  verificationExpiresAt?: string;
  disputeReason?: string;
  isUnlocked?: boolean;
  internalReferralId?: string;
  updatedAt?: Date | string;
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

export interface VisaRequirement {
    id: number;
    name: string;
    description?: string;
    createdAt?: string;
}