// ============================================
// HIRING MANAGER SURVEY QUESTION MAPPING
// ============================================
// This file defines the official mapping between survey questions (Q1-Q10)
// and their corresponding metric labels used across the application.
//
// IMPORTANT: Use these constants everywhere to ensure consistency.
// Never use raw question numbers (Q1, Q2, etc.) in the UI.
// ============================================

export const HM_METRICS = {
  // ─────────────────────────────────────────────
  // Q1 – HIRING MANAGER NPS
  // Core NPS question - "How likely to recommend TA team?"
  // ─────────────────────────────────────────────
  Q1: {
    id: 'hm-q1-nps',
    label: 'Hiring Manager NPS',
    shortLabel: 'HM NPS',
    questionNumber: 'Q1',
    description: 'How likely are you to recommend our Talent Acquisition / Recruiting team to another hiring manager?',
    type: 'nps' as const,
  },

  // ─────────────────────────────────────────────
  // Q2 – CANDIDATE QUALITY SATISFACTION
  // "How satisfied with overall quality of candidates?"
  // ─────────────────────────────────────────────
  Q2: {
    id: 'hm-q2-candidate-quality',
    label: 'Candidate Quality Satisfaction',
    shortLabel: 'Candidate Quality',
    questionNumber: 'Q2',
    description: 'How satisfied are you with the overall quality of candidates you received?',
    type: 'rating-1-5' as const,
  },

  // ─────────────────────────────────────────────
  // Q3 – ROLE FIT / PROFILE ALIGNMENT
  // "How satisfied with fit of candidates to role profile?"
  // ─────────────────────────────────────────────
  Q3: {
    id: 'hm-q3-role-fit',
    label: 'Role Fit Alignment',
    shortLabel: 'Role Fit',
    questionNumber: 'Q3',
    description: 'How satisfied are you with the fit of candidates to the role profile and requirements?',
    type: 'rating-1-5' as const,
  },

  // ─────────────────────────────────────────────
  // Q4 – PROCESS SPEED SATISFACTION
  // "How satisfied with speed of hiring process?"
  // ─────────────────────────────────────────────
  Q4: {
    id: 'hm-q4-process-speed',
    label: 'Process Speed Satisfaction',
    shortLabel: 'Process Speed',
    questionNumber: 'Q4',
    description: 'How satisfied are you with the speed of the hiring process for this role?',
    type: 'rating-1-5' as const,
  },

  // ─────────────────────────────────────────────
  // Q5 – SCHEDULING & COORDINATION
  // "How smooth was coordination and scheduling?"
  // ─────────────────────────────────────────────
  Q5: {
    id: 'hm-q5-scheduling',
    label: 'Scheduling & Coordination',
    shortLabel: 'Scheduling',
    questionNumber: 'Q5',
    description: 'How smooth was the coordination and scheduling of interviews?',
    type: 'rating-1-5' as const,
  },

  // ─────────────────────────────────────────────
  // Q6 – COMMUNICATION & PARTNERSHIP
  // "How satisfied with clarity, timeliness, transparency of communication?"
  // ─────────────────────────────────────────────
  Q6: {
    id: 'hm-q6-communication',
    label: 'Communication & Partnership',
    shortLabel: 'Communication',
    questionNumber: 'Q6',
    description: 'How satisfied are you with the clarity, timeliness, and transparency of communication from your recruiter / TA partner?',
    type: 'rating-1-5' as const,
  },

  // ─────────────────────────────────────────────
  // Q7 – MARKET GUIDANCE / MARKET INSIGHTS
  // "How helpful was market guidance and talent insights?"
  // ─────────────────────────────────────────────
  Q7: {
    id: 'hm-q7-market-guidance',
    label: 'Market Guidance',
    shortLabel: 'Market Insights',
    questionNumber: 'Q7',
    description: 'How helpful was the market guidance and talent insights provided by your recruiter?',
    type: 'rating-1-5' as const,
  },

  // ─────────────────────────────────────────────
  // Q8, Q9, Q10 – OPEN TEXT (for insights/themes)
  // ─────────────────────────────────────────────
  Q8: {
    id: 'hm-q8-what-worked',
    label: 'What Worked Well',
    shortLabel: 'Positives',
    questionNumber: 'Q8',
    description: 'What worked well in the hiring process for this role?',
    type: 'open-text' as const,
  },
  Q9: {
    id: 'hm-q9-improvements',
    label: 'Improvement Suggestions',
    shortLabel: 'Improvements',
    questionNumber: 'Q9',
    description: 'What one thing should we improve next time you hire for a similar role?',
    type: 'open-text' as const,
  },
  Q10: {
    id: 'hm-q10-additional',
    label: 'Additional Feedback',
    shortLabel: 'Other',
    questionNumber: 'Q10',
    description: 'Any additional feedback or suggestions for the Talent Acquisition team?',
    type: 'open-text' as const,
  },
} as const;

// ============================================
// DASHBOARD METRICS CONFIGURATION
// Defines which metrics appear in the top row of the HM Dashboard
// ============================================
export const HM_DASHBOARD_METRICS = {
  primary: [
    HM_METRICS.Q1, // Hiring Manager NPS
    HM_METRICS.Q2, // Candidate Quality
    HM_METRICS.Q4, // Process Speed
    HM_METRICS.Q6, // Communication & Partnership
  ],
  secondary: [
    HM_METRICS.Q3, // Role Fit
    HM_METRICS.Q5, // Scheduling
    HM_METRICS.Q7, // Market Guidance
  ],
};

// ============================================
// TRENDS PAGE METRICS
// Defines which metrics appear in HM Trends charts
// ============================================
export const HM_TRENDS_METRICS = [
  { metric: HM_METRICS.Q1, color: '#14b8a6', label: 'HM NPS Trend' },
  { metric: HM_METRICS.Q2, color: '#8b5cf6', label: 'Candidate Quality Trend' },
  { metric: HM_METRICS.Q4, color: '#f59e0b', label: 'Process Speed Trend' },
  { metric: HM_METRICS.Q6, color: '#10b981', label: 'Communication Trend' },
  { metric: HM_METRICS.Q3, color: '#ec4899', label: 'Role Fit Trend' },
  { metric: HM_METRICS.Q5, color: '#6366f1', label: 'Scheduling Trend' },
  { metric: HM_METRICS.Q7, color: '#06b6d4', label: 'Market Guidance Trend' },
];

// ============================================
// COHORTS PAGE METRICS
// Defines which metrics appear in HM Cohort tables
// ============================================
export const HM_COHORT_COLUMNS = [
  { key: 'cohortName', label: 'Cohort Name' },
  { key: 'hmNps', label: HM_METRICS.Q1.label, metric: HM_METRICS.Q1 },
  { key: 'candidateQuality', label: HM_METRICS.Q2.label, metric: HM_METRICS.Q2 },
  { key: 'processSpeed', label: HM_METRICS.Q4.label, metric: HM_METRICS.Q4 },
  { key: 'communication', label: HM_METRICS.Q6.label, metric: HM_METRICS.Q6 },
  { key: 'responseRate', label: 'Response Rate' },
  { key: 'surveyCount', label: '# Surveys' },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get the full metric label for a question ID
 * @param questionId - e.g., 'hm-q6-communication'
 * @returns Full label e.g., 'Communication & Partnership'
 */
export function getMetricLabel(questionId: string): string {
  const metric = Object.values(HM_METRICS).find(m => m.id === questionId);
  return metric?.label || questionId;
}

/**
 * Get the short metric label for a question ID
 * @param questionId - e.g., 'hm-q6-communication'
 * @returns Short label e.g., 'Communication'
 */
export function getMetricShortLabel(questionId: string): string {
  const metric = Object.values(HM_METRICS).find(m => m.id === questionId);
  return metric?.shortLabel || questionId;
}

/**
 * Convert question number to full label
 * @param questionNumber - e.g., 'Q6'
 * @returns Full label e.g., 'Communication & Partnership'
 */
export function questionNumberToLabel(questionNumber: string): string {
  const key = questionNumber.toUpperCase() as keyof typeof HM_METRICS;
  return HM_METRICS[key]?.label || questionNumber;
}

export default HM_METRICS;

