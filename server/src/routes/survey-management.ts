import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

const router = Router();

// GET /api/survey-management/surveys
router.get('/surveys', async (req: Request, res: Response) => {
  try {
    const { status, type } = req.query;

    const where: any = {};
    if (status) where.status = status;

    const surveys = await prisma.survey.findMany({
      where,
      include: {
        candidate: true,
        template: true,
        responses: true
      },
      orderBy: { sentAt: 'desc' }
    });

    const formatted = surveys.map(s => ({
      id: s.id,
      name: s.template.name,
      targetCohort: s.candidate.role,
      dateSent: dayjs(s.sentAt).format('MMM DD, YYYY'),
      responseRate: s.status === 'COMPLETED' ? 100 : 0,
      responsesOpen: s.status === 'SENT' || s.status === 'OPENED' ? 1 : 0,
      assignedTo: s.candidate.name,
      status: s.status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching surveys:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/survey-management/templates
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const templates = await prisma.surveyTemplate.findMany({
      where: { isActive: true },
      include: {
        questions: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = templates.map(t => ({
      id: t.id,
      name: t.name,
      description: t.description,
      type: `${t.questions.length} questions`,
      category: t.trigger,
      questionCount: t.questions.length
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/survey-management/templates
const createTemplateSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  trigger: z.enum(['POST_APPLICATION', 'POST_SCREEN', 'POST_INTERVIEW', 'POST_OFFER', 'POST_REJECTION']),
  delayDays: z.number().default(0),
  questions: z.array(z.object({
    question: z.string(),
    type: z.enum(['NPS_SCALE', 'TEXT', 'MULTIPLE_CHOICE', 'RATING']),
    isNPS: z.boolean().default(false),
    isRequired: z.boolean().default(true),
    scaleMin: z.number().optional(),
    scaleMax: z.number().optional()
  }))
});

router.post('/templates', async (req: Request, res: Response) => {
  try {
    const data = createTemplateSchema.parse(req.body);

    const template = await prisma.surveyTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        trigger: data.trigger,
        delayDays: data.delayDays,
        isActive: true,
        questions: {
          create: data.questions.map((q, idx) => ({
            question: q.question,
            type: q.type,
            isNPS: q.isNPS,
            isRequired: q.isRequired,
            scaleMin: q.scaleMin,
            scaleMax: q.scaleMax,
            order: idx + 1
          }))
        }
      },
      include: {
        questions: true
      }
    });

    res.status(201).json(template);
  } catch (error: any) {
    console.error('Error creating template:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/survey-management/distribute
const distributeSurveySchema = z.object({
  templateId: z.string(),
  candidateIds: z.array(z.string()).optional(),
  cohortFilter: z.object({
    role: z.string().optional(),
    country: z.string().optional(),
    stage: z.string().optional()
  }).optional(),
  sendViaEmail: z.boolean().default(true),
  sendViaSMS: z.boolean().default(false),
  scheduledFor: z.string().optional() // ISO date string
});

router.post('/distribute', async (req: Request, res: Response) => {
  try {
    const data = distributeSurveySchema.parse(req.body);

    // Get candidates based on filters
    let candidates;
    if (data.candidateIds && data.candidateIds.length > 0) {
      candidates = await prisma.candidate.findMany({
        where: { id: { in: data.candidateIds } }
      });
    } else if (data.cohortFilter) {
      const where: any = {};
      if (data.cohortFilter.role) where.role = data.cohortFilter.role;
      if (data.cohortFilter.country) where.country = data.cohortFilter.country;
      if (data.cohortFilter.stage) where.interviewStage = data.cohortFilter.stage;
      
      candidates = await prisma.candidate.findMany({ where });
    } else {
      return res.status(400).json({ error: 'Either candidateIds or cohortFilter must be provided' });
    }

    // Create surveys for each candidate
    const surveys = await Promise.all(
      candidates.map(async (candidate) => {
        return await prisma.survey.create({
          data: {
            token: nanoid(32),
            candidateId: candidate.id,
            templateId: data.templateId,
            sentAt: data.scheduledFor ? new Date(data.scheduledFor) : new Date(),
            expiresAt: dayjs().add(30, 'days').toDate(),
            status: data.scheduledFor ? 'SENT' : 'SENT'
          }
        });
      })
    );

    res.status(201).json({
      message: `Successfully created ${surveys.length} surveys`,
      count: surveys.length,
      surveys
    });
  } catch (error: any) {
    console.error('Error distributing surveys:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/survey-management/question-bank
router.get('/question-bank', async (req: Request, res: Response) => {
  try {
    const questions = await prisma.surveyQuestion.findMany({
      include: {
        template: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const grouped = questions.reduce((acc: any, q) => {
      const templateName = q.template.name;
      if (!acc[templateName]) {
        acc[templateName] = {
          templateName,
          templateId: q.template.id,
          questions: []
        };
      }
      acc[templateName].questions.push({
        id: q.id,
        question: q.question,
        type: q.type,
        isNPS: q.isNPS
      });
      return acc;
    }, {});

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Error fetching question bank:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/survey-management/stats
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const totalSurveys = await prisma.survey.count();
    const completedSurveys = await prisma.survey.count({ where: { status: 'COMPLETED' } });
    const pendingSurveys = await prisma.survey.count({ where: { status: 'SENT' } });
    const totalTemplates = await prisma.surveyTemplate.count({ where: { isActive: true } });

    const avgResponseRate = totalSurveys > 0 
      ? Math.round((completedSurveys / totalSurveys) * 100) 
      : 0;

    res.json({
      totalSurveys,
      completedSurveys,
      pendingSurveys,
      totalTemplates,
      avgResponseRate
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

