import surveySendWorker from './workers/surveySend.worker';
import srSyncWorker from './workers/srSync.worker';
import bulkImportWorker from './workers/bulkImport.worker';
import metricsAggregateWorker from './workers/metricsAggregate.worker';

console.log('🚀 Starting BullMQ workers...');

// Export all workers
export {
  surveySendWorker,
  srSyncWorker,
  bulkImportWorker,
  metricsAggregateWorker
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down workers...');
  await Promise.all([
    surveySendWorker.close(),
    srSyncWorker.close(),
    bulkImportWorker.close(),
    metricsAggregateWorker.close()
  ]);
  process.exit(0);
});

console.log('✅ All workers initialized and ready');

