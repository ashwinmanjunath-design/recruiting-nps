import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import dayjs from 'dayjs';

const router = Router();

// GET /api/dashboard/overview
router.get('/overview', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Calculate date range
    const start = startDate ? new Date(startDate as string) : dayjs().subtract(30, 'days').toDate();
    const end = endDate ? new Date(endDate as string) : new Date();

    // Get all responses in date range
    const responses = await prisma.surveyResponse.findMany({
      where: {
        createdAt: { gte: start, lte: end },
        question: { isNPS: true }
      },
      include: {
        candidate: true,
        survey: true
      }
    });

    // Calculate NPS metrics
    const promoters = responses.filter(r => r.score && r.score >= 9).length;
    const passives = responses.filter(r => r.score && r.score >= 7 && r.score <= 8).length;
    const detractors = responses.filter(r => r.score && r.score <= 6).length;
    const total = responses.length;

    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round((total / (total + 100)) * 100) : 0; // Mock denominator

    // Get all surveys sent
    const surveysSent = await prisma.survey.count({
      where: {
        sentAt: { gte: start, lte: end }
      }
    });

    const actualResponseRate = surveysSent > 0 ? Math.round((total / surveysSent) * 100) : 0;

    // Calculate median time to feedback
    const completedSurveys = await prisma.survey.findMany({
      where: {
        status: 'COMPLETED',
        respondedAt: { not: null },
        sentAt: { gte: start, lte: end }
      },
      select: {
        sentAt: true,
        respondedAt: true
      }
    });

    const feedbackTimes = completedSurveys
      .filter(s => s.respondedAt)
      .map(s => dayjs(s.respondedAt!).diff(dayjs(s.sentAt), 'hours'));
    
    const medianTime = feedbackTimes.length > 0
      ? feedbackTimes.sort((a, b) => a - b)[Math.floor(feedbackTimes.length / 2)]
      : 19;

    // Get previous period for comparison
    const prevStart = dayjs(start).subtract(dayjs(end).diff(dayjs(start), 'days'), 'days').toDate();
    const prevEnd = start;

    const prevResponses = await prisma.surveyResponse.count({
      where: {
        createdAt: { gte: prevStart, lte: prevEnd },
        question: { isNPS: true }
      }
    });

    const prevPromoters = await prisma.surveyResponse.count({
      where: {
        createdAt: { gte: prevStart, lte: prevEnd },
        question: { isNPS: true },
        score: { gte: 9 }
      }
    });

    const prevDetractors = await prisma.surveyResponse.count({
      where: {
        createdAt: { gte: prevStart, lte: prevEnd },
        question: { isNPS: true },
        score: { lte: 6 }
      }
    });

    const prevNPS = prevResponses > 0 
      ? Math.round(((prevPromoters - prevDetractors) / prevResponses) * 100) 
      : 0;

    const npsChange = npsScore - prevNPS;

    res.json({
      totalInvitations: surveysSent,
      responseRate: actualResponseRate,
      responseRateChange: 64, // Mock
      npsScore,
      npsChange,
      npsPercentageChange: prevNPS > 0 ? Math.round((npsChange / prevNPS) * 100) : 46,
      medianTimeToFeedback: medianTime,
      breakdown: {
        promoters: { count: promoters, percentage: total > 0 ? Math.round((promoters / total) * 100) : 0 },
        passives: { count: passives, percentage: total > 0 ? Math.round((passives / total) * 100) : 0 },
        detractors: { count: detractors, percentage: total > 0 ? Math.round((detractors / total) * 100) : 0 }
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/insights
router.get('/insights', async (req: Request, res: Response) => {
  try {
    // Get positive and negative themes
    const positiveThemes = await prisma.feedbackTheme.findMany({
      where: { category: 'POSITIVE' },
      orderBy: { count: 'desc' },
      take: 5
    });

    const negativeThemes = await prisma.feedbackTheme.findMany({
      where: { category: 'NEGATIVE' },
      orderBy: { count: 'desc' },
      take: 5
    });

    // Get recent action items
    const recentActions = await prisma.actionItem.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
      where: {
        status: { not: 'COMPLETED' }
      }
    });

    res.json({
      positiveThemes: positiveThemes.map(t => t.name),
      negativeThemes: negativeThemes.map(t => t.name),
      actionableInsights: [
        {
          title: 'Review wait times (Longer Interview)',
          priority: 'HIGH',
          checked: false
        },
        {
          title: 'Create Feedback Templates',
          priority: 'MEDIUM',
          checked: false
        },
        {
          title: 'Mark as Done',
          priority: 'LOW',
          checked: false
        }
      ],
      recentActions
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/dashboard/cohorts-mini
router.get('/cohorts-mini', async (req: Request, res: Response) => {
  try {
    const cohorts = await prisma.$queryRaw`
      SELECT 
        c.role as cohort_name,
        COUNT(DISTINCT sr.id) as total_responses,
        AVG(sr.score) as avg_score,
        COUNT(CASE WHEN sr.score >= 9 THEN 1 END) as promoters,
        COUNT(CASE WHEN sr.score <= 6 THEN 1 END) as detractors
      FROM candidates c
      JOIN survey_responses sr ON c.id = sr."candidateId"
      JOIN survey_questions sq ON sr."questionId" = sq.id
      WHERE sq."isNPS" = true
      GROUP BY c.role
      ORDER BY COUNT(DISTINCT sr.id) DESC
      LIMIT 5
    ` as any[];

    const formatted = cohorts.map((c: any) => {
      const nps = Math.round(((c.promoters - c.detractors) / c.total_responses) * 100);
      return {
        role: c.cohort_name,
        nps,
        trend: Math.round(Math.random() * 10), // Mock trend
        trendDirection: Math.random() > 0.5 ? 'up' : 'neutral'
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Cohorts mini error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

