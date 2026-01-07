import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

const router = Router();

// GET /api/surveys
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, candidateId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (candidateId) where.candidateId = candidateId;

    const surveys = await prisma.survey.findMany({
      where,
      include: {
        candidate: true,
        template: true,
        responses: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(surveys);
  } catch (error) {
    console.error('Surveys list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/surveys/:token
router.get('/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const survey = await prisma.survey.findUnique({
      where: { token },
      include: {
        candidate: true,
        template: {
          include: {
            questions: {
              orderBy: { order: 'asc' }
            }
          }
        },
        responses: true
      }
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    // Check if expired
    if (survey.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Survey expired' });
    }

    // Check if already completed
    if (survey.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Survey already completed' });
    }

    // Update status to OPENED if first time
    if (survey.status === 'SENT') {
      await prisma.survey.update({
        where: { id: survey.id },
        data: { status: 'OPENED' }
      });
    }

    res.json(survey);
  } catch (error) {
    console.error('Survey get error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/surveys/submit
const submitSchema = z.object({
  token: z.string(),
  responses: z.array(z.object({
    questionId: z.string(),
    score: z.number().min(0).max(10).optional(),
    comment: z.string().optional()
  }))
});

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { token, responses } = submitSchema.parse(req.body);

    // Find survey
    const survey = await prisma.survey.findUnique({
      where: { token },
      include: { template: { include: { questions: true } } }
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found' });
    }

    if (survey.status === 'COMPLETED') {
      return res.status(400).json({ error: 'Survey already completed' });
    }

    if (survey.expiresAt < new Date()) {
      return res.status(410).json({ error: 'Survey expired' });
    }

    // Save responses
    for (const response of responses) {
      await prisma.surveyResponse.create({
        data: {
          surveyId: survey.id,
          candidateId: survey.candidateId,
          questionId: response.questionId,
          score: response.score,
          comment: response.comment,
          sentiment: response.score 
            ? (response.score >= 7 ? 'POSITIVE' : response.score >= 5 ? 'NEUTRAL' : 'NEGATIVE')
            : undefined
        }
      });
    }

    // Update survey status
    await prisma.survey.update({
      where: { id: survey.id },
      data: {
        status: 'COMPLETED',
        respondedAt: new Date()
      }
    });

    res.json({ message: 'Survey submitted successfully' });
  } catch (error: any) {
    console.error('Survey submit error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/surveys/create
const createSurveySchema = z.object({
  candidateId: z.string(),
  templateId: z.string(),
  expiryDays: z.number().optional()
});

router.post('/create', async (req: Request, res: Response) => {
  try {
    const { candidateId, templateId, expiryDays = 30 } = createSurveySchema.parse(req.body);

    // Check if survey already exists for this candidate and template
    const existing = await prisma.survey.findFirst({
      where: {
        candidateId,
        templateId,
        status: { in: ['SENT', 'OPENED'] }
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Active survey already exists for this candidate' });
    }

    // Create survey
    const survey = await prisma.survey.create({
      data: {
        token: nanoid(32),
        candidateId,
        templateId,
        expiresAt: dayjs().add(expiryDays, 'days').toDate(),
        status: 'SENT'
      },
      include: {
        candidate: true,
        template: true
      }
    });

    res.status(201).json(survey);
  } catch (error: any) {
    console.error('Create survey error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

