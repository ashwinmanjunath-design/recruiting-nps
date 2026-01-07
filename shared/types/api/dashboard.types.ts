export interface DashboardOverviewResponse {
  totalInvitations: number;
  responseRate: number;
  responseRateChange: number;
  npsScore: number;
  npsChange: number;
  npsPercentageChange: number;
  medianTimeToFeedback: number;
  breakdown: {
    promoters: { count: number; percentage: number };
    passives: { count: number; percentage: number };
    detractors: { count: number; percentage: number };
  };
}

export interface InsightItem {
  id: string;
  title: string;
  description?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  checked: boolean;
  type?: 'positive' | 'negative' | 'warning';
}

export interface CohortSummary {
  role: string;
  nps: number;
  trend: number;
  trendDirection: 'up' | 'down' | 'neutral';
  sampleSize: string;
}

export interface DashboardInsightsResponse {
  positiveThemes: string[];
  negativeThemes: string[];
  actionableInsights: InsightItem[];
  recentActions: any[];
}

