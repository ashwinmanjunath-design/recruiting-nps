import { useEffect, useState } from 'react';
import { getDashboardOverview, getDashboardInsights, getDashboardCohorts } from '../api/client';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import CohortAnalysisCard from '../components/dashboard/CohortAnalysisCard';
import HiringManagerDashboard from '../components/dashboard/HiringManagerDashboard';
import { Calendar, X, Users, Briefcase, Building2, Monitor } from 'lucide-react';
import { SurveyAudience } from '../../../shared/types/enums';
import { useAudienceStore } from '../stores/audienceStore';

type TimePeriod = 'weekly' | 'monthly' | 'quarterly';
type ComparisonBaseline = 'engineers-q1' | 'designers-q1' | 'all-roles';

// ================================================================================
// AUDIENCE-SPECIFIC DASHBOARD CONFIGURATION
// Each audience has its own dashboard wording, labels, and sections.
// This ensures Hiring Manager feedback doesn't visually mix with Candidate NPS, etc.
// ================================================================================

interface AudienceDashboardConfig {
  title: string;
  subtitle: string;
  primaryKpiLabel: string;
  responseRateLabel: string;
  // Breakdown section labels (4 donut charts)
  breakdownLabels: {
    label1: string;
    label2: string;
    label3: string;
    label4: string;
  };
  // Gauge legend labels
  legendLabels: {
    positive: string;
    neutral: string;
    negative: string;
  };
  // Bottom card configuration
  bottomCardTitle: string;
  bottomCardItems: { label: string; value: number; color: string }[];
  // Actionable insights (top 3 items)
  insights: string[];
  // Section visibility toggles
  showTopRoles: boolean;
  showRecruiterBreakdown: boolean;
  showLocationBreakdown: boolean;
  showDepartmentBreakdown: boolean;
}

const audienceDashboardConfig: Record<SurveyAudience, AudienceDashboardConfig> = {
  // ─────────────────────────────────────────────────────────────────────────────
  // CANDIDATE DASHBOARD - "Candidate Experience"
  // ─────────────────────────────────────────────────────────────────────────────
  [SurveyAudience.CANDIDATE]: {
    title: 'Candidate 360° NPS Dashboard',
    subtitle: 'Feedback on interview experience and hiring process',
    primaryKpiLabel: 'Candidate NPS',
    responseRateLabel: 'Candidate Response Rate',
    breakdownLabels: {
      label1: 'Promoters',
      label2: 'Top Regions',
      label3: 'Top Roles',
      label4: 'Detractors',
    },
    legendLabels: {
      positive: 'Promoters',
      neutral: 'Passives',
      negative: 'Detractors',
    },
    bottomCardTitle: 'Top Roles',
    bottomCardItems: [
      { label: 'Engineers', value: 65, color: '#14b8a6' },
      { label: 'Designers', value: 45, color: '#f59e0b' },
      { label: 'Product', value: 55, color: '#10b981' },
      { label: 'Sales', value: 38, color: '#ef4444' },
    ],
    insights: [
      'Review interview wait times (avg 45 min delay)',
      'Improve feedback turnaround (target: 48hrs)',
      'Enhance recruiter communication frequency',
    ],
    showTopRoles: true,
    showRecruiterBreakdown: false,
    showLocationBreakdown: true,
    showDepartmentBreakdown: false,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // HIRING MANAGER DASHBOARD - "Talent Acquisition Support"
  // Theme: "How well is TA supporting hiring managers?"
  // Maps directly to survey questions in "Hiring Manager Experience Survey"
  // ─────────────────────────────────────────────────────────────────────────────
  [SurveyAudience.HIRING_MANAGER]: {
    title: 'Hiring Manager 360° NPS Dashboard',
    subtitle: 'Showing Hiring Manager feedback about Talent Acquisition support',
    primaryKpiLabel: 'HM NPS',  // Q1 - shortened from "Hiring Manager NPS"
    responseRateLabel: 'HM Response Rate',
    // ─────────────────────────────────────────────────────────────────────────
    // HIRING MANAGER QUESTION MAPPING (Q1-Q7)
    // Q1 – Hiring Manager NPS (primary KPI)
    // Q2 – Candidate Quality Satisfaction
    // Q3 – Role Fit / Profile Alignment
    // Q4 – Process Speed Satisfaction
    // Q5 – Scheduling & Coordination
    // Q6 – Communication & Partnership
    // Q7 – Market Guidance / Market Insights
    // ─────────────────────────────────────────────────────────────────────────
    breakdownLabels: {
      label1: 'Candidate Quality Satisfaction',   // Q2
      label2: 'Process Speed Satisfaction',       // Q4
      label3: 'Communication & Partnership',      // Q6
      label4: 'Scheduling & Coordination',        // Q5
    },
    legendLabels: {
      positive: 'Satisfied',
      neutral: 'Neutral',
      negative: 'Dissatisfied',
    },
    bottomCardTitle: 'By Department',
    bottomCardItems: [
      { label: 'Engineering', value: 72, color: '#14b8a6' },
      { label: 'Product', value: 68, color: '#f59e0b' },
      { label: 'Design', value: 61, color: '#10b981' },
      { label: 'Sales', value: 54, color: '#ef4444' },
    ],
    // Insights derived from Q8, Q9, Q10 open-text analysis
    insights: [
      'HMs most satisfied with: Communication & Partnership (Q6)',
      'Key improvement: Process Speed (Q4) – target: 5 days screening → onsite',
      'Action: Improve Candidate Quality (Q2) for senior roles',
    ],
    showTopRoles: false,
    showRecruiterBreakdown: true,
    showLocationBreakdown: true,
    showDepartmentBreakdown: true,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // WORKPLACE DASHBOARD - "Workplace / Culture Experience"
  // Theme: "How do employees feel about workplace & environment?"
  // Maps directly to survey questions in "Workplace Experience Survey"
  // ─────────────────────────────────────────────────────────────────────────────
  [SurveyAudience.WORKPLACE]: {
    title: 'Workplace Experience 360° NPS Dashboard',
    subtitle: 'Feedback on office, culture & support teams',
    primaryKpiLabel: 'Workplace NPS',
    responseRateLabel: 'Employee Response Rate',
    // These labels map to survey questions:
    // - wp-office-facilities: "How satisfied are you with the office facilities?"
    // - wp-remote-setup: "How satisfied are you with the support for remote/hybrid work?"
    // - wp-onboarding: "How supported did you feel during your first 90 days?"
    // - wp-culture-fit: "How well do you feel you fit with the company culture?"
    breakdownLabels: {
      label1: 'Office Facilities',
      label2: 'Remote/Hybrid Setup',
      label3: 'First 90 Days Support',
      label4: 'Culture Fit',
    },
    legendLabels: {
      positive: 'Satisfied',
      neutral: 'Neutral',
      negative: 'Dissatisfied',
    },
    bottomCardTitle: 'NPS by Location',
    bottomCardItems: [
      { label: 'Berlin HQ', value: 78, color: '#14b8a6' },
      { label: 'Bangalore', value: 71, color: '#f59e0b' },
      { label: 'London', value: 69, color: '#10b981' },
      { label: 'Remote', value: 65, color: '#8b5cf6' },
    ],
    // Insights derived from survey open-text themes
    insights: [
      'What people love: Flexible work policy & team culture',
      'Top complaint: Berlin meeting room availability',
      'Action: Improve remote equipment delivery (target: 3 days)',
    ],
    showTopRoles: false,
    showRecruiterBreakdown: false,
    showLocationBreakdown: true,
    showDepartmentBreakdown: false,
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // IT SUPPORT DASHBOARD - "IT Onboarding & Tools"
  // Theme: "Were systems ready on day 1? How fast are issues resolved?"
  // Maps directly to survey questions in "IT Support Experience Survey"
  // ─────────────────────────────────────────────────────────────────────────────
  [SurveyAudience.IT_SUPPORT]: {
    title: 'IT Support 360° NPS Dashboard',
    subtitle: 'Feedback on IT onboarding, tools and support',
    primaryKpiLabel: 'IT Support NPS',
    responseRateLabel: 'Survey Response Rate',
    // These labels map to survey questions:
    // - it-day1-readiness: "How ready were your laptop, accounts, and tools on day 1?"
    // - it-response-time: "How satisfied are you with IT's response time?"
    // - it-system-access: "How quickly did you receive access to all necessary systems?"
    // - it-resolution-quality: "How effectively did IT resolve your issues?"
    breakdownLabels: {
      label1: 'Day-1 Readiness',
      label2: 'Response Time',
      label3: 'System Access',
      label4: 'Resolution Quality',
    },
    legendLabels: {
      positive: 'Excellent',
      neutral: 'Acceptable',
      negative: 'Poor',
    },
    bottomCardTitle: 'By Service Area',
    bottomCardItems: [
      { label: 'Hardware Setup', value: 82, color: '#14b8a6' },
      { label: 'Software Access', value: 76, color: '#f59e0b' },
      { label: 'Security/VPN', value: 68, color: '#10b981' },
      { label: 'Helpdesk', value: 71, color: '#3b82f6' },
    ],
    // Insights derived from survey open-text themes
    insights: [
      'Strong: Helpdesk responsiveness (avg 2hr response)',
      'Improve: Day-1 laptop pre-config (target: 95% ready)',
      'Action: Automate software provisioning for new hires',
    ],
    showTopRoles: false,
    showRecruiterBreakdown: false,
    showLocationBreakdown: false,
    showDepartmentBreakdown: false,
  },
};

// Audience tab configuration for the switcher
const AUDIENCE_TABS = [
  { 
    value: SurveyAudience.CANDIDATE, 
    label: 'Candidate', 
    icon: Users,
    color: 'teal',
    description: 'Candidate interview experience'
  },
  { 
    value: SurveyAudience.HIRING_MANAGER, 
    label: 'Hiring Manager', 
    icon: Briefcase,
    color: 'purple',
    description: 'Hiring manager satisfaction'
  },
  { 
    value: SurveyAudience.WORKPLACE, 
    label: 'Workplace', 
    icon: Building2,
    color: 'amber',
    description: 'Workplace experience'
  },
  { 
    value: SurveyAudience.IT_SUPPORT, 
    label: 'IT Support', 
    icon: Monitor,
    color: 'blue',
    description: 'IT onboarding & support'
  },
] as const;

// Hiring Manager location options
const HIRING_MANAGER_LOCATIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'prague', label: 'Prague' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'bengaluru', label: 'Bengaluru' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'brazil', label: 'Brazil' },
] as const;

type HiringManagerLocation = typeof HIRING_MANAGER_LOCATIONS[number]['value'];

export default function Dashboard() {
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // ============================================
  const { audience: selectedAudience, setAudience: setSelectedAudience } = useAudienceStore();

  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Location filter for Hiring Manager audience
  const [selectedLocation, setSelectedLocation] = useState<HiringManagerLocation>('all');
  
  // Update global store when audience pill is clicked
  const handleAudienceChange = (audience: SurveyAudience) => {
    setSelectedAudience(audience);
  };
  
  // Filter states
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [comparisonBaseline, setComparisonBaseline] = useState<ComparisonBaseline>('engineers-q1');
  const [showDateModal, setShowDateModal] = useState(false);
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null);

  // Get current audience configuration
  const config = audienceDashboardConfig[selectedAudience];
  
  // Show location filter only for Hiring Manager
  const showLocationFilter = selectedAudience === SurveyAudience.HIRING_MANAGER;

  useEffect(() => {
    fetchData();
  }, [timePeriod, comparisonBaseline, customDateRange, selectedAudience, selectedLocation]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Build params - include location for Hiring Manager audience
      const params: any = { audience: selectedAudience };
      if (selectedAudience === SurveyAudience.HIRING_MANAGER && selectedLocation !== 'all') {
        params.location = selectedLocation;
      }
      
      // Pass audience (and location for HM) to all API calls for filtering
      const [overviewRes] = await Promise.all([
        getDashboardOverview(params),
        getDashboardInsights(params),
        getDashboardCohorts(params)
      ]);
      setOverview(overviewRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Mock data for demo - different defaults per audience
      const mockNpsScores: Record<SurveyAudience, number> = {
        [SurveyAudience.CANDIDATE]: 75,
        [SurveyAudience.HIRING_MANAGER]: 68,
        [SurveyAudience.WORKPLACE]: 72,
        [SurveyAudience.IT_SUPPORT]: 81,
      };
      const mockResponseRates: Record<SurveyAudience, number> = {
        [SurveyAudience.CANDIDATE]: 82,
        [SurveyAudience.HIRING_MANAGER]: 64,
        [SurveyAudience.WORKPLACE]: 71,
        [SurveyAudience.IT_SUPPORT]: 88,
      };
      setOverview({
        audience: selectedAudience,
        npsScore: mockNpsScores[selectedAudience],
        responseRate: mockResponseRates[selectedAudience],
        responseRateChange: 15,
        breakdown: { promoters: { percentage: 58 }, passives: { percentage: 24 }, detractors: { percentage: 18 } }
      });
    } finally {
      setLoading(false);
    }
  };

  // Get the current audience tab config
  const currentAudienceTab = AUDIENCE_TABS.find(tab => tab.value === selectedAudience) || AUDIENCE_TABS[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // HIRING MANAGER DASHBOARD - Special quarterly layout
  // Renders a completely different dashboard UI for Hiring Manager audience
  // ════════════════════════════════════════════════════════════════════════════
  if (selectedAudience === SurveyAudience.HIRING_MANAGER) {
    return (
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ maxWidth: '1320px' }}>
        {/* Audience Tabs - Same as other dashboards */}
        <div className="mb-6">
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
            {AUDIENCE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedAudience === tab.value;
              const activeClass = isActive 
                ? tab.color === 'teal' ? 'bg-teal-50 text-teal-700 border-teal-200'
                : tab.color === 'purple' ? 'bg-purple-50 text-purple-700 border-purple-200'
                : tab.color === 'amber' ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-blue-50 text-blue-700 border-blue-200'
                : '';
              
              return (
                <button
                  key={tab.value}
                  onClick={() => setSelectedAudience(tab.value)}
                  className={`
                    flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                    ${isActive 
                      ? `bg-white shadow-sm ${activeClass}` 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                  title={tab.description}
                >
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'text-gray-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <p className="text-xs text-gray-500">
              Showing <span className="font-medium text-gray-700">Hiring Manager</span> feedback data • Quarterly NPS Overview
            </p>
          </div>
        </div>

        {/* Dashboard Title + Filters - matching Candidate dashboard spacing */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-800" style={{ letterSpacing: '-0.02em' }}>
              Hiring Manager 360° NPS Dashboard
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Showing Hiring Manager feedback about Talent Acquisition support
            </p>
          </div>
        </div>

        {/* Hiring Manager Dashboard Content */}
        <HiringManagerDashboard 
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
      </main>
    );
  }

  const npsScore = overview?.npsScore ?? 75;
  const responseRate = overview?.responseRate ?? 82;
  const responseRateChange = overview?.responseRateChange ?? 15;

  // Audience-specific breakdown percentages (mock data)
  const getBreakdownData = () => {
    const audienceBreakdowns: Record<SurveyAudience, number[]> = {
      [SurveyAudience.CANDIDATE]: [58, 35, 45, 18],
      [SurveyAudience.HIRING_MANAGER]: [72, 65, 78, 81],
      [SurveyAudience.WORKPLACE]: [68, 74, 71, 66],
      [SurveyAudience.IT_SUPPORT]: [85, 79, 82, 88],
    };
    return audienceBreakdowns[selectedAudience];
  };

  const breakdownValues = getBreakdownData();

  // NPS Gauge data - colors vary slightly by audience sentiment
  const getGaugeData = () => {
    const isPositiveNPS = selectedAudience === SurveyAudience.IT_SUPPORT;
    return [
      { value: 58, color: '#10b981' },  // Green - positive
      { value: 24, color: '#f59e0b' },  // Amber - neutral
      { value: 18, color: isPositiveNPS ? '#ef4444' : '#ef4444' }   // Red - negative
    ];
  };

  const gaugeData = getGaugeData();

  // Dynamic trend data based on time period
  const getTrendData = () => {
    const datasets = {
      weekly: [
        { month: 'Week 1', promoters: 120, passives: 80, detractors: 50 },
        { month: 'Week 2', promoters: 140, passives: 90, detractors: 55 },
        { month: 'Week 3', promoters: 160, passives: 100, detractors: 62 },
        { month: 'Week 4', promoters: 175, passives: 108, detractors: 68 },
        { month: 'Week 5', promoters: 195, passives: 118, detractors: 74 },
        { month: 'Week 6', promoters: 210, passives: 130, detractors: 80 },
      ],
      monthly: [
        { month: 'Jan', promoters: 320, passives: 220, detractors: 150 },
        { month: 'Feb', promoters: 380, passives: 260, detractors: 180 },
        { month: 'Mar', promoters: 450, passives: 310, detractors: 210 },
        { month: 'Apr', promoters: 520, passives: 370, detractors: 250 },
        { month: 'May', promoters: 600, passives: 430, detractors: 290 },
        { month: 'Jun', promoters: 680, passives: 500, detractors: 340 },
        { month: 'Jul', promoters: 760, passives: 570, detractors: 390 },
        { month: 'Aug', promoters: 850, passives: 650, detractors: 440 },
      ],
      quarterly: [
        { month: 'Q1 2023', promoters: 1200, passives: 850, detractors: 550 },
        { month: 'Q2 2023', promoters: 1500, passives: 1050, detractors: 700 },
        { month: 'Q3 2023', promoters: 1850, passives: 1300, detractors: 880 },
        { month: 'Q4 2023', promoters: 2200, passives: 1580, detractors: 1050 },
        { month: 'Q1 2024', promoters: 2600, passives: 1900, detractors: 1250 },
      ],
    };
    return datasets[timePeriod];
  };

  const trendData = getTrendData();

  // Audience-specific donut charts with dynamic labels from config
  const donutCharts = [
    { label: config.breakdownLabels.label1, value: breakdownValues[0], data: [{ value: breakdownValues[0], color: '#10b981' }, { value: 100 - breakdownValues[0], color: '#e5e7eb' }] },
    { label: config.breakdownLabels.label2, value: breakdownValues[1], data: [{ value: breakdownValues[1], color: '#f59e0b' }, { value: 100 - breakdownValues[1], color: '#e5e7eb' }] },
    { label: config.breakdownLabels.label3, value: breakdownValues[2], data: [{ value: breakdownValues[2], color: '#14b8a6' }, { value: 100 - breakdownValues[2], color: '#e5e7eb' }] },
    { label: config.breakdownLabels.label4, value: breakdownValues[3], data: [{ value: breakdownValues[3], color: '#ef4444' }, { value: 100 - breakdownValues[3], color: '#e5e7eb' }] },
  ];

  return (
    <main className="mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6" style={{ maxWidth: '1320px' }}>
      {/* ========================================= */}
      {/* AUDIENCE SWITCH TABS - VERY IMPORTANT */}
      {/* ========================================= */}
      <div className="mb-6">
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {AUDIENCE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = selectedAudience === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setSelectedAudience(tab.value)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? `bg-white shadow-sm text-${tab.color}-700 ring-1 ring-${tab.color}-200` 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
                title={tab.description}
              >
                <Icon className={`w-4 h-4 ${isActive ? `text-${tab.color}-600` : 'text-gray-400'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
        {/* Current audience indicator with subtitle from config + Location filter for HM */}
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <p className="text-xs text-gray-500">
            Showing <span className="font-medium text-gray-700">{currentAudienceTab.label}</span> feedback data • {config.subtitle}
          </p>
          
          {/* Location filter - only for Hiring Manager */}
          {showLocationFilter && (
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value as HiringManagerLocation)}
              className="px-3 py-1.5 text-xs font-medium rounded-full border border-purple-200 bg-purple-50 text-purple-700 cursor-pointer transition-all hover:border-purple-300"
            >
              {HIRING_MANAGER_LOCATIONS.map((loc) => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Page Title + Filters - Using audience-specific title from config */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-5">
        <div>
          <h1 
            className="text-xl sm:text-2xl font-semibold text-gray-800" 
            style={{ letterSpacing: '-0.02em' }}
          >
            {config.title}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{config.subtitle}</p>
        </div>
        
        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Time Period Chips */}
          {(['weekly', 'monthly', 'quarterly'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border-2 transition-all ${
                timePeriod === period
                  ? 'border-primary bg-primary text-white'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50'
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
          
          {/* Comparison Selector */}
          <select 
            value={comparisonBaseline}
            onChange={(e) => setComparisonBaseline(e.target.value as ComparisonBaseline)}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 cursor-pointer transition-all"
          >
            <option value="engineers-q1">vs Engineers Q1</option>
            <option value="designers-q1">vs Designers Q1</option>
            <option value="all-roles">vs All Roles</option>
          </select>
          
          {/* Custom Range Button */}
          <button 
            onClick={() => setShowDateModal(true)}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all flex items-center gap-1"
          >
            <Calendar className="w-3.5 h-3.5" />
            Custom Range
          </button>
        </div>
      </div>

      {/* Custom Date Range Modal */}
      {showDateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Select Custom Date Range</h3>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                <input
                  type="date"
                  defaultValue={customDateRange?.from || ''}
                  onChange={(e) => setCustomDateRange(prev => ({ from: e.target.value, to: prev?.to || '' }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                <input
                  type="date"
                  defaultValue={customDateRange?.to || ''}
                  onChange={(e) => setCustomDateRange(prev => ({ from: prev?.from || '', to: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setCustomDateRange(null);
                    setShowDateModal(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowDateModal(false)}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* ========================================= */}
        {/* ROW 1: Hero Card + Insights */}
        {/* ========================================= */}
        
        {/* Hero Card - Full width on mobile, 2/3 on desktop */}
        <div className="lg:col-span-2 card p-4 sm:p-6" style={{ minHeight: '200px' }}>
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
            {/* NPS Gauge */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 sm:w-44 h-20 sm:h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      cx="50%"
                      cy="100%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={45}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={0}
                      label={({ cx, cy, innerRadius, outerRadius }) => {
                        const radius = (innerRadius + outerRadius) / 2;
                        const centerY = cy - radius * 0.35;
                        
                        return (
                          <text
                            x={cx}
                            y={centerY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan 
                              className="text-3xl font-semibold fill-slate-900" 
                              style={{ fontSize: '28px', fontWeight: 600 }}
                            >
                              {npsScore}
                            </tspan>
                            <tspan 
                              x={cx} 
                              dy="1.5em" 
                              className="text-[10px] font-medium fill-slate-500" 
                              style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.025em' }}
                            >
                              {config.primaryKpiLabel}
                            </tspan>
                          </text>
                        );
                      }}
                      labelLine={false}
                    >
                      {gaugeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend - using audience-specific labels */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  <span className="text-gray-600">{config.legendLabels.positive}: 58%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <span className="text-gray-600">{config.legendLabels.neutral}: 24%</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <span className="text-gray-600">{config.legendLabels.negative}: 18%</span>
                </div>
              </div>
            </div>

            {/* Response Rate */}
            <div className="flex-1 text-center sm:text-left">
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-1">{config.responseRateLabel}</div>
                <div className="flex items-baseline justify-center sm:justify-start gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900">{responseRate}%</span>
                  <span className="text-green-500 text-lg font-semibold">↑{responseRateChange}%</span>
                </div>
                <div className="text-xs text-gray-500">(from {responseRate - responseRateChange}%)</div>
              </div>
              <div className="text-xs text-gray-600">
                Based on the last <span className="font-semibold">6,000 invitations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actionable Insights Card - using audience-specific insights */}
        <div className="lg:col-span-1 card p-4 sm:p-6 flex flex-col">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
            {selectedAudience === SurveyAudience.HIRING_MANAGER 
              ? 'Top Improvement Areas' 
              : selectedAudience === SurveyAudience.IT_SUPPORT 
                ? 'IT Action Items' 
                : 'Actionable Insights'}
          </h3>
          
          <div className="space-y-2.5 flex-1">
            {config.insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <input type="checkbox" className="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded" />
                <span className="text-sm text-gray-700">{insight}</span>
              </div>
            ))}
          </div>

          <button className="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors font-medium w-full sm:w-auto sm:ml-auto">
            Mark as Done
          </button>
        </div>

        {/* ========================================= */}
        {/* ROW 2: NPS Trend + NPS Score Donuts */}
        {/* ========================================= */}
        
        {/* NPS Trend Over Time */}
        <div className="lg:col-span-2 card p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
            {config.primaryKpiLabel} Trend Over Time
          </h3>
          <div className="h-56 sm:h-64 lg:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDetractors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPassives" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="colorPromoters" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#d1d5db" tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} stroke="#d1d5db" tickLine={false} />
                <Tooltip />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }} 
                  iconType="circle" 
                  iconSize={8}
                  formatter={(value) => {
                    // Use audience-specific legend labels
                    if (value === 'detractors') return config.legendLabels.negative;
                    if (value === 'passives') return config.legendLabels.neutral;
                    if (value === 'promoters') return config.legendLabels.positive;
                    return value;
                  }}
                />
                <Area type="basis" dataKey="detractors" stackId="1" stroke="#ef4444" fill="url(#colorDetractors)" name="detractors" strokeWidth={2} />
                <Area type="basis" dataKey="passives" stackId="1" stroke="#f59e0b" fill="url(#colorPassives)" name="passives" strokeWidth={2} />
                <Area type="basis" dataKey="promoters" stackId="1" stroke="#10b981" fill="url(#colorPromoters)" name="promoters" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Satisfaction Breakdown - 4 Donuts with audience-specific labels */}
        <div className="lg:col-span-1 card p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
            {selectedAudience === SurveyAudience.CANDIDATE 
              ? 'NPS Score Breakdown' 
              : 'Satisfaction Scores'}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {donutCharts.map((chart, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="w-16 sm:w-20 h-16 sm:h-20 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chart.data}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={30}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {chart.data.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs sm:text-sm font-bold text-gray-900">{chart.value}%</span>
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1.5 text-center">{chart.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================= */}
        {/* ROW 3: Cohort Analysis + Bottom Card */}
        {/* ========================================= */}
        
        {/* Cohort Analysis */}
        <div className="lg:col-span-2">
          <CohortAnalysisCard />
        </div>

        {/* Bottom Card - using audience-specific title and data from config */}
        <div className="lg:col-span-1 card p-4 sm:p-6">
          <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">{config.bottomCardTitle}</h3>
          <div className="space-y-3">
            {config.bottomCardItems.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-gray-700 font-medium">{item.label}</span>
                  <span className="text-xs text-gray-600 font-semibold">{item.value}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${item.value}%`, backgroundColor: item.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
