import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

/**
 * SmartRecruiters Sync Worker
 * Syncs candidates, jobs, and applications from SmartRecruiters ATS
 */
export const srSyncWorker = new Worker(
  'sr-sync',
  async (job: Job) => {
    const { manual = false } = job.data;

    console.log(`Starting SmartRecruiters sync (manual: ${manual})`);

    try {
      // Get integration config
      const integration = await prisma.integrationConfig.findUnique({
        where: { provider: 'SMARTRECRUITERS' }
      });

      if (!integration || !integration.isActive) {
        console.log('SmartRecruiters integration not active');
        return { success: false, reason: 'Integration not active' };
      }

      const config = JSON.parse(integration.config);
      const { apiKey, baseUrl } = config;

      // Create sync log
      const syncLog = await prisma.syncLog.create({
        data: {
          integrationId: integration.id,
          syncType: 'FULL',
          status: 'RUNNING',
          startedAt: new Date()
        }
      });

      let candidatesSynced = 0;
      let jobsSynced = 0;
      let errors: string[] = [];

      try {
        // Sync jobs/requisitions
        const jobsResponse = await fetchFromSmartRecruiters(
          `${baseUrl}/jobs`,
          apiKey
        );

        for (const srJob of jobsResponse.content || []) {
          try {
            await prisma.job.upsert({
              where: { externalId: srJob.id },
              update: {
                title: srJob.title,
                department: srJob.department?.label,
                location: srJob.location?.city,
                status: srJob.status,
                updatedAt: new Date()
              },
              create: {
                externalId: srJob.id,
                title: srJob.title,
                department: srJob.department?.label,
                location: srJob.location?.city,
                status: srJob.status
              }
            });
            jobsSynced++;
          } catch (error: any) {
            errors.push(`Job ${srJob.id}: ${error.message}`);
          }
        }

        // Sync candidates
        const candidatesResponse = await fetchFromSmartRecruiters(
          `${baseUrl}/candidates`,
          apiKey
        );

        for (const srCandidate of candidatesResponse.content || []) {
          try {
            const candidate = await prisma.candidate.upsert({
              where: { externalId: srCandidate.id },
              update: {
                name: `${srCandidate.firstName} ${srCandidate.lastName}`,
                email: srCandidate.email,
                phone: srCandidate.phoneNumber,
                status: srCandidate.status,
                updatedAt: new Date()
              },
              create: {
                externalId: srCandidate.id,
                name: `${srCandidate.firstName} ${srCandidate.lastName}`,
                email: srCandidate.email,
                phone: srCandidate.phoneNumber,
                status: srCandidate.status
              }
            });

            // Link candidate to job if application exists
            if (srCandidate.primaryAssignment) {
              const job = await prisma.job.findFirst({
                where: { externalId: srCandidate.primaryAssignment.job.id }
              });

              if (job) {
                await prisma.candidateJob.upsert({
                  where: {
                    candidateId_jobId: {
                      candidateId: candidate.id,
                      jobId: job.id
                    }
                  },
                  update: {
                    stage: srCandidate.primaryAssignment.status
                  },
                  create: {
                    candidateId: candidate.id,
                    jobId: job.id,
                    stage: srCandidate.primaryAssignment.status
                  }
                });
              }
            }

            candidatesSynced++;
          } catch (error: any) {
            errors.push(`Candidate ${srCandidate.id}: ${error.message}`);
          }
        }

        // Update sync log
        await prisma.syncLog.update({
          where: { id: syncLog.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            recordsSynced: candidatesSynced + jobsSynced,
            errorCount: errors.length,
            errorDetails: errors.length > 0 ? JSON.stringify(errors) : null
          }
        });

        // Update integration last sync
        await prisma.integrationConfig.update({
          where: { id: integration.id },
          data: { lastSyncAt: new Date() }
        });

        console.log(`✅ SmartRecruiters sync completed: ${candidatesSynced} candidates, ${jobsSynced} jobs`);

        return {
          success: true,
          candidatesSynced,
          jobsSynced,
          errors: errors.length
        };
      } catch (error: any) {
        // Update sync log on error
        await prisma.syncLog.update({
          where: { id: syncLog.id },
          data: {
            status: 'FAILED',
            completedAt: new Date(),
            errorDetails: error.message
          }
        });

        throw error;
      }
    } catch (error: any) {
      console.error('SmartRecruiters sync error:', error);
      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: 1 // Only one sync at a time
  }
);

/**
 * Fetch data from SmartRecruiters API
 */
async function fetchFromSmartRecruiters(url: string, apiKey: string) {
  // Check if mock mode is enabled
  if (process.env.SR_MOCK_MODE === 'true') {
    return mockSmartRecruitersData(url);
  }

  const response = await axios.get(url, {
    headers: {
      'X-SmartToken': apiKey,
      'Content-Type': 'application/json'
    }
  });

  return response.data;
}

/**
 * Mock SmartRecruiters data for development
 */
function mockSmartRecruitersData(url: string) {
  if (url.includes('/jobs')) {
    return {
      content: [
        {
          id: 'job_1',
          title: 'Senior Software Engineer',
          department: { label: 'Engineering' },
          location: { city: 'San Francisco' },
          status: 'OPEN'
        },
        {
          id: 'job_2',
          title: 'Product Manager',
          department: { label: 'Product' },
          location: { city: 'New York' },
          status: 'OPEN'
        }
      ]
    };
  }

  if (url.includes('/candidates')) {
    return {
      content: [
        {
          id: 'cand_1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          status: 'ACTIVE',
          primaryAssignment: {
            job: { id: 'job_1' },
            status: 'INTERVIEW'
          }
        },
        {
          id: 'cand_2',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          phoneNumber: '+1234567891',
          status: 'ACTIVE',
          primaryAssignment: {
            job: { id: 'job_2' },
            status: 'OFFER'
          }
        }
      ]
    };
  }

  return { content: [] };
}

// Worker event listeners
srSyncWorker.on('completed', (job) => {
  console.log(`SmartRecruiters sync job ${job.id} completed`);
});

srSyncWorker.on('failed', (job, err) => {
  console.error(`SmartRecruiters sync job ${job?.id} failed:`, err.message);
});

srSyncWorker.on('error', (err) => {
  console.error('SmartRecruiters sync worker error:', err);
});

console.log('✅ SmartRecruiters sync worker started');

export default srSyncWorker;
