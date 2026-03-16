import { PrismaClient } from '@prisma/client';
import { NpsFilters } from './nps-analytics.service';

const prisma = new PrismaClient();

/**
 * Cohort Analytics Service
 *
 * Computes cohort-based analytics from real survey data.
 */

const COHORT_COLORS = ['#14b8a6', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export interface CohortData {
  id: string;
  name: string;
  npsScore: number;
  percentage: number;
  count: number;
  color: string;
  regions: Array<{
    city: string;
    lat: number;
    lng: number;
    value: number;
  }>;
}

export interface CohortComparison {
  cohort1: {
    id: string;
    name: string;
    nps: number;
    responseRate: number;
    sampleSize: number;
  };
  cohort2: {
    id: string;
    name: string;
    nps: number;
    responseRate: number;
    sampleSize: number;
  };
  difference: {
    nps: number;
    responseRate: number;
  };
}

function calculateNpsFromScores(scores: number[]): number {
  if (scores.length === 0) return 0;
  const promoters = scores.filter(s => s >= 9).length;
  const detractors = scores.filter(s => s <= 6).length;
  return Math.round(((promoters - detractors) / scores.length) * 100);
}

export class CohortAnalyticsService {
  /**
   * Get cohort breakdown with NPS scores and geographic distribution
   */
  async getCohortBreakdown(filters?: NpsFilters): Promise<CohortData[]> {
    const audience = filters?.audience || 'CANDIDATE';

    const cohorts = await prisma.cohortDefinition.findMany({
      where: { isActive: true },
      include: {
        members: {
          include: {
            candidate: {
              include: {
                surveys: {
                  where: { audience, sentAt: { not: null } },
                  include: { responses: true },
                },
              },
            },
          },
        },
      },
    });

    if (cohorts.length === 0) return [];

    // Total candidates across all cohorts for percentage calculation
    const totalMembers = cohorts.reduce((sum, c) => sum + c.members.length, 0);

    return cohorts.map((cohort, idx) => {
      const members = cohort.members;
      const scores = members
        .flatMap(m => m.candidate.surveys.flatMap(s => s.responses))
        .map(r => r.score)
        .filter((s): s is number => s !== null);

      const npsScore = calculateNpsFromScores(scores);

      // Group candidates by country for regions
      const countryMap = new Map<string, number>();
      for (const m of members) {
        const country = m.candidate.country || 'Unknown';
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      }

      const regions = Array.from(countryMap.entries()).map(([city, value]) => ({
        city,
        lat: 0, // Would need geocoding for real coordinates
        lng: 0,
        value,
      }));

      return {
        id: cohort.id,
        name: cohort.name,
        npsScore,
        percentage: totalMembers > 0 ? Math.round((members.length / totalMembers) * 1000) / 10 : 0,
        count: members.length,
        color: COHORT_COLORS[idx % COHORT_COLORS.length],
        regions,
      };
    });
  }

  /**
   * Compare two cohorts side-by-side
   */
  async compareCohorts(
    cohort1Id: string,
    cohort2Id: string,
    filters?: NpsFilters
  ): Promise<CohortComparison | null> {
    const audience = filters?.audience || 'CANDIDATE';

    const getCohortStats = async (cohortId: string) => {
      const cohort = await prisma.cohortDefinition.findUnique({
        where: { id: cohortId },
        include: {
          members: {
            include: {
              candidate: {
                include: {
                  surveys: {
                    where: { audience },
                    include: { responses: true },
                  },
                },
              },
            },
          },
        },
      });

      if (!cohort) return null;

      const members = cohort.members;
      const scores = members
        .flatMap(m => m.candidate.surveys.flatMap(s => s.responses))
        .map(r => r.score)
        .filter((s): s is number => s !== null);

      const totalSurveys = members.flatMap(m => m.candidate.surveys).length;
      const surveysWithResponses = members
        .flatMap(m => m.candidate.surveys)
        .filter(s => s.responses.length > 0).length;

      return {
        id: cohort.id,
        name: cohort.name,
        nps: calculateNpsFromScores(scores),
        responseRate: totalSurveys > 0 ? Math.round((surveysWithResponses / totalSurveys) * 100) : 0,
        sampleSize: members.length,
      };
    };

    const [stats1, stats2] = await Promise.all([
      getCohortStats(cohort1Id),
      getCohortStats(cohort2Id),
    ]);

    if (!stats1 || !stats2) return null;

    return {
      cohort1: stats1,
      cohort2: stats2,
      difference: {
        nps: stats1.nps - stats2.nps,
        responseRate: stats1.responseRate - stats2.responseRate,
      },
    };
  }

  /**
   * Get cohort analysis by specific dimension (role, source, stage, country)
   */
  async getCohortAnalysisByDimension(
    dimension: 'role' | 'source' | 'stage' | 'country',
    filters?: NpsFilters
  ): Promise<Array<{
    cohortName: string;
    nps: number;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>> {
    const audience = filters?.audience || 'CANDIDATE';
    const dimField = dimension === 'stage' ? 'interviewStage' : dimension;

    const candidates = await prisma.candidate.findMany({
      where: {
        [dimField]: { not: null },
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
    const groups = new Map<string, typeof candidates>();
    for (const c of candidates) {
      const key = (c as any)[dimField] as string;
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(c);
    }

    return Array.from(groups.entries()).map(([cohortName, groupCandidates]) => {
      const scores = groupCandidates
        .flatMap(c => c.surveys.flatMap(s => s.responses))
        .map(r => r.score)
        .filter((s): s is number => s !== null);

      return {
        cohortName,
        nps: calculateNpsFromScores(scores),
        count: scores.length,
        trend: 'stable' as const, // TODO: compare with previous period for actual trend
      };
    }).sort((a, b) => b.nps - a.nps);
  }

  /**
   * Get feedback themes by cohort
   */
  async getFeedbackThemesByCohort(
    cohortId: string,
    filters?: NpsFilters
  ): Promise<Array<{
    theme: string;
    sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    count: number;
    examples: string[];
  }>> {
    // Get themes from FeedbackTheme table
    const themes = await prisma.feedbackTheme.findMany({
      orderBy: { count: 'desc' },
      take: 20,
    });

    if (themes.length === 0) return [];

    return themes.map(t => ({
      theme: t.name,
      sentiment: t.sentiment as 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL',
      count: t.count,
      examples: t.examples,
    }));
  }
}

export default new CohortAnalyticsService();
