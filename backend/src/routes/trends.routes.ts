import { Router } from 'express';
import { SurveyAudience } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../../../shared/types/enums';
import trendsAnalyticsService from '../services/trends-analytics.service';

const router = Router();

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
router.use(requirePermission(Permission.VIEW_TRENDS));

/**
 * GET /api/trends/composition
 * Returns NPS composition trend (stacked percentages + NPS score line)
 * Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&interval=...
 */
router.get('/composition', async (req, res) => {
  try {
    const { interval = 'monthly', baseline, from, to, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const filters = {
      interval: interval as 'weekly' | 'monthly' | 'quarterly',
      baseline: baseline as any,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      audience,
    };

    const data = await trendsAnalyticsService.getNpsCompositionTrend(filters);
    
    res.json({ audience, data });
  } catch (error) {
    console.error('Trends composition error:', error);
    res.status(500).json({ error: 'Failed to fetch NPS composition trend' });
  }
});

/**
 * GET /api/trends/response
 * Returns response rate and time-to-feedback trend
 * Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&interval=...
 */
router.get('/response', async (req, res) => {
  try {
    const { interval = 'monthly', baseline, from, to, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const filters = {
      interval: interval as 'weekly' | 'monthly' | 'quarterly',
      baseline: baseline as any,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      audience,
    };

    const data = await trendsAnalyticsService.getResponseRateTrend(filters);
    
    res.json({ audience, data });
  } catch (error) {
    console.error('Response rate trend error:', error);
    res.status(500).json({ error: 'Failed to fetch response rate trend' });
  }
});

/**
 * GET /api/trends/insights
 * Returns noteworthy insights and events from trend analysis
 * Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&interval=...
 */
router.get('/insights', async (req, res) => {
  try {
    const { interval, baseline, from, to, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const filters = {
      interval: interval as 'weekly' | 'monthly' | 'quarterly' | undefined,
      baseline: baseline as any,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      audience,
    };

    const insights = await trendsAnalyticsService.getTrendInsights(filters);
    
    res.json({ audience, insights });
  } catch (error) {
    console.error('Trends insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

/**
 * GET /api/trends/summary
 * Returns summary statistics for the trends page header
 * Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&interval=...
 */
router.get('/summary', async (req, res) => {
  try {
    const { interval, baseline, from, to, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    const filters = {
      interval: interval as 'weekly' | 'monthly' | 'quarterly' | undefined,
      baseline: baseline as any,
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      audience,
    };

    const summary = await trendsAnalyticsService.getTrendSummary(filters);
    
    res.json({ audience, ...summary });
  } catch (error) {
    console.error('Trends summary error:', error);
    res.status(500).json({ error: 'Failed to fetch trends summary' });
  }
});

export default router;
