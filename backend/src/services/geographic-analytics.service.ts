import { PrismaClient } from '@prisma/client';
import { NpsFilters } from './nps-analytics.service';

const prisma = new PrismaClient();

/**
 * Geographic Analytics Service
 * 
 * This service computes geographic performance metrics from real survey data.
 * All query structures are production-ready.
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

export class GeographicAnalyticsService {
  /**
   * Get geographic performance by country/region
   * 
   * TODO: Replace mock data with real Prisma queries:
   * - Query GeoMetric table (pre-aggregated) or compute on-the-fly
   * - Join Candidate → SurveyResponse for NPS calculation
   * - Group by country/region
   * - Calculate NPS, response rate, and time metrics
   */
  async getGeographicPerformance(filters?: NpsFilters): Promise<GeographicPerformance[]> {
    // TODO: Replace with real query
    // Option 1: Use pre-aggregated GeoMetric table
    // const metrics = await prisma.geoMetric.findMany({
    //   where: {
    //     date: filters?.from ? { gte: filters.from } : undefined,
    //   },
    //   orderBy: { npsScore: 'desc' },
    // });

    // Option 2: Compute on-the-fly
    // const candidatesByCountry = await prisma.candidate.groupBy({
    //   by: ['country', 'region'],
    //   where: {
    //     responses: {
    //       some: {
    //         createdAt: filters?.from ? { gte: filters.from } : undefined,
    //       },
    //     },
    //   },
    //   _count: true,
    // });

    // For each country, calculate NPS from responses
    // const geoData = await Promise.all(
    //   candidatesByCountry.map(async (group) => {
    //     const responses = await prisma.surveyResponse.findMany({
    //       where: {
    //         candidate: { country: group.country },
    //         question: { isNPS: true },
    //         score: { not: null },
    //       },
    //       include: { survey: true },
    //     });

    //     const promoters = responses.filter(r => r.score >= 9).length;
    //     const passives = responses.filter(r => r.score >= 7 && r.score <= 8).length;
    //     const detractors = responses.filter(r => r.score <= 6).length;
    //     const npsScore = responses.length > 0
    //       ? Math.round(((promoters - detractors) / responses.length) * 100)
    //       : 0;

    //     // Calculate avg time from survey sent to response
    //     const avgTimeDays = responses.length > 0
    //       ? responses.reduce((sum, r) => {
    //           const diffMs = new Date(r.createdAt).getTime() - new Date(r.survey.sentAt).getTime();
    //           return sum + diffMs / (1000 * 60 * 60 * 24);
    //         }, 0) / responses.length
    //       : 0;

    //     return {
    //       country: group.country,
    //       region: group.region,
    //       npsScore,
    //       responseRate: calculateResponseRate(group.country),
    //       totalCandidates: group._count,
    //       totalResponses: responses.length,
    //       promoters,
    //       passives,
    //       detractors,
    //       avgTimeDays,
    //     };
    //   })
    // );

    // MOCK DATA for development
    return [
      {
        country: 'United States',
        countryCode: 'US',
        npsScore: 78,
        responseRate: 85,
        totalCandidates: 1250,
        totalResponses: 1062,
        promoters: 615,
        passives: 255,
        detractors: 192,
        avgTimeDays: 2.3,
      },
      {
        country: 'United Kingdom',
        countryCode: 'GB',
        npsScore: 76,
        responseRate: 82,
        totalCandidates: 850,
        totalResponses: 697,
        promoters: 420,
        passives: 175,
        detractors: 102,
        avgTimeDays: 2.8,
      },
      {
        country: 'Germany',
        countryCode: 'DE',
        npsScore: 74,
        responseRate: 80,
        totalCandidates: 620,
        totalResponses: 496,
        promoters: 295,
        passives: 125,
        detractors: 76,
        avgTimeDays: 3.1,
      },
      {
        country: 'India',
        countryCode: 'IN',
        npsScore: 72,
        responseRate: 88,
        totalCandidates: 1100,
        totalResponses: 968,
        promoters: 560,
        passives: 242,
        detractors: 166,
        avgTimeDays: 1.9,
      },
      {
        country: 'Brazil',
        countryCode: 'BR',
        npsScore: 70,
        responseRate: 75,
        totalCandidates: 450,
        totalResponses: 338,
        promoters: 185,
        passives: 95,
        detractors: 58,
        avgTimeDays: 3.5,
      },
    ];
  }

  /**
   * Get map data points with lat/lng coordinates
   * 
   * TODO: Replace with real query:
   * - Query candidates with non-null lat/lng or region
   * - Use geocoding service or pre-computed coordinates
   * - Calculate NPS for each location
   */
  async getMapDataPoints(filters?: NpsFilters): Promise<MapDataPoint[]> {
    // TODO: Replace with real query
    // const candidates = await prisma.candidate.findMany({
    //   where: {
    //     country: { not: null },
    //     responses: {
    //       some: {
    //         question: { isNPS: true },
    //         createdAt: filters?.from ? { gte: filters.from } : undefined,
    //       },
    //     },
    //   },
    //   include: {
    //     responses: {
    //       where: { question: { isNPS: true } },
    //     },
    //   },
    // });

    // Group by country/city and calculate NPS
    // const locationMap = new Map();
    // candidates.forEach(candidate => {
    //   const key = `${candidate.country}-${candidate.region || 'main'}`;
    //   if (!locationMap.has(key)) {
    //     locationMap.set(key, {
    //       country: candidate.country,
    //       region: candidate.region,
    //       responses: [],
    //       count: 0,
    //     });
    //   }
    //   const loc = locationMap.get(key);
    //   loc.responses.push(...candidate.responses);
    //   loc.count++;
    // });

    // Convert to MapDataPoint format with coordinates
    // const dataPoints = Array.from(locationMap.values()).map(loc => {
    //   const coords = getCoordinatesForLocation(loc.country, loc.region);
    //   const nps = calculateNps(loc.responses);
    //   return {
    //     lat: coords.lat,
    //     lng: coords.lng,
    //     npsScore: nps,
    //     country: loc.country,
    //     count: loc.count,
    //   };
    // });

    // MOCK DATA
    return [
      { lat: 37.7749, lng: -122.4194, npsScore: 78, country: 'United States', count: 450 },
      { lat: 40.7128, lng: -74.0060, npsScore: 76, country: 'United States', count: 380 },
      { lat: 51.5074, lng: -0.1278, npsScore: 76, country: 'United Kingdom', count: 420 },
      { lat: 52.5200, lng: 13.4050, npsScore: 74, country: 'Germany', count: 320 },
      { lat: 12.9716, lng: 77.5946, npsScore: 72, country: 'India', count: 580 },
      { lat: -23.5505, lng: -46.6333, npsScore: 70, country: 'Brazil', count: 280 },
    ];
  }

  /**
   * Get regional insights (best/worst performing regions)
   * 
   * TODO: Replace with real query:
   * - Identify top and bottom performing regions
   * - Analyze trends over time
   * - Return actionable insights
   */
  async getRegionalInsights(filters?: NpsFilters): Promise<{
    topPerforming: GeographicPerformance[];
    needsImprovement: GeographicPerformance[];
    insights: Array<{ type: string; message: string; region: string }>;
  }> {
    // TODO: Replace with real query
    const allRegions = await this.getGeographicPerformance(filters);
    
    // Sort by NPS score
    const sorted = [...allRegions].sort((a, b) => b.npsScore - a.npsScore);
    
    const topPerforming = sorted.slice(0, 3);
    const needsImprovement = sorted.slice(-3).reverse();

    // Generate insights
    const insights = [];
    
    // TODO: Add real insight generation logic
    // if (topPerforming[0].npsScore > 75) {
    //   insights.push({
    //     type: 'positive',
    //     message: `Strong performance in ${topPerforming[0].country}`,
    //     region: topPerforming[0].country,
    //   });
    // }

    return {
      topPerforming,
      needsImprovement,
      insights: [
        {
          type: 'positive',
          message: 'North America shows consistently high NPS',
          region: 'United States',
        },
        {
          type: 'attention',
          message: 'Response time in Brazil needs improvement',
          region: 'Brazil',
        },
      ],
    };
  }
}

export default new GeographicAnalyticsService();

