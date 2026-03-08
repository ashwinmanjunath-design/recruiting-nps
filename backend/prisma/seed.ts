import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function seed() {
  console.log('Starting database seed...');

  try {
    // Create users
    console.log('Creating users...');

    const hashedPassword = await bcrypt.hash('password', 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'ADMIN',
        isActive: true,
      },
    });

    const analyst = await prisma.user.upsert({
      where: { email: 'analyst@example.com' },
      update: {},
      create: {
        email: 'analyst@example.com',
        password: hashedPassword,
        name: 'Sarah Analyst',
        role: 'ANALYST',
        isActive: true,
      },
    });

    const recruiter = await prisma.user.upsert({
      where: { email: 'recruiter@example.com' },
      update: {},
      create: {
        email: 'recruiter@example.com',
        password: hashedPassword,
        name: 'Mike Recruiter',
        role: 'RECRUITER',
        isActive: true,
      },
    });

    console.log('Created 3 users');

    // Create survey templates
    console.log('Creating survey templates...');

    const npsTemplate = await prisma.surveyTemplate.create({
      data: {
        name: 'Post-Interview NPS',
        description: 'Standard post-interview candidate experience survey',
        trigger: 'POST_INTERVIEW',
        audience: 'CANDIDATE',
        isActive: true,
        questions: {
          create: [
            {
              type: 'NPS_SCALE',
              question: 'On a scale of 0-10, how likely are you to recommend our company to a friend or colleague?',
              isNPS: true,
              isRequired: true,
              scaleMin: 0,
              scaleMax: 10,
              order: 1,
            },
            {
              type: 'TEXT',
              question: 'What did you like most about your interview experience?',
              isRequired: false,
              order: 2,
            },
            {
              type: 'TEXT',
              question: 'What could we improve in our interview process?',
              isRequired: false,
              order: 3,
            },
            {
              type: 'RATING',
              question: 'How would you rate the communication throughout the process?',
              isRequired: true,
              scaleMin: 1,
              scaleMax: 5,
              options: ['1', '2', '3', '4', '5'],
              order: 4,
            },
          ],
        },
      },
      include: { questions: true },
    });

    const quickNpsTemplate = await prisma.surveyTemplate.create({
      data: {
        name: 'Quick NPS Check',
        description: 'Quick one-question NPS survey',
        trigger: 'MANUAL',
        audience: 'CANDIDATE',
        isActive: true,
        questions: {
          create: [
            {
              type: 'NPS_SCALE',
              question: 'How likely are you to recommend us to others?',
              isNPS: true,
              isRequired: true,
              scaleMin: 0,
              scaleMax: 10,
              order: 1,
            },
          ],
        },
      },
    });

    console.log('Created 2 survey templates');

    // Get the NPS question ID for responses
    const npsQuestion = npsTemplate.questions.find((q) => q.isNPS);
    const textQuestion = npsTemplate.questions.find((q) => q.type === 'TEXT');

    if (!npsQuestion || !textQuestion) {
      throw new Error('Failed to create template questions');
    }

    // Create jobs
    console.log('Creating jobs...');

    const jobsData = [
      { title: 'Senior Software Engineer', department: 'Engineering', location: 'San Francisco, CA, USA', status: 'ACTIVE' },
      { title: 'Product Manager', department: 'Product', location: 'New York, NY, USA', status: 'ACTIVE' },
      { title: 'Data Scientist', department: 'Data', location: 'Boston, MA, USA', status: 'ACTIVE' },
      { title: 'UX Designer', department: 'Design', location: 'Seattle, WA, USA', status: 'ACTIVE' },
    ];

    const jobs = [];
    for (const jobData of jobsData) {
      const job = await prisma.job.create({ data: jobData });
      jobs.push(job);
    }

    console.log(`Created ${jobs.length} jobs`);

    // Create candidates
    console.log('Creating candidates...');

    const candidatesData = [
      { name: 'John Doe', email: 'john.doe@example.com', phone: '+14155551001', role: 'Software Engineer', country: 'USA', region: 'North America', source: 'LinkedIn', status: 'ACTIVE' as const },
      { name: 'Jane Smith', email: 'jane.smith@example.com', phone: '+12125551002', role: 'Product Manager', country: 'USA', region: 'North America', source: 'Referral', status: 'ACTIVE' as const },
      { name: 'Bob Johnson', email: 'bob.johnson@example.com', phone: '+16175551003', role: 'Data Scientist', country: 'USA', region: 'North America', source: 'Career Site', status: 'ACTIVE' as const },
      { name: 'Alice Williams', email: 'alice.williams@example.com', phone: '+12065551004', role: 'UX Designer', country: 'USA', region: 'North America', source: 'LinkedIn', status: 'ACTIVE' as const },
      { name: 'Charlie Brown', email: 'charlie.brown@example.com', phone: '+14155551005', role: 'Software Engineer', country: 'Germany', region: 'Europe', source: 'Agency', status: 'ACTIVE' as const },
      { name: 'Diana Prince', email: 'diana.prince@example.com', phone: '+13105551006', role: 'Product Manager', country: 'UK', region: 'Europe', source: 'LinkedIn', status: 'ACTIVE' as const },
      { name: 'Ethan Hunt', email: 'ethan.hunt@example.com', phone: '+14155551007', role: 'Software Engineer', country: 'India', region: 'Asia', source: 'Referral', status: 'ACTIVE' as const },
      { name: 'Fiona Green', email: 'fiona.green@example.com', phone: '+14805551008', role: 'Data Scientist', country: 'Australia', region: 'Oceania', source: 'Career Site', status: 'ACTIVE' as const },
    ];

    const candidates = [];
    for (const candidateData of candidatesData) {
      const candidate = await prisma.candidate.upsert({
        where: { email: candidateData.email },
        update: {},
        create: candidateData,
      });
      candidates.push(candidate);
    }

    console.log(`Created ${candidates.length} candidates`);

    // Create surveys and responses
    console.log('Creating surveys and responses...');

    const npsScores = [9, 10, 8, 7, 9, 6, 10, 8];
    const feedbacks = [
      'Great interview experience! Very professional and friendly.',
      'Excellent process, kept me informed throughout.',
      'Good experience overall, communication could be faster.',
      'Interview was okay, but scheduling was difficult.',
      'Really impressed with the team and culture.',
      'Process took too long and communication was poor.',
      'Amazing experience! Would definitely recommend.',
      'Smooth process, interviewers were well-prepared.',
    ];

    let surveyCount = 0;
    let responseCount = 0;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      const numSurveys = 2 + Math.floor(Math.random() * 2);

      for (let j = 0; j < numSurveys; j++) {
        const daysAgo = Math.floor(Math.random() * 90);
        const sentAt = new Date();
        sentAt.setDate(sentAt.getDate() - daysAgo);

        const expiresAt = new Date(sentAt);
        expiresAt.setDate(expiresAt.getDate() + 30);

        const isCompleted = Math.random() > 0.3;

        const survey = await prisma.survey.create({
          data: {
            token: randomUUID(),
            templateId: npsTemplate.id,
            candidateId: candidate.id,
            audience: 'CANDIDATE',
            status: isCompleted ? 'COMPLETED' : 'SENT',
            sentAt,
            expiresAt,
            respondedAt: isCompleted ? new Date(sentAt.getTime() + Math.random() * 5 * 86400000) : null,
          },
        });

        surveyCount++;

        // Create responses if survey is completed
        if (isCompleted) {
          // NPS score response
          await prisma.surveyResponse.create({
            data: {
              surveyId: survey.id,
              candidateId: candidate.id,
              questionId: npsQuestion.id,
              audience: 'CANDIDATE',
              score: npsScores[i % npsScores.length],
              sentiment: npsScores[i % npsScores.length] >= 9 ? 'POSITIVE' : npsScores[i % npsScores.length] >= 7 ? 'NEUTRAL' : 'NEGATIVE',
            },
          });

          // Text feedback response
          await prisma.surveyResponse.create({
            data: {
              surveyId: survey.id,
              candidateId: candidate.id,
              questionId: textQuestion.id,
              audience: 'CANDIDATE',
              text: feedbacks[i % feedbacks.length],
              sentiment: npsScores[i % npsScores.length] >= 7 ? 'POSITIVE' : 'NEGATIVE',
            },
          });

          responseCount += 2;
        }
      }
    }

    console.log(`Created ${surveyCount} surveys and ${responseCount} responses`);

    // Create cohorts
    console.log('Creating cohorts...');

    const engineersCohort = await prisma.cohortDefinition.create({
      data: {
        name: 'Software Engineers',
        description: 'All software engineering candidates',
        filters: { role: 'Software Engineer' },
      },
    });

    const linkedInCohort = await prisma.cohortDefinition.create({
      data: {
        name: 'LinkedIn Sourced',
        description: 'Candidates sourced from LinkedIn',
        filters: { source: 'LinkedIn' },
      },
    });

    for (const candidate of candidates) {
      if (candidate.role === 'Software Engineer') {
        await prisma.cohortMembership.create({
          data: { cohortId: engineersCohort.id, candidateId: candidate.id },
        });
      }
      if (candidate.source === 'LinkedIn') {
        await prisma.cohortMembership.create({
          data: { cohortId: linkedInCohort.id, candidateId: candidate.id },
        });
      }
    }

    console.log('Created 2 cohorts');

    // Create feedback themes
    console.log('Creating feedback themes...');

    const themes = [
      { name: 'Great Communication', category: 'POSITIVE' as const, sentiment: 'POSITIVE' as const, count: 12 },
      { name: 'Professional Interviewers', category: 'POSITIVE' as const, sentiment: 'POSITIVE' as const, count: 15 },
      { name: 'Friendly Culture', category: 'POSITIVE' as const, sentiment: 'POSITIVE' as const, count: 10 },
      { name: 'Slow Process', category: 'NEGATIVE' as const, sentiment: 'NEGATIVE' as const, count: 8 },
      { name: 'Well Organized', category: 'POSITIVE' as const, sentiment: 'POSITIVE' as const, count: 11 },
      { name: 'Disorganized Scheduling', category: 'NEGATIVE' as const, sentiment: 'NEGATIVE' as const, count: 5 },
      { name: 'Overall Great Experience', category: 'POSITIVE' as const, sentiment: 'POSITIVE' as const, count: 18 },
      { name: 'Poor Feedback Loop', category: 'NEGATIVE' as const, sentiment: 'NEGATIVE' as const, count: 3 },
    ];

    for (const themeData of themes) {
      await prisma.feedbackTheme.create({ data: themeData });
    }

    console.log(`Created ${themes.length} feedback themes`);

    // Create action items
    console.log('Creating action items...');

    const actions = [
      {
        title: 'Improve interview scheduling system',
        description: 'Several candidates mentioned difficulty with scheduling. Implement automated scheduling tool.',
        priority: 'HIGH' as const,
        status: 'IN_PROGRESS' as const,
        assignedTo: recruiter.id,
        createdById: admin.id,
      },
      {
        title: 'Speed up feedback delivery',
        description: 'Candidates are waiting too long for feedback. Set SLA of 48 hours.',
        priority: 'HIGH' as const,
        status: 'PENDING' as const,
        assignedTo: recruiter.id,
        createdById: admin.id,
      },
      {
        title: 'Create interview prep guide',
        description: 'Help candidates prepare better by providing detailed interview guide.',
        priority: 'MEDIUM' as const,
        status: 'PENDING' as const,
        createdById: analyst.id,
      },
      {
        title: 'Train interviewers on best practices',
        description: 'Ensure all interviewers are trained on candidate experience best practices.',
        priority: 'MEDIUM' as const,
        status: 'COMPLETED' as const,
        assignedTo: admin.id,
        createdById: admin.id,
      },
    ];

    for (const actionData of actions) {
      await prisma.actionItem.create({ data: actionData });
    }

    console.log(`Created ${actions.length} action items`);

    // Create daily metrics
    console.log('Creating daily metrics...');

    let metricsCount = 0;
    for (let daysAgo = 90; daysAgo >= 0; daysAgo -= 3) {
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      date.setHours(0, 0, 0, 0);

      const totalSurveys = 15 + Math.floor(Math.random() * 10);
      const totalResponses = Math.floor(totalSurveys * (0.6 + Math.random() * 0.3));
      const promoters = Math.floor(totalResponses * (0.5 + Math.random() * 0.2));
      const detractors = Math.floor(totalResponses * (0.05 + Math.random() * 0.15));
      const passives = totalResponses - promoters - detractors;
      const npsScore = ((promoters - detractors) / totalResponses) * 100;

      await prisma.dailyMetric.create({
        data: {
          date,
          audience: 'CANDIDATE',
          totalSurveys,
          totalResponses,
          promoters,
          passives,
          detractors,
          npsScore: Math.round(npsScore * 10) / 10,
          responseRate: Math.round((totalResponses / totalSurveys) * 100 * 10) / 10,
          avgTimeDays: 1.5 + Math.random() * 3,
        },
      });
      metricsCount++;
    }

    console.log(`Created ${metricsCount} daily metrics`);

    // Create geo metrics
    console.log('Creating geo metrics...');

    const geoData = [
      { country: 'USA', countryCode: 'US', region: 'North America', totalCandidates: 120, totalResponses: 95 },
      { country: 'Germany', countryCode: 'DE', region: 'Europe', totalCandidates: 45, totalResponses: 38 },
      { country: 'UK', countryCode: 'GB', region: 'Europe', totalCandidates: 35, totalResponses: 28 },
      { country: 'India', countryCode: 'IN', region: 'Asia', totalCandidates: 60, totalResponses: 42 },
      { country: 'Australia', countryCode: 'AU', region: 'Oceania', totalCandidates: 20, totalResponses: 17 },
    ];

    for (const geo of geoData) {
      const promoters = Math.floor(geo.totalResponses * (0.5 + Math.random() * 0.2));
      const detractors = Math.floor(geo.totalResponses * (0.05 + Math.random() * 0.15));
      const passives = geo.totalResponses - promoters - detractors;
      const npsScore = ((promoters - detractors) / geo.totalResponses) * 100;

      await prisma.geoMetric.create({
        data: {
          ...geo,
          audience: 'CANDIDATE',
          promoters,
          passives,
          detractors,
          npsScore: Math.round(npsScore * 10) / 10,
          responseRate: Math.round((geo.totalResponses / geo.totalCandidates) * 100 * 10) / 10,
          avgTimeDays: 1.5 + Math.random() * 3,
        },
      });
    }

    console.log(`Created ${geoData.length} geo metrics`);

    console.log('\nDatabase seeding completed successfully!');
    console.log('\nSummary:');
    console.log('  - 3 users (admin, analyst, recruiter)');
    console.log('  - 2 survey templates');
    console.log(`  - ${jobs.length} jobs`);
    console.log(`  - ${candidates.length} candidates`);
    console.log(`  - ${surveyCount} surveys (${responseCount} responses)`);
    console.log('  - 2 cohorts');
    console.log(`  - ${themes.length} feedback themes`);
    console.log(`  - ${actions.length} action items`);
    console.log(`  - ${metricsCount} daily metrics`);
    console.log(`  - ${geoData.length} geo metrics`);
    console.log('\nLogin credentials:');
    console.log('  - admin@example.com / password');
    console.log('  - analyst@example.com / password');
    console.log('  - recruiter@example.com / password');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
