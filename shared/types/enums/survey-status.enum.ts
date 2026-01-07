export enum SurveyStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  SENT = 'SENT',
  OPENED = 'OPENED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED'
}

export enum SurveyTrigger {
  POST_APPLICATION = 'POST_APPLICATION',
  POST_SCREEN = 'POST_SCREEN',
  POST_INTERVIEW = 'POST_INTERVIEW',
  POST_OFFER = 'POST_OFFER',
  POST_REJECTION = 'POST_REJECTION',
  MANUAL = 'MANUAL'
}

/**
 * Survey Audience Types
 * Represents different internal stakeholders providing feedback
 */
export enum SurveyAudience {
  CANDIDATE = 'CANDIDATE',           // Candidates going through interview process
  HIRING_MANAGER = 'HIRING_MANAGER', // Hiring managers providing feedback on recruiting
  WORKPLACE = 'WORKPLACE',           // Workplace experience (HR, culture, environment)
  IT_SUPPORT = 'IT_SUPPORT'          // IT team feedback (system access, onboarding, tools)
}

/**
 * Audience display labels for UI
 */
export const SurveyAudienceLabels: Record<SurveyAudience, string> = {
  [SurveyAudience.CANDIDATE]: 'Candidate Survey',
  [SurveyAudience.HIRING_MANAGER]: 'Hiring Manager Survey',
  [SurveyAudience.WORKPLACE]: 'Workplace Survey',
  [SurveyAudience.IT_SUPPORT]: 'IT Team Survey'
};

/**
 * Audience badge colors for UI
 */
export const SurveyAudienceColors: Record<SurveyAudience, { bg: string; text: string }> = {
  [SurveyAudience.CANDIDATE]: { bg: 'bg-teal-100', text: 'text-teal-700' },
  [SurveyAudience.HIRING_MANAGER]: { bg: 'bg-purple-100', text: 'text-purple-700' },
  [SurveyAudience.WORKPLACE]: { bg: 'bg-amber-100', text: 'text-amber-700' },
  [SurveyAudience.IT_SUPPORT]: { bg: 'bg-blue-100', text: 'text-blue-700' }
};

export enum QuestionType {
  NPS_SCALE = 'NPS_SCALE',
  TEXT = 'TEXT',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  RATING = 'RATING',
  YES_NO = 'YES_NO'
}

export enum Sentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE'
}

