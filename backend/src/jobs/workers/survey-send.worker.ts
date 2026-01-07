import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConfig } from '../config/redis';
import emailService from '../../services/email.service';
import smsService from '../../services/sms.service';

const prisma = new PrismaClient();

/**
 * Survey Send Worker
 * Processes jobs to send surveys via email/SMS
 */
export const surveySendWorker = new Worker(
  'survey-send',
  async (job: Job) => {
    const { surveyId, channel } = job.data;

    console.log(`Processing survey send job: ${surveyId}, channel: ${channel}`);

    try {
      // Get survey with template and candidate
      const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
          template: {
            include: { questions: true }
          },
          candidate: true
        }
      });

      if (!survey) {
        throw new Error(`Survey ${surveyId} not found`);
      }

      // Generate survey link (unique token)
      const surveyToken = `survey_${surveyId}_${Date.now()}`;
      const surveyLink = `${process.env.FRONTEND_URL}/survey/${surveyToken}`;

      // Send via appropriate channel
      if (channel === 'email' || channel === 'both') {
        await emailService.sendSurveyEmail({
          to: survey.candidate.email,
          templateName: survey.template.name,
          surveyLink,
          candidateName: survey.candidate.name
        });
      }

      if (channel === 'sms' || channel === 'both') {
        if (survey.candidate.phone) {
          await smsService.sendSurveySMS({
            to: survey.candidate.phone,
            surveyLink,
            candidateName: survey.candidate.name
          });
        }
      }

      // Update survey status
      await prisma.survey.update({
        where: { id: surveyId },
        data: {
          status: 'SENT',
          sentAt: new Date()
        }
      });

      console.log(`Survey ${surveyId} sent successfully`);
      return { success: true, surveyId };
    } catch (error: any) {
      console.error(`Error sending survey ${surveyId}:`, error);
      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: 5,
    limiter: {
      max: 100,
      duration: 60000 // 100 surveys per minute
    }
  }
);


// Worker event listeners
surveySendWorker.on('completed', (job) => {
  console.log(`Survey send job ${job.id} completed`);
});

surveySendWorker.on('failed', (job, err) => {
  console.error(`Survey send job ${job?.id} failed:`, err.message);
});

surveySendWorker.on('error', (err) => {
  console.error('Survey send worker error:', err);
});

console.log('✅ Survey send worker started');

export default surveySendWorker;
