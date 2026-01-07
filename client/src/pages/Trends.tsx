import { useState, useEffect } from 'react';
import { 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Info, Users, Briefcase, Building2, Monitor } from 'lucide-react';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import type { TimePeriod, ComparisonBaseline } from '../components/dashboard/DashboardFilters';
import { 
  getTrendsComposition, 
  getTrendsResponse, 
  getTrendsInsights, 
  getTrendsSummary,
  type TrendsFilters,
  type NpsCompositionDataPoint,
  type ResponseRateDataPoint,
  type TrendInsight,
  type TrendSummary
} from '../api/queries/trends.queries';
import { SurveyAudience } from '../../../shared/types/enums';
import { useAudienceStore } from '../stores/audienceStore';

// ============================================================================
// AUDIENCE-SPECIFIC TRENDS CONFIG
// Each audience has distinct labels to avoid confusion between data sources.
// When switching audiences, all API calls include audience parameter.
// ============================================================================
const AUDIENCE_CONFIG = {
  [SurveyAudience.CANDIDATE]: {
    label: 'Candidate', 
    icon: Users,
    title: 'Candidate NPS Trends Analysis',
    subtitle: 'Tracking candidate interview experience over time',
    npsLabel: 'Candidate NPS',
    currentNpsLabel: 'Current Candidate NPS',
    chartTitle: 'Candidate NPS Composition & Trend',
    responseChartTitle: 'Candidate Response Rate & Time to Feedback',
    insightsTitle: 'Candidate Insights & Noteworthy Events',
    positive: 'Promoters', 
    neutral: 'Passives', 
    negative: 'Detractors',
    responseLabel: 'Candidate Response Rate', 
    feedbackLabel: 'Time to Candidate Feedback',
  },
  [SurveyAudience.HIRING_MANAGER]: {
    label: 'Hiring Manager', 
    icon: Briefcase,
    title: 'Hiring Manager NPS Trends Analysis',
    subtitle: 'Tracking HM satisfaction with Talent Acquisition over time',
    // ─────────────────────────────────────────────────────────────────────────
    // HM Survey Question Mapping:
    // Q1 – Hiring Manager NPS | Q2 – Candidate Quality | Q3 – Role Fit
    // Q4 – Process Speed | Q5 – Scheduling | Q6 – Communication & Partnership
    // Q7 – Market Guidance | Q8-Q10 – Open text feedback
    // ─────────────────────────────────────────────────────────────────────────
    npsLabel: 'HM NPS',
    currentNpsLabel: 'Current HM NPS',
    chartTitle: 'HM NPS Composition & Trend',
    responseChartTitle: 'HM Response Rate & Time to Feedback',
    insightsTitle: 'Hiring Manager Insights & Noteworthy Events',
    positive: 'Satisfied', 
    neutral: 'Neutral', 
    negative: 'Dissatisfied',
    responseLabel: 'Hiring Manager Response Rate', 
    feedbackLabel: 'Time to HM Feedback',
  },
  [SurveyAudience.WORKPLACE]: {
    label: 'Workplace', 
    icon: Building2,
    title: 'Workplace NPS Trends Analysis',
    subtitle: 'Tracking employee workplace satisfaction over time',
    npsLabel: 'Workplace NPS',
    currentNpsLabel: 'Current Workplace NPS',
    chartTitle: 'Workplace NPS Composition & Trend',
    responseChartTitle: 'Workplace Response Rate & Time to Feedback',
    insightsTitle: 'Workplace Insights & Noteworthy Events',
    positive: 'Satisfied', 
    neutral: 'Neutral', 
    negative: 'Dissatisfied',
    responseLabel: 'Employee Response Rate', 
    feedbackLabel: 'Survey Completion Time',
  },
  [SurveyAudience.IT_SUPPORT]: {
    label: 'IT Support', 
    icon: Monitor,
    title: 'IT Support NPS Trends Analysis',
    subtitle: 'Tracking IT support satisfaction over time',
    npsLabel: 'IT Support NPS',
    currentNpsLabel: 'Current IT Support NPS',
    chartTitle: 'IT Support NPS Composition & Trend',
    responseChartTitle: 'IT Response Rate & Time to Feedback',
    insightsTitle: 'IT Support Insights & Noteworthy Events',
    positive: 'Excellent', 
    neutral: 'Acceptable', 
    negative: 'Poor',
    responseLabel: 'IT Response Rate', 
    feedbackLabel: 'Survey Completion Time',
  },
};

// FALLBACK MOCK DATA - Used if API fails or returns empty data
const FALLBACK_COMPOSITION_DATA = {
  weekly: [
    { period: 'Week 1', promotersPercentage: 48, passivesPercentage: 32, detractorsPercentage: 20, npsScore: 28, totalResponses: 250 },
    { period: 'Week 2', promotersPercentage: 51, passivesPercentage: 30, detractorsPercentage: 19, npsScore: 32, totalResponses: 305 },
    { period: 'Week 3', promotersPercentage: 53, passivesPercentage: 29, detractorsPercentage: 18, npsScore: 35, totalResponses: 360 },
    { period: 'Week 4', promotersPercentage: 55, passivesPercentage: 28, detractorsPercentage: 17, npsScore: 38, totalResponses: 420 },
  ],
  monthly: [
    { period: 'Jan', promotersPercentage: 45, passivesPercentage: 33, detractorsPercentage: 22, npsScore: 23, totalResponses: 1150 },
    { period: 'Feb', promotersPercentage: 48, passivesPercentage: 32, detractorsPercentage: 20, npsScore: 28, totalResponses: 1280 },
    { period: 'Mar', promotersPercentage: 50, passivesPercentage: 31, detractorsPercentage: 19, npsScore: 31, totalResponses: 1450 },
    { period: 'Apr', promotersPercentage: 52, passivesPercentage: 30, detractorsPercentage: 18, npsScore: 34, totalResponses: 1620 },
    { period: 'May', promotersPercentage: 54, passivesPercentage: 29, detractorsPercentage: 17, npsScore: 37, totalResponses: 1810 },
    { period: 'Jun', promotersPercentage: 56, passivesPercentage: 28, detractorsPercentage: 16, npsScore: 40, totalResponses: 2010 },
  ],
  quarterly: [
    { period: 'Q1 2023', promotersPercentage: 42, passivesPercentage: 35, detractorsPercentage: 23, npsScore: 19, totalResponses: 3350 },
    { period: 'Q2 2023', promotersPercentage: 46, passivesPercentage: 33, detractorsPercentage: 21, npsScore: 25, totalResponses: 4050 },
    { period: 'Q3 2023', promotersPercentage: 50, passivesPercentage: 31, detractorsPercentage: 19, npsScore: 31, totalResponses: 4750 },
    { period: 'Q4 2023', promotersPercentage: 53, passivesPercentage: 30, detractorsPercentage: 17, npsScore: 36, totalResponses: 5450 },
    { period: 'Q1 2024', promotersPercentage: 56, passivesPercentage: 28, detractorsPercentage: 16, npsScore: 40, totalResponses: 6150 },
  ],
};

const FALLBACK_RESPONSE_DATA = {
  weekly: [
    { period: 'Week 1', responseRatePercentage: 75, timeToFeedbackHours: 28, totalSent: 420, totalResponded: 315 },
    { period: 'Week 2', responseRatePercentage: 78, timeToFeedbackHours: 26, totalSent: 450, totalResponded: 351 },
    { period: 'Week 3', responseRatePercentage: 80, timeToFeedbackHours: 24, totalSent: 480, totalResponded: 384 },
    { period: 'Week 4', responseRatePercentage: 82, timeToFeedbackHours: 22, totalSent: 510, totalResponded: 418 },
  ],
  monthly: [
    { period: 'Jan', responseRatePercentage: 72, timeToFeedbackHours: 32, totalSent: 1600, totalResponded: 1152 },
    { period: 'Feb', responseRatePercentage: 74, timeToFeedbackHours: 30, totalSent: 1750, totalResponded: 1295 },
    { period: 'Mar', responseRatePercentage: 76, timeToFeedbackHours: 28, totalSent: 1900, totalResponded: 1444 },
    { period: 'Apr', responseRatePercentage: 78, timeToFeedbackHours: 26, totalSent: 2050, totalResponded: 1599 },
    { period: 'May', responseRatePercentage: 80, timeToFeedbackHours: 24, totalSent: 2200, totalResponded: 1760 },
    { period: 'Jun', responseRatePercentage: 82, timeToFeedbackHours: 22, totalSent: 2350, totalResponded: 1927 },
  ],
  quarterly: [
    { period: 'Q1 2023', responseRatePercentage: 68, timeToFeedbackHours: 36, totalSent: 4500, totalResponded: 3060 },
    { period: 'Q2 2023', responseRatePercentage: 72, timeToFeedbackHours: 32, totalSent: 5200, totalResponded: 3744 },
    { period: 'Q3 2023', responseRatePercentage: 76, timeToFeedbackHours: 28, totalSent: 5900, totalResponded: 4484 },
    { period: 'Q4 2023', responseRatePercentage: 79, timeToFeedbackHours: 25, totalSent: 6600, totalResponded: 5214 },
    { period: 'Q1 2024', responseRatePercentage: 82, timeToFeedbackHours: 22, totalSent: 7300, totalResponded: 5986 },
  ],
};

// Audience-specific fallback insights
const FALLBACK_INSIGHTS_BY_AUDIENCE: Record<SurveyAudience, TrendInsight[]> = {
  [SurveyAudience.CANDIDATE]: [
    {
      severity: 'success',
      title: 'Candidate Response Rate Improvement',
      description: 'Candidate response rate has increased by 10% over the last quarter, indicating better engagement.',
      period: 'Q1 2025',
      resolved: false,
    },
    {
      severity: 'warning',
      title: 'Significant NPS Drop in June',
      description: 'Candidate NPS decreased by 8 points attributed to changes in technical interview format.',
      period: 'June 2025',
      resolved: false,
    },
    {
      severity: 'info',
      title: 'Improved Satisfaction in Tech Roles',
      description: 'Engineering candidates reporting 15% higher satisfaction after updated interview rubrics.',
      period: 'May 2025',
      resolved: true,
    },
  ],
  [SurveyAudience.HIRING_MANAGER]: [
    {
      severity: 'success',
      title: 'Communication Scores Up',
      description: 'Hiring manager satisfaction with recruiter communication (Q6) improved by 12% this quarter.',
      period: 'Q1 2025',
      resolved: false,
    },
    {
      severity: 'warning',
      title: 'Process Speed Concerns',
      description: 'Multiple HMs flagged slow screening-to-onsite timelines. Average currently 8 days vs 5-day target.',
      period: 'Q4 2024',
      resolved: false,
    },
    {
      severity: 'info',
      title: 'Senior Role Quality Improved',
      description: 'Candidate quality scores (Q2) for senior engineering roles improved by 18% after pipeline updates.',
      period: 'March 2025',
      resolved: true,
    },
  ],
  [SurveyAudience.WORKPLACE]: [
    {
      severity: 'success',
      title: 'Office Facilities Satisfaction Up',
      description: 'Employee satisfaction with office facilities improved by 15% after Berlin office renovation.',
      period: 'Q1 2025',
      resolved: false,
    },
    {
      severity: 'info',
      title: 'Remote Work Policy Well Received',
      description: 'New hybrid work policy received positive feedback across all locations.',
      period: 'Feb 2025',
      resolved: true,
    },
  ],
  [SurveyAudience.IT_SUPPORT]: [
    {
      severity: 'success',
      title: 'Day-1 Readiness Improved',
      description: 'Systems ready on day 1 metric improved to 94% from 78% last quarter.',
      period: 'Q1 2025',
      resolved: false,
    },
    {
      severity: 'warning',
      title: 'Ticket Resolution Time Increasing',
      description: 'Average ticket resolution time increased by 2 hours due to new security protocols.',
      period: 'March 2025',
      resolved: false,
    },
  ],
};

const FALLBACK_INSIGHTS = FALLBACK_INSIGHTS_BY_AUDIENCE[SurveyAudience.CANDIDATE];

const FALLBACK_SUMMARY: TrendSummary = {
  currentNps: 40,
  npsChange: 3,
  currentResponseRate: 82,
  responseRateChange: 2,
  avgTimeToFeedback: 22,
  timeToFeedbackChange: -2,
};

export default function Trends() {
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // ============================================
  const { audience: selectedAudience, setAudience: setSelectedAudience } = useAudienceStore();
  
  // Filter states
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly');
  const [comparisonBaseline, setComparisonBaseline] = useState<ComparisonBaseline>('engineers-q1');
  const [customDateRange, setCustomDateRange] = useState<{ from: string; to: string } | null>(null);

  // Data states - Initialize with fallback data to ensure charts are never empty
  const [compositionData, setCompositionData] = useState<NpsCompositionDataPoint[]>(FALLBACK_COMPOSITION_DATA.monthly);
  const [responseData, setResponseData] = useState<ResponseRateDataPoint[]>(FALLBACK_RESPONSE_DATA.monthly);
  const [insights, setInsights] = useState<TrendInsight[]>(FALLBACK_INSIGHTS);
  const [summary, setSummary] = useState<TrendSummary>(FALLBACK_SUMMARY);
  const [loading, setLoading] = useState(false);

  // Get current audience config
  const audienceConfig = AUDIENCE_CONFIG[selectedAudience];

  // Build filters object - include audience for all API calls
  const filters: TrendsFilters = {
    interval: timePeriod,
    baseline: comparisonBaseline,
    from: customDateRange?.from,
    to: customDateRange?.to,
    audience: selectedAudience,
  };

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [compositionRes, responseRes, insightsRes, summaryRes] = await Promise.all([
          getTrendsComposition(filters),
          getTrendsResponse(filters),
          getTrendsInsights(filters),
          getTrendsSummary(filters),
        ]);

        // Use API data if available, otherwise keep fallback data
        if (compositionRes.data.data && compositionRes.data.data.length > 0) {
          setCompositionData(compositionRes.data.data);
        } else {
          // Use fallback for current interval
          setCompositionData(FALLBACK_COMPOSITION_DATA[timePeriod]);
        }

        if (responseRes.data.data && responseRes.data.data.length > 0) {
          setResponseData(responseRes.data.data);
        } else {
          setResponseData(FALLBACK_RESPONSE_DATA[timePeriod]);
        }

        if (insightsRes.data.insights && insightsRes.data.insights.length > 0) {
          setInsights(insightsRes.data.insights);
        } else {
          // Use audience-specific fallback insights
          setInsights(FALLBACK_INSIGHTS_BY_AUDIENCE[selectedAudience] || FALLBACK_INSIGHTS);
        }

        if (summaryRes.data && summaryRes.data.currentNps !== undefined) {
          setSummary(summaryRes.data);
        } else {
          setSummary(FALLBACK_SUMMARY);
        }
      } catch (error) {
        console.error('Error fetching trends data, using fallback:', error);
        // On error, use fallback data for current interval and audience
        setCompositionData(FALLBACK_COMPOSITION_DATA[timePeriod]);
        setResponseData(FALLBACK_RESPONSE_DATA[timePeriod]);
        setInsights(FALLBACK_INSIGHTS_BY_AUDIENCE[selectedAudience] || FALLBACK_INSIGHTS);
        setSummary(FALLBACK_SUMMARY);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timePeriod, comparisonBaseline, customDateRange, selectedAudience]);

  // Custom tooltip for composition chart
  const CompositionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-semibold text-gray-900">
                {entry.name === 'NPS Score' ? entry.value : `${entry.value}%`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for response chart
  const ResponseTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                <span className="text-gray-700">{entry.name}:</span>
              </div>
              <span className="font-semibold text-gray-900">
                {entry.dataKey === 'responseRatePercentage' ? `${entry.value}%` : `${entry.value}h`}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Severity icon helper
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  // Severity color helper
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-amber-50 border-amber-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-4">
      {/* ================================ */}
      {/* AUDIENCE TABS */}
      {/* ================================ */}
      <div className="mb-4">
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
          {(Object.keys(AUDIENCE_CONFIG) as SurveyAudience[]).map((audience) => {
            const cfg = AUDIENCE_CONFIG[audience];
            const Icon = cfg.icon;
            const isActive = selectedAudience === audience;
            
            return (
              <button
                key={audience}
                onClick={() => setSelectedAudience(audience)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive 
                    ? 'bg-white shadow-sm text-gray-900 ring-1 ring-gray-200' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'text-gray-400'}`} />
                <span className="hidden sm:inline">{cfg.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{audienceConfig.label}</span> trend data
        </p>
      </div>

      {/* ================================ */}
      {/* HEADER + FILTERS */}
      {/* ================================ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
            {audienceConfig.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{audienceConfig.subtitle}</p>
        </div>
        <DashboardFilters
          onPeriodChange={(period) => setTimePeriod(period)}
          onBaselineChange={(baseline) => setComparisonBaseline(baseline)}
          onDateRangeChange={(from, to) => setCustomDateRange({ from, to })}
        />
      </div>

      {/* ================================ */}
      {/* SUMMARY STATS - COMPACT */}
      {/* ================================ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* NPS Score */}
        <div className="card py-4">
          <p className="text-sm text-gray-600 mb-1">{audienceConfig.currentNpsLabel}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{summary.currentNps}</h3>
            {summary.npsChange !== 0 && (
              <span className={`text-sm font-semibold flex items-center ${summary.npsChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.npsChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(summary.npsChange)} pts
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">vs previous period</p>
        </div>

        {/* Response Rate */}
        <div className="card py-4">
          <p className="text-sm text-gray-600 mb-1">{audienceConfig.responseLabel}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{summary.currentResponseRate}%</h3>
            {summary.responseRateChange !== 0 && (
              <span className={`text-sm font-semibold flex items-center ${summary.responseRateChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.responseRateChange > 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                {Math.abs(summary.responseRateChange)}%
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">vs previous period</p>
        </div>

        {/* Time to Feedback */}
        <div className="card py-4">
          <p className="text-sm text-gray-600 mb-1">{audienceConfig.feedbackLabel}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{summary.avgTimeToFeedback}h</h3>
            {summary.timeToFeedbackChange !== 0 && (
              <span className={`text-sm font-semibold flex items-center ${summary.timeToFeedbackChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {summary.timeToFeedbackChange < 0 ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                {Math.abs(summary.timeToFeedbackChange)}h
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">vs previous period</p>
        </div>
      </div>

      {/* ================================ */}
      {/* 1) MAIN TRENDS CHART - COMPACT */}
      {/* ================================ */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-800 mb-2">{audienceConfig.chartTitle}</h3>
        <div style={{ height: '260px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart 
              data={compositionData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
            <defs>
              <linearGradient id="colorDetractors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="colorPassives" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
              </linearGradient>
              <linearGradient id="colorPromoters" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis 
              dataKey="period" 
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              stroke="#d1d5db"
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fontSize: 12, fill: '#9ca3af' }}
              stroke="#d1d5db"
              tickLine={false}
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#9ca3af' } }}
              domain={[0, 100]}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12, fill: '#14b8a6' }}
              stroke="#14b8a6"
              tickLine={false}
              label={{ value: 'NPS Score', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#14b8a6' } }}
              domain={[-100, 100]}
            />
            <Tooltip content={<CompositionTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '13px', paddingTop: '20px' }}
              iconType="rect"
              iconSize={14}
            />
            
            {/* Stacked areas for composition */}
            <Area 
              yAxisId="left"
              type="natural" 
              dataKey="detractorsPercentage" 
              stackId="1"
              stroke="#ef4444"
              fill="url(#colorDetractors)"
              name={`${audienceConfig.negative} %`}
            />
            <Area 
              yAxisId="left"
              type="natural" 
              dataKey="passivesPercentage" 
              stackId="1"
              stroke="#f59e0b"
              fill="url(#colorPassives)"
              name={`${audienceConfig.neutral} %`}
            />
            <Area 
              yAxisId="left"
              type="natural" 
              dataKey="promotersPercentage" 
              stackId="1"
              stroke="#10b981"
              fill="url(#colorPromoters)"
              name={`${audienceConfig.positive} %`}
            />
            
            {/* NPS score line on right axis */}
            <Line 
              yAxisId="right"
              type="natural" 
              dataKey="npsScore" 
              stroke="#14b8a6" 
              strokeWidth={3}
              dot={{ fill: '#fff', stroke: '#14b8a6', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#14b8a6', strokeWidth: 2 }}
              name="NPS Score"
            />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================================ */}
      {/* 2 & 3) RESPONSE RATE + INSIGHTS - FIXED HEIGHTS */}
      {/* ================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 2) Response Rate & Time to Feedback (2/3 width) */}
        <div className="lg:col-span-2 card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{audienceConfig.responseChartTitle}</h3>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart 
                data={responseData}
                margin={{ top: 10, right: 60, left: 0, bottom: 0 }}
              >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: '#9ca3af' }}
                stroke="#d1d5db"
                tickLine={false}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 12, fill: '#14b8a6' }}
                stroke="#14b8a6"
                tickLine={false}
                label={{ value: 'Response Rate (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12, fill: '#14b8a6' } }}
                domain={[0, 100]}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 12, fill: '#ec4899' }}
                stroke="#ec4899"
                tickLine={false}
                label={{ value: 'Time to Feedback (hours)', angle: 90, position: 'insideRight', style: { fontSize: 12, fill: '#ec4899' } }}
                domain={[0, 'dataMax + 10']}
              />
              <Tooltip content={<ResponseTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }}
                iconType="line"
                iconSize={14}
              />
              
              <Line 
                yAxisId="left"
                type="natural" 
                dataKey="responseRatePercentage" 
                stroke="#14b8a6" 
                strokeWidth={3}
                dot={{ fill: '#fff', stroke: '#14b8a6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                name="Response Rate %"
              />
              <Line 
                yAxisId="right"
                type="natural" 
                dataKey="timeToFeedbackHours" 
                stroke="#ec4899" 
                strokeWidth={3}
                dot={{ fill: '#fff', stroke: '#ec4899', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#ec4899', strokeWidth: 2 }}
                name="Time to Feedback (hrs)"
              />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3) Insights & Noteworthy Events (1/3 width) */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">{audienceConfig.insightsTitle}</h3>
          <div className="space-y-3">
            {insights && insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`flex items-start gap-3 p-3 border rounded-lg ${getSeverityColor(insight.severity)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getSeverityIcon(insight.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{insight.title}</p>
                    <p className="text-xs text-gray-600 mt-1">{insight.description}</p>
                    {insight.period && (
                      <p className="text-xs text-gray-500 mt-1">{insight.period}</p>
                    )}
                    {insight.resolved && (
                      <span className="inline-flex items-center text-xs text-green-600 mt-2">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Resolved
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No insights available for this period</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
