import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

interface SRSyncJob {
  manual?: boolean;
}

export const srSyncWorker = new Worker<SRSyncJob>(
  'sr-sync',
  async (job: Job<SRSyncJob>) => {
    const { manual = false } = job.data;

    console.log(`Starting SmartRecruiters sync (manual: ${manual})`);

    try {
      // Get integration config
      const integration = await prisma.integrationConfig.findUnique({
        where: { provider: 'SMARTRECRUITERS' }
      });

      if (!integration || !integration.isActive) {
        throw new Error('SmartRecruiters integration not configured or inactive');
      }

      const config = JSON.parse(integration.config as string);
      const { apiKey, baseUrl } = config;

      // Check if mock mode
      const useMockMode = process.env.SR_MOCK_MODE === 'true' || !apiKey.startsWith('sk_');

      if (useMockMode) {
        await syncMockData(job);
      } else {
        await syncRealData(job, baseUrl, apiKey);
      }

      // Update last sync time
      await prisma.integrationConfig.update({
        where: { id: integration.id },
        data: { lastSyncAt: new Date() }
      });

      // Create sync log
      await prisma.syncLog.create({
        data: {
          integrationId: integration.id,
          status: 'SUCCESS',
          recordsSynced: 0, // TODO: Track actual count
          completedAt: new Date()
        }
      });

      console.log(`✅ SmartRecruiters sync completed successfully`);
      return { success: true };
    } catch (error: any) {
      console.error('SmartRecruiters sync error:', error);

      // Log failure
      const integration = await prisma.integrationConfig.findUnique({
        where: { provider: 'SMARTRECRUITERS' }
      });

      if (integration) {
        await prisma.syncLog.create({
          data: {
            integrationId: integration.id,
            status: 'FAILED',
            errorMessage: error.message,
            recordsSynced: 0
          }
        });
      }

      throw error;
    }
  },
  { connection: redisConfig, concurrency: 1 }
);

// Mock data sync (for development)
async function syncMockData(job: Job) {
  console.log('🎭 Using mock mode for SmartRecruiters sync');

  await job.updateProgress(20);

  // Sync mock candidates
  const mockCandidates = [
    {
      externalId: 'sr_cand_1',
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      role: 'Software Engineer',
      source: 'LinkedIn',
      location: 'San Francisco, CA',
      status: 'INTERVIEWED'
    },
    {
      externalId: 'sr_cand_2',
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '+1234567891',
      role: 'Product Manager',
      source: 'Referral',
      location: 'New York, NY',
      status: 'OFFERED'
    }
  ];

  for (const candidate of mockCandidates) {
    await prisma.candidate.upsert({
      where: { externalId: candidate.externalId },
      update: candidate,
      create: candidate
    });
  }

  await job.updateProgress(60);

  // Sync mock jobs
  const mockJobs = [
    {
      externalId: 'sr_job_1',
      title: 'Senior Software Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      status: 'OPEN'
    },
    {
      externalId: 'sr_job_2',
      title: 'Product Manager',
      department: 'Product',
      location: 'New York, NY',
      status: 'OPEN'
    }
  ];

  for (const jobData of mockJobs) {
    await prisma.job.upsert({
      where: { externalId: jobData.externalId },
      update: jobData,
      create: jobData
    });
  }

  await job.updateProgress(100);
  console.log('✅ Mock data synced successfully');
}

// Real API sync
async function syncRealData(job: Job, baseUrl: string, apiKey: string) {
  console.log('🔗 Syncing with SmartRecruiters API');

  const headers = {
    'X-SmartToken': apiKey,
    'Content-Type': 'application/json'
  };

  // Sync candidates
  await job.updateProgress(10);
  const candidatesResponse = await axios.get(`${baseUrl}/candidates`, { headers });
  const candidates = candidatesResponse.data.content || [];

  for (const candidate of candidates) {
    await prisma.candidate.upsert({
      where: { externalId: candidate.id },
      update: {
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        phone: candidate.phoneNumber,
        location: candidate.location?.city || null,
        status: candidate.status
      },
      create: {
        externalId: candidate.id,
        name: `${candidate.firstName} ${candidate.lastName}`,
        email: candidate.email,
        phone: candidate.phoneNumber,
        location: candidate.location?.city || null,
        status: candidate.status || 'NEW'
      }
    });
  }

  await job.updateProgress(50);

  // Sync jobs
  const jobsResponse = await axios.get(`${baseUrl}/postings`, { headers });
  const jobs = jobsResponse.data.content || [];

  for (const jobData of jobs) {
    await prisma.job.upsert({
      where: { externalId: jobData.id },
      update: {
        title: jobData.name,
        department: jobData.industry?.label,
        location: jobData.location?.city,
        status: jobData.status
      },
      create: {
        externalId: jobData.id,
        title: jobData.name,
        department: jobData.industry?.label || 'General',
        location: jobData.location?.city || 'Remote',
        status: jobData.status || 'OPEN'
      }
    });
  }

  await job.updateProgress(100);
  console.log(`✅ Synced ${candidates.length} candidates and ${jobs.length} jobs`);
}

// Event listeners
srSyncWorker.on('completed', (job) => {
  console.log(`✅ SmartRecruiters sync job ${job.id} completed`);
});

srSyncWorker.on('failed', (job, err) => {
  console.error(`❌ SmartRecruiters sync job ${job?.id} failed:`, err);
});

export default srSyncWorker;

