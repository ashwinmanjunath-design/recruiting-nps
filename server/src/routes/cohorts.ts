import { Router, Request, Response } from 'express';
import { prisma } from '../index';

const router = Router();

// GET /api/cohorts/analysis
router.get('/analysis', async (req: Request, res: Response) => {
  try {
    const { role, source, stage, location } = req.query;

    // Build where clause based on filters
    const where: any = {};
    if (role) where.role = role;
    if (source) where.source = source;
    if (location) where.country = location;
    if (stage) where.interviewStage = stage;

    // Get cohort data
    const cohortData = await prisma.$queryRaw`
      SELECT 
        c.role as cohort_name,
        c.country,
        c.interview_stage as stage,
        COUNT(DISTINCT sr.id) as total_responses,
        AVG(sr.score) as avg_score,
        COUNT(CASE WHEN sr.score >= 9 THEN 1 END) as promoters,
        COUNT(CASE WHEN sr.score <= 6 THEN 1 END) as detractors,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY 
          EXTRACT(EPOCH FROM (s."respondedAt" - s."sentAt"))/3600
        ) as median_time_hours
      FROM candidates c
      JOIN survey_responses sr ON c.id = sr."candidateId"
      JOIN survey_questions sq ON sr."questionId" = sq.id
      JOIN surveys s ON sr."surveyId" = s.id
      WHERE sq."isNPS" = true
      ${Object.keys(where).length > 0 ? 'AND ' + Object.entries(where).map(([k, v]) => `c.${k} = '${v}'`).join(' AND ') : ''}
      GROUP BY c.role, c.country, c.interview_stage
      ORDER BY COUNT(DISTINCT sr.id) DESC
    ` as any[];

    const formatted = cohortData.map((c: any) => {
      const total = parseInt(c.total_responses);
      const nps = Math.round(((c.promoters - c.detractors) / total) * 100);
      
      return {
        cohortName: c.cohort_name,
        country: c.country,
        stage: c.stage,
        nps,
        avgScore: parseFloat(c.avg_score).toFixed(1),
        medianTimeHours: parseFloat(c.median_time_hours || 0).toFixed(1),
        changeVsPrevPeriod: Math.round((Math.random() - 0.5) * 20), // Mock
        trend: Math.random() > 0.5 ? 'up' : 'neutral',
        sampleSize: total,
        significance: total > 50 ? 'High' : total > 20 ? 'Medium' : 'Low'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Cohorts analysis error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cohorts/comparison
router.get('/comparison', async (req: Request, res: Response) => {
  try {
    const { cohort1, cohort2 } = req.query;

    if (!cohort1 || !cohort2) {
      return res.status(400).json({ error: 'cohort1 and cohort2 are required' });
    }

    // Get data for both cohorts
    const getCohortData = async (cohortName: string) => {
      const responses = await prisma.surveyResponse.findMany({
        where: {
          candidate: { role: cohortName },
          question: { isNPS: true }
        },
        include: {
          candidate: true
        }
      });

      const promoters = responses.filter(r => r.score && r.score >= 9).length;
      const detractors = responses.filter(r => r.score && r.score <= 6).length;
      const total = responses.length;
      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      return {
        cohortName,
        nps,
        totalResponses: total,
        promoters,
        detractors,
        avgScore: total > 0 ? (responses.reduce((sum, r) => sum + (r.score || 0), 0) / total).toFixed(1) : '0'
      };
    };

    const cohort1Data = await getCohortData(cohort1 as string);
    const cohort2Data = await getCohortData(cohort2 as string);

    res.json({
      cohort1: cohort1Data,
      cohort2: cohort2Data,
      comparison: {
        npsDifference: cohort1Data.nps - cohort2Data.nps,
        responseDifference: cohort1Data.totalResponses - cohort2Data.totalResponses
      }
    });
  } catch (error) {
    console.error('Cohorts comparison error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cohorts/feedback-themes
router.get('/feedback-themes', async (req: Request, res: Response) => {
  try {
    const { cohort } = req.query;

    // Get feedback themes
    const themes = await prisma.feedbackTheme.findMany({
      orderBy: { count: 'desc' },
      take: 10
    });

    // Separate by sentiment
    const positiveThemes = themes.filter(t => t.sentiment === 'POSITIVE');
    const negativeThemes = themes.filter(t => t.sentiment === 'NEGATIVE');

    res.json({
      cohort,
      positive: positiveThemes.map(t => ({
        name: t.name,
        count: t.count,
        level: t.count > 50 ? 'High' : 'Medium'
      })),
      negative: negativeThemes.map(t => ({
        name: t.name,
        count: t.count,
        level: t.count > 50 ? 'High' : 'Medium'
      }))
    });
  } catch (error) {
    console.error('Feedback themes error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/cohorts/scatter-data
router.get('/scatter-data', async (req: Request, res: Response) => {
  try {
    // Get all responses for scatter plot visualization
    const responses = await prisma.surveyResponse.findMany({
      where: {
        question: { isNPS: true }
      },
      include: {
        candidate: true
      },
      take: 200 // Limit for performance
    });

    const scatterData = responses.map(r => ({
      x: r.score || 0,
      y: Math.random() * 10, // Mock Y-axis (could be time, etc.)
      cohort: r.candidate.role,
      country: r.candidate.country
    }));

    res.json(scatterData);
  } catch (error) {
    console.error('Scatter data error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

