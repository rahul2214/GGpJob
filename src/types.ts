export enum NotificationType {
  // Seekers
  APPLICATION_STATUS = 'application_status',
  REFERRAL_ACCEPTED = 'referral_accepted',
  NEW_JOB_MATCH = 'new_job_match',
  ATS_SCORE_READY = 'ats_score_ready',
  CREDITS_ADDED = 'credits_added',

  // Employees / Referrers
  REFERRAL_SHORTLISTED = 'referral_shortlisted',
  REFERRAL_HIRED = 'referral_hired',
  REWARD_CREDITED = 'reward_credited',
  NEW_JOB_FOR_REFERRAL = 'new_job_for_referral',
  LEADERBOARD_RANK_CHANGE = 'leaderboard_rank_change',

  // Recruiters
  NEW_APPLICATION = 'new_application',
  JOB_EXPIRING = 'job_expiring',
  CREDITS_LOW = 'credits_low',

  // Admins
  NEW_COMPANY = 'new_company',
  NEW_RECRUITER = 'new_recruiter',
  PAYMENT_RECEIVED = 'payment_received',
  FRAUD_ALERT = 'fraud_alert'
}

export interface NotificationPayload {
  route: string; // Used for deep linking via expo-router
  type: NotificationType;
  [key: string]: any;
}

export interface NotificationPreferences {
  job_alerts: boolean;
  referral_updates: boolean;
  rewards: boolean;
  leaderboard: boolean;
  interview_reminders: boolean;
}
