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

// Generate mock candidate count based on selection
export const getMockCandidateCount = (selection: CohortSelection): number => {
  // Simulate different counts based on filters
  let base = 150;
  if (selection.role === 'Engineers') base = 220;
  if (selection.role === 'Product Designers') base = 85;
  if (selection.role === 'Data Scientists') base = 65;
  if (selection.stage === 'Final Round') base = Math.floor(base * 0.3);
  if (selection.stage === 'Phone Screen') base = Math.floor(base * 1.5);
  if (selection.period === 'Last 30 days') base = Math.floor(base * 0.4);
  return base + Math.floor(Math.random() * 30);
};

// Default comparison cohort
export const DEFAULT_COMPARISON_COHORT: CohortSelection = {
  role: 'Product Designers',
  stage: 'All Stages',
  period: 'Q4 2024',
};

// Generate mock cohort rows for comparison table
export const generateMockCohortRows = (
  primarySelection: CohortSelection,
  comparisonSelection: CohortSelection = DEFAULT_COMPARISON_COHORT
): CohortRow[] => {
  return [
    {
      id: 'primary',
      name: generateCohortName(primarySelection),
      medianFeedbackHours: 18 + Math.floor(Math.random() * 8),
      changeVsPrevious: '+5%',
      nps: 72 + Math.floor(Math.random() * 10),
      periodLabel: primarySelection.period,
      createdBy: 'Primary',  // The cohort you built using the filters above
      candidateCount: getMockCandidateCount(primarySelection),
    },
    {
      id: 'comparison',
      name: generateCohortName(comparisonSelection),
      medianFeedbackHours: 22 + Math.floor(Math.random() * 6),
      changeVsPrevious: '-2%',
      nps: 65 + Math.floor(Math.random() * 8),
      periodLabel: comparisonSelection.period,
      createdBy: 'Comparison',  // Baseline cohort for comparison
      candidateCount: getMockCandidateCount(comparisonSelection),
    },
  ];
};

// Generate mock trend data for visual comparison chart
export const generateMockTrendData = (
  primaryName: string,
  comparisonName: string
): CohortTrendPoint[] => {
  // Generate 6 months of mock data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  
  // Base NPS values with slight variation
  let cohort1Base = 68;
  let cohort2Base = 62;
  
  return months.map((month, idx) => {
    // Add some trend and randomness
    cohort1Base += Math.floor(Math.random() * 4) - 1;
    cohort2Base += Math.floor(Math.random() * 3) - 1;
    
    return {
      period: month,
      cohort1Nps: Math.min(85, Math.max(55, cohort1Base + idx * 1.5)),
      cohort2Nps: Math.min(80, Math.max(50, cohort2Base + idx * 0.8)),
    };
  });
};

// Empty state data
export const EMPTY_COHORT_ROWS: CohortRow[] = [];
export const EMPTY_TREND_DATA: CohortTrendPoint[] = [];

