// ============================================
// COHORT FEEDBACK THEMES MOCK DATA
// TODO: Replace with real Feedback Themes API (GET /api/cohorts/:id/themes)
// ============================================

export type ThemeLevel = 'High' | 'Medium' | 'Low';

export interface ThemeItem {
  id: string;
  label: string;
  level: ThemeLevel;
}

export interface CohortThemes {
  positives: ThemeItem[];
  negatives: ThemeItem[];
}

// Themes organized by cohort type (role-based)
export const cohortThemesByRole: Record<string, CohortThemes> = {
  'Engineers': {
    positives: [
      { id: 'eng-pos-1', label: 'Technical Interview Depth', level: 'High' },
      { id: 'eng-pos-2', label: 'Clear Problem Statements', level: 'High' },
      { id: 'eng-pos-3', label: 'Interviewer Technical Knowledge', level: 'Medium' },
      { id: 'eng-pos-4', label: 'Code Review Feedback Quality', level: 'Medium' },
    ],
    negatives: [
      { id: 'eng-neg-1', label: 'Long Wait Between Rounds', level: 'High' },
      { id: 'eng-neg-2', label: 'Unclear Role Expectations', level: 'Medium' },
      { id: 'eng-neg-3', label: 'Limited System Design Discussion', level: 'Low' },
    ],
  },
  'Product Designers': {
    positives: [
      { id: 'des-pos-1', label: 'Portfolio Review Process', level: 'High' },
      { id: 'des-pos-2', label: 'Design Challenge Clarity', level: 'Medium' },
      { id: 'des-pos-3', label: 'Cultural Fit Emphasis', level: 'Medium' },
    ],
    negatives: [
      { id: 'des-neg-1', label: 'Unclear Evaluation Criteria', level: 'High' },
      { id: 'des-neg-2', label: 'Limited Team Interaction', level: 'Medium' },
      { id: 'des-neg-3', label: 'Rushed Presentations', level: 'Low' },
    ],
  },
  'Data Scientists': {
    positives: [
      { id: 'ds-pos-1', label: 'Real-World Problem Cases', level: 'High' },
      { id: 'ds-pos-2', label: 'Technical Discussion Quality', level: 'High' },
      { id: 'ds-pos-3', label: 'ML Infrastructure Questions', level: 'Medium' },
    ],
    negatives: [
      { id: 'ds-neg-1', label: 'Overly Academic Focus', level: 'Medium' },
      { id: 'ds-neg-2', label: 'Lack of Business Context', level: 'Medium' },
      { id: 'ds-neg-3', label: 'Whiteboard Coding Pressure', level: 'Low' },
    ],
  },
  'Product Managers': {
    positives: [
      { id: 'pm-pos-1', label: 'Product Sense Questions', level: 'High' },
      { id: 'pm-pos-2', label: 'Cross-Functional Exposure', level: 'Medium' },
      { id: 'pm-pos-3', label: 'Strategy Discussion Depth', level: 'Medium' },
    ],
    negatives: [
      { id: 'pm-neg-1', label: 'Vague Success Metrics', level: 'High' },
      { id: 'pm-neg-2', label: 'Limited Engineering Interaction', level: 'Medium' },
    ],
  },
  'All Roles': {
    positives: [
      { id: 'all-pos-1', label: 'Professional Communication', level: 'High' },
      { id: 'all-pos-2', label: 'Timely Scheduling', level: 'Medium' },
      { id: 'all-pos-3', label: 'Transparent Process', level: 'Medium' },
    ],
    negatives: [
      { id: 'all-neg-1', label: 'Slow Feedback Turnaround', level: 'High' },
      { id: 'all-neg-2', label: 'Inconsistent Interviewer Prep', level: 'Medium' },
      { id: 'all-neg-3', label: 'Generic Rejection Emails', level: 'Low' },
    ],
  },
};

// Get themes for a specific cohort selection
export const getThemesForCohort = (role: string): CohortThemes => {
  // Try exact match first
  if (cohortThemesByRole[role]) {
    return cohortThemesByRole[role];
  }
  
  // Check if role contains any known role type
  for (const key of Object.keys(cohortThemesByRole)) {
    if (role.includes(key) || key.includes(role)) {
      return cohortThemesByRole[key];
    }
  }
  
  // Fall back to "All Roles" themes
  return cohortThemesByRole['All Roles'];
};

// Default/fallback themes
export const DEFAULT_THEMES: CohortThemes = cohortThemesByRole['All Roles'];

