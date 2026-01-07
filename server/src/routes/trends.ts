import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import dayjs from 'dayjs';

const router = Router();

// GET /api/trends/history
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { period = 'monthly', months = 12 } = req.query;

    const monthsInt = parseInt(months as string);
    const startDate = dayjs().subtract(monthsInt, 'month').startOf('month').toDate();

    // Get responses grouped by month
    const monthlyData = [];
    
    for (let i = 0; i < monthsInt; i++) {
      const monthStart = dayjs().subtract(i, 'month').startOf('month').toDate();
      const monthEnd = dayjs().subtract(i, 'month').endOf('month').toDate();
      
      const responses = await prisma.surveyResponse.findMany({
        where: {
          createdAt: { gte: monthStart, lte: monthEnd },
          question: { isNPS: true }
        }
      });

      const promoters = responses.filter(r => r.score && r.score >= 9).length;
      const passives = responses.filter(r => r.score && r.score >= 7 && r.score <= 8).length;
      const detractors = responses.filter(r => r.score && r.score <= 6).length;
      const total = responses.length;
      const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      monthlyData.push({
        month: dayjs(monthStart).format('MMM'),
        year: dayjs(monthStart).format('YYYY'),
        promoters,
        passives,
        detractors,
        nps,
        total
      });
    }

    res.json(monthlyData.reverse());
  } catch (error) {
    console.error('Trends history error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trends/response-rate
router.get('/response-rate', async (req: Request, res: Response) => {
  try {
    const { months = 6 } = req.query;
    const monthsInt = parseInt(months as string);

    const data = [];
    
    for (let i = 0; i < monthsInt; i++) {
      const monthStart = dayjs().subtract(i, 'month').startOf('month').toDate();
      const monthEnd = dayjs().subtract(i, 'month').endOf('month').toDate();
      
      const sent = await prisma.survey.count({
        where: { sentAt: { gte: monthStart, lte: monthEnd } }
      });

      const completed = await prisma.survey.count({
        where: {
          sentAt: { gte: monthStart, lte: monthEnd },
          status: 'COMPLETED'
        }
      });

      // Calculate median time to feedback
      const completedSurveys = await prisma.survey.findMany({
        where: {
          sentAt: { gte: monthStart, lte: monthEnd },
          status: 'COMPLETED',
          respondedAt: { not: null }
        },
        select: { sentAt: true, respondedAt: true }
      });

      const feedbackTimes = completedSurveys
        .filter(s => s.respondedAt)
        .map(s => dayjs(s.respondedAt!).diff(dayjs(s.sentAt), 'hours'));
      
      const medianTime = feedbackTimes.length > 0
        ? feedbackTimes.sort((a, b) => a - b)[Math.floor(feedbackTimes.length / 2)]
        : 0;

      data.push({
        month: dayjs(monthStart).format('MMM'),
        responseRate: sent > 0 ? Math.round((completed / sent) * 100) : 0,
        timeToFeedback: medianTime
      });
    }

    res.json(data.reverse());
  } catch (error) {
    console.error('Response rate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trends/insights
router.get('/insights', async (req: Request, res: Response) => {
  try {
    // Get significant events from action items
    const insights = await prisma.actionItem.findMany({
      where: {
        priority: 'HIGH',
        createdAt: { gte: dayjs().subtract(3, 'months').toDate() }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    const formatted = insights.map(i => ({
      id: i.id,
      title: i.title,
      description: i.description,
      date: dayjs(i.createdAt).format('MMMM YYYY'),
      status: i.status,
      resolved: i.status === 'COMPLETED'
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Trends insights error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

