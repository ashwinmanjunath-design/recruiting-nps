/**
 * Mock NPS Data for Development & Testing
 * 
 * TODO: This entire file should be removed in production.
 * All values here are placeholders for design/testing purposes only.
 * When real NPS survey data is available in the database,
 * the backend services will compute these values dynamically.
 */

export const mockNpsData = {
  // Overall Metrics
  overview: {
    npsScore: 75,
    responseRate: 82,
    responseRateChange: 15,
    totalInvitations: 6000,
    totalResponses: 4920,
    breakdown: {
      promoters: {
        count: 158,
        percentage: 58,
      },
      passives: {
        count: 65,
        percentage: 24,
      },
      detractors: {
        count: 48,
        percentage: 18,
      },
    },
  },

  // Trend Data for Different Time Periods
  trends: {
    weekly: [
      { period: 'Week 1', promoters: 120, passives: 80, detractors: 50, nps: 68 },
      { period: 'Week 2', promoters: 150, passives: 95, detractors: 60, nps: 70 },
      { period: 'Week 3', promoters: 180, passives: 110, detractors: 70, nps: 72 },
      { period: 'Week 4', promoters: 210, passives: 130, detractors: 80, nps: 75 },
    ],
    monthly: [
      { period: 'Jan', promoters: 520, passives: 380, detractors: 250, nps: 68 },
      { period: 'Feb', promoters: 580, passives: 420, detractors: 280, nps: 70 },
      { period: 'Mar', promoters: 650, passives: 480, detractors: 320, nps: 72 },
      { period: 'Apr', promoters: 720, passives: 540, detractors: 360, nps: 74 },
      { period: 'May', promoters: 800, passives: 610, detractors: 400, nps: 75 },
      { period: 'Jun', promoters: 880, passives: 680, detractors: 450, nps: 77 },
    ],
    quarterly: [
      { period: 'Q1 2023', promoters: 1500, passives: 1100, detractors: 750, nps: 65 },
      { period: 'Q2 2023', promoters: 1800, passives: 1350, detractors: 900, nps: 68 },
      { period: 'Q3 2023', promoters: 2100, passives: 1600, detractors: 1050, nps: 71 },
      { period: 'Q4 2023', promoters: 2400, passives: 1850, detractors: 1200, nps: 73 },
      { period: 'Q1 2024', promoters: 2700, passives: 2100, detractors: 1350, nps: 75 },
    ],
  },

  // Cohort Data
  cohorts: [
    {
      id: 'tech-hires',
      name: 'Tech Hires',
      npsScore: 78,
      percentage: 2.9,
      count: 180,
      color: '#14b8a6',
      regions: [
        { city: 'San Francisco', lat: 37.7749, lng: -122.4194, value: 45 },
        { city: 'London', lat: 51.5074, lng: -0.1278, value: 35 },
        { city: 'Berlin', lat: 52.5200, lng: 13.4050, value: 30 },
      ],
    },
    {
      id: 'sales-hires',
      name: 'Sales Hires',
      npsScore: 72,
      percentage: 2.8,
      count: 198,
      color: '#f59e0b',
      regions: [
        { city: 'New York', lat: 40.7128, lng: -74.0060, value: 50 },
        { city: 'São Paulo', lat: -23.5505, lng: -46.6333, value: 40 },
        { city: 'Mexico City', lat: 19.4326, lng: -99.1332, value: 35 },
      ],
    },
    {
      id: 'product-hires',
      name: 'Product Hires',
      npsScore: 74,
      percentage: 3.6,
      count: 1598,
      color: '#ef4444',
      regions: [
        { city: 'Bangalore', lat: 12.9716, lng: 77.5946, value: 60 },
        { city: 'Seoul', lat: 37.5665, lng: 126.9780, value: 45 },
        { city: 'Sydney', lat: -33.8688, lng: 151.2093, value: 40 },
      ],
    },
  ],

  // NPS Score Breakdown for Donuts
  npsBreakdown: {
    promoters: {
      value: 58,
      count: 158,
      color: '#10b981',
    },
    topCounties: {
      value: 35,
      label: 'US, UK, DE',
      color: '#f59e0b',
    },
    topRoles: {
      value: 72,
      label: 'Engineers, PMs',
      color: '#10b981',
    },
    moderate: {
      value: 48,
      label: 'NPS 40-60',
      color: '#f59e0b',
    },
  },

  // Insights & Actions
  insights: {
    positive: [
      {
        id: '1',
        title: 'High Satisfaction in Tech Roles',
        description: 'Engineers reporting positive interview experience',
        priority: 'high',
        completed: false,
      },
    ],
    negative: [
      {
        id: '2',
        title: 'Response Time Concerns',
        description: 'Some candidates mention delays in feedback',
        priority: 'medium',
        completed: false,
      },
    ],
  },

  // Geographic Performance
  geographic: {
    regions: [
      { country: 'United States', nps: 78, responseRate: 85, count: 1250 },
      { country: 'United Kingdom', nps: 76, responseRate: 82, count: 850 },
      { country: 'Germany', nps: 74, responseRate: 80, count: 620 },
      { country: 'India', nps: 72, responseRate: 88, count: 1100 },
      { country: 'Brazil', nps: 70, responseRate: 75, count: 450 },
    ],
  },
};

export default mockNpsData;

