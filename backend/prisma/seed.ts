import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Starting database seed...');

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
      isActive: true
    }
  });

    const analyst = await prisma.user.upsert({
      where: { email: 'analyst@example.com' },
      update: {},
      create: {
      email: 'analyst@example.com',
      password: hashedPassword,
        name: 'Sarah Analyst',
      role: 'ANALYST',
      isActive: true
    }
  });

    const recruiter = await prisma.user.upsert({
      where: { email: 'recruiter@example.com' },
      update: {},
      create: {
      email: 'recruiter@example.com',
      password: hashedPassword,
        name: 'Mike Recruiter',
      role: 'RECRUITER',
      isActive: true
    }
  });

  console.log(`✅ Created ${3} users`);

    // Create survey templates
    console.log('Creating survey templates...');

    const npsTemplate = await prisma.surveyTemplate.upsert({
      where: { name: 'Post-Interview NPS' },
      update: {},
      create: {
        name: 'Post-Interview NPS',
        description: 'Standard post-interview candidate experience survey',
      isActive: true,
      questions: {
        create: [
          {
            type: 'NPS',
              question: 'On a scale of 0-10, how likely are you to recommend our company to a friend or colleague?',
            required: true,
            order: 1
          },
          {
            type: 'TEXT',
            question: 'What did you like most about your interview experience?',
            required: false,
            order: 2
          },
          {
            type: 'TEXT',
              question: 'What could we improve in our interview process?',
            required: false,
            order: 3
            },
            {
              type: 'RATING',
              question: 'How would you rate the communication throughout the process?',
              required: true,
              order: 4,
              options: JSON.stringify(['1', '2', '3', '4', '5'])
            }
          ]
        }
      }
    });

    const quickNpsTemplate = await prisma.surveyTemplate.upsert({
      where: { name: 'Quick NPS Check' },
      update: {},
      create: {
        name: 'Quick NPS Check',
        description: 'Quick one-question NPS survey',
        isActive: true,
        questions: {
          create: [
            {
              type: 'NPS',
              question: 'How likely are you to recommend us to others?',
              required: true,
              order: 1
            }
          ]
        }
      }
    });

    console.log(`✅ Created ${2} survey templates`);

    // Create jobs
    console.log('Creating jobs...');

    const jobs = [
      {
        externalId: 'job_eng_001',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'San Francisco, CA, USA',
        status: 'ACTIVE'
      },
      {
        externalId: 'job_pm_001',
        title: 'Product Manager',
        department: 'Product',
        location: 'New York, NY, USA',
        status: 'ACTIVE'
      },
      {
        externalId: 'job_ds_001',
        title: 'Data Scientist',
        department: 'Data',
        location: 'Boston, MA, USA',
        status: 'ACTIVE'
      },
      {
        externalId: 'job_design_001',
        title: 'UX Designer',
        department: 'Design',
        location: 'Seattle, WA, USA',
        status: 'ACTIVE'
      }
    ];

    for (const jobData of jobs) {
      await prisma.job.upsert({
        where: { externalId: jobData.externalId },
        update: jobData,
        create: jobData
      });
    }

  console.log(`✅ Created ${jobs.length} jobs`);

    // Create candidates
    console.log('Creating candidates...');

    const candidatesData = [
      {
        externalId: 'cand_001',
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+14155551001',
        role: 'Software Engineer',
        location: 'San Francisco, CA, USA',
        source: 'LinkedIn',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_002',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+12125551002',
        role: 'Product Manager',
        location: 'New York, NY, USA',
        source: 'Referral',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_003',
        name: 'Bob Johnson',
        email: 'bob.johnson@example.com',
        phone: '+16175551003',
        role: 'Data Scientist',
        location: 'Boston, MA, USA',
        source: 'Career Site',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_004',
        name: 'Alice Williams',
        email: 'alice.williams@example.com',
        phone: '+12065551004',
        role: 'UX Designer',
        location: 'Seattle, WA, USA',
        source: 'LinkedIn',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_005',
        name: 'Charlie Brown',
        email: 'charlie.brown@example.com',
        phone: '+14155551005',
        role: 'Software Engineer',
        location: 'San Francisco, CA, USA',
        source: 'Agency',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_006',
        name: 'Diana Prince',
        email: 'diana.prince@example.com',
        phone: '+13105551006',
        role: 'Product Manager',
        location: 'Los Angeles, CA, USA',
        source: 'LinkedIn',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_007',
        name: 'Ethan Hunt',
        email: 'ethan.hunt@example.com',
        phone: '+14155551007',
        role: 'Software Engineer',
        location: 'San Francisco, CA, USA',
        source: 'Referral',
        status: 'ACTIVE'
      },
      {
        externalId: 'cand_008',
        name: 'Fiona Green',
        email: 'fiona.green@example.com',
        phone: '+14805551008',
        role: 'Data Scientist',
        location: 'Phoenix, AZ, USA',
        source: 'Career Site',
        status: 'ACTIVE'
      }
    ];

    const candidates = [];
    for (const candidateData of candidatesData) {
      const candidate = await prisma.candidate.upsert({
        where: { email: candidateData.email },
        update: candidateData,
        create: candidateData
      });
      candidates.push(candidate);
    }

  console.log(`✅ Created ${candidates.length} candidates`);

    // Create surveys and responses
    console.log('Creating surveys and responses...');

    const npsScores = [9, 10, 8, 7, 9, 6, 10, 8]; // Mix of promoters, passives, detractors
    const feedbacks = [
      'Great interview experience! Very professional and friendly.',
      'Excellent process, kept me informed throughout.',
      'Good experience overall, communication could be faster.',
      'Interview was okay, but scheduling was difficult.',
      'Really impressed with the team and culture.',
      'Process took too long and communication was poor.',
      'Amazing experience! Would definitely recommend.',
      'Smooth process, interviewers were well-prepared.'
    ];
  
  let surveyCount = 0;
  let responseCount = 0;

    for (let i = 0; i < candidates.length; i++) {
      const candidate = candidates[i];
      
      // Create 2-3 surveys per candidate
      const numSurveys = 2 + Math.floor(Math.random() * 2);
      
      for (let j = 0; j < numSurveys; j++) {
        const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
        const sentAt = new Date();
        sentAt.setDate(sentAt.getDate() - daysAgo);

      const survey = await prisma.survey.create({
        data: {
          templateId: npsTemplate.id,
          candidateId: candidate.id,
            status: Math.random() > 0.3 ? 'COMPLETED' : 'SENT', // 70% response rate
            sentAt,
            scheduledFor: null
        }
      });

      surveyCount++;

        // Create response if survey is completed
      if (survey.status === 'COMPLETED') {
          const respondedAt = new Date(sentAt);
          respondedAt.setDate(respondedAt.getDate() + Math.floor(Math.random() * 5)); // Respond within 5 days

        await prisma.surveyResponse.create({
          data: {
            surveyId: survey.id,
              npsScore: npsScores[i % npsScores.length],
              feedback: feedbacks[i % feedbacks.length],
              createdAt: respondedAt
          }
        });

        responseCount++;
      }
    }
  }

  console.log(`✅ Created ${surveyCount} surveys and ${responseCount} responses`);

    // Create cohorts
    console.log('Creating cohorts...');
  
    const engineersCohort = await prisma.cohortDefinition.create({
      data: {
        name: 'Software Engineers',
        description: 'All software engineering candidates',
        filters: { role: 'Software Engineer' }
      }
    });

    const linkedInCohort = await prisma.cohortDefinition.create({
      data: {
        name: 'LinkedIn Sourced',
        description: 'Candidates sourced from LinkedIn',
        filters: { source: 'LinkedIn' }
      }
    });

    // Add candidates to cohorts
    for (const candidate of candidates) {
      if (candidate.role === 'Software Engineer') {
        await prisma.cohortMembership.create({
      data: {
            cohortId: engineersCohort.id,
            candidateId: candidate.id
          }
        });
      }

      if (candidate.source === 'LinkedIn') {
        await prisma.cohortMembership.create({
      data: {
            cohortId: linkedInCohort.id,
            candidateId: candidate.id
          }
        });
      }
    }

    console.log(`✅ Created ${2} cohorts`);

    // Create feedback themes
    console.log('Creating feedback themes...');

    const themes = [
      { theme: 'communication', count: 12, sentiment: 'POSITIVE', category: 'PROCESS' },
      { theme: 'professional', count: 15, sentiment: 'POSITIVE', category: 'CULTURE' },
      { theme: 'friendly', count: 10, sentiment: 'POSITIVE', category: 'CULTURE' },
      { theme: 'slow', count: 8, sentiment: 'NEGATIVE', category: 'PROCESS' },
      { theme: 'organized', count: 11, sentiment: 'POSITIVE', category: 'PROCESS' },
      { theme: 'disorganized', count: 5, sentiment: 'NEGATIVE', category: 'PROCESS' },
      { theme: 'great', count: 18, sentiment: 'POSITIVE', category: 'OVERALL' },
      { theme: 'poor', count: 3, sentiment: 'NEGATIVE', category: 'OVERALL' }
    ];

    for (const themeData of themes) {
      await prisma.feedbackTheme.upsert({
        where: { theme: themeData.theme },
        update: themeData,
        create: themeData
      });
    }

  console.log(`✅ Created ${themes.length} feedback themes`);

    // Create action items
    console.log('Creating action items...');

    const actions = [
      {
        title: 'Improve interview scheduling system',
        description: 'Several candidates mentioned difficulty with scheduling. Implement automated scheduling tool.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        assignedTo: 'recruiter@example.com',
        createdById: admin.id
      },
      {
        title: 'Speed up feedback delivery',
        description: 'Candidates are waiting too long for feedback. Set SLA of 48 hours.',
        priority: 'URGENT',
        status: 'PENDING',
        assignedTo: 'recruiter@example.com',
        createdById: admin.id
      },
      {
        title: 'Create interview prep guide',
        description: 'Help candidates prepare better by providing detailed interview guide.',
        priority: 'MEDIUM',
        status: 'PENDING',
        createdById: analyst.id
      },
      {
        title: 'Train interviewers on best practices',
        description: 'Ensure all interviewers are trained on candidate experience best practices.',
        priority: 'MEDIUM',
        status: 'COMPLETED',
        assignedTo: 'admin@example.com',
        createdById: admin.id
      }
    ];

    for (const actionData of actions) {
      await prisma.actionItem.create({
        data: actionData
      });
    }

    console.log(`✅ Created ${actions.length} action items`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - 3 users (admin, analyst, recruiter)`);
    console.log(`   - 2 survey templates`);
    console.log(`   - 4 jobs`);
    console.log(`   - 8 candidates`);
    console.log(`   - ${surveyCount} surveys (${responseCount} responses)`);
    console.log(`   - 2 cohorts`);
    console.log(`   - ${themes.length} feedback themes`);
    console.log(`   - ${actions.length} action items`);
    console.log('\n🔐 Login credentials:');
    console.log(`   - admin@example.com / password`);
    console.log(`   - analyst@example.com / password`);
    console.log(`   - recruiter@example.com / password`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
