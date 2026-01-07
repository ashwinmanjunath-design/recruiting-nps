import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  console.log('✅ Created admin user');

  // Create survey template
  const template = await prisma.surveyTemplate.upsert({
    where: { id: 'post-interview-nps' },
    update: {},
    create: {
      id: 'post-interview-nps',
      name: 'Post-Interview NPS Survey',
      description: 'Candidate experience survey sent after interviews',
      trigger: 'POST_INTERVIEW',
      delayDays: 1,
      isActive: true
    }
  });
  console.log('✅ Created survey template');

  // Create survey questions
  const questions = await Promise.all([
    prisma.surveyQuestion.upsert({
      where: { id: 'nps-main' },
      update: {},
      create: {
        id: 'nps-main',
        templateId: template.id,
        question: 'On a scale of 0-10, how likely are you to recommend our company\'s recruiting process to a friend or colleague?',
        type: 'NPS_SCALE',
        scaleMin: 0,
        scaleMax: 10,
        isRequired: true,
        isNPS: true,
        order: 1
      }
    }),
    prisma.surveyQuestion.upsert({
      where: { id: 'nps-reason' },
      update: {},
      create: {
        id: 'nps-reason',
        templateId: template.id,
        question: 'What is the primary reason for your score?',
        type: 'TEXT',
        isRequired: false,
        isNPS: false,
        order: 2
      }
    }),
    prisma.surveyQuestion.upsert({
      where: { id: 'nps-improvement' },
      update: {},
      create: {
        id: 'nps-improvement',
        templateId: template.id,
        question: 'How can we improve your experience?',
        type: 'TEXT',
        isRequired: false,
        isNPS: false,
        order: 3
      }
    })
  ]);
  console.log('✅ Created survey questions');

  // Create sample candidates
  const roles = ['Engineer', 'Product Manager', 'Designer', 'Data Scientist', 'Marketing Manager'];
  const countries = ['India', 'United States', 'Germany', 'Brazil', 'United Kingdom'];
  const stages = ['Initial Screen', 'Technical Interview', 'Final Round', 'Offer Stage'];
  const sources = ['LinkedIn', 'Referral', 'Company Website', 'Job Board', 'University'];

  const candidates = [];
  for (let i = 0; i < 100; i++) {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const country = countries[Math.floor(Math.random() * countries.length)];
    
    const candidate = await prisma.candidate.create({
      data: {
        email: `candidate${i}@example.com`,
        name: `Candidate ${i}`,
        phone: `+1234567${String(i).padStart(4, '0')}`,
        role,
        country,
        region: country === 'India' ? 'Asia' : country === 'United States' ? 'North America' : 'Europe',
        source: sources[Math.floor(Math.random() * sources.length)],
        interviewStage: stages[Math.floor(Math.random() * stages.length)],
        status: ['INTERVIEWING', 'OFFERED', 'ACCEPTED', 'REJECTED'][Math.floor(Math.random() * 4)] as any,
        applicationDate: dayjs().subtract(Math.floor(Math.random() * 90), 'days').toDate()
      }
    });
    candidates.push(candidate);
  }
  console.log(`✅ Created ${candidates.length} sample candidates`);

  // Create surveys and responses
  for (const candidate of candidates.slice(0, 80)) { // 80% response rate
    // Create survey
    const sentDate = dayjs().subtract(Math.floor(Math.random() * 60), 'days').toDate();
    const survey = await prisma.survey.create({
      data: {
        token: nanoid(32),
        candidateId: candidate.id,
        templateId: template.id,
        sentAt: sentDate,
        respondedAt: dayjs(sentDate).add(Math.floor(Math.random() * 48), 'hours').toDate(),
        expiresAt: dayjs(sentDate).add(30, 'days').toDate(),
        status: 'COMPLETED'
      }
    });

    // Create NPS response
    const npsScore = Math.floor(Math.random() * 11); // 0-10
    await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        candidateId: candidate.id,
        questionId: 'nps-main',
        score: npsScore,
        sentiment: npsScore >= 7 ? 'POSITIVE' : npsScore >= 5 ? 'NEUTRAL' : 'NEGATIVE'
      }
    });

    // Create text responses
    const comments = [
      'Great communication throughout the process',
      'Interview questions were very relevant',
      'Process was too long and unclear',
      'Friendly and professional recruiters',
      'Waited too long for feedback',
      'Technical interview was well-structured',
      'Unclear job requirements',
      'Fast and efficient process'
    ];

    await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        candidateId: candidate.id,
        questionId: 'nps-reason',
        comment: comments[Math.floor(Math.random() * comments.length)],
        sentiment: npsScore >= 7 ? 'POSITIVE' : npsScore >= 5 ? 'NEUTRAL' : 'NEGATIVE'
      }
    });
  }
  console.log('✅ Created surveys and responses');

  // Create feedback themes
  const themes = [
    { name: 'Structured Interview Process', category: 'POSITIVE', sentiment: 'POSITIVE', count: 45 },
    { name: 'Fast Communication', category: 'POSITIVE', sentiment: 'POSITIVE', count: 52 },
    { name: 'Friendly Recruiters', category: 'POSITIVE', sentiment: 'POSITIVE', count: 38 },
    { name: 'Long Wait Requirements', category: 'NEGATIVE', sentiment: 'NEGATIVE', count: 28 },
    { name: 'Unclear Job Requirements', category: 'NEGATIVE', sentiment: 'NEGATIVE', count: 31 },
    { name: 'Lack of Feedback After rejection', category: 'NEGATIVE', sentiment: 'NEGATIVE', count: 22 }
  ];

  for (const theme of themes) {
    await prisma.feedbackTheme.upsert({
      where: { name: theme.name },
      update: {},
      create: {
        name: theme.name,
        category: theme.category as any,
        sentiment: theme.sentiment as any,
        count: theme.count,
        examples: [
          'Example feedback 1',
          'Example feedback 2',
          'Example feedback 3'
        ]
      }
    });
  }
  console.log('✅ Created feedback themes');

  // Create action items
  const actions = [
    {
      title: 'Review interview script for Junior Engineers',
      description: 'High Detractor-to-Promoter Ratio in specific cohort',
      priority: 'HIGH',
      sourceInsight: 'Unclear Job Requirements',
      linkedTheme: 'Unclear Job Requirements'
    },
    {
      title: 'A/B test application form',
      description: 'Test shorter application form to improve completion rates',
      priority: 'MEDIUM',
      sourceInsight: 'Application Process Feedback'
    },
    {
      title: 'Investigate low response rate in Brazil',
      description: 'Response rate significantly lower than other regions',
      priority: 'HIGH',
      sourceInsight: 'Geographic Analysis',
      linkedTheme: 'Long Wait Requirements'
    },
    {
      title: 'Low intent',
      description: 'Follow up on candidates with low engagement',
      priority: 'LOW'
    }
  ];

  for (const action of actions) {
    await prisma.actionItem.create({
      data: {
        ...action,
        priority: action.priority as any,
        status: 'PENDING',
        assignedTo: Math.random() > 0.5 ? 'Sarah K' : undefined
      }
    });
  }
  console.log('✅ Created action items');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

