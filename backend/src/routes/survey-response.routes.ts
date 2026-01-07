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

    // TODO: Validate token against database
    // For now, basic token format validation
    if (!token.startsWith('srv_')) {
      secureLogger.warn('Invalid survey token format', { token: token.substring(0, 20), ip: req.ip });
      return res.status(400).json({ error: 'Invalid survey token' });
    }

    // Extract timestamp from token (format: srv_<nanoid>_<timestamp>)
    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(400).json({ error: 'Invalid survey token format' });
    }

    const tokenTimestamp = parseInt(parts[parts.length - 1], 10);
    if (isNaN(tokenTimestamp)) {
      return res.status(400).json({ error: 'Invalid survey token' });
    }

    // Check if token is expired (30 days)
    const tokenAge = Date.now() - tokenTimestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (tokenAge > maxAge) {
      secureLogger.warn('Expired survey token used', { tokenAge, ip: req.ip });
      return res.status(400).json({ error: 'Survey token has expired' });
    }

    // TODO: Store response in database
    // await prisma.surveyResponse.create({
    //   data: {
    //     surveyToken: token,
    //     npsScore,
    //     feedback: feedback || null,
    //     submittedAt: new Date(),
    //   }
    // });

    secureLogger.info('Survey response submitted', {
      token: token.substring(0, 20) + '...',
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

    if (!token || !token.startsWith('srv_')) {
      return res.status(400).json({ valid: false, error: 'Invalid token format' });
    }

    // Extract timestamp from token
    const parts = token.split('_');
    if (parts.length < 3) {
      return res.status(400).json({ valid: false, error: 'Invalid token format' });
    }

    const tokenTimestamp = parseInt(parts[parts.length - 1], 10);
    if (isNaN(tokenTimestamp)) {
      return res.status(400).json({ valid: false, error: 'Invalid token' });
    }

    // Check if token is expired
    const tokenAge = Date.now() - tokenTimestamp;
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const isExpired = tokenAge > maxAge;

    // TODO: Check database for token existence and usage status

    res.json({
      valid: !isExpired,
      expired: isExpired,
      expiresAt: new Date(tokenTimestamp + maxAge).toISOString(),
    });
  } catch (error: any) {
    secureLogger.error('Token validation error', { error: error.message, ip: req.ip });
    res.status(500).json({ error: 'Failed to validate token' });
  }
});

export default router;

