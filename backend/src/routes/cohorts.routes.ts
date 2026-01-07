import { Router } from 'express';
import { PrismaClient, SurveyAudience } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../../../shared/types/enums';

const router = Router();
const prisma = new PrismaClient();

// Valid audience values for validation
const VALID_AUDIENCES = ['CANDIDATE', 'HIRING_MANAGER', 'WORKPLACE', 'IT_SUPPORT'] as const;

/**
 * Parse and validate audience parameter from query string
 * Defaults to CANDIDATE if not provided or invalid
 */
function parseAudience(audienceParam: string | undefined): SurveyAudience {
  if (!audienceParam) return 'CANDIDATE';
  const upper = audienceParam.toUpperCase();
  if (VALID_AUDIENCES.includes(upper as any)) {
    return upper as SurveyAudience;
  }
  return 'CANDIDATE';
}

router.use(authMiddleware);
router.use(requirePermission(Permission.VIEW_COHORTS));

// GET /api/cohorts/analysis
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&role=...&source=...
router.get('/analysis', async (req, res) => {
  try {
    const { role, source, stage, location, recency, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    // Build filter
    const where: any = {};
    if (role) where.role = role;
    if (source) where.source = source;
    if (location) where.country = { contains: location as string };

    // Add limit to prevent unbounded queries
    const candidates = await prisma.candidate.findMany({
      where,
      take: 5000, // Limit results
      include: {
        surveys: {
          where: { audience }, // Filter surveys by audience
          include: { responses: true }
        }
      }
    });

    // Calculate metrics - only from surveys matching the audience
    const responsesAll = candidates.flatMap(c => c.surveys.flatMap(s => s.responses));
    const npsScores = responsesAll.map(r => (r as any).npsScore ?? r.score).filter(s => s !== null && s !== undefined) as number[];
    
    const promoters = npsScores.filter(s => s >= 9).length;
    const passives = npsScores.filter(s => s >= 7 && s <= 8).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const total = npsScores.length;
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    const responseRate = candidates.length > 0
      ? Math.round((responsesAll.length / candidates.length) * 100)
      : 0;

    res.json({
      audience,
      cohort: {
        size: candidates.length,
        nps,
        responseRate,
        promoters,
        passives,
        detractors
      },
      filters: { role, source, stage, location, recency }
    });
  } catch (error) {
    console.error('Cohort analysis error:', error);
    res.status(500).json({ error: 'Failed to fetch cohort analysis' });
  }
});

// GET /api/cohorts/comparison
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&cohort1=...&cohort2=...
router.get('/comparison', async (req, res) => {
  try {
    const { cohort1, cohort2, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    if (!cohort1 || !cohort2) {
      return res.status(400).json({ error: 'Both cohort1 and cohort2 are required' });
    }

    const getCohortMetrics = async (cohortId: string) => {
      const cohort = await prisma.cohortDefinition.findUnique({
        where: { id: cohortId },
        include: {
          members: {
            include: {
              candidate: {
                include: {
                  surveys: {
                    where: { audience }, // Filter by audience
                    include: { responses: true }
                  }
                }
              }
            }
          }
        }
      });

      if (!cohort) return null;

      const candidates = cohort.members.map(m => m.candidate);
      const responses = candidates.flatMap(c => c.surveys.flatMap(s => s.responses));
      const npsScores = responses.map(r => (r as any).npsScore ?? r.score).filter(s => s !== null && s !== undefined) as number[];
      
      const promoters = npsScores.filter(s => s >= 9).length;
      const detractors = npsScores.filter(s => s <= 6).length;
      const total = npsScores.length;
      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      return {
        id: cohort.id,
        name: cohort.name,
        size: candidates.length,
        nps,
        responseRate: candidates.length > 0 ? Math.round((responses.length / candidates.length) * 100) : 0,
        promoters,
        detractors
      };
    };

    const [metrics1, metrics2] = await Promise.all([
      getCohortMetrics(cohort1 as string),
      getCohortMetrics(cohort2 as string)
    ]);

    if (!metrics1 || !metrics2) {
      return res.status(404).json({ error: 'One or both cohorts not found' });
    }

    res.json({
      audience,
      cohort1: metrics1,
      cohort2: metrics2,
      comparison: {
        npsDiff: metrics1.nps - metrics2.nps,
        responseRateDiff: metrics1.responseRate - metrics2.responseRate
      }
    });
  } catch (error) {
    console.error('Cohort comparison error:', error);
    res.status(500).json({ error: 'Failed to compare cohorts' });
  }
});

// GET /api/cohorts/feedback-themes
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT
router.get('/feedback-themes', async (req, res) => {
  try {
    const { cohort, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const themes = await prisma.feedbackTheme.findMany({
      orderBy: { count: 'desc' },
      take: 20
    });

    res.json({
      audience,
      themes: themes.map(t => ({
        theme: (t as any).theme ?? t.name,
        count: t.count,
        sentiment: t.sentiment,
        category: t.category
      }))
    });
  } catch (error) {
    console.error('Feedback themes error:', error);
    res.status(500).json({ error: 'Failed to fetch feedback themes' });
  }
});

// GET /api/cohorts/scatter-data
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT
router.get('/scatter-data', async (req, res) => {
  try {
    const { audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const cohorts = await prisma.cohortDefinition.findMany({
      include: {
        members: {
          include: {
            candidate: {
              include: {
                surveys: {
                  where: { audience }, // Filter by audience
                  include: { responses: true }
                }
              }
            }
          }
        }
      }
    });

    const scatterData = cohorts.map(cohort => {
      const candidates = cohort.members.map(m => m.candidate);
      const responses = candidates.flatMap(c => c.surveys.flatMap(s => s.responses));
      const npsScores = responses.map(r => (r as any).npsScore ?? r.score).filter(s => s !== null && s !== undefined) as number[];
      
      const promoters = npsScores.filter(s => s >= 9).length;
      const detractors = npsScores.filter(s => s <= 6).length;
      const total = npsScores.length;
      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      return {
        cohortName: cohort.name,
        nps,
        responseRate: candidates.length > 0 ? Math.round((responses.length / candidates.length) * 100) : 0,
        size: candidates.length
      };
    });

    res.json({ audience, data: scatterData });
  } catch (error) {
    console.error('Scatter data error:', error);
    res.status(500).json({ error: 'Failed to fetch scatter data' });
  }
});

export default router;

