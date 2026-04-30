import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const isQueueEnabled = process.env.REDIS_ENABLED === 'true';

type QueueLike = {
  add: (name: string, data: unknown, opts?: unknown) => Promise<{ id: string }>;
  close: () => Promise<void>;
};

const createDisabledQueue = (queueName: string): QueueLike => ({
  add: async (name: string) => {
    console.warn(
      `[Queue Disabled] Skipped enqueue for "${queueName}" job "${name}". ` +
      'Set REDIS_ENABLED=true with a valid REDIS_URL to enable background workers.'
    );
    return { id: `disabled-${queueName}-${Date.now()}` };
  },
  close: async () => {},
});

let connection: IORedis | null = null;

if (isQueueEnabled) {
  connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
  });

  connection.on('error', (error) => {
    console.error('Redis connection error:', error.message);
  });
} else {
  console.warn('⚠️ REDIS_ENABLED is not true. Background queues are disabled.');
}

// ==================== Queue Definitions ====================

export const surveySendQueue: QueueLike = connection
  ? (new Queue('survey-send', { connection }) as unknown as QueueLike)
  : createDisabledQueue('survey-send');
export const srSyncQueue: QueueLike = connection
  ? (new Queue('sr-sync', { connection }) as unknown as QueueLike)
  : createDisabledQueue('sr-sync');
export const bulkImportQueue: QueueLike = connection
  ? (new Queue('bulk-import', { connection }) as unknown as QueueLike)
  : createDisabledQueue('bulk-import');
export const metricsAggregateQueue: QueueLike = connection
  ? (new Queue('metrics-aggregate', { connection }) as unknown as QueueLike)
  : createDisabledQueue('metrics-aggregate');

// ==================== Queue Events ====================

if (connection) {
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

  void metricsAggregateEvents;
}

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
  if (connection) {
    await connection.quit();
  }
  console.log('✅ All queues closed');
};

export const queues = {
  surveySend: surveySendQueue,
  srSync: srSyncQueue,
  bulkImport: bulkImportQueue,
  metricsAggregate: metricsAggregateQueue,
  addSurveySendJob,
  addSRSyncJob,
  addBulkImportJob,
  scheduleAutoSync,
  scheduleDailyMetrics,
  closeQueues,
};

export default queues;
