/**
 * Worker Starter
 * Start all BullMQ workers for background job processing
 */
import dotenv from 'dotenv';
import surveySendWorker from './workers/survey-send.worker';
import srSyncWorker from './workers/sr-sync.worker';
import bulkImportWorker from './workers/bulk-import.worker';
import metricsAggregateWorker from './workers/metrics-aggregate.worker';

// Load environment variables
dotenv.config();

console.log('🚀 Starting all workers...');

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n⏹️  SIGTERM received, closing workers...');
  
  await Promise.all([
    surveySendWorker.close(),
    srSyncWorker.close(),
    bulkImportWorker.close(),
    metricsAggregateWorker.close()
  ]);
  
  console.log('✅ All workers closed');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n⏹️  SIGINT received, closing workers...');
  
  await Promise.all([
    surveySendWorker.close(),
    srSyncWorker.close(),
    bulkImportWorker.close(),
    metricsAggregateWorker.close()
  ]);
  
  console.log('✅ All workers closed');
  process.exit(0);
});

console.log('✅ All workers running');
console.log('Press Ctrl+C to stop');

