import { PrismaClient, SurveyAudience } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * NPS Analytics Service
 *
 * Computes NPS metrics from real survey response data.
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
  audience?: SurveyAudience;
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

function buildSurveyWhere(filters?: NpsFilters) {
  const where: any = {
    sentAt: { not: null },
    audience: filters?.audience || 'CANDIDATE',
  };
  if (filters?.from) where.sentAt = { ...where.sentAt, gte: filters.from };
  if (filters?.to) where.sentAt = { ...where.sentAt, lte: filters.to };
  return where;
}

function buildCandidateWhere(filters?: NpsFilters) {
  const where: any = {};
  if (filters?.role) where.role = filters.role;
  if (filters?.country) where.country = filters.country;
  if (filters?.region) where.region = filters.region;
  if (filters?.source) where.source = filters.source;
  return where;
}

export class NpsAnalyticsService {
  async getOverallNpsScore(filters?: NpsFilters): Promise<NpsOverview> {
    const surveyWhere = buildSurveyWhere(filters);
    const candidateWhere = buildCandidateWhere(filters);

    // If candidate filters are present, add them
    if (Object.keys(candidateWhere).length > 0) {
      surveyWhere.candidate = candidateWhere;
    }

    const surveys = await prisma.survey.findMany({
      where: surveyWhere,
      take: 10000,
      include: { responses: true },
    });

    const totalSent = surveys.length;
    const surveysWithResponses = surveys.filter(s => s.responses.length > 0);
    const totalResponded = surveysWithResponses.length;
    const responseRate = totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0;

    const allScores = surveys
      .flatMap(s => s.responses)
      .map(r => r.score)
      .filter((s): s is number => s !== null && s !== undefined);

    const promoters = allScores.filter(s => s >= 9).length;
    const passives = allScores.filter(s => s >= 7 && s <= 8).length;
    const detractors = allScores.filter(s => s <= 6).length;
    const total = allScores.length;
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    return {
      npsScore,
      responseRate,
      responseRateChange: 0, // Calculated at route level with history
      totalInvitations: totalSent,
      totalResponses: total,
      breakdown: {
        promoters: { count: promoters, percentage: total > 0 ? Math.round((promoters / total) * 100) : 0 },
        passives: { count: passives, percentage: total > 0 ? Math.round((passives / total) * 100) : 0 },
        detractors: { count: detractors, percentage: total > 0 ? Math.round((detractors / total) * 100) : 0 },
      },
    };
  }

  async getNpsTrend(
    interval: 'daily' | 'weekly' | 'monthly' | 'quarterly',
    filters?: NpsFilters
  ): Promise<NpsTrend[]> {
    const audience = filters?.audience || 'CANDIDATE';

    const where: any = { audience };
    if (filters?.from) where.date = { ...where.date, gte: filters.from };
    if (filters?.to) where.date = { ...where.date, lte: filters.to };

    const metrics = await prisma.dailyMetric.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    if (metrics.length === 0) return [];

    // Group by period
    const groups = new Map<string, typeof metrics>();
    for (const m of metrics) {
      const key = getPeriodKey(m.date, interval);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(m);
    }

    const results: NpsTrend[] = [];
    for (const [, periodMetrics] of groups) {
      const promoters = periodMetrics.reduce((s, m) => s + m.promoters, 0);
      const passives = periodMetrics.reduce((s, m) => s + m.passives, 0);
      const detractors = periodMetrics.reduce((s, m) => s + m.detractors, 0);
      const total = promoters + passives + detractors;
      if (total === 0) continue;

      results.push({
        period: formatPeriod(periodMetrics[0].date, interval),
        promoters,
        passives,
        detractors,
        nps: Math.round(((promoters - detractors) / total) * 100),
      });
    }

    return results;
  }

  async getResponseRate(filters?: NpsFilters): Promise<{
    rate: number;
    change: number;
    totalSent: number;
    totalResponded: number;
  }> {
    const surveyWhere = buildSurveyWhere(filters);

    const totalSent = await prisma.survey.count({ where: surveyWhere });
    const totalResponded = await prisma.survey.count({
      where: { ...surveyWhere, status: 'COMPLETED' },
    });

    const rate = totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0;

    return { rate, change: 0, totalSent, totalResponded };
  }

  async getNpsBreakdown(
    dimension: 'role' | 'country' | 'region' | 'source',
    filters?: NpsFilters
  ): Promise<Array<{ label: string; nps: number; count: number }>> {
    const audience = filters?.audience || 'CANDIDATE';

    // Get candidates grouped by dimension
    const candidates = await prisma.candidate.findMany({
      where: {
        [dimension]: { not: null },
        surveys: { some: { audience } },
      },
      take: 5000,
      include: {
        surveys: {
          where: { audience },
          include: { responses: true },
        },
      },
    });

    // Group by dimension value
    const groups = new Map<string, number[]>();
    for (const c of candidates) {
      const key = (c as any)[dimension] as string;
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      const scores = c.surveys
        .flatMap(s => s.responses)
        .map(r => r.score)
        .filter((s): s is number => s !== null);
      groups.get(key)!.push(...scores);
    }

    const results = Array.from(groups.entries()).map(([label, scores]) => {
      const promoters = scores.filter(s => s >= 9).length;
      const detractors = scores.filter(s => s <= 6).length;
      const total = scores.length;
      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
      return { label, nps, count: total };
    });

    return results.sort((a, b) => b.nps - a.nps);
  }
}

function formatPeriod(date: Date, interval: string): string {
  if (interval === 'weekly') {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return `Week of ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  }
  if (interval === 'quarterly') {
    const q = Math.floor(date.getMonth() / 3) + 1;
    return `Q${q} ${date.getFullYear()}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getPeriodKey(date: Date, interval: string): string {
  if (interval === 'weekly') {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    return weekStart.toISOString().slice(0, 10);
  }
  if (interval === 'quarterly') {
    const q = Math.floor(date.getMonth() / 3);
    return `${date.getFullYear()}-Q${q}`;
  }
  return `${date.getFullYear()}-${String(date.getMonth()).padStart(2, '0')}`;
}

export default new NpsAnalyticsService();
