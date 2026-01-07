import { Queue, Worker, Job, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create Redis connection for BullMQ
export const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ==================== Queue Definitions ====================

export const surveySendQueue = new Queue('survey-send', { connection });
export const srSyncQueue = new Queue('sr-sync', { connection });
export const bulkImportQueue = new Queue('bulk-import', { connection });
export const metricsAggregateQueue = new Queue('metrics-aggregate', { connection });

// ==================== Queue Events ====================

const surveySendEvents = new QueueEvents('survey-send', { connection });
const srSyncEvents = new QueueEvents('sr-sync', { connection });
const bulkImportEvents = new QueueEvents('bulk-import', { connection });
const metricsAggregateEvents = new QueueEvents('metrics-aggregate', { connection });

// Event Listeners
surveySendEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Survey send job ${jobId} completed`);
});

surveySendEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Survey send job ${jobId} failed:`, failedReason);
});

srSyncEvents.on('completed', ({ jobId }) => {
  console.log(`✅ SmartRecruiters sync job ${jobId} completed`);
});

srSyncEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ SmartRecruiters sync job ${jobId} failed:`, failedReason);
});

bulkImportEvents.on('completed', ({ jobId }) => {
  console.log(`✅ Bulk import job ${jobId} completed`);
});

bulkImportEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`❌ Bulk import job ${jobId} failed:`, failedReason);
});

// ==================== Job Types ====================

export interface SurveySendJob {
  surveyId: string;
  sendViaEmail: boolean;
  sendViaSMS: boolean;
}

export interface SRSyncJob {
  syncType: 'candidates' | 'jobs' | 'full';
  limit?: number;
}

export interface BulkImportJob {
  importId: string;
}

// ==================== Queue Operations ====================

export const addSurveySendJob = async (data: SurveySendJob) => {
  return await surveySendQueue.add('send-survey', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
  });
};

export const addSRSyncJob = async (data: SRSyncJob) => {
  return await srSyncQueue.add('sync-smartrecruiters', data, {
    attempts: 2,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};

export const addBulkImportJob = async (data: BulkImportJob) => {
  return await bulkImportQueue.add('process-import', data, {
    attempts: 1, // No retries for imports
  });
};

// ==================== Scheduled/Recurring Jobs ====================

// Auto-sync SmartRecruiters (configurable interval)
export const scheduleAutoSync = async (intervalMinutes: number = 15) => {
  await srSyncQueue.add(
    'auto-sync',
    { syncType: 'full' },
    {
      repeat: {
        every: intervalMinutes * 60 * 1000, // Convert to milliseconds
      },
    }
  );
  console.log(`📅 Scheduled auto-sync every ${intervalMinutes} minutes`);
};

// Daily metrics aggregation
export const scheduleDailyMetrics = async () => {
  await metricsAggregateQueue.add(
    'daily-aggregate',
    {},
    {
      repeat: {
        pattern: '0 1 * * *', // Daily at 1 AM
      },
    }
  );
  console.log('📅 Scheduled daily metrics aggregation at 1 AM');
};

// ==================== Cleanup ====================

export const closeQueues = async () => {
  await surveySendQueue.close();
  await srSyncQueue.close();
  await bulkImportQueue.close();
  await metricsAggregateQueue.close();
  await connection.quit();
  console.log('✅ All queues closed');
};

export default {
  surveySendQueue,
  srSyncQueue,
  bulkImportQueue,
  metricsAggregateQueue,
  addSurveySendJob,
  addSRSyncJob,
  addBulkImportJob,
  scheduleAutoSync,
  scheduleDailyMetrics,
  closeQueues,
};

