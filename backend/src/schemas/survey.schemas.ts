import { z } from 'zod';
import { validateEmail, sanitizeString, sanitizeEmailHeader } from '../utils/validation';

/**
 * Survey Audience enum values
 * Represents different internal stakeholders providing feedback
 */
export const SurveyAudienceEnum = z.enum([
  'CANDIDATE',      // Candidates going through interview process
  'HIRING_MANAGER', // Hiring managers providing feedback on recruiting
  'WORKPLACE',      // Workplace experience (HR, culture, environment)
  'IT_SUPPORT'      // IT team feedback (system access, onboarding, tools)
]);

export type SurveyAudienceType = z.infer<typeof SurveyAudienceEnum>;

/**
 * Survey send request schema with comprehensive validation
 */
export const surveySendSchema = z.object({
  surveyName: z
    .string()
    .min(1, 'Survey name is required')
    .max(200, 'Survey name too long')
    .transform(sanitizeString),
  fromEmail: z
    .string()
    .email('Invalid email format')
    .refine(
      (email) => {
        const validation = validateEmail(email);
        return validation.valid;
      },
      { message: 'fromEmail must be from an allowed domain' }
    )
    .transform((email) => sanitizeEmailHeader(email.toLowerCase().trim())),
  recipients: z
    .array(z.string().email('Invalid email format'))
    .min(1, 'At least one recipient is required')
    .max(500, 'Too many recipients (max 500)')
    .refine(
      (emails) => {
        return emails.every((email) => {
          const validation = validateEmail(email);
          return validation.valid;
        });
      },
      { message: 'All recipients must be from allowed domains' }
    )
    .transform((emails) => emails.map((e) => sanitizeEmailHeader(e.toLowerCase().trim()))),
  audience: SurveyAudienceEnum.optional().default('CANDIDATE'),
  targetCohort: z.string().optional().nullable(),
  sendImmediately: z.boolean().optional().default(false),
  subject: z
    .string()
    .max(200, 'Subject too long')
    .optional()
    .transform((val) => (val ? sanitizeEmailHeader(val) : undefined)),
});

/**
 * Survey creation schema
 */
export const createSurveySchema = z.object({
  survey: z.object({
    name: z.string().min(1).max(200).transform(sanitizeString),
    templateId: z.string().optional(),
    audience: SurveyAudienceEnum.optional().default('CANDIDATE'),
  }),
  email: z.object({
    sendMode: z.enum(['cohort', 'individual', 'bulk']),
    recipients: z
      .array(
        z.object({
          email: z.string().email(),
          name: z.string().optional(),
        })
      )
      .optional(),
    fromEmail: z
      .string()
      .email()
      .refine(
        (email) => {
          const validation = validateEmail(email);
          return validation.valid;
        },
        { message: 'fromEmail must be from an allowed domain' }
      )
      .transform((email) => sanitizeEmailHeader(email.toLowerCase().trim())),
    subject: z.string().max(200).optional().transform((val) => (val ? sanitizeEmailHeader(val) : undefined)),
    sendImmediately: z.boolean().default(false),
    cohortFilter: z.any().optional(),
  }),
});

/**
 * Survey distribution schema
 */
export const distributeSurveySchema = z.object({
  templateId: z.string().min(1),
  candidateIds: z.array(z.string()).optional(),
  cohortId: z.string().optional(),
  channel: z.enum(['email', 'sms', 'both']),
  scheduleFor: z.string().datetime().optional(),
});

/**
 * Survey template schema
 */
export const surveyTemplateSchema = z.object({
  name: z.string().min(1).max(200).transform(sanitizeString),
  description: z.string().max(1000).optional().transform((val) => (val ? sanitizeString(val) : undefined)),
  audience: SurveyAudienceEnum.optional().default('CANDIDATE'),
  questions: z
    .array(
      z.object({
        type: z.enum(['NPS', 'TEXT', 'RATING', 'MULTIPLE_CHOICE']),
        question: z.string().min(1).max(500).transform(sanitizeString),
        required: z.boolean().optional(),
        options: z.array(z.string().max(200).transform(sanitizeString)).optional(),
      })
    )
    .min(1, 'At least one question is required'),
});

/**
 * Dashboard/Analytics filter schema with audience support
 */
export const dashboardFilterSchema = z.object({
  audience: SurveyAudienceEnum.optional().default('CANDIDATE'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  cohort: z.string().optional(),
  role: z.string().optional(),
  region: z.string().optional(),
});

