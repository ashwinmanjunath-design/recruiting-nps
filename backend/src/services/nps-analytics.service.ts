import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * NPS Analytics Service
 * 
 * This service computes NPS metrics from real survey response data.
 * Currently uses mock data for development, but all query structures
 * are production-ready and can be uncommented when real data is available.
 */

export interface DateRangeFilter {
  from?: Date;
  to?: Date;
}

export interface NpsFilters extends DateRangeFilter {
  role?: string;
  country?: string;
  region?: string;
  source?: string;
  cohortId?: string;
  baseline?: 'engineers-q1' | 'designers-q1' | 'all-roles';
}

export interface NpsOverview {
  npsScore: number;
  responseRate: number;
  responseRateChange: number;
  totalInvitations: number;
  totalResponses: number;
  breakdown: {
    promoters: { count: number; percentage: number };
    passives: { count: number; percentage: number };
    detractors: { count: number; percentage: number };
  };
}

export interface NpsTrend {
  period: string;
  promoters: number;
  passives: number;
  detractors: number;
  nps: number;
}

export class NpsAnalyticsService {
  /**
   * Get overall NPS score for a given date range and filters
   * 
   * TODO: Replace mock data with real Prisma query:
   * - Query SurveyResponse table for NPS ratings (score 0-10)
   * - Filter by date range, role, region, etc.
   * - Calculate NPS: % Promoters (9-10) - % Detractors (0-6)
   * - Group responses by status
   */
  async getOverallNpsScore(filters?: NpsFilters): Promise<NpsOverview> {
    // TODO: Replace with real query
    // const responses = await prisma.surveyResponse.findMany({
    //   where: {
    //     AND: [
    //       filters?.from ? { createdAt: { gte: filters.from } } : {},
    //       filters?.to ? { createdAt: { lte: filters.to } } : {},
    //       filters?.role ? { candidate: { role: filters.role } } : {},
    //       filters?.country ? { candidate: { country: filters.country } } : {},
    //       { question: { isNPS: true } },
    //       { score: { not: null } },
    //     ],
    //   },
    //   include: {
    //     candidate: true,
    //     survey: true,
    //   },
    // });

    // const promoters = responses.filter(r => r.score >= 9).length;
    // const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
    // const detractors = responses.filter(r => r.score <= 6).length;
    // const total = responses.length;

    // const npsScore = total > 0 
    //   ? Math.round(((promoters - detractors) / total) * 100) 
    //   : 0;

    // MOCK DATA for development
    return {
      npsScore: 75,
      responseRate: 82,
      responseRateChange: 15,
      totalInvitations: 6000,
      totalResponses: 4920,
      breakdown: {
        promoters: { count: 158, percentage: 58 },
        passives: { count: 65, percentage: 24 },
        detractors: { count: 48, percentage: 18 },
      },
    };
  }

  /**
   * Get NPS trend over time with specified interval
   * 
   * TODO: Replace mock data with real Prisma query:
   * - Query SurveyResponse grouped by date intervals
   * - Calculate NPS for each period
   * - Support daily, weekly, monthly, quarterly intervals
   */
  async getNpsTrend(
    interval: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    filters?: NpsFilters
  ): Promise<NpsTrend[]> {
    // TODO: Replace with real query using Prisma groupBy or raw SQL
    // const responses = await prisma.$queryRaw`
    //   SELECT 
    //     DATE_TRUNC(${interval}, created_at) as period,
    //     COUNT(*) FILTER (WHERE score >= 9) as promoters,
    //     COUNT(*) FILTER (WHERE score >= 7 AND score <= 8) as passives,
    //     COUNT(*) FILTER (WHERE score <= 6) as detractors,
    //     ROUND(
    //       (COUNT(*) FILTER (WHERE score >= 9) - COUNT(*) FILTER (WHERE score <= 6)) * 100.0 / COUNT(*),
    //       0
    //     ) as nps
    //   FROM survey_responses
    //   WHERE question_id IN (SELECT id FROM survey_questions WHERE is_nps = true)
    //   GROUP BY DATE_TRUNC(${interval}, created_at)
    //   ORDER BY period
    // `;

    // MOCK DATA for development
    const mockData = {
      weekly: [
        { period: 'Week 1', promoters: 120, passives: 80, detractors: 50, nps: 68 },
        { period: 'Week 2', promoters: 150, passives: 95, detractors: 60, nps: 70 },
        { period: 'Week 3', promoters: 180, passives: 110, detractors: 70, nps: 72 },
        { period: 'Week 4', promoters: 210, passives: 130, detractors: 80, nps: 75 },
      ],
      monthly: [
        { period: 'Jan', promoters: 520, passives: 380, detractors: 250, nps: 68 },
        { period: 'Feb', promoters: 580, passives: 420, detractors: 280, nps: 70 },
        { period: 'Mar', promoters: 650, passives: 480, detractors: 320, nps: 72 },
        { period: 'Apr', promoters: 720, passives: 540, detractors: 360, nps: 74 },
        { period: 'May', promoters: 800, passives: 610, detractors: 400, nps: 75 },
        { period: 'Jun', promoters: 880, passives: 680, detractors: 450, nps: 77 },
      ],
      quarterly: [
        { period: 'Q1 2023', promoters: 1500, passives: 1100, detractors: 750, nps: 65 },
        { period: 'Q2 2023', promoters: 1800, passives: 1350, detractors: 900, nps: 68 },
        { period: 'Q3 2023', promoters: 2100, passives: 1600, detractors: 1050, nps: 71 },
        { period: 'Q4 2023', promoters: 2400, passives: 1850, detractors: 1200, nps: 73 },
        { period: 'Q1 2024', promoters: 2700, passives: 2100, detractors: 1350, nps: 75 },
      ],
      daily: [],
    };

    return mockData[interval];
  }

  /**
   * Get response rate for surveys
   * 
   * TODO: Replace with real query:
   * - Count total surveys sent vs completed
   * - Calculate percentage
   * - Compare with previous period for trend
   */
  async getResponseRate(filters?: NpsFilters): Promise<{
    rate: number;
    change: number;
    totalSent: number;
    totalResponded: number;
  }> {
    // TODO: Replace with real query
    // const totalSent = await prisma.survey.count({
    //   where: {
    //     status: { in: ['SENT', 'COMPLETED', 'OPENED'] },
    //     sentAt: filters?.from ? { gte: filters.from } : undefined,
    //   },
    // });

    // const totalResponded = await prisma.survey.count({
    //   where: {
    //     status: 'COMPLETED',
    //     respondedAt: filters?.from ? { gte: filters.from } : undefined,
    //   },
    // });

    // const rate = totalSent > 0 ? (totalResponded / totalSent) * 100 : 0;

    // MOCK DATA
    return {
      rate: 82,
      change: 15,
      totalSent: 6000,
      totalResponded: 4920,
    };
  }

  /**
   * Get NPS breakdown by segment (role, country, etc.)
   * 
   * TODO: Replace with real query:
   * - Group responses by specified dimension
   * - Calculate NPS for each group
   * - Return sorted by NPS score
   */
  async getNpsBreakdown(
    dimension: 'role' | 'country' | 'region' | 'source',
    filters?: NpsFilters
  ): Promise<Array<{ label: string; nps: number; count: number }>> {
    // TODO: Replace with real query using groupBy
    // const responses = await prisma.surveyResponse.groupBy({
    //   by: ['candidate.' + dimension],
    //   where: {
    //     question: { isNPS: true },
    //     score: { not: null },
    //     ...buildFilterWhere(filters),
    //   },
    //   _count: true,
    // });

    // MOCK DATA
    return [
      { label: 'Engineers', nps: 78, count: 245 },
      { label: 'Product Managers', nps: 74, count: 180 },
      { label: 'Designers', nps: 72, count: 98 },
      { label: 'Sales', nps: 70, count: 156 },
    ];
  }
}

export default new NpsAnalyticsService();

