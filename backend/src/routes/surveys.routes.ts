import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { requirePermission } from '../middleware/rbac.middleware';
import { Permission } from '../../../shared/types/enums';
import { queues } from '../jobs/queue.config';
import type { CreateSurveyPayload, CreateSurveyResponse, SurveyRecipient } from '../../../shared/types/models/survey.types';
import emailService from '../services/email.service';
import { surveySendRateLimiter } from '../middleware/rateLimiter.middleware';
import { surveySendSchema, createSurveySchema, distributeSurveySchema, surveyTemplateSchema } from '../schemas/survey.schemas';
import { secureLogger } from '../utils/logger';
import { nanoid } from 'nanoid';

const router = Router();
const prisma = new PrismaClient();

// POST /api/surveys/send - Send survey emails (REQUIRES AUTH + RBAC)
router.post('/send', authMiddleware, requirePermission(Permission.MANAGE_SURVEYS), surveySendRateLimiter, async (req: AuthRequest, res) => {
  try {
    // Validate and sanitize input using Zod schema
    const validationResult = surveySendSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      secureLogger.warn('Survey send validation failed', {
        errors: validationResult.error.errors,
        userId: req.user?.userId,
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors,
      });
    }

    const payload = validationResult.data;
    secureLogger.info('Survey send request', {
      surveyName: payload.surveyName,
      recipientCount: payload.recipients.length,
      userId: req.user?.userId,
      ip: req.ip,
    });

    const finalRecipients: string[] = payload.recipients;

    console.log('[POST /api/surveys/send] ⚠️  FINAL RECIPIENTS (will send to these exact emails):', JSON.stringify(finalRecipients, null, 2));
    console.log('[POST /api/surveys/send] Recipient count:', finalRecipients.length);

    // Generate secure, time-limited survey tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const tokenExpiryHours = 30 * 24; // 30 days
    const expiresAt = new Date(Date.now() + tokenExpiryHours * 60 * 60 * 1000);
    
    const emailResults: Array<{ email: string; success: boolean; messageId?: string }> = [];
    const emailErrors: Array<{ email: string; error: string }> = [];

    for (const email of finalRecipients) {
      try {
        // Generate unique, secure token for this recipient
        // Using nanoid for cryptographically strong random tokens
        const recipientToken = `srv_${nanoid(32)}_${Date.now()}`;
        const recipientSurveyLink = `${frontendUrl}/survey/${recipientToken}`;

        // TODO: Store token in database with expiresAt for validation
        // await prisma.surveyToken.create({
        //   data: {
        //     token: recipientToken,
        //     email,
        //     surveyId: surveyId,
        //     expiresAt,
        //   }
        // });

        secureLogger.info('Sending survey email', {
          to: email,
          surveyName: payload.surveyName,
          userId: req.user?.userId,
        });
        
        const result = await emailService.sendSurveyEmail({
          to: email,
          candidateName: email.split('@')[0],
          surveyLink: recipientSurveyLink,
          templateName: payload.surveyName,
          subject: payload.subject || `Candidate Survey: ${payload.surveyName}`,
          fromEmail: payload.fromEmail,
        });

        emailResults.push({ email, success: true, messageId: result.messageId });
        secureLogger.info('Survey email sent successfully', { email, messageId: result.messageId });
      } catch (error: any) {
        secureLogger.error('Failed to send survey email', {
          email,
          error: error.message,
          code: error?.code,
        });
        emailErrors.push({ email, error: error.message || 'Unknown error' });
      }
    }

    // If all emails failed, return error
    if (emailResults.length === 0 && emailErrors.length > 0) {
      secureLogger.error('All survey emails failed', {
        total: finalRecipients.length,
        errors: emailErrors,
        userId: req.user?.userId,
      });
      return res.status(500).json({
        success: false,
        message: 'Failed to send survey emails',
        errors: emailErrors,
      });
    }

    // Log summary
    secureLogger.info('Survey send completed', {
      total: finalRecipients.length,
      successful: emailResults.length,
      failed: emailErrors.length,
      userId: req.user?.userId,
    });

    // Return success (don't expose full recipient list in response)
    res.status(200).json({
      success: true,
      sentTo: emailResults.length,
      failed: emailErrors.length,
      // Don't return full recipient list for security
    });
  } catch (error: any) {
    secureLogger.error('Survey send error', {
      error: error.message,
      code: error?.code,
      userId: req.user?.userId,
      ip: req.ip,
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send survey emails',
    });
  }
});

router.use(authMiddleware);
router.use(requirePermission(Permission.VIEW_SURVEYS));

// All routes below require authentication and VIEW_SURVEYS permission

// GET /api/survey-management/surveys
router.get('/surveys', async (req, res) => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) where.status = status;

    // Add limit to prevent unbounded queries
    const surveys = await prisma.survey.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit results
      include: {
        template: true,
        candidate: true,
        responses: true
      }
    });

    res.json({
      surveys: surveys.map(s => ({
        id: s.id,
        templateName: s.template.name,
        candidateName: s.candidate.name,
        candidateEmail: s.candidate.email,
        status: s.status,
        sentAt: s.sentAt,
        scheduledFor: s.scheduledFor,
        responded: s.responses.length > 0,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('Surveys list error:', error);
    res.status(500).json({ error: 'Failed to fetch surveys' });
  }
});

// GET /api/survey-management/templates
router.get('/templates', async (req, res) => {
  try {
    const templates = await prisma.surveyTemplate.findMany({
      where: { isActive: true },
      include: {
        questions: true,
        _count: {
          select: { surveys: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        questionCount: t.questions.length,
        usageCount: t._count.surveys,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Templates list error:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// GET /api/survey-management/question-bank
router.get('/question-bank', async (req, res) => {
  try {
    // Add limit to prevent unbounded queries
    const questions = await prisma.surveyQuestion.findMany({
      distinct: ['question'],
      orderBy: { question: 'asc' },
      take: 500, // Limit results
    });

    const grouped = questions.reduce((acc: any, q) => {
      if (!acc[q.type]) acc[q.type] = [];
      acc[q.type].push({
        id: q.id,
        question: q.question,
        type: q.type,
        required: q.required
      });
      return acc;
    }, {});

    res.json({ questionBank: grouped });
  } catch (error) {
    console.error('Question bank error:', error);
    res.status(500).json({ error: 'Failed to fetch question bank' });
  }
});

// GET /api/survey-management/stats
router.get('/stats', async (req, res) => {
  try {
    const totalSurveys = await prisma.survey.count();
    const sentSurveys = await prisma.survey.count({ where: { sentAt: { not: null } } });
    const pendingSurveys = await prisma.survey.count({ where: { status: 'PENDING' } });
    const responses = await prisma.surveyResponse.count();

    res.json({
      total: totalSurveys,
      sent: sentSurveys,
      pending: pendingSurveys,
      responseRate: sentSurveys > 0 ? Math.round((responses / sentSurveys) * 100) : 0
    });
  } catch (error) {
    console.error('Survey stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// POST /api/survey-management/distribute
router.post('/distribute', requirePermission(Permission.MANAGE_SURVEYS), async (req: AuthRequest, res) => {
  try {
    const data = distributeSurveySchema.parse(req.body);

    // Get candidates
    let candidateIds: string[] = [];
    if (data.candidateIds) {
      candidateIds = data.candidateIds;
    } else if (data.cohortId) {
      const memberships = await prisma.cohortMembership.findMany({
        where: { cohortId: data.cohortId },
        select: { candidateId: true }
      });
      candidateIds = memberships.map(m => m.candidateId);
    }

    if (candidateIds.length === 0) {
      return res.status(400).json({ error: 'No candidates specified' });
    }

    // Create surveys
    const surveys = await Promise.all(
      candidateIds.map(candidateId =>
        prisma.survey.create({
          data: {
            templateId: data.templateId,
            candidateId,
            status: data.scheduleFor ? 'PENDING' : 'SENT',
            scheduledFor: data.scheduleFor ? new Date(data.scheduleFor) : undefined,
            sentAt: data.scheduleFor ? undefined : new Date()
          }
        })
      )
    );

    // Queue for sending (if not scheduled)
    if (!data.scheduleFor) {
      for (const survey of surveys) {
        await queues.surveySend.add('send-survey', {
          surveyId: survey.id,
          channel: data.channel
        });
      }
    }

    res.status(201).json({
      message: `${surveys.length} surveys ${data.scheduleFor ? 'scheduled' : 'queued'} successfully`,
      count: surveys.length
    });
  } catch (error: any) {
    console.error('Distribute surveys error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to distribute surveys' });
  }
});

// POST /api/survey-management/templates
router.post('/templates', requirePermission(Permission.MANAGE_SURVEYS), async (req: AuthRequest, res) => {
  try {
    const data = surveyTemplateSchema.parse(req.body);

    const template = await prisma.surveyTemplate.create({
      data: {
        name: data.name,
        description: data.description,
        questions: {
          create: data.questions.map((q, index) => ({
            type: q.type,
            question: q.question,
            required: q.required ?? true,
            options: q.options ? JSON.stringify(q.options) : null,
            order: index + 1
          }))
        }
      },
      include: { questions: true }
    });

    res.status(201).json({ template });
  } catch (error: any) {
    console.error('Create template error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    
    res.status(500).json({ error: 'Failed to create template' });
  }
});

// POST /api/surveys - Create survey with recipient configuration
router.post('/', async (req: AuthRequest, res) => {
  try {
    // Validate input using Zod schema
    const validationResult = createSurveySchema.safeParse(req.body);
    
    if (!validationResult.success) {
      secureLogger.warn('Survey creation validation failed', {
        errors: validationResult.error.errors,
        userId: req.user?.userId,
      });
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
    }

    const payload = validationResult.data;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    secureLogger.info('Creating survey', {
      surveyName: payload.survey.name,
      sendMode: payload.email.sendMode,
      userId,
    });

    // Resolve recipients based on sendMode
    let recipientEmails: string[] = [];
    
    if (payload.email.sendMode === 'cohort') {
      // TODO: Query candidates from DB using cohortFilter
      // For now, use mock recipients or empty array
      console.log('[POST /api/surveys] Cohort mode - cohortFilter:', payload.email.cohortFilter);
      // In a real implementation, query candidates from DB
      recipientEmails = []; // Will be populated from DB query
    } else {
      // Individual or bulk mode - use provided recipients
      recipientEmails = payload.email.recipients.map(r => r.email);
      console.log('[POST /api/surveys] Recipient emails from payload:', recipientEmails);
    }

    // Calculate recipient count
    const recipientCount = recipientEmails.length || payload.email.recipients.length;

    // Create survey ID (mock for now, would be from DB insert)
    const surveyId = `srv_${Date.now()}`;

    // Generate survey link (mock token)
    const surveyToken = `survey_${surveyId}_${Date.now()}`;
    const surveyLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/survey/${surveyToken}`;

    // If sendImmediately is true, send emails now
    if (payload.email.sendImmediately) {
      console.log('[POST /api/surveys] sendImmediately=true, sending emails now');
      console.log('[POST /api/surveys] Sending email to recipients:', recipientEmails);

      // Check if we have recipients
      const emailsToSend = recipientEmails.length > 0 
        ? recipientEmails 
        : payload.email.recipients.map(r => r.email);

      if (emailsToSend.length === 0) {
        console.warn('[POST /api/surveys] No recipients to send to');
        return res.status(400).json({ error: 'No recipients specified for sending' });
      }

      // Send email to each recipient
      const emailResults: Array<{ email: string; success: boolean; messageId?: string }> = [];
      const emailErrors: Array<{ email: string; error: string }> = [];

      for (const email of emailsToSend) {
        try {
          console.log(`[SurveyEmail] Sending email to: ${email}`);
          
          const result = await emailService.sendSurveyEmail({
            to: email,
            candidateName: payload.email.recipients.find(r => r.email === email)?.name || 'Candidate',
            surveyLink,
            templateName: payload.survey.name,
            subject: payload.email.subject,
            fromEmail: payload.email.fromEmail,
          });

          emailResults.push({ email, success: true, messageId: result.messageId });
          console.log(`[SurveyEmail] ✅ Email sent successfully to ${email}`);
        } catch (error: any) {
          console.error(`[SurveyEmail] ❌ Error sending email to ${email}:`, error.message);
          emailErrors.push({ email, error: error.message });
        }
      }

      // If all emails failed, return error
      if (emailResults.length === 0 && emailErrors.length > 0) {
        return res.status(500).json({ 
          error: 'Failed to send survey emails',
          details: emailErrors 
        });
      }

      // Log summary
      console.log('[POST /api/surveys] Email sending summary:', {
        total: emailsToSend.length,
        successful: emailResults.length,
        failed: emailErrors.length,
        errors: emailErrors,
      });
    } else {
      console.log('[POST /api/surveys] sendImmediately=false, survey saved but not sent');
    }

    const response: CreateSurveyResponse = {
      surveyId,
      status: payload.email.sendImmediately ? 'sending' : 'scheduled',
      sendMode: payload.email.sendMode,
      recipientCount,
    };

    console.log('[POST /api/surveys] Survey created successfully:', {
      surveyId,
      name: payload.survey.name,
      sendMode: payload.email.sendMode,
      recipientCount,
      sendImmediately: payload.email.sendImmediately,
    });

    res.status(201).json(response);
  } catch (error: any) {
    console.error('[POST /api/surveys] Error creating survey:', error);
    res.status(500).json({ 
      error: 'Failed to create survey',
      message: error.message 
    });
  }
});

export default router;

