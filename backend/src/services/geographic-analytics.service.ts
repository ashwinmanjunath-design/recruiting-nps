import { PrismaClient } from '@prisma/client';
import { NpsFilters } from './nps-analytics.service';

const prisma = new PrismaClient();

/**
 * Geographic Analytics Service
 *
 * Computes geographic performance metrics from real survey data.
 * Uses GeoMetric table (pre-aggregated) or computes from SurveyResponse + Candidate.
 */

export interface GeographicPerformance {
  country: string;
  countryCode?: string;
  region?: string;
  npsScore: number;
  responseRate: number;
  totalCandidates: number;
  totalResponses: number;
  promoters: number;
  passives: number;
  detractors: number;
  avgTimeDays: number;
}

export interface MapDataPoint {
  lat: number;
  lng: number;
  npsScore: number;
  country: string;
  count: number;
}

// Known coordinates for major cities/countries
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'United States': { lat: 37.0902, lng: -95.7129 },
  'United Kingdom': { lat: 55.3781, lng: -3.436 },
  'Germany': { lat: 51.1657, lng: 10.4515 },
  'India': { lat: 20.5937, lng: 78.9629 },
  'Brazil': { lat: -14.235, lng: -51.9253 },
  'Czech Republic': { lat: 49.8175, lng: 15.473 },
  'Singapore': { lat: 1.3521, lng: 103.8198 },
  'Australia': { lat: -25.2744, lng: 133.7751 },
  'Japan': { lat: 36.2048, lng: 138.2529 },
  'France': { lat: 46.2276, lng: 2.2137 },
  'Canada': { lat: 56.1304, lng: -106.3468 },
};

export class GeographicAnalyticsService {
  /**
   * Get geographic performance - tries GeoMetric first, falls back to computing from surveys
   */
  async getGeographicPerformance(filters?: NpsFilters): Promise<GeographicPerformance[]> {
    const audience = filters?.audience || 'CANDIDATE';

    // Try pre-aggregated GeoMetric table first
    const geoMetrics = await prisma.geoMetric.findMany({
      where: {
        audience,
        ...(filters?.from && { date: { gte: filters.from } }),
        ...(filters?.to && { date: { ...({} as any), lte: filters.to } }),
      },
      orderBy: { npsScore: 'desc' },
    });

    if (geoMetrics.length > 0) {
      return geoMetrics.map(g => ({
        country: g.country,
        countryCode: g.countryCode || undefined,
        region: g.region || undefined,
        npsScore: Math.round(g.npsScore),
        responseRate: Math.round(g.responseRate),
        totalCandidates: g.totalCandidates,
        totalResponses: g.totalResponses,
        promoters: g.promoters,
        passives: g.passives,
        detractors: g.detractors,
        avgTimeDays: g.avgTimeDays,
      }));
    }

    // Fall back to computing from survey responses
    const candidates = await prisma.candidate.findMany({
      where: {
        country: { not: null },
        surveys: { some: { audience, sentAt: { not: null } } },
      },
      take: 10000,
      include: {
        surveys: {
          where: { audience, sentAt: { not: null } },
          include: { responses: true },
        },
      },
    });

    // Group by country
    const countryMap = new Map<string, typeof candidates>();
    for (const c of candidates) {
      if (!c.country) continue;
      if (!countryMap.has(c.country)) countryMap.set(c.country, []);
      countryMap.get(c.country)!.push(c);
    }

    const results: GeographicPerformance[] = [];
    for (const [country, countryCandidates] of countryMap) {
      const allResponses = countryCandidates.flatMap(c => c.surveys.flatMap(s => s.responses));
      const scores = allResponses.map(r => r.score).filter((s): s is number => s !== null);

      const promoters = scores.filter(s => s >= 9).length;
      const passives = scores.filter(s => s >= 7 && s <= 8).length;
      const detractors = scores.filter(s => s <= 6).length;
      const total = scores.length;
      const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      const totalSurveys = countryCandidates.flatMap(c => c.surveys).length;
      const surveysWithResponses = countryCandidates.flatMap(c => c.surveys).filter(s => s.responses.length > 0).length;
      const responseRate = totalSurveys > 0 ? Math.round((surveysWithResponses / totalSurveys) * 100) : 0;

      // Calculate avg time to feedback
      const allSurveys = countryCandidates.flatMap(c => c.surveys);
      const times = allResponses
        .map(r => {
          const survey = allSurveys.find(s => s.id === r.surveyId);
          if (!survey?.sentAt) return null;
          return (new Date(r.createdAt).getTime() - new Date(survey.sentAt).getTime()) / (1000 * 60 * 60 * 24);
        })
        .filter((t): t is number => t !== null && t >= 0);
      const avgTimeDays = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

      results.push({
        country,
        npsScore,
        responseRate,
        totalCandidates: countryCandidates.length,
        totalResponses: total,
        promoters,
        passives,
        detractors,
        avgTimeDays: Math.round(avgTimeDays * 10) / 10,
      });
    }

    return results.sort((a, b) => b.npsScore - a.npsScore);
  }

  /**
   * Get map data points with lat/lng coordinates
   */
  async getMapDataPoints(filters?: NpsFilters): Promise<MapDataPoint[]> {
    const geoData = await this.getGeographicPerformance(filters);

    return geoData
      .filter(g => COUNTRY_COORDINATES[g.country])
      .map(g => {
        const coords = COUNTRY_COORDINATES[g.country];
        return {
          lat: coords.lat,
          lng: coords.lng,
          npsScore: g.npsScore,
          country: g.country,
          count: g.totalCandidates,
        };
      });
  }

  /**
   * Get regional insights (best/worst performing regions)
   */
  async getRegionalInsights(filters?: NpsFilters): Promise<{
    topPerforming: GeographicPerformance[];
    needsImprovement: GeographicPerformance[];
    insights: Array<{ type: string; message: string; region: string }>;
  }> {
    const allRegions = await this.getGeographicPerformance(filters);

    if (allRegions.length === 0) {
      return { topPerforming: [], needsImprovement: [], insights: [] };
    }

    const sorted = [...allRegions].sort((a, b) => b.npsScore - a.npsScore);
    const topPerforming = sorted.slice(0, 3);
    const needsImprovement = sorted.slice(-3).reverse();

    // Generate dynamic insights from real data
    const insights: Array<{ type: string; message: string; region: string }> = [];

    if (topPerforming[0] && topPerforming[0].npsScore > 0) {
      insights.push({
        type: 'positive',
        message: `${topPerforming[0].country} leads with NPS of ${topPerforming[0].npsScore}`,
        region: topPerforming[0].country,
      });
    }

    const lowResponseRate = allRegions.filter(r => r.responseRate > 0 && r.responseRate < 70);
    if (lowResponseRate.length > 0) {
      insights.push({
        type: 'attention',
        message: `Response rate below 70% in ${lowResponseRate.map(r => r.country).join(', ')}`,
        region: lowResponseRate[0].country,
      });
    }

    return { topPerforming, needsImprovement, insights };
  }
}

export default new GeographicAnalyticsService();
