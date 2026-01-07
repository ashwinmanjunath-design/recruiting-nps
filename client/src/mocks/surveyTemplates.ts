// ============================================
// SURVEY TEMPLATES MOCK DATA
// TODO: Replace with real Survey Templates API (GET /api/surveys/templates)
// ============================================

import { SurveyAudience } from '../../../shared/types/enums';

export type QuestionType =
  | "nps"
  | "single-choice"
  | "rating-1-5"
  | "open-text";

export interface SurveyQuestion {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[]; // for single-choice
}

export type SurveyCategory = "Post-Interview" | "Final Round" | "New Hire" | "Hiring Manager" | "Workplace" | "IT Support" | "Custom";

export interface SurveyTemplate {
  id: string;
  name: string;
  category: SurveyCategory;
  audience: SurveyAudience; // Target audience for this template
  description: string;
  recommendedUse: string;
  questions: SurveyQuestion[];
}

export const surveyTemplates: SurveyTemplate[] = [
  // ============================================
  // CANDIDATE SURVEYS (existing)
  // ============================================
  {
    id: "post-interview-general",
    name: "Post-interview – General",
    category: "Post-Interview",
    audience: SurveyAudience.CANDIDATE,
    description:
      "Use after any interview to measure overall candidate experience.",
    recommendedUse: "Send within 24–48 hours after the interview.",
    questions: [
      {
        id: "nps",
        type: "nps",
        text:
          "On a scale of 0–10, how likely are you to recommend our interview process to a friend or colleague?"
      },
      {
        id: "overall-satisfaction",
        type: "single-choice",
        text: "Overall, how satisfied were you with your interview experience?",
        options: [
          "Very satisfied",
          "Satisfied",
          "Neutral",
          "Dissatisfied",
          "Very dissatisfied"
        ]
      },
      {
        id: "process-clarity",
        type: "rating-1-5",
        text: "How clear were the interview steps and expectations?"
      },
      {
        id: "communication",
        type: "rating-1-5",
        text: "How satisfied were you with our communication during the process?"
      },
      {
        id: "fairness",
        type: "rating-1-5",
        text: "How fair did you feel the interview assessment was?"
      },
      {
        id: "like-most",
        type: "open-text",
        text: "What did you like most about the interview process?"
      },
      {
        id: "improve",
        type: "open-text",
        text: "What could we have done better?"
      }
    ]
  },
  {
    id: "post-interview-engineers",
    name: "Post-interview – Engineers",
    category: "Post-Interview",
    audience: SurveyAudience.CANDIDATE,
    description:
      "Focuses on technical depth, realism of interview questions, and fairness for engineering roles.",
    recommendedUse: "Use for all engineering interviews across levels.",
    questions: [
      {
        id: "nps",
        type: "nps",
        text:
          "On a scale of 0–10, how likely are you to recommend our engineering interview process?"
      },
      {
        id: "technical-depth",
        type: "single-choice",
        text: "How appropriate was the level of technical depth?",
        options: ["Too easy", "About right", "Too difficult"]
      },
      {
        id: "realistic-work",
        type: "rating-1-5",
        text:
          "How well did the interview questions reflect the actual work you expect in this role?"
      },
      {
        id: "interviewer-behaviour",
        type: "rating-1-5",
        text:
          "How respectful and professional were the interviewers during your interactions?"
      },
      {
        id: "technical-feedback",
        type: "open-text",
        text:
          "Any feedback on our technical interview format, questions, or interviewers?"
      }
    ]
  },
  {
    id: "final-round-experience",
    name: "Final Round Experience",
    category: "Final Round",
    audience: SurveyAudience.CANDIDATE,
    description:
      "Understands how candidates experienced the overall process and offer stage.",
    recommendedUse:
      "Send after final round or after decision communication (offer or rejection).",
    questions: [
      {
        id: "nps",
        type: "nps",
        text:
          "On a scale of 0–10, how likely are you to recommend interviewing with us to a friend or colleague?"
      },
      {
        id: "offer-clarity",
        type: "rating-1-5",
        text:
          "How clear were the role, level, compensation and location details you received?"
      },
      {
        id: "decision-transparency",
        type: "rating-1-5",
        text:
          "How transparent did you feel we were about the decision-making process and timelines?"
      },
      {
        id: "interviewer-consistency",
        type: "rating-1-5",
        text: "How consistent were the interviews with what was described to you?"
      },
      {
        id: "final-comments",
        type: "open-text",
        text:
          "Is there anything else you would like us to know about your experience?"
      }
    ]
  },
  {
    id: "new-hire-onboarding",
    name: "New Hire Onboarding",
    category: "New Hire",
    audience: SurveyAudience.CANDIDATE,
    description:
      "Checks how new joiners felt about onboarding and early experience.",
    recommendedUse:
      "Use 30–60 days after joining for new hires who accepted offers.",
    questions: [
      {
        id: "onboarding-overall",
        type: "rating-1-5",
        text: "Overall, how would you rate your onboarding experience?"
      },
      {
        id: "onboarding-support",
        type: "rating-1-5",
        text:
          "How supported did you feel by your manager and team during your first weeks?"
      },
      {
        id: "tools-clarity",
        type: "rating-1-5",
        text:
          "How clear were tools, processes and expectations in your first month?"
      },
      {
        id: "onboarding-best",
        type: "open-text",
        text:
          "What worked particularly well in your onboarding that we should keep doing?"
      },
      {
        id: "onboarding-improve",
        type: "open-text",
        text:
          "What could we improve in onboarding for future new joiners in your role?"
      }
    ]
  },

  // ============================================
  // HIRING MANAGER SURVEYS
  // Theme: "How well is Talent Acquisition supporting me to hire great people, efficiently?"
  // 
  // QUESTION MAPPING (Q1-Q10):
  // Q1 – Hiring Manager NPS
  // Q2 – Candidate Quality Satisfaction
  // Q3 – Role Fit / Profile Alignment
  // Q4 – Process Speed Satisfaction
  // Q5 – Scheduling & Coordination
  // Q6 – Communication & Partnership
  // Q7 – Market Guidance / Market Insights
  // Q8, Q9, Q10 – Open text (for insights/theme extraction)
  // ============================================
  {
    id: "hiring-manager-experience",
    name: "Hiring Manager – Recruitment Experience Survey",
    category: "Hiring Manager",
    audience: SurveyAudience.HIRING_MANAGER,
    description:
      "Measures how well Talent Acquisition is supporting hiring managers to hire great people efficiently. Covers candidate quality, speed, communication, market guidance, and partnership.",
    recommendedUse:
      "Send after a role is filled/closed or at the end of a hiring cycle. Can also be sent quarterly to active hiring managers.",
    questions: [
      // ─────────────────────────────────────────────
      // Q1 – HIRING MANAGER NPS (Core metric)
      // ─────────────────────────────────────────────
      {
        id: "hm-q1-nps",
        type: "nps",
        text: "How likely are you to recommend our Talent Acquisition / Recruiting team to another hiring manager at Omio?"
      },
      // ─────────────────────────────────────────────
      // Q2 – CANDIDATE QUALITY SATISFACTION
      // ─────────────────────────────────────────────
      {
        id: "hm-q2-candidate-quality",
        type: "rating-1-5",
        text: "How satisfied are you with the overall quality of candidates you received?"
      },
      // ─────────────────────────────────────────────
      // Q3 – ROLE FIT / PROFILE ALIGNMENT
      // ─────────────────────────────────────────────
      {
        id: "hm-q3-role-fit",
        type: "rating-1-5",
        text: "How satisfied are you with the fit of candidates to the role profile and requirements?"
      },
      // ─────────────────────────────────────────────
      // Q4 – PROCESS SPEED SATISFACTION
      // ─────────────────────────────────────────────
      {
        id: "hm-q4-process-speed",
        type: "rating-1-5",
        text: "How satisfied are you with the speed of the hiring process for this role?"
      },
      // ─────────────────────────────────────────────
      // Q5 – SCHEDULING & COORDINATION
      // ─────────────────────────────────────────────
      {
        id: "hm-q5-scheduling",
        type: "rating-1-5",
        text: "How smooth was the coordination and scheduling of interviews?"
      },
      // ─────────────────────────────────────────────
      // Q6 – COMMUNICATION & PARTNERSHIP
      // ─────────────────────────────────────────────
      {
        id: "hm-q6-communication",
        type: "rating-1-5",
        text: "How satisfied are you with the clarity, timeliness, and transparency of communication from your recruiter / TA partner?"
      },
      // ─────────────────────────────────────────────
      // Q7 – MARKET GUIDANCE / MARKET INSIGHTS
      // ─────────────────────────────────────────────
      {
        id: "hm-q7-market-guidance",
        type: "rating-1-5",
        text: "How helpful was the market guidance and talent insights provided by your recruiter (e.g., salary benchmarks, candidate availability, competitor landscape)?"
      },
      // ─────────────────────────────────────────────
      // Q8, Q9, Q10 – OPEN TEXT (for insights/themes)
      // ─────────────────────────────────────────────
      {
        id: "hm-q8-what-worked",
        type: "open-text",
        text: "What worked well in the hiring process for this role?"
      },
      {
        id: "hm-q9-improvements",
        type: "open-text",
        text: "What one thing should we improve next time you hire for a similar role?"
      },
      {
        id: "hm-q10-additional",
        type: "open-text",
        text: "Any additional feedback or suggestions for the Talent Acquisition team?"
      }
    ]
  },

  // ============================================
  // WORKPLACE SURVEYS
  // Theme: "How do employees feel about workplace & environment?"
  // ============================================
  {
    id: "workplace-experience",
    name: "Workplace Experience Survey",
    category: "Workplace",
    audience: SurveyAudience.WORKPLACE,
    description:
      "Measures employee satisfaction with office facilities, remote work setup, onboarding, and company culture. Helps identify what people love and dislike about the workplace.",
    recommendedUse:
      "Send quarterly to all employees, or after major office/policy changes. Also useful for new hires at 30/60/90 days.",
    questions: [
      // ─────────────────────────────────────────────
      // CORE NPS QUESTION (Workplace NPS)
      // ─────────────────────────────────────────────
      {
        id: "wp-nps",
        type: "nps",
        text: "How likely are you to recommend Omio as a great place to work to a friend or colleague?"
      },
      // ─────────────────────────────────────────────
      // OFFICE FACILITIES
      // ─────────────────────────────────────────────
      {
        id: "wp-office-facilities",
        type: "rating-1-5",
        text: "How satisfied are you with the office facilities (desk, meeting rooms, common areas)?"
      },
      {
        id: "wp-office-amenities",
        type: "rating-1-5",
        text: "How satisfied are you with office amenities (kitchen, snacks, coffee, quiet spaces)?"
      },
      // ─────────────────────────────────────────────
      // REMOTE SETUP / FLEXIBILITY
      // ─────────────────────────────────────────────
      {
        id: "wp-remote-setup",
        type: "rating-1-5",
        text: "How satisfied are you with the support for remote/hybrid work setup?"
      },
      {
        id: "wp-flexibility",
        type: "rating-1-5",
        text: "How satisfied are you with the flexibility in where and when you work?"
      },
      // ─────────────────────────────────────────────
      // ONBOARDING & FIRST 90 DAYS
      // ─────────────────────────────────────────────
      {
        id: "wp-onboarding",
        type: "rating-1-5",
        text: "How supported did you feel during your first 90 days at Omio?"
      },
      {
        id: "wp-culture-fit",
        type: "rating-1-5",
        text: "How well do you feel you fit with the company culture and values?"
      },
      // ─────────────────────────────────────────────
      // OPEN TEXT
      // ─────────────────────────────────────────────
      {
        id: "wp-what-you-love",
        type: "open-text",
        text: "What do you love most about working at Omio?"
      },
      {
        id: "wp-what-to-improve",
        type: "open-text",
        text: "What one thing would most improve your workplace experience?"
      }
    ]
  },

  // ============================================
  // IT SUPPORT SURVEYS
  // Theme: "IT Onboarding & Tools - Were systems ready on day 1?"
  // ============================================
  {
    id: "it-support-experience",
    name: "IT Support Experience Survey",
    category: "IT Support",
    audience: SurveyAudience.IT_SUPPORT,
    description:
      "Measures IT onboarding readiness, system access, equipment setup, and support quality. Helps IT team understand day-1 readiness and issue resolution effectiveness.",
    recommendedUse:
      "Send within the first week of a new hire's start date, or after an IT support ticket is resolved.",
    questions: [
      // ─────────────────────────────────────────────
      // CORE NPS QUESTION (IT Support NPS)
      // ─────────────────────────────────────────────
      {
        id: "it-nps",
        type: "nps",
        text: "How likely are you to recommend our IT support team to a colleague?"
      },
      // ─────────────────────────────────────────────
      // DAY-1 READINESS
      // ─────────────────────────────────────────────
      {
        id: "it-day1-readiness",
        type: "rating-1-5",
        text: "How ready were your laptop, accounts, and tools on your first day?"
      },
      {
        id: "it-system-access",
        type: "rating-1-5",
        text: "How quickly did you receive access to all necessary systems?"
      },
      // ─────────────────────────────────────────────
      // EQUIPMENT & SETUP
      // ─────────────────────────────────────────────
      {
        id: "it-equipment-quality",
        type: "rating-1-5",
        text: "How satisfied are you with the quality of your laptop and equipment?"
      },
      {
        id: "it-software-setup",
        type: "rating-1-5",
        text: "How satisfied are you with the software and tools pre-installed on your machine?"
      },
      // ─────────────────────────────────────────────
      // SUPPORT & ISSUE RESOLUTION
      // ─────────────────────────────────────────────
      {
        id: "it-response-time",
        type: "rating-1-5",
        text: "How satisfied are you with IT's response time when you needed help?"
      },
      {
        id: "it-resolution-quality",
        type: "rating-1-5",
        text: "How effectively did IT resolve your issues or requests?"
      },
      // ─────────────────────────────────────────────
      // OPEN TEXT
      // ─────────────────────────────────────────────
      {
        id: "it-what-worked",
        type: "open-text",
        text: "What worked well in your IT onboarding or support experience?"
      },
      {
        id: "it-what-to-improve",
        type: "open-text",
        text: "What one thing should IT improve for the next new hire?"
      }
    ]
  }
];

// Category options for filtering
export const SURVEY_CATEGORIES = ['Post-Interview', 'Final Round', 'New Hire', 'Hiring Manager', 'Workplace', 'IT Support', 'Custom'] as const;

// Audience options with labels for UI
export const SURVEY_AUDIENCE_OPTIONS = [
  { value: SurveyAudience.CANDIDATE, label: 'Candidate Survey' },
  { value: SurveyAudience.HIRING_MANAGER, label: 'Hiring Manager Survey' },
  { value: SurveyAudience.WORKPLACE, label: 'Workplace Survey' },
  { value: SurveyAudience.IT_SUPPORT, label: 'IT Team Survey' },
] as const;

// Get template by ID
export const getTemplateById = (id: string): SurveyTemplate | undefined => {
  return surveyTemplates.find(t => t.id === id);
};

// Get templates by category
export const getTemplatesByCategory = (category: string): SurveyTemplate[] => {
  if (category === 'All') return surveyTemplates;
  return surveyTemplates.filter(t => t.category === category);
};

// Get templates by audience
export const getTemplatesByAudience = (audience: SurveyAudience): SurveyTemplate[] => {
  return surveyTemplates.filter(t => t.audience === audience);
};

// Get templates by category and audience
export const getTemplatesByCategoryAndAudience = (
  category: string, 
  audience?: SurveyAudience
): SurveyTemplate[] => {
  let filtered = surveyTemplates;
  
  if (category !== 'All') {
    filtered = filtered.filter(t => t.category === category);
  }
  
  if (audience) {
    filtered = filtered.filter(t => t.audience === audience);
  }
  
  return filtered;
};

