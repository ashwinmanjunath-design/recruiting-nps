import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/geographic/regions
router.get('/regions', async (req: Request, res: Response) => {
  try {
    const { compareWith = 'all' } = req.query;

    // Get NPS by region
    const regionData = await prisma.$queryRaw`
      SELECT 
        c.region,
        c.country,
        COUNT(DISTINCT sr.id) as total_responses,
        AVG(sr.score) as avg_score,
        COUNT(CASE WHEN sr.score >= 9 THEN 1 END) as promoters,
        COUNT(CASE WHEN sr.score <= 6 THEN 1 END) as detractors
      FROM candidates c
      JOIN survey_responses sr ON c.id = sr."candidateId"
      JOIN survey_questions sq ON sr."questionId" = sq.id
      WHERE sq."isNPS" = true AND c.region IS NOT NULL
      GROUP BY c.region, c.country
      ORDER BY COUNT(DISTINCT sr.id) DESC
    ` as any[];

    const formatted = regionData.map((r: any) => {
      const total = parseInt(r.total_responses);
      const nps = Math.round(((r.promoters - r.detractors) / total) * 100);
      const responseRate = Math.round(Math.random() * 30 + 70); // Mock: 70-100%
      
      return {
        region: r.region || r.country,
        country: r.country,
        nps,
        avgScore: parseFloat(r.avg_score).toFixed(1),
        totalCandidates: total,
        responseRate,
        medianTimeHours: Math.round(Math.random() * 10 + 12), // Mock: 12-22 hours
        changeVsAverage: Math.round((Math.random() - 0.5) * 20), // Mock: -10% to +10%
        trend7day: Math.round((Math.random() - 0.5) * 30) // Mock trend
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Geographic regions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/geographic/map-data
router.get('/map-data', async (req: Request, res: Response) => {
  try {
    // Get NPS score by country for map visualization
    const countryData = await prisma.$queryRaw`
      SELECT 
        c.country,
        COUNT(DISTINCT sr.id) as total_responses,
        COUNT(CASE WHEN sr.score >= 9 THEN 1 END) as promoters,
        COUNT(CASE WHEN sr.score <= 6 THEN 1 END) as detractors
      FROM candidates c
      JOIN survey_responses sr ON c.id = sr."candidateId"
      JOIN survey_questions sq ON sr."questionId" = sq.id
      WHERE sq."isNPS" = true AND c.country IS NOT NULL
      GROUP BY c.country
    ` as any[];

    const mapData = countryData.map((c: any) => {
      const total = parseInt(c.total_responses);
      const nps = Math.round(((c.promoters - c.detractors) / total) * 100);
      
      return {
        country: c.country,
        nps,
        candidates: total,
        color: nps >= 70 ? '#10b981' : nps >= 50 ? '#f59e0b' : '#ef4444'
      };
    });

    res.json(mapData);
  } catch (error) {
    console.error('Map data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/geographic/insights
router.get('/insights', async (req: Request, res: Response) => {
  try {
    const { region } = req.query;

    // Generate insights based on data
    const insights = [
      {
        title: 'High NPS in India correlates with university hiring events',
        checked: true,
        type: 'positive'
      },
      {
        title: 'Low response rate Brazil due timezone challenges',
        checked: false,
        type: 'negative'
      },
      {
        title: 'Low response rate challenges',
        checked: false,
        type: 'warning'
      }
    ];

    res.json(insights);
  } catch (error) {
    console.error('Geographic insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

