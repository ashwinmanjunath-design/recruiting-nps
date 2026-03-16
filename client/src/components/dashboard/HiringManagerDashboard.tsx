// ============================================
// HIRING MANAGER DASHBOARD COMPONENT
// ============================================
// Wired to real API data from /api/dashboard/hiring-manager
// Displays: Quarterly NPS cards, Score breakdown, Trend line,
// Location overview, Insights summary, and Response overview.
//
// QUESTION MAPPING:
// Q1 (hm-q1-nps) → HM NPS gauge + promoters/neutral/detractors
// Q2 (hm-q2-quality) → "Candidate Quality Satisfaction" score
// Q3 (hm-q3-role-fit) → "Role Fit Alignment" score
// Q4 (hm-q4-process-speed) → "Process Speed Satisfaction" score
// Q5 (hm-q5-scheduling) → "Scheduling & Coordination" score
// Q6 (hm-q6-communication) → "Communication & Partnership" score
// Q7 (hm-q7-market-guidance) → "Market Guidance" score
// ============================================

import { useState, useEffect } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Users, Send, CheckCircle2, MapPin, AlertCircle, User } from 'lucide-react';
import { getHiringManagerDashboard } from '../../api/client';
// Recruiter performance - empty until real data available
const RECRUITER_PERFORMANCE_DATA: { name: string; nps: number; surveysCompleted: number; trend: 'up' | 'down' | 'stable'; avgResponseTime: string }[] = [];

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────
interface HMDashboardData {
  audience: string;
  filters: { location?: string; quarter?: string; year: number };
  metrics: {
    hmNps: number;
    candidateQuality: number;
    roleFit: number;
    processSpeed: number;
    scheduling: number;
    communication: number;
    marketGuidance: number;
  };
  npsBreakdown: {
    promoters: number;
    passives: number;
    detractors: number;
    total: number;
    promotersPercent: number;
    passivesPercent: number;
    detractorsPercent: number;
  };
  quarterlyData: {
    quarter: string;
    nps: number;
    responded: number;
    sent: number;
    change: number;
  }[];
  locationBreakdown: {
    region: string;
    regionCode: string;
    nps: number;
    responded: number;
    sent: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  responseOverview: {
    totalSent: number;
    totalResponded: number;
    responseRate: number;
    avgCompletionTime: string;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function getNpsColor(nps: number): string {
  if (nps >= 70) return '#14b8a6';
  if (nps >= 50) return '#10b981';
  if (nps >= 30) return '#f59e0b';
  return '#ef4444';
}

function getNpsBgColor(nps: number): string {
  if (nps >= 70) return '#ccfbf1';
  if (nps >= 50) return '#d1fae5';
  if (nps >= 30) return '#fef3c7';
  return '#fee2e2';
}

// ─────────────────────────────────────────────────────────────────────────────
// DONUT CHART COMPONENT (for Score Breakdown)
// ─────────────────────────────────────────────────────────────────────────────
// Sized to match Candidate dashboard measurements for visual consistency
function ScoreDonut({ label, value, color }: { label: string; value: number; color: string }) {
  const data = [
    { value: value, color: color },
    { value: 100 - value, color: '#f3f4f6' },
  ];

  return (
    <div className="flex flex-col items-center p-4 bg-gray-50/50 rounded-xl">
      <div className="relative w-36 h-36 sm:w-40 sm:h-40">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={62}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-gray-900">{value}%</span>
        </div>
      </div>
      <span className="mt-3 text-sm font-medium text-gray-700 text-center">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// QUARTERLY NPS CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function QuarterlyNpsCard({ data, year }: { data: { quarter: string; nps: number; responded: number; sent: number; change: number }; year: number }) {
  const npsColor = getNpsColor(data.nps);
  const bgColor = getNpsBgColor(data.nps);
  
  return (
    <div className="card p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{data.quarter} {year}</span>
        {data.change !== 0 && (
          <span className={`flex items-center text-xs font-medium ${data.change > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {data.change > 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {data.change > 0 ? '+' : ''}{data.change}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold" style={{ color: npsColor }}>
          {data.nps}
        </span>
        <span className="text-sm text-gray-400">HM NPS</span>
      </div>
      
      <div 
        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: bgColor, color: npsColor }}
      >
        {data.responded} responded
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCATION NPS CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
function LocationNpsCard({ data }: { data: { region: string; regionCode: string; nps: number; responded: number; sent: number; trend: string } }) {
  const npsColor = getNpsColor(data.nps);
  const TrendIcon = data.trend === 'up' ? TrendingUp : data.trend === 'down' ? TrendingDown : Minus;
  const trendColor = data.trend === 'up' ? 'text-emerald-500' : data.trend === 'down' ? 'text-red-500' : 'text-gray-400';
  
  return (
    <div 
      className="bg-white rounded-3xl p-4 hover:shadow-lg transition-all"
      style={{ borderLeftWidth: '4px', borderLeftColor: npsColor, boxShadow: '0 18px 45px rgba(15, 23, 42, 0.08)' }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-800">{data.region}</span>
        </div>
        <TrendIcon className={`w-4 h-4 ${trendColor}`} />
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-2xl font-bold" style={{ color: npsColor }}>
          {data.nps}
        </span>
        <span className="text-xs text-gray-400">NPS</span>
      </div>
      
      <div className="text-xs text-gray-500">
        {data.responded} / {data.sent} responded
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROPS INTERFACE
// ─────────────────────────────────────────────────────────────────────────────
interface HiringManagerDashboardProps {
  selectedLocation?: string;
  onLocationChange?: (location: string) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HIRING MANAGER DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function HiringManagerDashboard({ selectedLocation = 'all', onLocationChange }: HiringManagerDashboardProps) {
  const [trendView, setTrendView] = useState<'quarterly' | 'yearly'>('quarterly');
  const [data, setData] = useState<HMDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await getHiringManagerDashboard({
          location: selectedLocation !== 'all' ? selectedLocation : undefined,
          year: new Date().getFullYear(),
        });
        setData(response.data);
      } catch (err: any) {
        console.error('Failed to fetch HM dashboard data:', err);
        // If API fails (e.g., auth error, no data), use fallback data for development
        if (err?.response?.status === 401) {
          console.warn('Token expired - using fallback data. Please re-login for live data.');
        }
        setError('No hiring manager data available yet.');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation]);

  // Custom tooltip for the trend chart
  const TrendTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">
            {trendView === 'quarterly' ? `${label} ${data?.filters.year || 2025}` : label}
          </p>
          <p className="text-sm text-teal-600">
            NPS: <span className="font-bold">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <p className="text-gray-600 font-medium">{error || 'No data available'}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Prepare trend data
  const trendData = data.quarterlyData.map(q => ({
    period: q.quarter,
    nps: q.nps,
    responseRate: q.sent > 0 ? Math.round((q.responded / q.sent) * 100) : 0
  }));

  // Score breakdown data from metrics (Q2, Q4, Q5, Q6)
  const scoreBreakdownData = [
    { label: 'Candidate Quality', value: data.metrics.candidateQuality, color: '#10b981', metric: 'Q2' },
    { label: 'Process Speed', value: data.metrics.processSpeed, color: '#f59e0b', metric: 'Q4' },
    { label: 'Communication', value: data.metrics.communication, color: '#14b8a6', metric: 'Q6' },
    { label: 'Scheduling', value: data.metrics.scheduling, color: '#8b5cf6', metric: 'Q5' },
  ];

  // Calculate yearly average
  const yearlyNps = Math.round(data.quarterlyData.reduce((sum, q) => sum + q.nps, 0) / data.quarterlyData.length) || 0;
  const yearlyNpsColor = getNpsColor(yearlyNps);

  // Gauge data for the center hero box (same as Candidate dashboard)
  const gaugeData = [
    { value: data.npsBreakdown.promotersPercent, color: '#10b981' },
    { value: data.npsBreakdown.passivesPercent, color: '#f59e0b' },
    { value: data.npsBreakdown.detractorsPercent, color: '#ef4444' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* ════════════════════════════════════════════════════════════════════════
          HERO BOX: Matching Candidate dashboard layout exactly
          - Semi-circle gauge on the left
          - Response Rate stats on the right
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-2 card p-4 sm:p-6" style={{ minHeight: '200px' }}>
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
          {/* NPS Gauge - Semi-circle style matching Candidate dashboard */}
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
                            className="text-3xl font-semibold" 
                            style={{ fontSize: '28px', fontWeight: 600, fill: yearlyNpsColor }}
                          >
                            {yearlyNps}
                          </tspan>
                          <tspan 
                            x={cx} 
                            dy="1.5em" 
                            className="text-[10px] font-medium" 
                            style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.025em', fill: '#64748b' }}
                          >
                            HM NPS
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
            {/* Legend - matching Candidate dashboard style */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                <span className="text-gray-600">Satisfied: {data.npsBreakdown.promotersPercent}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                <span className="text-gray-600">Neutral: {data.npsBreakdown.passivesPercent}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                <span className="text-gray-600">Dissatisfied: {data.npsBreakdown.detractorsPercent}%</span>
              </div>
            </div>
          </div>

          {/* Response Rate - matching Candidate dashboard layout */}
          <div className="flex-1 text-center sm:text-left">
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-1">HM Response Rate</div>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-900">{data.responseOverview.responseRate}%</span>
                <span className="text-green-500 text-lg font-semibold">↑8%</span>
              </div>
              <div className="text-xs text-gray-500">(from {data.responseOverview.responseRate - 8}%)</div>
            </div>
            <div className="text-xs text-gray-600">
              Based on <span className="font-semibold">{data.responseOverview.totalSent} invitations</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Insights Card - matching Candidate dashboard */}
      <div className="lg:col-span-1 card p-4 sm:p-6 flex flex-col">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">
          Top Improvement Areas
        </h3>
        
        <div className="space-y-2.5 flex-1">
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded" />
            <span className="text-sm text-gray-700">Speed up screening to onsite timeline</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded" />
            <span className="text-sm text-gray-700">Improve senior role candidate quality</span>
          </div>
          <div className="flex items-start gap-2">
            <input type="checkbox" className="mt-0.5 w-4 h-4 text-purple-600 border-gray-300 rounded" />
            <span className="text-sm text-gray-700">More market insights & salary benchmarking</span>
          </div>
        </div>

        <button className="mt-4 px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors font-medium w-full sm:w-auto sm:ml-auto">
          Mark as Done
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION A: Quarterly NPS Snapshot
          Data from: quarterlyData (aggregated from Q1 responses)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Quarterly HM NPS Snapshot</h2>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
            <span className="text-xs text-gray-500">{data.filters.year} Average:</span>
            <span className="text-sm font-bold" style={{ color: yearlyNpsColor }}>{yearlyNps}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.quarterlyData.map((q) => (
            <QuarterlyNpsCard key={q.quarter} data={q} year={data.filters.year} />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          NPS Trend + Score Breakdown Row (matching Candidate dashboard)
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-2 card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Hiring Manager NPS Trend
          </h3>
          
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => setTrendView('quarterly')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                trendView === 'quarterly'
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quarterly
            </button>
          </div>
        </div>
        
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="npsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<TrendTooltip />} />
              <Area 
                type="monotone" 
                dataKey="nps" 
                stroke="#14b8a6"
                strokeWidth={3}
                fill="url(#npsGradient)"
                dot={{ fill: '#fff', stroke: '#14b8a6', strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: '#14b8a6', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HM Score Breakdown - 1/3 width (matching Candidate NPS Score Breakdown) */}
      <div className="lg:col-span-1 card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">HM Score Breakdown</h3>
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {scoreBreakdownData.map((item) => (
            <div key={item.metric} className="flex flex-col items-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { value: item.value, color: item.color },
                        { value: 100 - item.value, color: '#e5e7eb' },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={30}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill={item.color} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{item.value}%</span>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-1.5 text-center">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          NPS Distribution Row - Full width
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-2 card p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">NPS Distribution</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-emerald-50 rounded-xl">
            <p className="text-xs text-emerald-600 font-medium mb-1">Satisfied (9-10)</p>
            <p className="text-3xl font-bold text-emerald-600">{data.npsBreakdown.promotersPercent}%</p>
            <p className="text-xs text-gray-500 mt-1">{data.npsBreakdown.promoters} responses</p>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-xl">
            <p className="text-xs text-amber-600 font-medium mb-1">Neutral (7-8)</p>
            <p className="text-3xl font-bold text-amber-600">{data.npsBreakdown.passivesPercent}%</p>
            <p className="text-xs text-gray-500 mt-1">{data.npsBreakdown.passives} responses</p>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-xl">
            <p className="text-xs text-red-600 font-medium mb-1">Dissatisfied (0-6)</p>
            <p className="text-3xl font-bold text-red-600">{data.npsBreakdown.detractorsPercent}%</p>
            <p className="text-xs text-gray-500 mt-1">{data.npsBreakdown.detractors} responses</p>
          </div>
        </div>
      </div>

      {/* Regional Overview - 1/3 width */}
      <div className="lg:col-span-1 card p-4 sm:p-6">
        <h3 className="text-sm sm:text-base font-semibold text-gray-800 mb-3">By Region</h3>
        <div className="space-y-3">
          {data.locationBreakdown.slice(0, 4).map((loc) => (
            <div key={loc.regionCode}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-gray-700 font-medium">{loc.region}</span>
                <span className="text-xs text-gray-600 font-semibold">{loc.nps}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all" 
                  style={{ width: `${loc.nps}%`, backgroundColor: getNpsColor(loc.nps) }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION C: Location Overview (2x3 grid) - Full width
          Data from: locationBreakdown
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-3">
        <h3 className="text-base font-semibold text-gray-900 mb-4">
          Regional Hiring Manager NPS Overview
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.locationBreakdown.map((loc) => (
            <LocationNpsCard key={loc.regionCode} data={loc} />
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION D: Recruiter Performance
          HM satisfaction scores per recruiter
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-3 card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-900">
            Recruiter Performance
          </h3>
          <span className="text-xs text-gray-500">HM satisfaction by recruiter</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RECRUITER_PERFORMANCE_DATA.map((recruiter) => {
            const npsColor = getNpsColor(recruiter.nps);
            const TrendIcon = recruiter.trend === 'up' ? TrendingUp : recruiter.trend === 'down' ? TrendingDown : Minus;
            const trendColor = recruiter.trend === 'up' ? 'text-emerald-500' : recruiter.trend === 'down' ? 'text-red-500' : 'text-gray-400';
            
            return (
              <div 
                key={recruiter.name}
                className="flex items-center gap-4 p-4 bg-gray-50/50 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all"
              >
                {/* Avatar */}
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-purple-600" />
                </div>
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800 truncate">{recruiter.name}</span>
                    <TrendIcon className={`w-3.5 h-3.5 ${trendColor} flex-shrink-0`} />
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-gray-500">{recruiter.surveysCompleted} surveys</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{recruiter.avgResponseTime}</span>
                  </div>
                </div>
                
                {/* NPS Score */}
                <div className="flex flex-col items-center">
                  <span 
                    className="text-xl font-bold"
                    style={{ color: npsColor }}
                  >
                    {recruiter.nps}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">NPS</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          SECTION E: HM Response Overview
          Data from: responseOverview
          ════════════════════════════════════════════════════════════════════════ */}
      <div className="lg:col-span-3 grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-5 shadow-sm border border-purple-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <Send className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total HM Surveys Sent</span>
          </div>
          <div className="text-3xl font-bold text-purple-700">
            {data.responseOverview.totalSent}
          </div>
          <p className="text-xs text-gray-500 mt-1">Year to date</p>
        </div>

        <div className="bg-gradient-to-br from-teal-50 to-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-sm font-medium text-gray-600">Total HM Responses</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-teal-700">
              {data.responseOverview.totalResponded}
            </span>
            <span className="text-sm font-semibold text-emerald-600">
              ({data.responseOverview.responseRate}% rate)
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Avg. completion: {data.responseOverview.avgCompletionTime}
          </p>
        </div>
      </div>
    </div>
  );
}
