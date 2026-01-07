import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import dayjs from 'dayjs';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

/**
 * Metrics Aggregation Worker
 * Aggregates daily metrics for performance and reporting
 */
export const metricsAggregateWorker = new Worker(
  'metrics-aggregate',
  async (job: Job) => {
    const { date } = job.data;

    console.log(`Aggregating metrics for date: ${date || 'today'}`);

    try {
      const targetDate = date ? dayjs(date) : dayjs().subtract(1, 'day');
      const startOfDay = targetDate.startOf('day').toDate();
      const endOfDay = targetDate.endOf('day').toDate();

      // Aggregate daily metrics
      await aggregateDailyMetrics(startOfDay, endOfDay);

      // Aggregate geographic metrics
      await aggregateGeographicMetrics();

      // Update feedback themes
      await updateFeedbackThemes();

      console.log(`✅ Metrics aggregation completed for ${targetDate.format('YYYY-MM-DD')}`);

      return {
        success: true,
        date: targetDate.format('YYYY-MM-DD')
      };
    } catch (error: any) {
      console.error('Metrics aggregation error:', error);
      throw error;
    }
  },
  {
    connection: redisConfig,
    concurrency: 1
  }
);

/**
 * Aggregate daily metrics
 */
async function aggregateDailyMetrics(startDate: Date, endDate: Date) {
  // Get all responses for the day
  const responses = await prisma.surveyResponse.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate
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

  const nps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

  // Count unique candidates who responded
  const uniqueCandidates = new Set(responses.map(r => r.survey.candidateId)).size;

  // Count surveys sent
  const surveysSent = await prisma.survey.count({
    where: {
      sentAt: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const responseRate = surveysSent > 0 ? Math.round((responses.length / surveysSent) * 100) : 0;

  // Calculate average time to feedback
  const timesToFeedback = responses
    .filter(r => r.survey.sentAt)
    .map(r => {
      const days = Math.abs(r.createdAt.getTime() - r.survey.sentAt!.getTime()) / (1000 * 60 * 60 * 24);
      return days;
    });

  const avgTimeToFeedback = timesToFeedback.length > 0
    ? timesToFeedback.reduce((a, b) => a + b, 0) / timesToFeedback.length
    : 0;

  // Upsert daily metric
  await prisma.dailyMetric.upsert({
    where: {
      date: startDate
    },
    update: {
      nps,
      responseCount: responses.length,
      responseRate,
      promoters,
      passives,
      detractors,
      avgTimeToFeedback,
      uniqueCandidates
    },
    create: {
      date: startDate,
      nps,
      responseCount: responses.length,
      responseRate,
      promoters,
      passives,
      detractors,
      avgTimeToFeedback,
      uniqueCandidates
    }
  });

  console.log(`Daily metrics aggregated: NPS ${nps}, Response Rate ${responseRate}%`);
}

/**
 * Aggregate geographic metrics
 */
async function aggregateGeographicMetrics() {
  // Get all candidates with location
  const candidates = await prisma.candidate.findMany({
    where: {
      location: { not: null }
    },
    include: {
      surveys: {
        include: {
          responses: true
        }
      }
    }
  });

  // Group by country (extract from location)
  const countryGroups: Record<string, any[]> = {};

  for (const candidate of candidates) {
    // Simple location parsing - extract last part as country
    const location = candidate.location || '';
    const parts = location.split(',').map(p => p.trim());
    const country = parts[parts.length - 1] || 'Unknown';

    if (!countryGroups[country]) {
      countryGroups[country] = [];
    }

    countryGroups[country].push(candidate);
  }

  // Calculate metrics for each country
  for (const [country, countryCandidates] of Object.entries(countryGroups)) {
    const allResponses = countryCandidates.flatMap(c =>
      c.surveys.flatMap(s => s.responses)
    );

    const npsScores = allResponses.map(r => r.npsScore).filter(s => s !== null) as number[];
    
    const promoters = npsScores.filter(s => s >= 9).length;
    const detractors = npsScores.filter(s => s <= 6).length;
    const total = npsScores.length;

    const avgNps = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0;

    const allSurveys = countryCandidates.flatMap(c => c.surveys);
    const responseRate = allSurveys.length > 0
      ? Math.round((allResponses.length / allSurveys.length) * 100)
      : 0;

    // Calculate median time to feedback
    const timesToFeedback = allResponses
      .filter(r => {
        const survey = allSurveys.find(s => s.id === r.surveyId);
        return survey && survey.sentAt;
      })
      .map(r => {
        const survey = allSurveys.find(s => s.id === r.surveyId);
        if (!survey || !survey.sentAt) return 0;
        return Math.abs(r.createdAt.getTime() - survey.sentAt.getTime()) / (1000 * 60 * 60 * 24);
      })
      .sort((a, b) => a - b);

    const medianTimeToFeedback = timesToFeedback.length > 0
      ? timesToFeedback[Math.floor(timesToFeedback.length / 2)]
      : 0;

    // Upsert geographic metric
    await prisma.geoMetric.upsert({
      where: {
        country_region: {
          country,
          region: country
        }
      },
      update: {
        avgNps,
        responseRate,
        candidateCount: countryCandidates.length,
        medianTimeToFeedback: Math.round(medianTimeToFeedback)
      },
      create: {
        country,
        region: country,
        avgNps,
        responseRate,
        candidateCount: countryCandidates.length,
        medianTimeToFeedback: Math.round(medianTimeToFeedback)
      }
    });
  }

  console.log(`Geographic metrics aggregated for ${Object.keys(countryGroups).length} countries`);
}

/**
 * Update feedback themes from survey responses
 */
async function updateFeedbackThemes() {
  // Get all responses with feedback text
  const responses = await prisma.surveyResponse.findMany({
    where: {
      feedback: { not: null }
    }
  });

  // Simple keyword extraction (in production, use NLP/AI)
  const keywords = [
    { word: 'communication', sentiment: 'NEUTRAL', category: 'PROCESS' },
    { word: 'interview', sentiment: 'NEUTRAL', category: 'INTERVIEW' },
    { word: 'friendly', sentiment: 'POSITIVE', category: 'CULTURE' },
    { word: 'professional', sentiment: 'POSITIVE', category: 'CULTURE' },
    { word: 'slow', sentiment: 'NEGATIVE', category: 'PROCESS' },
    { word: 'fast', sentiment: 'POSITIVE', category: 'PROCESS' },
    { word: 'disorganized', sentiment: 'NEGATIVE', category: 'PROCESS' },
    { word: 'organized', sentiment: 'POSITIVE', category: 'PROCESS' },
    { word: 'rude', sentiment: 'NEGATIVE', category: 'CULTURE' },
    { word: 'great', sentiment: 'POSITIVE', category: 'OVERALL' },
    { word: 'poor', sentiment: 'NEGATIVE', category: 'OVERALL' },
  ];

  const themeCounts: Record<string, any> = {};

  for (const response of responses) {
    const feedback = (response.feedback || '').toLowerCase();

    for (const keyword of keywords) {
      if (feedback.includes(keyword.word)) {
        const key = keyword.word;
        if (!themeCounts[key]) {
          themeCounts[key] = {
            theme: keyword.word,
            count: 0,
            sentiment: keyword.sentiment,
            category: keyword.category
          };
        }
        themeCounts[key].count++;
      }
    }
  }

  // Update themes in database
  for (const themeData of Object.values(themeCounts)) {
    await prisma.feedbackTheme.upsert({
      where: { theme: themeData.theme },
      update: {
        count: themeData.count,
        sentiment: themeData.sentiment as any,
        category: themeData.category as any
      },
      create: {
        theme: themeData.theme,
        count: themeData.count,
        sentiment: themeData.sentiment as any,
        category: themeData.category as any
      }
    });
  }

  console.log(`Feedback themes updated: ${Object.keys(themeCounts).length} themes`);
}

// Worker event listeners
metricsAggregateWorker.on('completed', (job) => {
  console.log(`Metrics aggregation job ${job.id} completed`);
});

metricsAggregateWorker.on('failed', (job, err) => {
  console.error(`Metrics aggregation job ${job?.id} failed:`, err.message);
});

metricsAggregateWorker.on('error', (err) => {
  console.error('Metrics aggregation worker error:', err);
});

console.log('✅ Metrics aggregation worker started');

export default metricsAggregateWorker;
