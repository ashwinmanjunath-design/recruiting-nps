import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { secureLogger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

/**
 * Survey response schema with validation
 */
const surveyResponseSchema = z.object({
  token: z.string().min(10).max(200),
  npsScore: z.number().int().min(0).max(10),
  feedback: z.string().max(5000).optional(),
});

/**
 * POST /api/survey-response
 * Public endpoint for submitting survey responses
 * Validates token and ensures it hasn't expired
 */
router.post('/', async (req, res) => {
  try {
    const validationResult = surveyResponseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      secureLogger.warn('Survey response validation failed', {
        errors: validationResult.error.errors,
        ip: req.ip,
      });
      return res.status(400).json({
        error: 'Invalid input',
        details: validationResult.error.errors,
      });
    }

    const { token, npsScore, feedback } = validationResult.data;

    const survey = await prisma.survey.findUnique({
      where: { token },
      include: {
        template: {
          include: { questions: true },
        },
      },
    });

    if (!survey) {
      return res.status(404).json({ error: 'Survey not found or invalid token' });
    }

    if (survey.respondedAt) {
      return res.status(400).json({ error: 'This survey has already been submitted' });
    }

    if (survey.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Survey token has expired' });
    }

    const npsQuestion =
      survey.template.questions.find((q: any) => q.type === 'NPS_SCALE') ||
      survey.template.questions[0];
    const feedbackQuestion =
      survey.template.questions.find((q: any) => q.type === 'TEXT') || null;

    if (!npsQuestion) {
      return res.status(500).json({ error: 'Survey is misconfigured' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.surveyResponse.create({
        data: {
          surveyId: survey.id,
          candidateId: survey.candidateId,
          questionId: npsQuestion.id,
          audience: survey.audience,
          score: npsScore,
          text: null,
        },
      });

      if (feedback && feedback.trim() && feedbackQuestion) {
        await tx.surveyResponse.create({
          data: {
            surveyId: survey.id,
            candidateId: survey.candidateId,
            questionId: feedbackQuestion.id,
            audience: survey.audience,
            score: null,
            text: feedback.trim(),
          },
        });
      }

      await tx.survey.update({
        where: { id: survey.id },
        data: {
          respondedAt: new Date(),
          status: 'COMPLETED',
        },
      });
    });

    secureLogger.info('Survey response submitted', {
      surveyId: survey.id,
      npsScore,
      hasFeedback: !!feedback,
      ip: req.ip,
    });

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
    });
  } catch (error: any) {
    secureLogger.error('Survey response error', {
      error: error.message,
      ip: req.ip,
    });
    res.status(500).json({ error: 'Failed to submit survey response' });
  }
});

/**
 * GET /api/survey-response/validate/:token
 * Validate if a survey token is valid and not expired
 */
router.get('/validate/:token', async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }

    const survey = await prisma.survey.findUnique({
      where: { token },
      select: {
        id: true,
        expiresAt: true,
        respondedAt: true,
      },
    });

    if (!survey) {
      return res.status(404).json({ valid: false, error: 'Survey token not found' });
    }

    const isExpired = survey.expiresAt < new Date();
    const alreadySubmitted = !!survey.respondedAt;

    res.json({
      valid: !isExpired && !alreadySubmitted,
      expired: isExpired,
      alreadySubmitted,
      expiresAt: survey.expiresAt.toISOString(),
    });
  } catch (error: any) {
    secureLogger.error('Token validation error', { error: error.message, ip: req.ip });
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

export default router;
