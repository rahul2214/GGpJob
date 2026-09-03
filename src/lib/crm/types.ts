/**
 * JobsDart Candidate CRM & Brevo AI Email Automation Types
 * Scalable to 1,000,000 Users and 10,000,000 Email Events
 */

export type LifecycleStage =
  | 'NEW_ONBOARDED'
  | 'ACTIVE_SEEKER'
  | 'PASSIVE_SEEKER'
  | 'HIGHLY_ENGAGED'
  | 'DORMANT'
  | 'UNSUBSCRIBED';

export type BrevoSyncStatus = 'PENDING' | 'SYNCED' | 'FAILED' | 'EXCLUDED';

export type EmailAlertFrequency = 'INSTANT' | 'DAILY' | 'WEEKLY' | 'PAUSED';

export type EmailDeliveryStatus =
  | 'QUEUED'
  | 'SENT'
  | 'DELIVERED'
  | 'OPENED'
  | 'CLICKED'
  | 'APPLICATION_CONVERTED'
  | 'HARD_BOUNCE'
  | 'SOFT_BOUNCE'
  | 'UNSUBSCRIBED'
  | 'FAILED'
  | 'SPAM';

export type CampaignType =
  | 'JOB_RECOMMENDATIONS'
  | 'RECENT_JOBS_DIGEST'
  | 'PROFILE_UPDATE_NUDGE'
  | 'COMMUNITY_CONVERSATIONS'
  | 'FEATURE_EDUCATION'
  | 'RESUME_BUILDER'
  | 'COMMUNITY'
  | 'PRODUCT_UPDATES'
  | 'CONVERSION'
  | 'RE_ENGAGEMENT'
  // Backward compatibility aliases
  | 'AI_JOB_RECOMMENDATION'
  | 'ONBOARDING_WELCOME'
  | 'WEEKLY_DIGEST'
  | 'URGENT_JOB_ALERT';

export interface CampaignCategoryDefinition {
  type: CampaignType;
  icon: string;
  label: string;
  exampleSubject: string;
  triggerCondition: string;
  recommendedFrequency: string;
  defaultTemplateId: string;
  targetAudienceRule: string;
}

export interface CRMCandidate {
  id: number | string;
  uuid: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  headline?: string;
  country?: string;
  state?: string;
  currentCity?: string;
  preferredJobTitles: string[];
  skills: Array<string | { name: string }>;
  preferredLocations: string[];
  lifecycleStage: LifecycleStage;
  engagementScore: number; // 0 - 100
  brevoSyncStatus: BrevoSyncStatus;
  brevoContactId?: string | number;
  lastBrevoSyncAt?: string;
  lastActiveAt?: string;
  lastEmailSentAt?: string;
  emailFrequency: EmailAlertFrequency;
  isUnsubscribed: boolean;
  totalEmailsSent: number;
  totalEmailsOpened: number;
  totalEmailsClicked: number;
  totalApplicationsSubmitted: number;
  createdAt: string;
}

export interface CRMEmailLog {
  id: string | number;
  candidateId: string | number;
  candidateEmail: string;
  candidateName: string;
  campaignType: CampaignType;
  templateId?: string;
  emailSubject: string;
  brevoMessageId?: string;
  status: EmailDeliveryStatus;
  recommendedJobIds: number[];
  recommendedJobTitles: string[];
  matchScoreAverage: number;
  sentAt: string;
  openedAt?: string;
  clickedAt?: string;
  convertedAt?: string;
  errorMessage?: string;
}

export interface BrevoContactAttributes {
  FIRSTNAME?: string;
  LASTNAME?: string;
  SKILLS?: string;
  LOCATION?: string;
  JOB_TITLE?: string;
  AI_MATCH_SCORE?: number;
  LIFECYCLE_STAGE?: string;
  LAST_ACTIVE_AT?: string;
  TOTAL_APPLICATIONS?: number;
  JOBSEEKER_UUID?: string;
}

export interface BrevoWebhookPayload {
  event: 'sent' | 'delivered' | 'opened' | 'clicks' | 'hard_bounce' | 'soft_bounce' | 'unsubscribe' | 'spam' | 'blocked';
  email: string;
  'message-id'?: string;
  messageId?: string;
  date?: string;
  ts?: number;
  ts_event?: number;
  tag?: string;
  tags?: string[];
  link?: string;
  reason?: string;
  signature?: string;
}

export interface SkillPerformanceMetric {
  skill: string;
  candidatesCount: number;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface CategoryPerformanceMetric {
  category: string;
  jobsCount: number;
  totalRecommendations: number;
  conversionCount: number;
  conversionRate: number;
}

export interface TemplatePerformanceMetric {
  templateId: string;
  templateName: string;
  emailsSent: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
}

export interface UserLeaderboardItem {
  id: string | number;
  name: string;
  email: string;
  engagementScore: number;
  applicationsCount: number;
  emailsOpened: number;
  emailsClicked: number;
  lastActiveAt: string;
  lifecycleStage: LifecycleStage;
}

export interface CRMAnalyticsSummary {
  totalCandidates: number;
  activeSeekersCount: number;
  syncedToBrevoCount: number;
  avgEngagementScore: number;
  
  // Rates
  totalEmailsSent: number;
  totalDelivered: number;
  totalOpened: number;
  totalClicked: number;
  totalApplicationsConverted: number;
  totalBounced: number;
  totalSpamComplaints: number;
  totalUnsubscribed: number;

  deliveryRatePercentage: number;
  openRatePercentage: number;
  clickRatePercentage: number;
  conversionRatePercentage: number;
  bounceRatePercentage: number;
  spamComplaintRatePercentage: number;
  unsubscribeRatePercentage: number;

  // Breakdown metrics
  topPerformingSkills: SkillPerformanceMetric[];
  topJobCategories: CategoryPerformanceMetric[];
  topTemplates: TemplatePerformanceMetric[];
  mostEngagedUsers: UserLeaderboardItem[];
  mostActiveUsers: UserLeaderboardItem[];

  brevoApiConfigured: boolean;
  brevoHealthStatus: 'HEALTHY' | 'DEGRADED' | 'UNCONFIGURED';
}

export interface QueueJobTask {
  id: string;
  taskType: 'BATCH_CONTACT_SYNC' | 'AI_RECOMMENDATION_DISPATCH' | 'ANALYTICS_RECALCULATION';
  payload: any;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  retryCount: number;
  maxRetries: number;
  createdAt: string;
  processedAt?: string;
  error?: string;
}
