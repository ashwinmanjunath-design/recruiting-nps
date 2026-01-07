// ============================================
// HIRING MANAGER DASHBOARD MOCK DATA
// ============================================
// This file contains mock data for the Hiring Manager quarterly dashboard.
// Replace with real API calls when backend is ready.
// ============================================

// ─────────────────────────────────────────────────────────────────────────────
// YEARLY NPS DATA (Historical)
// ─────────────────────────────────────────────────────────────────────────────
export interface YearlyNpsData {
  year: number;
  nps: number;
  responded: number;
  sent: number;
  responseRate: number;
  change?: number; // vs previous year
}

export const YEARLY_NPS_DATA: YearlyNpsData[] = [
  { year: 2023, nps: 52, responded: 156, sent: 245, responseRate: 64, change: 0 },
  { year: 2024, nps: 61, responded: 198, sent: 278, responseRate: 71, change: 9 },
  { year: 2025, nps: 68, responded: 197, sent: 283, responseRate: 70, change: 7 },  // Current year
  { year: 2026, nps: 0, responded: 0, sent: 0, responseRate: 0, change: 0 },        // Future - no data yet
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION A: Quarterly NPS Snapshot (Q1-Q4 for current year)
// ─────────────────────────────────────────────────────────────────────────────
export interface QuarterlyNpsData {
  quarter: string;
  nps: number;
  responded: number;
  sent: number;
  change?: number; // vs previous quarter
}

export const QUARTERLY_NPS_DATA: QuarterlyNpsData[] = [
  { quarter: 'Q1', nps: 58, responded: 42, sent: 65, change: 0 },
  { quarter: 'Q2', nps: 64, responded: 51, sent: 72, change: 6 },
  { quarter: 'Q3', nps: 71, responded: 48, sent: 68, change: 7 },
  { quarter: 'Q4', nps: 68, responded: 56, sent: 78, change: -3 },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION B: Trend Line Data (Quarterly & Yearly)
// ─────────────────────────────────────────────────────────────────────────────
export interface TrendPoint {
  period: string;
  nps: number;
  responseRate: number;
}

export const QUARTERLY_TREND_DATA: TrendPoint[] = [
  { period: 'Q1', nps: 58, responseRate: 65 },
  { period: 'Q2', nps: 64, responseRate: 71 },
  { period: 'Q3', nps: 71, responseRate: 71 },
  { period: 'Q4', nps: 68, responseRate: 72 },
];

export const YEARLY_TREND_DATA: TrendPoint[] = [
  { period: '2023', nps: 52, responseRate: 64 },
  { period: '2024', nps: 61, responseRate: 71 },
  { period: '2025', nps: 68, responseRate: 70 },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION C: Location Overview (6 regions)
// ─────────────────────────────────────────────────────────────────────────────
export interface LocationNpsData {
  region: string;
  regionCode: string;
  nps: number;
  responded: number;
  sent: number;
  trend: 'up' | 'down' | 'stable';
}

export const LOCATION_NPS_DATA: LocationNpsData[] = [
  { region: 'Berlin', regionCode: 'DE', nps: 72, responded: 28, sent: 38, trend: 'up' },
  { region: 'Prague', regionCode: 'CZ', nps: 65, responded: 18, sent: 24, trend: 'stable' },
  { region: 'United Kingdom', regionCode: 'UK', nps: 58, responded: 22, sent: 32, trend: 'down' },
  { region: 'Bengaluru', regionCode: 'IN', nps: 78, responded: 35, sent: 42, trend: 'up' },
  { region: 'Singapore', regionCode: 'SG', nps: 61, responded: 12, sent: 18, trend: 'stable' },
  { region: 'Brazil', regionCode: 'BR', nps: 54, responded: 8, sent: 14, trend: 'down' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION D: Recruiter Performance (HM satisfaction per recruiter)
// ─────────────────────────────────────────────────────────────────────────────
export interface RecruiterPerformanceData {
  name: string;
  nps: number;
  surveysCompleted: number;
  trend: 'up' | 'down' | 'stable';
  avgResponseTime: string;
}

export const RECRUITER_PERFORMANCE_DATA: RecruiterPerformanceData[] = [
  { name: 'Alina Musuroaea', nps: 82, surveysCompleted: 34, trend: 'up', avgResponseTime: '3.8 min' },
  { name: 'Arisa Ikeda', nps: 76, surveysCompleted: 28, trend: 'stable', avgResponseTime: '4.1 min' },
  { name: 'Ashwin Manjunath', nps: 71, surveysCompleted: 42, trend: 'up', avgResponseTime: '3.5 min' },
  { name: 'Paul Marsh', nps: 68, surveysCompleted: 31, trend: 'down', avgResponseTime: '4.6 min' },
  { name: 'Prapti Shah', nps: 74, surveysCompleted: 36, trend: 'up', avgResponseTime: '3.9 min' },
  { name: 'Zuzana Brozova', nps: 79, surveysCompleted: 26, trend: 'stable', avgResponseTime: '4.2 min' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: Insights Summary (Strengths & Opportunities)
// Derived from Q8-Q10 open text analysis
// ─────────────────────────────────────────────────────────────────────────────
export interface InsightItem {
  text: string;
  count: number; // mentions
  metric?: string; // related metric (Q1-Q7)
}

export const HM_STRENGTHS: InsightItem[] = [
  { text: 'Strong recruiter partnership and collaboration', count: 34, metric: 'Communication & Partnership' },
  { text: 'Good candidate quality for technical roles', count: 28, metric: 'Candidate Quality' },
  { text: 'Clear and timely communication updates', count: 25, metric: 'Communication & Partnership' },
  { text: 'Smooth interview scheduling process', count: 22, metric: 'Scheduling & Coordination' },
];

export const HM_OPPORTUNITIES: InsightItem[] = [
  { text: 'Speed up screening to onsite timeline', count: 31, metric: 'Process Speed' },
  { text: 'Improve senior role candidate quality', count: 24, metric: 'Candidate Quality' },
  { text: 'More market insights and salary benchmarking', count: 19, metric: 'Market Guidance' },
  { text: 'Better role profile alignment discussions', count: 15, metric: 'Role Fit' },
];

// ─────────────────────────────────────────────────────────────────────────────
// SECTION E: HM Response Overview
// ─────────────────────────────────────────────────────────────────────────────
export interface HmResponseOverview {
  totalSent: number;
  totalResponded: number;
  responseRate: number;
  avgCompletionTime: string;
}

export const HM_RESPONSE_OVERVIEW: HmResponseOverview = {
  totalSent: 283,
  totalResponded: 197,
  responseRate: 70,
  avgCompletionTime: '4.2 min',
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get NPS color based on score band
 * 70+ = Excellent (teal)
 * 50-69 = Good (green)
 * 30-49 = Fair (amber)
 * <30 = Poor (red)
 */
export function getNpsColor(nps: number): string {
  if (nps >= 70) return '#14b8a6'; // teal-500
  if (nps >= 50) return '#10b981'; // emerald-500
  if (nps >= 30) return '#f59e0b'; // amber-500
  return '#ef4444'; // red-500
}

/**
 * Get NPS background color (lighter shade)
 */
export function getNpsBgColor(nps: number): string {
  if (nps >= 70) return '#ccfbf1'; // teal-100
  if (nps >= 50) return '#d1fae5'; // emerald-100
  if (nps >= 30) return '#fef3c7'; // amber-100
  return '#fee2e2'; // red-100
}

/**
 * Get NPS label based on score band
 */
export function getNpsLabel(nps: number): string {
  if (nps >= 70) return 'Excellent';
  if (nps >= 50) return 'Good';
  if (nps >= 30) return 'Fair';
  return 'Needs Improvement';
}

/**
 * Calculate current year total NPS (average of Q1-Q4)
 */
export function getYearlyNps(): number {
  const total = QUARTERLY_NPS_DATA.reduce((sum, q) => sum + q.nps, 0);
  return Math.round(total / QUARTERLY_NPS_DATA.length);
}

/**
 * Get the latest quarter data
 */
export function getLatestQuarter(): QuarterlyNpsData {
  return QUARTERLY_NPS_DATA[QUARTERLY_NPS_DATA.length - 1];
}

export default {
  QUARTERLY_NPS_DATA,
  QUARTERLY_TREND_DATA,
  LOCATION_NPS_DATA,
  RECRUITER_PERFORMANCE_DATA,
  HM_STRENGTHS,
  HM_OPPORTUNITIES,
  HM_RESPONSE_OVERVIEW,
};

