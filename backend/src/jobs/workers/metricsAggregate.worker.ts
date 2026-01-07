import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

export const metricsAggregateWorker = new Worker(
  'metrics-aggregate',
  async (job: Job) => {
    console.log('Starting daily metrics aggregation');

    try {
      await job.updateProgress(10);

      // Calculate daily metrics
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await job.updateProgress(30);

      // Aggregate NPS metrics
      const responses = await prisma.surveyResponse.findMany({
        where: {
          createdAt: {
            gte: yesterday,
            lt: today
          }
        },
        include: {
          survey: {
            include: {
              candidate: true
            }
          }
        }
      });

      const npsScores = responses.map(r => r.npsScore).filter(s => s !== null) as number[];
      const promoters = npsScores.filter(s => s >= 9).length;
      const passives = npsScores.filter(s => s >= 7 && s <= 8).length;
      const detractors = npsScores.filter(s => s <= 6).length;
      const total = npsScores.length;
      const avgNps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

      await job.updateProgress(60);

      // Create daily metric record
      await prisma.dailyMetric.create({
        data: {
          date: yesterday,
          totalCandidates: await prisma.candidate.count(),
          totalSurveys: await prisma.survey.count({ where: { sentAt: { not: null } } }),
          totalResponses: await prisma.surveyResponse.count(),
          avgNps,
          promoters,
          passives,
          detractors,
          responseRate: 0 // TODO: Calculate accurate response rate
        }
      });

      await job.updateProgress(80);

      // Aggregate geographic metrics
      await aggregateGeographicMetrics();

      await job.updateProgress(100);

      console.log(`✅ Daily metrics aggregation completed for ${yesterday.toDateString()}`);
      return { success: true };
    } catch (error) {
      console.error('Metrics aggregation error:', error);
      throw error;
    }
  },
  { connection: redisConfig, concurrency: 1 }
);

async function aggregateGeographicMetrics() {
  // Get all unique locations
  const candidates = await prisma.candidate.groupBy({
    by: ['location'],
    where: {
      location: { not: null }
    },
    _count: true
  });

  for (const group of candidates) {
    if (!group.location) continue;

    // Get surveys for candidates in this location
    const locationCandidates = await prisma.candidate.findMany({
      where: { location: group.location },
      include: {
        surveys: {
          include: { responses: true }
        }
      }
    });

    const responses = locationCandidates.flatMap(c => 
      c.surveys.flatMap(s => s.responses)
    );

    const npsScores = responses.map(r => r.npsScore).filter(s => s !== null) as number[];
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const total = npsScores.length;
    const avgNps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    const responseRate = locationCandidates.length > 0
      ? Math.round((responses.length / locationCandidates.length) * 100)
      : 0;

    // Upsert geographic metric
    await prisma.geoMetric.upsert({
      where: { country: group.location },
      update: {
        avgNps,
        responseRate,
        candidateCount: group._count,
        lastUpdated: new Date()
      },
      create: {
        country: group.location,
        avgNps,
        responseRate,
        candidateCount: group._count
      }
    });
  }

  console.log(`✅ Geographic metrics aggregated for ${candidates.length} locations`);
}

// Event listeners
metricsAggregateWorker.on('completed', (job) => {
  console.log(`✅ Metrics aggregation job ${job.id} completed`);
});

metricsAggregateWorker.on('failed', (job, err) => {
  console.error(`❌ Metrics aggregation job ${job?.id} failed:`, err);
});

export default metricsAggregateWorker;

