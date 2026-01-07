import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';
import fs from 'fs';
import { redisConfig } from '../config/redis';

const prisma = new PrismaClient();

/**
 * Bulk Import Worker
 * Processes CSV/Excel file imports for candidates, survey responses, and cohorts
 */
export const bulkImportWorker = new Worker(
  'bulk-import',
  async (job: Job) => {
    const { importJobId, filePath, importType } = job.data;

    console.log(`Processing bulk import: ${importJobId}, type: ${importType}`);

    try {
      // Update import job status
      await prisma.importJob.update({
        where: { id: importJobId },
        data: { status: 'PROCESSING' }
      });

      // Read and parse file
      const fileData = fs.readFileSync(filePath);
      const ext = filePath.split('.').pop()?.toLowerCase();

      let rows: any[] = [];

      if (ext === 'csv') {
        rows = parse(fileData, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        });
      } else if (ext === 'xls' || ext === 'xlsx') {
        const workbook = XLSX.read(fileData, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        rows = XLSX.utils.sheet_to_json(sheet);
      } else {
        throw new Error(`Unsupported file format: ${ext}`);
      }

      console.log(`Parsed ${rows.length} rows from file`);

      // Update total rows
      await prisma.importJob.update({
        where: { id: importJobId },
        data: { totalRows: rows.length }
      });

      // Process rows based on import type
      let successCount = 0;
      const errors: any[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowNumber = i + 1;

        try {
          if (importType === 'CANDIDATES') {
            await importCandidate(row);
          } else if (importType === 'SURVEY_RESPONSES') {
            await importSurveyResponse(row);
          } else if (importType === 'COHORTS') {
            await importCohort(row);
          }

          successCount++;
        } catch (error: any) {
          console.error(`Error processing row ${rowNumber}:`, error.message);
          errors.push({
            rowNumber,
            field: error.field || 'unknown',
            errorMessage: error.message
          });

          // Store error in database
          await prisma.importError.create({
            data: {
              importJobId,
              rowNumber,
              field: error.field || 'unknown',
              errorMessage: error.message
            }
          });
        }
      }

      // Update import job with results
      await prisma.importJob.update({
        where: { id: importJobId },
        data: {
          status: successCount > 0 ? 'COMPLETED' : 'FAILED',
          successRows: successCount,
          completedAt: new Date()
        }
      });

      // Delete temporary file
      fs.unlinkSync(filePath);

      console.log(`✅ Import completed: ${successCount}/${rows.length} rows, ${errors.length} errors`);

      return {
        success: true,
        totalRows: rows.length,
        successRows: successCount,
        errorRows: errors.length
      };
    } catch (error: any) {
      console.error(`Import job ${importJobId} failed:`, error);

      // Update import job status
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
  {
    connection: redisConfig,
    concurrency: 2
  }
);

/**
 * Import a candidate from row data
 */
async function importCandidate(row: any) {
  const requiredFields = ['name', 'email'];
  
  for (const field of requiredFields) {
    if (!row[field]) {
      const error: any = new Error(`Missing required field: ${field}`);
      error.field = field;
      throw error;
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row.email)) {
    const error: any = new Error('Invalid email format');
    error.field = 'email';
    throw error;
  }

  await prisma.candidate.upsert({
    where: { email: row.email },
    update: {
      name: row.name,
      phone: row.phone || null,
      role: row.role || null,
      location: row.location || null,
      source: row.source || null,
      status: (row.status as any) || 'ACTIVE',
      updatedAt: new Date()
    },
    create: {
      name: row.name,
      email: row.email,
      phone: row.phone || null,
      role: row.role || null,
      location: row.location || null,
      source: row.source || null,
      status: (row.status as any) || 'ACTIVE'
    }
  });
}

/**
 * Import a survey response from row data
 */
async function importSurveyResponse(row: any) {
  const requiredFields = ['candidateEmail', 'npsScore'];
  
  for (const field of requiredFields) {
    if (!row[field]) {
      const error: any = new Error(`Missing required field: ${field}`);
      error.field = field;
      throw error;
    }
  }

  // Find candidate
  const candidate = await prisma.candidate.findUnique({
    where: { email: row.candidateEmail }
  });

  if (!candidate) {
    const error: any = new Error(`Candidate not found: ${row.candidateEmail}`);
    error.field = 'candidateEmail';
    throw error;
  }

  // Validate NPS score
  const npsScore = parseInt(row.npsScore, 10);
  if (isNaN(npsScore) || npsScore < 0 || npsScore > 10) {
    const error: any = new Error('NPS score must be between 0 and 10');
    error.field = 'npsScore';
    throw error;
  }

  // Get or create a survey for this candidate
  let survey = await prisma.survey.findFirst({
    where: { candidateId: candidate.id },
    orderBy: { createdAt: 'desc' }
  });

  if (!survey) {
    // Create a default survey
    const defaultTemplate = await prisma.surveyTemplate.findFirst();
    
    if (!defaultTemplate) {
      throw new Error('No survey template found');
    }

    survey = await prisma.survey.create({
      data: {
        candidateId: candidate.id,
        templateId: defaultTemplate.id,
        status: 'COMPLETED',
        sentAt: new Date()
      }
    });
  }

  // Create survey response
  await prisma.surveyResponse.create({
    data: {
      surveyId: survey.id,
      npsScore,
      feedback: row.feedback || null
    }
  });
}

/**
 * Import a cohort from row data
 */
async function importCohort(row: any) {
  const requiredFields = ['cohortName', 'candidateEmail'];
  
  for (const field of requiredFields) {
    if (!row[field]) {
      const error: any = new Error(`Missing required field: ${field}`);
      error.field = field;
      throw error;
    }
  }

  // Find or create cohort
  let cohort = await prisma.cohortDefinition.findFirst({
    where: { name: row.cohortName }
  });

  if (!cohort) {
    cohort = await prisma.cohortDefinition.create({
      data: {
        name: row.cohortName,
        description: row.cohortDescription || null,
        filters: {}
      }
    });
  }

  // Find candidate
  const candidate = await prisma.candidate.findUnique({
    where: { email: row.candidateEmail }
  });

  if (!candidate) {
    const error: any = new Error(`Candidate not found: ${row.candidateEmail}`);
    error.field = 'candidateEmail';
    throw error;
  }

  // Add candidate to cohort
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

// Worker event listeners
bulkImportWorker.on('completed', (job) => {
  console.log(`Bulk import job ${job.id} completed`);
});

bulkImportWorker.on('failed', (job, err) => {
  console.error(`Bulk import job ${job?.id} failed:`, err.message);
});

bulkImportWorker.on('error', (err) => {
  console.error('Bulk import worker error:', err);
});

console.log('✅ Bulk import worker started');

export default bulkImportWorker;
