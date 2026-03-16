// ============================================
// COHORT ANALYTICS MOCK DATA
// TODO: Replace with real Cohort analytics API (GET /api/cohorts/analytics)
// ============================================

export interface CohortRow {
  id: string;
  name: string;
  medianFeedbackHours: number;
  changeVsPrevious: string;
  nps: number;
  periodLabel: string;
  createdBy: string;
  candidateCount: number;
}

export interface CohortTrendPoint {
  period: string;
  cohort1Nps: number;
  cohort2Nps: number;
}

export interface CohortSelection {
  role: string;
  stage: string;
  period: string;
}

// Dropdown options
export const ROLE_OPTIONS = [
  'All Roles',
  'Engineers',
  'Product Designers',
  'Data Scientists',
  'Product Managers',
];

export const STAGE_OPTIONS = [
  'All Stages',
  'Phone Screen',
  'Technical Interview',
  'Onsite',
  'Final Round',
];

export const PERIOD_OPTIONS = [
  'Last 30 days',
  'Last 3 months',
  'Q4 2024',
  'Q3 2024',
  'YTD',
];

// Generate cohort name from selection
export const generateCohortName = (selection: CohortSelection): string => {
  const role = selection.role === 'All Roles' ? 'All Roles' : selection.role;
  const stage = selection.stage === 'All Stages' ? 'All Stages' : selection.stage;
  const period = selection.period;
  return `${role} – ${stage} (${period})`;
};

// Get candidate count - returns 0 until real API is wired up
export const getMockCandidateCount = (_selection: CohortSelection): number => {
  return 0;
};

// Default comparison cohort
export const DEFAULT_COMPARISON_COHORT: CohortSelection = {
  role: 'Product Designers',
  stage: 'All Stages',
  period: 'Q4 2024',
};

// Generate cohort rows - returns empty until real API is wired up
export const generateMockCohortRows = (
  _primarySelection: CohortSelection,
  _comparisonSelection: CohortSelection = DEFAULT_COMPARISON_COHORT
): CohortRow[] => {
  return [];
};

// Generate trend data - returns empty until real API is wired up
export const generateMockTrendData = (
  _primaryName: string,
  _comparisonName: string
): CohortTrendPoint[] => {
  return [];
};

// Empty state data
export const EMPTY_COHORT_ROWS: CohortRow[] = [];
export const EMPTY_TREND_DATA: CohortTrendPoint[] = [];

