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

// Themes organized by cohort type - empty until real API is wired up
export const cohortThemesByRole: Record<string, CohortThemes> = {};

// Get themes for a specific cohort selection - returns empty until real API
export const getThemesForCohort = (_role: string): CohortThemes => {
  return { positives: [], negatives: [] };
};

// Default/fallback themes
export const DEFAULT_THEMES: CohortThemes = { positives: [], negatives: [] };

