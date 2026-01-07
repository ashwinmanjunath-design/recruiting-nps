import { SurveyStatus, SurveyTrigger, QuestionType, Sentiment, SurveyAudience } from '../enums';

export interface SurveyTemplate {
  id: string;
  name: string;
  description?: string;
  trigger: SurveyTrigger;
  audience: SurveyAudience;
  delayDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  templateId: string;
  question: string;
  type: QuestionType;
  isNPS: boolean;
  isRequired: boolean;
  scaleMin?: number;
  scaleMax?: number;
  options?: string[];
  order: number;
  createdAt: string;
}

export interface Survey {
  id: string;
  token: string;
  candidateId: string;
  jobId?: string;
  templateId: string;
  audience: SurveyAudience;
  createdBy?: string;
  sentAt?: string;
  scheduledFor?: string;
  respondedAt?: string;
  expiresAt: string;
  status: SurveyStatus;
  sendViaEmail: boolean;
  sendViaSMS: boolean;
  reminderSent: boolean;
  metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  candidateId: string;
  questionId: string;
  audience: SurveyAudience;
  score?: number;
  text?: string;
  sentiment?: Sentiment;
  createdAt: string;
}

// ============================================
// SURVEY RECIPIENT TYPES
// ============================================

export type SurveyRecipient =
  | {
      type: 'candidate';
      candidateId: string; // from your DB / SmartRecruiters
      email: string;
      name?: string;
      role?: string; // e.g. "Backend Engineer"
    }
  | {
      type: 'manual';
      email: string;
      name?: string; // optional if you want
    };

// ============================================
// CREATE SURVEY PAYLOAD TYPES
// ============================================

export type SurveySendMode = 'cohort' | 'individual' | 'bulk';

export interface CohortFilter {
  role?: string;
  stage?: string;
  region?: string;
}

export interface CreateSurveyPayload {
  survey: {
    name: string;
    targetCohort: string;
    templateId: string | null;
    audience?: SurveyAudience; // Survey audience type (default: CANDIDATE)
    questionSetVersion?: string; // future-proof: store meta about questions versioning
  };
  email: {
    subject: string;
    fromEmail: string;
    sendMode: SurveySendMode;
    recipients: SurveyRecipient[];
    cohortFilter?: CohortFilter | null;
    sendImmediately: boolean;
    scheduledAt: string | null; // ISO 8601, e.g. "2025-12-03T10:00:00Z"
  };
}

export interface CreateSurveyResponse {
  surveyId: string;
  status: 'draft' | 'scheduled' | 'sending';
  sendMode: SurveySendMode;
  recipientCount: number;
}

