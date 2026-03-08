import { PrismaClient, SurveyAudience } from '@prisma/client';

const prisma = new PrismaClient();

export interface TrendFilters {
  from?: Date;
  to?: Date;
  interval?: 'weekly' | 'monthly' | 'quarterly';
  role?: string;
  region?: string;
  baseline?: 'engineers-q1' | 'designers-q1' | 'all-roles';
  audience?: SurveyAudience;
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

export class TrendsAnalyticsService {
  async getNpsCompositionTrend(filters?: TrendFilters): Promise<NpsCompositionTrend[]> {
    const interval = filters?.interval || 'monthly';
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

    const results: NpsCompositionTrend[] = [];
    for (const [, periodMetrics] of groups) {
      const totalResponses = periodMetrics.reduce((s, m) => s + m.totalResponses, 0);
      const promoters = periodMetrics.reduce((s, m) => s + m.promoters, 0);
      const passives = periodMetrics.reduce((s, m) => s + m.passives, 0);
      const detractors = periodMetrics.reduce((s, m) => s + m.detractors, 0);

      const total = promoters + passives + detractors;
      if (total === 0) continue;

      results.push({
        period: formatPeriod(periodMetrics[0].date, interval),
        promotersPercentage: Math.round((promoters / total) * 100),
        passivesPercentage: Math.round((passives / total) * 100),
        detractorsPercentage: Math.round((detractors / total) * 100),
        npsScore: Math.round(((promoters - detractors) / total) * 100),
        totalResponses,
      });
    }

    return results;
  }

  async getResponseRateTrend(filters?: TrendFilters): Promise<ResponseRateTrend[]> {
    const interval = filters?.interval || 'monthly';
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

    const results: ResponseRateTrend[] = [];
    for (const [, periodMetrics] of groups) {
      const totalSent = periodMetrics.reduce((s, m) => s + m.totalSurveys, 0);
      const totalResponded = periodMetrics.reduce((s, m) => s + m.totalResponses, 0);
      const avgTimeDays = periodMetrics.reduce((s, m) => s + m.avgTimeDays, 0) / periodMetrics.length;

      results.push({
        period: formatPeriod(periodMetrics[0].date, interval),
        responseRatePercentage: totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0,
        timeToFeedbackHours: Math.round(avgTimeDays * 24),
        totalSent,
        totalResponded,
      });
    }

    return results;
  }

  async getTrendInsights(filters?: TrendFilters): Promise<TrendInsight[]> {
    const audience = filters?.audience || 'CANDIDATE';

    const metrics = await prisma.dailyMetric.findMany({
      where: { audience },
      orderBy: { date: 'desc' },
      take: 60,
    });

    if (metrics.length < 2) return [];

    const insights: TrendInsight[] = [];

    // Split into recent half vs older half
    const mid = Math.floor(metrics.length / 2);
    const recent = metrics.slice(0, mid);
    const older = metrics.slice(mid);

    const recentAvgNps = recent.reduce((s, m) => s + m.npsScore, 0) / recent.length;
    const olderAvgNps = older.reduce((s, m) => s + m.npsScore, 0) / older.length;
    const npsDiff = recentAvgNps - olderAvgNps;

    if (npsDiff > 5) {
      insights.push({
        severity: 'success',
        title: 'NPS Improving',
        description: `NPS has increased by ${Math.round(npsDiff)} points compared to the previous period.`,
        resolved: false,
      });
    } else if (npsDiff < -5) {
      insights.push({
        severity: 'warning',
        title: 'NPS Declining',
        description: `NPS has decreased by ${Math.round(Math.abs(npsDiff))} points compared to the previous period.`,
        resolved: false,
      });
    } else {
      insights.push({
        severity: 'info',
        title: 'NPS Stable',
        description: `NPS has remained steady around ${Math.round(recentAvgNps)} over the recent period.`,
        resolved: false,
      });
    }

    const recentAvgRate = recent.reduce((s, m) => s + m.responseRate, 0) / recent.length;
    const olderAvgRate = older.reduce((s, m) => s + m.responseRate, 0) / older.length;
    const rateDiff = recentAvgRate - olderAvgRate;

    if (rateDiff > 3) {
      insights.push({
        severity: 'success',
        title: 'Response Rate Improvement',
        description: `Response rate has increased by ${Math.round(rateDiff)}% compared to the previous period.`,
        resolved: false,
      });
    } else if (rateDiff < -3) {
      insights.push({
        severity: 'warning',
        title: 'Response Rate Declining',
        description: `Response rate has dropped by ${Math.round(Math.abs(rateDiff))}%. Consider improving survey distribution.`,
        resolved: false,
      });
    }

    const recentAvgTime = recent.reduce((s, m) => s + m.avgTimeDays, 0) / recent.length;
    if (recentAvgTime > 3) {
      insights.push({
        severity: 'warning',
        title: 'Slow Feedback Time',
        description: `Average time to feedback is ${recentAvgTime.toFixed(1)} days. Consider streamlining the process.`,
        resolved: false,
      });
    }

    return insights;
  }

  async getTrendSummary(filters?: TrendFilters): Promise<{
    currentNps: number;
    npsChange: number;
    currentResponseRate: number;
    responseRateChange: number;
    avgTimeToFeedback: number;
    timeToFeedbackChange: number;
  }> {
    const audience = filters?.audience || 'CANDIDATE';

    const metrics = await prisma.dailyMetric.findMany({
      where: { audience },
      orderBy: { date: 'desc' },
      take: 20,
    });

    if (metrics.length === 0) {
      return {
        currentNps: 0,
        npsChange: 0,
        currentResponseRate: 0,
        responseRateChange: 0,
        avgTimeToFeedback: 0,
        timeToFeedbackChange: 0,
      };
    }

    const mid = Math.floor(metrics.length / 2);
    const recent = metrics.slice(0, Math.max(mid, 1));
    const older = metrics.slice(mid);

    const currentNps = Math.round(recent.reduce((s, m) => s + m.npsScore, 0) / recent.length);
    const prevNps = older.length > 0 ? Math.round(older.reduce((s, m) => s + m.npsScore, 0) / older.length) : currentNps;

    const currentRate = Math.round(recent.reduce((s, m) => s + m.responseRate, 0) / recent.length);
    const prevRate = older.length > 0 ? Math.round(older.reduce((s, m) => s + m.responseRate, 0) / older.length) : currentRate;

    const currentTime = Math.round((recent.reduce((s, m) => s + m.avgTimeDays, 0) / recent.length) * 24);
    const prevTime = older.length > 0 ? Math.round((older.reduce((s, m) => s + m.avgTimeDays, 0) / older.length) * 24) : currentTime;

    return {
      currentNps,
      npsChange: currentNps - prevNps,
      currentResponseRate: currentRate,
      responseRateChange: currentRate - prevRate,
      avgTimeToFeedback: currentTime,
      timeToFeedbackChange: currentTime - prevTime,
    };
  }
}

export default new TrendsAnalyticsService();
