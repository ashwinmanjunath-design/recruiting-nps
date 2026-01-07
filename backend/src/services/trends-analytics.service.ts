import { PrismaClient, SurveyAudience } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Trends Analytics Service
 * 
 * This service provides trend analysis data for NPS composition,
 * response rates, and time-to-feedback metrics over time.
 * 
 * Supports filtering by audience type (Candidate, Hiring Manager, Workplace, IT Support)
 */

export interface TrendFilters {
  from?: Date;
  to?: Date;
  interval?: 'weekly' | 'monthly' | 'quarterly';
  role?: string;
  region?: string;
  baseline?: 'engineers-q1' | 'designers-q1' | 'all-roles';
  audience?: SurveyAudience; // Filter by survey audience type
}

export interface NpsCompositionTrend {
  period: string;
  promotersPercentage: number;
  passivesPercentage: number;
  detractorsPercentage: number;
  npsScore: number;
  totalResponses: number;
}

export interface ResponseRateTrend {
  period: string;
  responseRatePercentage: number;
  timeToFeedbackHours: number;
  totalSent: number;
  totalResponded: number;
}

export interface TrendInsight {
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  period?: string;
  resolved?: boolean;
}

export class TrendsAnalyticsService {
  /**
   * Get NPS composition trend over time
   * Returns stacked data showing percentage of Promoters, Passives, Detractors
   * plus overall NPS score as a line
   * 
   * TODO: Replace mock data with real Prisma query:
   * - Query SurveyResponse grouped by time intervals
   * - Calculate percentages for each category
   * - Calculate NPS score for each period
   */
  async getNpsCompositionTrend(filters?: TrendFilters): Promise<NpsCompositionTrend[]> {
    const interval = filters?.interval || 'monthly';

    // TODO: Replace with real Prisma query
    // const responses = await prisma.$queryRaw`
    //   SELECT 
    //     DATE_TRUNC(${interval}, sr.created_at) as period,
    //     COUNT(*) as total_responses,
    //     COUNT(*) FILTER (WHERE sr.score >= 9) * 100.0 / COUNT(*) as promoters_pct,
    //     COUNT(*) FILTER (WHERE sr.score >= 7 AND sr.score <= 8) * 100.0 / COUNT(*) as passives_pct,
    //     COUNT(*) FILTER (WHERE sr.score <= 6) * 100.0 / COUNT(*) as detractors_pct,
    //     ROUND(
    //       (COUNT(*) FILTER (WHERE sr.score >= 9) - COUNT(*) FILTER (WHERE sr.score <= 6)) * 100.0 / COUNT(*),
    //       0
    //     ) as nps_score
    //   FROM survey_responses sr
    //   JOIN survey_questions sq ON sr.question_id = sq.id
    //   WHERE sq.is_nps = true
    //     AND sr.score IS NOT NULL
    //     ${filters?.from ? `AND sr.created_at >= ${filters.from}` : ''}
    //     ${filters?.to ? `AND sr.created_at <= ${filters.to}` : ''}
    //   GROUP BY DATE_TRUNC(${interval}, sr.created_at)
    //   ORDER BY period
    // `;

    // MOCK DATA for development
    const mockData = {
      weekly: [
        { period: 'Week 1', promotersPercentage: 48, passivesPercentage: 32, detractorsPercentage: 20, npsScore: 28, totalResponses: 250 },
        { period: 'Week 2', promotersPercentage: 51, passivesPercentage: 30, detractorsPercentage: 19, npsScore: 32, totalResponses: 305 },
        { period: 'Week 3', promotersPercentage: 53, passivesPercentage: 29, detractorsPercentage: 18, npsScore: 35, totalResponses: 360 },
        { period: 'Week 4', promotersPercentage: 55, passivesPercentage: 28, detractorsPercentage: 17, npsScore: 38, totalResponses: 420 },
      ],
      monthly: [
        { period: 'Jan', promotersPercentage: 45, passivesPercentage: 33, detractorsPercentage: 22, npsScore: 23, totalResponses: 1150 },
        { period: 'Feb', promotersPercentage: 48, passivesPercentage: 32, detractorsPercentage: 20, npsScore: 28, totalResponses: 1280 },
        { period: 'Mar', promotersPercentage: 50, passivesPercentage: 31, detractorsPercentage: 19, npsScore: 31, totalResponses: 1450 },
        { period: 'Apr', promotersPercentage: 52, passivesPercentage: 30, detractorsPercentage: 18, npsScore: 34, totalResponses: 1620 },
        { period: 'May', promotersPercentage: 54, passivesPercentage: 29, detractorsPercentage: 17, npsScore: 37, totalResponses: 1810 },
        { period: 'Jun', promotersPercentage: 56, passivesPercentage: 28, detractorsPercentage: 16, npsScore: 40, totalResponses: 2010 },
      ],
      quarterly: [
        { period: 'Q1 2023', promotersPercentage: 42, passivesPercentage: 35, detractorsPercentage: 23, npsScore: 19, totalResponses: 3350 },
        { period: 'Q2 2023', promotersPercentage: 46, passivesPercentage: 33, detractorsPercentage: 21, npsScore: 25, totalResponses: 4050 },
        { period: 'Q3 2023', promotersPercentage: 50, passivesPercentage: 31, detractorsPercentage: 19, npsScore: 31, totalResponses: 4750 },
        { period: 'Q4 2023', promotersPercentage: 53, passivesPercentage: 30, detractorsPercentage: 17, npsScore: 36, totalResponses: 5450 },
        { period: 'Q1 2024', promotersPercentage: 56, passivesPercentage: 28, detractorsPercentage: 16, npsScore: 40, totalResponses: 6150 },
      ],
    };

    return mockData[interval];
  }

  /**
   * Get response rate and time-to-feedback trends
   * 
   * TODO: Replace mock data with real Prisma query:
   * - Query Surveys grouped by time intervals
   * - Calculate response rate (completed / sent)
   * - Calculate average time between sentAt and respondedAt
   */
  async getResponseRateTrend(filters?: TrendFilters): Promise<ResponseRateTrend[]> {
    const interval = filters?.interval || 'monthly';

    // TODO: Replace with real Prisma query
    // const surveys = await prisma.$queryRaw`
    //   SELECT 
    //     DATE_TRUNC(${interval}, s.sent_at) as period,
    //     COUNT(*) as total_sent,
    //     COUNT(*) FILTER (WHERE s.status = 'COMPLETED') as total_responded,
    //     COUNT(*) FILTER (WHERE s.status = 'COMPLETED') * 100.0 / COUNT(*) as response_rate_pct,
    //     AVG(
    //       EXTRACT(EPOCH FROM (s.responded_at - s.sent_at)) / 3600
    //     ) FILTER (WHERE s.responded_at IS NOT NULL) as avg_time_to_feedback_hours
    //   FROM surveys s
    //   WHERE s.sent_at IS NOT NULL
    //     ${filters?.from ? `AND s.sent_at >= ${filters.from}` : ''}
    //     ${filters?.to ? `AND s.sent_at <= ${filters.to}` : ''}
    //   GROUP BY DATE_TRUNC(${interval}, s.sent_at)
    //   ORDER BY period
    // `;

    // MOCK DATA for development
    const mockData = {
      weekly: [
        { period: 'Week 1', responseRatePercentage: 75, timeToFeedbackHours: 28, totalSent: 420, totalResponded: 315 },
        { period: 'Week 2', responseRatePercentage: 78, timeToFeedbackHours: 26, totalSent: 450, totalResponded: 351 },
        { period: 'Week 3', responseRatePercentage: 80, timeToFeedbackHours: 24, totalSent: 480, totalResponded: 384 },
        { period: 'Week 4', responseRatePercentage: 82, timeToFeedbackHours: 22, totalSent: 510, totalResponded: 418 },
      ],
      monthly: [
        { period: 'Jan', responseRatePercentage: 72, timeToFeedbackHours: 32, totalSent: 1600, totalResponded: 1152 },
        { period: 'Feb', responseRatePercentage: 74, timeToFeedbackHours: 30, totalSent: 1750, totalResponded: 1295 },
        { period: 'Mar', responseRatePercentage: 76, timeToFeedbackHours: 28, totalSent: 1900, totalResponded: 1444 },
        { period: 'Apr', responseRatePercentage: 78, timeToFeedbackHours: 26, totalSent: 2050, totalResponded: 1599 },
        { period: 'May', responseRatePercentage: 80, timeToFeedbackHours: 24, totalSent: 2200, totalResponded: 1760 },
        { period: 'Jun', responseRatePercentage: 82, timeToFeedbackHours: 22, totalSent: 2350, totalResponded: 1927 },
      ],
      quarterly: [
        { period: 'Q1 2023', responseRatePercentage: 68, timeToFeedbackHours: 36, totalSent: 4500, totalResponded: 3060 },
        { period: 'Q2 2023', responseRatePercentage: 72, timeToFeedbackHours: 32, totalSent: 5200, totalResponded: 3744 },
        { period: 'Q3 2023', responseRatePercentage: 76, timeToFeedbackHours: 28, totalSent: 5900, totalResponded: 4484 },
        { period: 'Q4 2023', responseRatePercentage: 79, timeToFeedbackHours: 25, totalSent: 6600, totalResponded: 5214 },
        { period: 'Q1 2024', responseRatePercentage: 82, timeToFeedbackHours: 22, totalSent: 7300, totalResponded: 5986 },
      ],
    };

    return mockData[interval];
  }

  /**
   * Get insights and noteworthy events from trend analysis
   * 
   * TODO: Replace mock data with real analytics:
   * - Detect significant NPS changes (> 10% drop/increase)
   * - Identify response rate anomalies
   * - Flag time-to-feedback spikes
   * - Use ML or rule-based system for insight generation
   */
  async getTrendInsights(filters?: TrendFilters): Promise<TrendInsight[]> {
    // TODO: Implement real insight generation based on:
    // - Statistical analysis of trends
    // - Comparison with baseline periods
    // - Anomaly detection algorithms
    // - User-defined thresholds

    // MOCK DATA for development
    return [
      {
        severity: 'success',
        title: 'Response Rate Improvement',
        description: 'Response rate has increased by 10% over the last quarter, indicating better candidate engagement.',
        period: 'Q1 2024',
        resolved: false,
      },
      {
        severity: 'warning',
        title: 'Time to Feedback Trending Up',
        description: 'Average time to feedback has increased from 22 to 28 hours in the past month. Consider streamlining the feedback process.',
        period: 'May 2024',
        resolved: false,
      },
      {
        severity: 'info',
        title: 'NPS Stabilizing',
        description: 'NPS score has remained steady at 38-40 range for the past 3 months, showing consistent candidate experience.',
        period: 'Apr-Jun 2024',
        resolved: false,
      },
    ];
  }

  /**
   * Get trend summary statistics
   * 
   * TODO: Replace with real calculations from actual data
   */
  async getTrendSummary(filters?: TrendFilters): Promise<{
    currentNps: number;
    npsChange: number;
    currentResponseRate: number;
    responseRateChange: number;
    avgTimeToFeedback: number;
    timeToFeedbackChange: number;
  }> {
    // TODO: Calculate real values from latest period vs previous period
    
    // MOCK DATA
    return {
      currentNps: 40,
      npsChange: 3, // +3 from previous period
      currentResponseRate: 82,
      responseRateChange: 2, // +2% from previous period
      avgTimeToFeedback: 22,
      timeToFeedbackChange: -2, // -2 hours (improvement)
    };
  }
}

export default new TrendsAnalyticsService();

