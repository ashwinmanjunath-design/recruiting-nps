import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

interface BulkImportJob {
  importJobId: string;
  filePath: string;
  importType: 'CANDIDATES' | 'SURVEY_RESPONSES' | 'COHORTS';
}

export const bulkImportWorker = new Worker<BulkImportJob>(
  'bulk-import',
  async (job: Job<BulkImportJob>) => {
    const { importJobId, filePath, importType } = job.data;

    console.log(`Processing bulk import: ${importJobId}, type: ${importType}`);

    try {
      // Update status to processing
      await prisma.importJob.update({
        where: { id: importJobId },
        data: { status: 'PROCESSING' }
      });

      // Read and parse file
      const fileContent = fs.readFileSync(filePath);
      const records = parseFile(filePath, fileContent);

      await job.updateProgress(20);

      // Process based on import type
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < records.length; i++) {
        const record = records[i];
        const rowNumber = i + 2; // +2 for header row and 0-index

        try {
          switch (importType) {
            case 'CANDIDATES':
              await importCandidate(record);
              break;
            case 'SURVEY_RESPONSES':
              await importSurveyResponse(record);
              break;
            case 'COHORTS':
              await importCohort(record);
              break;
          }
          successCount++;
        } catch (error: any) {
          errorCount++;
          await prisma.importError.create({
            data: {
              importJobId,
              rowNumber,
              field: error.field || 'unknown',
              errorMessage: error.message
            }
          });
        }

        // Update progress
        const progress = 20 + Math.floor((i / records.length) * 70);
        await job.updateProgress(progress);
      }

      // Update import job status
      await prisma.importJob.update({
        where: { id: importJobId },
        data: {
          status: errorCount > 0 && successCount === 0 ? 'FAILED' : 'COMPLETED',
          totalRows: records.length,
          successRows: successCount,
          completedAt: new Date()
        }
      });

      // Clean up file
      fs.unlinkSync(filePath);

      await job.updateProgress(100);
      console.log(`✅ Import completed: ${successCount} success, ${errorCount} errors`);

      return { success: true, successCount, errorCount };
    } catch (error: any) {
      console.error(`Import error for job ${importJobId}:`, error);

      await prisma.importJob.update({
        where: { id: importJobId },
        data: {
          status: 'FAILED',
          completedAt: new Date()
        }
      });

      throw error;
    }
  },
  { connection: redisConfig, concurrency: 2 }
);

// Parse file based on extension
function parseFile(filePath: string, fileContent: Buffer): any[] {
  const extension = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();

  if (extension === '.csv') {
    return parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  } else if (extension === '.xlsx' || extension === '.xls') {
    const workbook = XLSX.read(fileContent);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(worksheet);
  } else {
    throw new Error('Unsupported file format');
  }
}

// Import candidate
async function importCandidate(record: any) {
  const required = ['email', 'name'];
  for (const field of required) {
    if (!record[field]) {
      const error: any = new Error(`Missing required field: ${field}`);
      error.field = field;
      throw error;
    }
  }

  await prisma.candidate.upsert({
    where: { email: record.email },
    update: {
      name: record.name,
      phone: record.phone || null,
      role: record.role || null,
      source: record.source || null,
      location: record.location || null,
      status: record.status || 'NEW'
    },
    create: {
      email: record.email,
      name: record.name,
      phone: record.phone || null,
      role: record.role || null,
      source: record.source || null,
      location: record.location || null,
      status: record.status || 'NEW'
    }
  });
}

// Import survey response
async function importSurveyResponse(record: any) {
  const required = ['candidateEmail', 'npsScore'];
  for (const field of required) {
    if (!record[field]) {
      const error: any = new Error(`Missing required field: ${field}`);
      error.field = field;
      throw error;
    }
  }

  // Find candidate
  const candidate = await prisma.candidate.findUnique({
    where: { email: record.candidateEmail }
  });

  if (!candidate) {
    const error: any = new Error(`Candidate not found: ${record.candidateEmail}`);
    error.field = 'candidateEmail';
    throw error;
  }

  // Create or find survey
  const template = await prisma.surveyTemplate.findFirst({
    where: { name: record.templateName || 'Default NPS Survey' }
  });

  if (!template) {
    const error: any = new Error('Survey template not found');
    error.field = 'templateName';
    throw error;
  }

  const survey = await prisma.survey.create({
    data: {
      templateId: template.id,
      candidateId: candidate.id,
      status: 'COMPLETED',
      sentAt: new Date(),
      completedAt: new Date()
    }
  });

  // Create response
  await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      npsScore: parseInt(record.npsScore, 10),
      feedback: record.feedback || null
    }
  });
}

// Import cohort
async function importCohort(record: any) {
  const required = ['name', 'candidateEmail'];
  for (const field of required) {
    if (!record[field]) {
      const error: any = new Error(`Missing required field: ${field}`);
      error.field = field;
      throw error;
    }
  }

  // Find or create cohort
  let cohort = await prisma.cohortDefinition.findFirst({
    where: { name: record.name }
  });

  if (!cohort) {
    cohort = await prisma.cohortDefinition.create({
      data: {
        name: record.name,
        description: record.description || null,
        filters: {}
      }
    });
  }

  // Find candidate
  const candidate = await prisma.candidate.findUnique({
    where: { email: record.candidateEmail }
  });

  if (!candidate) {
    const error: any = new Error(`Candidate not found: ${record.candidateEmail}`);
    error.field = 'candidateEmail';
    throw error;
  }

  // Create membership
  await prisma.cohortMembership.upsert({
    where: {
      cohortId_candidateId: {
        cohortId: cohort.id,
        candidateId: candidate.id
      }
    },
    update: {},
    create: {
      cohortId: cohort.id,
      candidateId: candidate.id
    }
  });
}

// Event listeners
bulkImportWorker.on('completed', (job) => {
  console.log(`✅ Bulk import job ${job.id} completed`);
});

bulkImportWorker.on('failed', (job, err) => {
  console.error(`❌ Bulk import job ${job?.id} failed:`, err);
});

export default bulkImportWorker;

