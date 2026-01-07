import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

interface SurveySendJob {
  surveyId: string;
  channel: 'email' | 'sms' | 'both';
}

export const surveySendWorker = new Worker<SurveySendJob>(
  'survey-send',
  async (job: Job<SurveySendJob>) => {
    const { surveyId, channel } = job.data;

    console.log(`Processing survey send job: ${surveyId}, channel: ${channel}`);

    try {
      // Fetch survey with template and candidate
      const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
        include: {
          template: { include: { questions: true } },
          candidate: true
        }
      });

      if (!survey) {
        throw new Error(`Survey ${surveyId} not found`);
      }

      // Generate survey link (in production, this would be a real URL)
      const surveyLink = `${process.env.FRONTEND_URL}/survey/${survey.id}`;

      // Send via email
      if (channel === 'email' || channel === 'both') {
        await sendEmailSurvey(survey, surveyLink);
        await job.updateProgress(50);
      }

      // Send via SMS
      if (channel === 'sms' || channel === 'both') {
        await sendSMSSurvey(survey, surveyLink);
        await job.updateProgress(100);
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
    } catch (error) {
      console.error(`Error sending survey ${surveyId}:`, error);
      throw error;
    }
  },
  { connection: redisConfig, concurrency: 5 }
);

// Email sending function (stub - integrate with Resend)
async function sendEmailSurvey(survey: any, link: string) {
  console.log(`📧 Sending email survey to: ${survey.candidate.email}`);
  
  // TODO: Integrate with Resend
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'surveys@yourcompany.com',
  //   to: survey.candidate.email,
  //   subject: `Survey: ${survey.template.name}`,
  //   html: `<p>Hi ${survey.candidate.name},</p>
  //          <p>Please take a moment to complete this survey:</p>
  //          <a href="${link}">Take Survey</a>`
  // });

  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`✅ Email sent to ${survey.candidate.email}`);
}

// SMS sending function (stub - integrate with Twilio)
async function sendSMSSurvey(survey: any, link: string) {
  console.log(`📱 Sending SMS survey to: ${survey.candidate.phone || 'N/A'}`);
  
  // TODO: Integrate with Twilio
  // const twilio = require('twilio')(
  //   process.env.TWILIO_ACCOUNT_SID,
  //   process.env.TWILIO_AUTH_TOKEN
  // );
  // await twilio.messages.create({
  //   body: `Hi ${survey.candidate.name}, please complete our survey: ${link}`,
  //   from: process.env.TWILIO_PHONE_NUMBER,
  //   to: survey.candidate.phone
  // });

  // Simulate SMS sending delay
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(`✅ SMS sent to ${survey.candidate.phone || 'N/A'}`);
}

// Event listeners
surveySendWorker.on('completed', (job) => {
  console.log(`✅ Survey send job ${job.id} completed`);
});

surveySendWorker.on('failed', (job, err) => {
  console.error(`❌ Survey send job ${job?.id} failed:`, err);
});

surveySendWorker.on('progress', (job, progress) => {
  console.log(`📊 Survey send job ${job.id} progress: ${progress}%`);
});

export default surveySendWorker;

