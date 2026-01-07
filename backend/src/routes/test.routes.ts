import { Router } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { queues } from '../jobs/queue.config';
import { authMiddleware } from '../middleware/auth.middleware';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// Only enable test endpoints in development
if (process.env.NODE_ENV !== 'production') {
  
  /**
   * POST /api/test/send-survey
   * Manually trigger a survey send for testing
   */
  router.post('/send-survey', authMiddleware, async (req, res) => {
    try {
      const schema = z.object({
        surveyId: z.string(),
        to: z.string().email().optional(),
        channel: z.enum(['email', 'sms', 'both']).default('email'),
      });

      const { surveyId, to, channel } = schema.parse(req.body);

      // Get survey
      const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
          template: {
            include: { questions: true }
          },
          candidate: true,
        },
      });

      if (!survey) {
        return res.status(404).json({ error: 'Survey not found' });
      }

      // Queue the job
      const job = await queues.surveySend.add('send-survey-test', {
        surveyId,
        channel,
        testMode: true,
        testEmail: to,
      });

      console.log('[Test Endpoint] Survey send job queued:', {
        jobId: job.id,
        surveyId,
        testEmail: to,
        channel,
        candidateName: survey.candidate.name,
        candidateEmail: survey.candidate.email,
      });

      res.json({
        success: true,
        jobId: job.id,
        surveyId,
        candidate: {
          name: survey.candidate.name,
          email: survey.candidate.email,
        },
        testEmail: to || process.env.TEST_EMAIL_ADDRESS,
        channel,
        message: 'Survey send job queued successfully',
        mailhogUrl: 'http://localhost:8025',
        instructions: 'Check MailHog at http://localhost:8025 to view the email',
      });
    } catch (error: any) {
      console.error('[Test Endpoint] Error queuing survey send:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: 'Invalid input', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/test/mailhog-status
   * Check MailHog status and recent emails
   */
  router.get('/mailhog-status', async (req, res) => {
    try {
      const response = await axios.get('http://localhost:8025/api/v2/messages');
      
      res.json({
        status: 'running',
        mailhogUrl: 'http://localhost:8025',
        totalEmails: response.data.total || 0,
        emails: response.data.items?.slice(0, 10).map((email: any) => ({
          id: email.ID,
          from: email.From?.Mailbox + '@' + email.From?.Domain,
          to: email.To?.map((t: any) => t.Mailbox + '@' + t.Domain),
          subject: email.Content?.Headers?.Subject?.[0],
          created: email.Created,
        })) || [],
      });
    } catch (error: any) {
      res.json({
        status: 'not_running',
        mailhogUrl: 'http://localhost:8025',
        error: 'MailHog is not running or not accessible',
        instructions: 'Start MailHog with: docker-compose up -d mailhog',
      });
    }
  });

  /**
   * GET /api/test/surveys
   * Get list of surveys for testing
   */
  router.get('/surveys', authMiddleware, async (req, res) => {
    try {
      const surveys = await prisma.survey.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          template: {
            select: { name: true }
          },
          candidate: {
            select: { name: true, email: true, phone: true }
          },
        },
      });

      res.json({
        surveys: surveys.map(s => ({
          id: s.id,
          templateName: s.template.name,
          candidate: {
            name: s.candidate.name,
            email: s.candidate.email,
            phone: s.candidate.phone,
          },
          status: s.status,
          sentAt: s.sentAt,
          createdAt: s.createdAt,
        })),
        testEndpoint: 'POST /api/test/send-survey',
        example: {
          surveyId: surveys[0]?.id || 'survey_id_here',
          to: process.env.TEST_EMAIL_ADDRESS || 'your-email@example.com',
          channel: 'email',
        },
      });
    } catch (error: any) {
      console.error('[Test Endpoint] Error fetching surveys:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/test/create-test-survey
   * Create a test survey quickly
   */
  router.post('/create-test-survey', authMiddleware, async (req, res) => {
    try {
      // Get first template and candidate
      const template = await prisma.surveyTemplate.findFirst({
        where: { isActive: true }
      });

      const candidate = await prisma.candidate.findFirst();

      if (!template || !candidate) {
        return res.status(400).json({ 
          error: 'No templates or candidates found. Run: npm run seed' 
        });
      }

      // Create survey
      const survey = await prisma.survey.create({
        data: {
          templateId: template.id,
          candidateId: candidate.id,
          status: 'PENDING',
        },
        include: {
          template: true,
          candidate: true,
        },
      });

      res.json({
        success: true,
        survey: {
          id: survey.id,
          templateName: template.name,
          candidateName: candidate.name,
          candidateEmail: candidate.email,
        },
        nextStep: {
          endpoint: 'POST /api/test/send-survey',
          payload: {
            surveyId: survey.id,
            to: process.env.TEST_EMAIL_ADDRESS || 'your-email@example.com',
            channel: 'email',
          },
        },
      });
    } catch (error: any) {
      console.error('[Test Endpoint] Error creating test survey:', error);
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/test/config
   * Show current test configuration
   */
  router.get('/config', authMiddleware, async (req, res) => {
    res.json({
      emailMode: process.env.EMAIL_MODE || 'local',
      smsMode: process.env.SMS_MODE || 'mock',
      testEmailAddress: process.env.TEST_EMAIL_ADDRESS || 'NOT SET',
      mailhogHost: process.env.MAILHOG_HOST || 'localhost',
      mailhogPort: process.env.MAILHOG_PORT || '1025',
      mailhogWebUI: 'http://localhost:8025',
      environment: process.env.NODE_ENV || 'development',
      warnings: [
        !process.env.TEST_EMAIL_ADDRESS && 'TEST_EMAIL_ADDRESS not set in .env',
      ].filter(Boolean),
    });
  });

  console.log('✅ Test endpoints enabled (development mode)');
  console.log('   - POST /api/test/send-survey');
  console.log('   - GET  /api/test/mailhog-status');
  console.log('   - GET  /api/test/surveys');
  console.log('   - POST /api/test/create-test-survey');
  console.log('   - GET  /api/test/config');
}

export default router;

