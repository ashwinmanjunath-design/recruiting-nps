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
router.use(requirePermission(Permission.VIEW_GEOGRAPHIC));

// GET /api/geographic/regions
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT
router.get('/regions', async (req, res) => {
  try {
    const { audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    // Add limit and filter by audience
    const geoMetrics = await prisma.geoMetric.findMany({
      where: { audience },
      orderBy: { country: 'asc' },
      take: 500 // Limit results
    });

    const regions = geoMetrics.map(g => ({
      country: g.country,
      region: g.region || g.country,
      nps: g.npsScore,
      responseRate: g.responseRate,
      totalCandidates: g.totalCandidates,
      medianTimeToFeedback: g.avgTimeDays
    }));

    res.json({ audience, regions });
  } catch (error) {
    console.error('Geographic regions error:', error);
    res.status(500).json({ error: 'Failed to fetch geographic data' });
  }
});

// GET /api/geographic/map-data
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT
router.get('/map-data', async (req, res) => {
  try {
    const { audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    // Add limit and filter by audience
    const geoMetrics = await prisma.geoMetric.findMany({
      where: { audience },
      take: 500 // Limit results
    });

    // Convert to GeoJSON format
    const features = geoMetrics.map(g => ({
      type: 'Feature',
      properties: {
        country: g.country,
        nps: g.npsScore,
        responseRate: g.responseRate,
        candidateCount: g.totalCandidates
      },
      geometry: {
        type: 'Point',
        coordinates: [0, 0] // TODO: Add lat/lon to schema or use geocoding
      }
    }));

    const geoJSON = {
      type: 'FeatureCollection',
      features
    };

    res.json({ audience, ...geoJSON });
  } catch (error) {
    console.error('Geographic map data error:', error);
    res.status(500).json({ error: 'Failed to fetch map data' });
  }
});

// GET /api/geographic/insights
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&region=...
router.get('/insights', async (req, res) => {
  try {
    const { region, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    let where: any = { audience };
    if (region) {
      where.OR = [
        { country: region, audience },
        { region: region, audience }
      ];
      delete where.audience;
    }

    const metrics = await prisma.geoMetric.findMany({ where });

    const totalCandidates = metrics.reduce((sum, m) => sum + m.totalCandidates, 0);
    const avgNps = metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.npsScore, 0) / metrics.length)
      : 0;
    const avgResponseRate = metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.responseRate, 0) / metrics.length)
      : 0;

    // Get related actions
    const actions = await prisma.actionItem.findMany({
      where: {
        status: { not: 'COMPLETED' }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    res.json({
      audience,
      region: region || 'All Regions',
      metrics: {
        nps: avgNps,
        responseRate: avgResponseRate,
        totalCandidates,
        regionCount: metrics.length
      },
      insights: metrics.map(m => ({
        country: m.country,
        nps: m.npsScore,
        trend: 'stable' // TODO: Calculate trend
      })),
      actions: actions.map(a => ({
        id: a.id,
        title: a.title,
        priority: a.priority,
        status: a.status
      }))
    });
  } catch (error) {
    console.error('Geographic insights error:', error);
    res.status(500).json({ error: 'Failed to fetch geographic insights' });
  }
});

export default router;

