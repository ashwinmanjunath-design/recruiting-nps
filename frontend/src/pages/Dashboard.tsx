import React from 'react';
import { useDashboardOverview, useDashboardInsights } from '../api/queries/dashboard.queries';
import { useFiltersStore } from '../store/filtersStore';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Users,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';

const COLORS = {
  promoters: '#22c55e',
  passives: '#f59e0b',
  detractors: '#ef4444',
};

export default function Dashboard() {
  const { dateRange } = useFiltersStore();
  
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview({
    startDate: dateRange.start?.toISOString(),
    endDate: dateRange.end?.toISOString(),
  });

  const { data: insights, isLoading: insightsLoading } = useDashboardInsights();

  if (overviewLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const npsScore = overview?.nps || 0;
  const responseRate = overview?.responseRate || 0;

  // Prepare donut chart data
  const donutData = [
    { name: 'Promoters', value: overview?.promoters || 0, fill: COLORS.promoters },
    { name: 'Passives', value: overview?.passives || 0, fill: COLORS.passives },
    { name: 'Detractors', value: overview?.detractors || 0, fill: COLORS.detractors },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of candidate NPS and engagement metrics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* NPS Score */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">NPS Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{npsScore}</p>
            </div>
            <div className={`p-3 rounded-full ${
              npsScore >= 50 ? 'bg-green-100' :
              npsScore >= 0 ? 'bg-yellow-100' : 'bg-red-100'
            }`}>
              <TrendingUp className={`w-6 h-6 ${
                npsScore >= 50 ? 'text-green-600' :
                npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'
              }`} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`font-medium ${
              npsScore >= 50 ? 'text-green-600' :
              npsScore >= 0 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {npsScore >= 50 ? 'Excellent' :
               npsScore >= 0 ? 'Good' : 'Needs Improvement'}
            </span>
          </div>
        </div>

        {/* Response Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{responseRate}%</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {overview?.totalResponses || 0} responses
            </span>
          </div>
        </div>

        {/* Total Candidates */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {overview?.totalCandidates || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">Surveyed</span>
          </div>
        </div>

        {/* Avg Time to Feedback */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Time to Feedback</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {overview?.avgTimeToFeedback || 0}
              </p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">days</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Trend Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            NPS Trend Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overview?.npsHistory || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="nps"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ fill: '#4f46e5', r: 5 }}
                name="NPS Score"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* NPS Distribution Donut */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            NPS Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={donutData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {donutData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights & Recommended Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Insights */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Insights
          </h3>
          <div className="space-y-4">
            {insights?.insights?.slice(0, 5).map((insight: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg"
              >
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">{insight.theme}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Mentioned {insight.count} times • {insight.sentiment}
                  </p>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No insights available yet</p>
            )}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recommended Actions
          </h3>
          <div className="space-y-4">
            {insights?.actions?.slice(0, 5).map((action: any, idx: number) => (
              <div
                key={idx}
                className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg"
              >
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span className={`px-2 py-1 rounded ${
                      action.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                      action.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {action.priority}
                    </span>
                    {action.assignee && <span>Assigned to: {action.assignee}</span>}
                  </div>
                </div>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-8">No actions recommended yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

