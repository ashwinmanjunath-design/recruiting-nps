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

// All routes require authentication
router.use(authMiddleware);
router.use(requirePermission(Permission.VIEW_DASHBOARD));

// GET /api/dashboard/overview
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT&startDate=...&endDate=...
router.get('/overview', async (req, res) => {
  try {
    const { startDate, endDate, audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    // Get total candidates
    const totalCandidates = await prisma.candidate.count();

    // Get surveys with responses in date range, filtered by audience
    const surveyWhere: any = { 
      sentAt: { not: null },
      audience // Filter by audience
    };
    if (startDate) {
      surveyWhere.sentAt = { ...surveyWhere.sentAt, gte: new Date(startDate as string) };
    }
    if (endDate) {
      surveyWhere.sentAt = { ...surveyWhere.sentAt, lte: new Date(endDate as string) };
    }

    // Add limit to prevent unbounded queries
    const surveys = await prisma.survey.findMany({
      where: surveyWhere,
      take: 10000, // Limit results
      include: { responses: true }
    });

    const totalSent = surveys.length;
    const totalResponses = surveys.filter(s => s.responses.length > 0).length;
    const responseRate = totalSent > 0 ? Math.round((totalResponses / totalSent) * 100) : 0;

    // Calculate NPS
    const responses = surveys.flatMap(s => s.responses);
    const npsScores = responses.map(r => (r as any).npsScore ?? r.score).filter(s => s !== null && s !== undefined) as number[];
    
    const promoters = npsScores.filter(s => s >= 9).length;
    const passives = npsScores.filter(s => s >= 7 && s <= 8).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    
    const total = npsScores.length;
    const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    // Average time to feedback (in days)
    const timesToFeedback = responses
      .filter(r => r.createdAt)
      .map(r => {
        const survey = surveys.find(s => s.id === r.surveyId);
        if (!survey || !survey.sentAt) return null;
        const days = Math.abs(new Date(r.createdAt).getTime() - new Date(survey.sentAt).getTime()) / (1000 * 60 * 60 * 24);
        return days;
      })
      .filter(d => d !== null) as number[];

    const avgTimeToFeedback = timesToFeedback.length > 0
      ? Math.round(timesToFeedback.reduce((a, b) => a + b, 0) / timesToFeedback.length)
      : 0;

    // NPS history (last 6 months) - filtered by audience
    const npsHistory = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthResponses = responses.filter(r => {
        const date = new Date(r.createdAt);
        return date >= monthStart && date < monthEnd;
      });
      
      const monthNpsScores = monthResponses.map(r => (r as any).npsScore ?? r.score).filter(s => s !== null && s !== undefined) as number[];
      const monthPromoters = monthNpsScores.filter(s => s >= 9).length;
      const monthDetractors = monthNpsScores.filter(s => s <= 6).length;
      const monthTotal = monthNpsScores.length;
      const monthNps = monthTotal > 0 ? Math.round(((monthPromoters - monthDetractors) / monthTotal) * 100) : 0;
      
      npsHistory.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        nps: monthNps
      });
    }

    res.json({
      audience,
      nps,
      responseRate,
      totalCandidates,
      totalResponses,
      promoters,
      passives,
      detractors,
      avgTimeToFeedback,
      npsHistory
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard overview' });
  }
});

// ============================================================================
// GET /api/dashboard/hiring-manager
// Hiring Manager specific dashboard metrics
// Query params: ?location=berlin|prague|uk|bengaluru|singapore|brazil&quarter=Q1|Q2|Q3|Q4
// ============================================================================
router.get('/hiring-manager', async (req, res) => {
  try {
    const { location, quarter, year } = req.query;
    const currentYear = year ? parseInt(year as string) : new Date().getFullYear();

    // Build date range for quarter filter
    let dateFilter: any = {};
    if (quarter) {
      const quarterNum = parseInt((quarter as string).replace('Q', ''));
      const startMonth = (quarterNum - 1) * 3;
      const startDate = new Date(currentYear, startMonth, 1);
      const endDate = new Date(currentYear, startMonth + 3, 0);
      dateFilter = { gte: startDate, lte: endDate };
    }

    // Get all HM surveys with responses
    const surveyWhere: any = {
      audience: 'HIRING_MANAGER',
      sentAt: { not: null },
      ...(quarter && { sentAt: dateFilter })
    };

    const surveys = await prisma.survey.findMany({
      where: surveyWhere,
      take: 10000,
      include: {
        responses: {
          include: { question: true }
        },
        candidate: true
      }
    });

    // Filter by location if provided
    let filteredSurveys = surveys;
    if (location && location !== 'all') {
      const locationMap: Record<string, string[]> = {
        'berlin': ['Germany', 'Berlin', 'DE'],
        'prague': ['Czech Republic', 'Prague', 'CZ'],
        'uk': ['United Kingdom', 'UK', 'GB', 'London'],
        'bengaluru': ['India', 'Bengaluru', 'Bangalore', 'IN'],
        'singapore': ['Singapore', 'SG'],
        'brazil': ['Brazil', 'BR', 'São Paulo'],
      };
      const locationTerms = locationMap[location as string] || [];
      filteredSurveys = surveys.filter(s => 
        s.candidate && locationTerms.some(term => 
          (s.candidate.country || '').toLowerCase().includes(term.toLowerCase())
        )
      );
    }

    // Calculate metrics from responses
    const allResponses = filteredSurveys.flatMap(s => s.responses);
    
    // Group responses by question ID pattern
    const getQuestionResponses = (pattern: string) => 
      allResponses.filter(r => r.questionId?.includes(pattern));

    // Q1: HM NPS (0-10 scale) - Calculate actual NPS
    const q1Responses = getQuestionResponses('q1');
    const npsScores = q1Responses.map(r => r.score).filter(s => s !== null) as number[];
    const promoters = npsScores.filter(s => s >= 9).length;
    const passives = npsScores.filter(s => s >= 7 && s <= 8).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const totalNps = npsScores.length;
    const hmNps = totalNps > 0 ? Math.round(((promoters - detractors) / totalNps) * 100) : 0;

    // Q2: Candidate Quality (1-5 scale → percentage)
    const q2Responses = getQuestionResponses('q2');
    const q2Scores = q2Responses.map(r => r.score).filter(s => s !== null) as number[];
    const candidateQuality = q2Scores.length > 0 
      ? Math.round((q2Scores.reduce((a, b) => a + b, 0) / q2Scores.length / 5) * 100)
      : 0;

    // Q3: Role Fit (1-5 scale → percentage)
    const q3Responses = getQuestionResponses('q3');
    const q3Scores = q3Responses.map(r => r.score).filter(s => s !== null) as number[];
    const roleFit = q3Scores.length > 0 
      ? Math.round((q3Scores.reduce((a, b) => a + b, 0) / q3Scores.length / 5) * 100)
      : 0;

    // Q4: Process Speed (1-5 scale → percentage)
    const q4Responses = getQuestionResponses('q4');
    const q4Scores = q4Responses.map(r => r.score).filter(s => s !== null) as number[];
    const processSpeed = q4Scores.length > 0 
      ? Math.round((q4Scores.reduce((a, b) => a + b, 0) / q4Scores.length / 5) * 100)
      : 0;

    // Q5: Scheduling (1-5 scale → percentage)
    const q5Responses = getQuestionResponses('q5');
    const q5Scores = q5Responses.map(r => r.score).filter(s => s !== null) as number[];
    const scheduling = q5Scores.length > 0 
      ? Math.round((q5Scores.reduce((a, b) => a + b, 0) / q5Scores.length / 5) * 100)
      : 0;

    // Q6: Communication (1-5 scale → percentage)
    const q6Responses = getQuestionResponses('q6');
    const q6Scores = q6Responses.map(r => r.score).filter(s => s !== null) as number[];
    const communication = q6Scores.length > 0 
      ? Math.round((q6Scores.reduce((a, b) => a + b, 0) / q6Scores.length / 5) * 100)
      : 0;

    // Q7: Market Guidance (1-5 scale → percentage)
    const q7Responses = getQuestionResponses('q7');
    const q7Scores = q7Responses.map(r => r.score).filter(s => s !== null) as number[];
    const marketGuidance = q7Scores.length > 0 
      ? Math.round((q7Scores.reduce((a, b) => a + b, 0) / q7Scores.length / 5) * 100)
      : 0;

    // Calculate quarterly data
    const quarterlyData = [];
    for (let q = 1; q <= 4; q++) {
      const qStart = new Date(currentYear, (q - 1) * 3, 1);
      const qEnd = new Date(currentYear, q * 3, 0);
      
      const qSurveys = filteredSurveys.filter(s => {
        const sentAt = s.sentAt ? new Date(s.sentAt) : null;
        return sentAt && sentAt >= qStart && sentAt <= qEnd;
      });
      
      const qResponses = qSurveys.flatMap(s => s.responses);
      const qNpsScores = qResponses
        .filter(r => r.questionId?.includes('q1'))
        .map(r => r.score)
        .filter(s => s !== null) as number[];
      
      const qPromoters = qNpsScores.filter(s => s >= 9).length;
      const qDetractors = qNpsScores.filter(s => s <= 6).length;
      const qTotal = qNpsScores.length;
      const qNps = qTotal > 0 ? Math.round(((qPromoters - qDetractors) / qTotal) * 100) : 0;

      quarterlyData.push({
        quarter: `Q${q}`,
        nps: qNps,
        responded: qSurveys.filter(s => s.responses.length > 0).length,
        sent: qSurveys.length,
        change: q > 1 ? (qNps - (quarterlyData[q - 2]?.nps || 0)) : 0
      });
    }

    // Calculate location breakdown
    const locationBreakdown = [];
    const locations = ['berlin', 'prague', 'uk', 'bengaluru', 'singapore', 'brazil'];
    const locationNames: Record<string, string> = {
      berlin: 'Berlin', prague: 'Prague', uk: 'United Kingdom',
      bengaluru: 'Bengaluru', singapore: 'Singapore', brazil: 'Brazil'
    };
    
    for (const loc of locations) {
      const locationMap: Record<string, string[]> = {
        'berlin': ['Germany', 'Berlin', 'DE'],
        'prague': ['Czech Republic', 'Prague', 'CZ'],
        'uk': ['United Kingdom', 'UK', 'GB', 'London'],
        'bengaluru': ['India', 'Bengaluru', 'Bangalore', 'IN'],
        'singapore': ['Singapore', 'SG'],
        'brazil': ['Brazil', 'BR', 'São Paulo'],
      };
      const terms = locationMap[loc];
      const locSurveys = surveys.filter(s => 
        s.candidate && terms.some(term => 
          (s.candidate.country || '').toLowerCase().includes(term.toLowerCase())
        )
      );
      
      const locResponses = locSurveys.flatMap(s => s.responses);
      const locNpsScores = locResponses
        .filter(r => r.questionId?.includes('q1'))
        .map(r => r.score)
        .filter(s => s !== null) as number[];
      
      const locPromoters = locNpsScores.filter(s => s >= 9).length;
      const locDetractors = locNpsScores.filter(s => s <= 6).length;
      const locTotal = locNpsScores.length;
      const locNps = locTotal > 0 ? Math.round(((locPromoters - locDetractors) / locTotal) * 100) : 0;

      locationBreakdown.push({
        region: locationNames[loc],
        regionCode: loc.toUpperCase().slice(0, 2),
        nps: locNps,
        responded: locSurveys.filter(s => s.responses.length > 0).length,
        sent: locSurveys.length,
        trend: 'stable' as const // TODO: Calculate actual trend
      });
    }

    // Response overview
    const totalSent = filteredSurveys.length;
    const totalResponded = filteredSurveys.filter(s => s.responses.length > 0).length;
    const responseRate = totalSent > 0 ? Math.round((totalResponded / totalSent) * 100) : 0;

    res.json({
      audience: 'HIRING_MANAGER',
      filters: { location, quarter, year: currentYear },
      
      // Main metrics (mapped from questions)
      metrics: {
        hmNps,                    // Q1
        candidateQuality,         // Q2
        roleFit,                  // Q3
        processSpeed,             // Q4
        scheduling,               // Q5
        communication,            // Q6
        marketGuidance,           // Q7
      },
      
      // NPS breakdown
      npsBreakdown: {
        promoters,
        passives,
        detractors,
        total: totalNps,
        promotersPercent: totalNps > 0 ? Math.round((promoters / totalNps) * 100) : 0,
        passivesPercent: totalNps > 0 ? Math.round((passives / totalNps) * 100) : 0,
        detractorsPercent: totalNps > 0 ? Math.round((detractors / totalNps) * 100) : 0,
      },
      
      // Quarterly breakdown
      quarterlyData,
      
      // Location breakdown
      locationBreakdown,
      
      // Response overview
      responseOverview: {
        totalSent,
        totalResponded,
        responseRate,
        avgCompletionTime: '4.2 min' // TODO: Calculate from actual data
      }
    });
  } catch (error) {
    console.error('Hiring Manager dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch Hiring Manager dashboard data' });
  }
});

// GET /api/dashboard/insights
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT
router.get('/insights', async (req, res) => {
  try {
    const { audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    // Get top feedback themes (limited)
    // Note: FeedbackTheme may need audience field in future for full filtering
    const themes = await prisma.feedbackTheme.findMany({
      orderBy: { count: 'desc' },
      take: 50 // Limit results
    });

    // Get recommended actions (limited)
    const actions = await prisma.actionItem.findMany({
      where: { status: { not: 'COMPLETED' } },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit results
      include: { assignee: true }
    });

    res.json({
      audience,
      insights: themes.map(t => ({
        theme: (t as any).theme ?? t.name,
        count: t.count,
        sentiment: t.sentiment,
        category: t.category
      })),
      actions: actions.map(a => ({
        id: a.id,
        title: a.title,
        description: a.description,
        priority: a.priority,
        status: a.status,
        assignee: a.assignedTo,
        dueDate: a.dueDate
      }))
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// GET /api/dashboard/cohorts
// Query params: ?audience=CANDIDATE|HIRING_MANAGER|WORKPLACE|IT_SUPPORT
router.get('/cohorts', async (req, res) => {
  try {
    const { audience: audienceParam } = req.query;
    const audience = parseAudience(audienceParam as string);

    // Add limit to prevent unbounded queries
    const cohorts = await prisma.cohortDefinition.findMany({
      take: 100, // Limit results
      include: {
        members: true
      }
    });

    res.json({
      audience,
      cohorts: cohorts.map(c => ({
        id: c.id,
        name: c.name,
        size: c.members.length,
        filters: c.filters
      }))
    });
  } catch (error) {
    console.error('Dashboard cohorts error:', error);
    res.status(500).json({ error: 'Failed to fetch cohorts' });
  }
});

export default router;

