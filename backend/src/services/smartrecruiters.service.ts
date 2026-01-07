import axios from 'axios';

interface SmartRecruitersConfig {
  apiKey: string;
  baseUrl: string;
}

interface CandidateData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  location?: string;
}

interface JobData {
  id: string;
  title: string;
  department?: string;
  location?: string;
  status: string;
}

class SmartRecruitersService {
  private mockMode: boolean;

  constructor() {
    // Use mock mode if env variable is set
    this.mockMode = process.env.SR_MOCK_MODE === 'true';
  }

  /**
   * Sync candidates from SmartRecruiters
   */
  async syncCandidates(config: SmartRecruitersConfig): Promise<{ synced: number; errors: number }> {
    if (this.mockMode) {
      return this.mockSyncCandidates();
    }

    try {
      const response = await axios.get(`${config.baseUrl}/candidates`, {
        headers: {
          'X-SmartToken': config.apiKey
        },
        params: {
          limit: 100,
          updatedAfter: this.getLastSyncTime()
        }
      });

      const candidates = response.data.content || [];
      let synced = 0;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      for (const candidate of candidates) {
        try {
          await prisma.candidate.upsert({
            where: { email: candidate.email },
            update: {
              name: `${candidate.firstName} ${candidate.lastName}`,
              phone: candidate.phone,
              location: candidate.location?.city || candidate.location?.country,
              source: 'SMARTRECRUITERS',
              externalId: candidate.id
            },
            create: {
              email: candidate.email,
              name: `${candidate.firstName} ${candidate.lastName}`,
              phone: candidate.phone,
              location: candidate.location?.city || candidate.location?.country,
              source: 'SMARTRECRUITERS',
              externalId: candidate.id,
              status: 'ACTIVE'
            }
          });
          synced++;
        } catch (error) {
          console.error(`Error syncing candidate ${candidate.email}:`, error);
        }
      }

      await prisma.$disconnect();

      return { synced, errors: candidates.length - synced };
    } catch (error: any) {
      console.error('SmartRecruiters API error:', error);
      throw new Error(`Failed to sync candidates: ${error.message}`);
    }
  }

  /**
   * Sync jobs from SmartRecruiters
   */
  async syncJobs(config: SmartRecruitersConfig): Promise<{ synced: number; errors: number }> {
    if (this.mockMode) {
      return this.mockSyncJobs();
    }

    try {
      const response = await axios.get(`${config.baseUrl}/jobs`, {
        headers: {
          'X-SmartToken': config.apiKey
        },
        params: {
          limit: 100,
          status: 'ACTIVE'
        }
      });

      const jobs = response.data.content || [];
      let synced = 0;

      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();

      for (const job of jobs) {
        try {
          await prisma.job.upsert({
            where: { externalId: job.id },
            update: {
              title: job.title,
              department: job.department?.label,
              location: job.location?.city || job.location?.country,
              status: job.status
            },
            create: {
              title: job.title,
              department: job.department?.label,
              location: job.location?.city || job.location?.country,
              status: job.status,
              externalId: job.id
            }
          });
          synced++;
        } catch (error) {
          console.error(`Error syncing job ${job.id}:`, error);
        }
      }

      await prisma.$disconnect();

      return { synced, errors: jobs.length - synced };
    } catch (error: any) {
      console.error('SmartRecruiters API error:', error);
      throw new Error(`Failed to sync jobs: ${error.message}`);
    }
  }

  /**
   * Mock sync candidates (for development)
   */
  private async mockSyncCandidates(): Promise<{ synced: number; errors: number }> {
    console.log('[MOCK] Syncing candidates from SmartRecruiters');

    const mockCandidates = [
      {
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1-555-0101',
        location: 'San Francisco, CA'
      },
      {
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '+1-555-0102',
        location: 'New York, NY'
      },
      {
        email: 'bob.johnson@example.com',
        firstName: 'Bob',
        lastName: 'Johnson',
        phone: '+1-555-0103',
        location: 'Austin, TX'
      }
    ];

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    for (const candidate of mockCandidates) {
      await prisma.candidate.upsert({
        where: { email: candidate.email },
        update: {
          name: `${candidate.firstName} ${candidate.lastName}`,
          phone: candidate.phone,
          location: candidate.location,
          source: 'SMARTRECRUITERS'
        },
        create: {
          email: candidate.email,
          name: `${candidate.firstName} ${candidate.lastName}`,
          phone: candidate.phone,
          location: candidate.location,
          source: 'SMARTRECRUITERS',
          status: 'ACTIVE'
        }
      });
    }

    await prisma.$disconnect();

    return { synced: mockCandidates.length, errors: 0 };
  }

  /**
   * Mock sync jobs (for development)
   */
  private async mockSyncJobs(): Promise<{ synced: number; errors: number }> {
    console.log('[MOCK] Syncing jobs from SmartRecruiters');

    const mockJobs = [
      {
        id: 'sr-job-1',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA',
        status: 'ACTIVE'
      },
      {
        id: 'sr-job-2',
        title: 'Product Manager',
        department: 'Product',
        location: 'New York, NY',
        status: 'ACTIVE'
      }
    ];

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    for (const job of mockJobs) {
      await prisma.job.upsert({
        where: { externalId: job.id },
        update: {
          title: job.title,
          department: job.department,
          location: job.location,
          status: job.status
        },
        create: {
          title: job.title,
          department: job.department,
          location: job.location,
          status: job.status,
          externalId: job.id
        }
      });
    }

    await prisma.$disconnect();

    return { synced: mockJobs.length, errors: 0 };
  }

  /**
   * Get last sync time for incremental sync
   */
  private getLastSyncTime(): string {
    // Get timestamp from 24 hours ago
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  }
}

export default new SmartRecruitersService();

