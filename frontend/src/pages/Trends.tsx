import React, { useState } from 'react';
import { useTrendsHistory, useTrendsResponseRate, useTrendsInsights } from '../api/queries/trends.queries';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, Users, Loader2, AlertCircle } from 'lucide-react';

export default function Trends() {
  const [period, setPeriod] = useState<string>('monthly');
  const [months, setMonths] = useState<number>(12);

  const { data: historyData, isLoading: historyLoading } = useTrendsHistory({ period, months });
  const { data: responseRateData, isLoading: responseLoading } = useTrendsResponseRate({ months: 6 });
  const { data: insightsData, isLoading: insightsLoading } = useTrendsInsights();

  if (historyLoading || responseLoading || insightsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const trendData = historyData?.data || [];
  const responseData = responseRateData?.data || [];
  const insights = insightsData?.insights || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trends</h1>
          <p className="text-gray-600 mt-1">NPS and engagement trends over time</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center space-x-3">
          <select
            value={months}
            onChange={(e) => setMonths(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value={6}>Last 6 months</option>
            <option value={12}>Last 12 months</option>
            <option value={24}>Last 24 months</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {trendData.length > 0 && (
          <>
            {/* Current NPS */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Current NPS</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {trendData[trendData.length - 1]?.nps || 0}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <div className="mt-4 text-sm text-green-600 font-medium">
                ↑ Excellent trend
              </div>
            </div>

            {/* Response Rate */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Response Rate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {trendData[trendData.length - 1]?.responseRate || 0}%
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Total Responses */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Responses</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {trendData.reduce((sum, d) => sum + (d.totalResponses || 0), 0)}
                  </p>
                </div>
                <AlertCircle className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            {/* Avg Time to Feedback */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Time to Feedback</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {responseData.length > 0
                      ? Math.round(responseData.reduce((sum, d) => sum + d.avgTimeToFeedback, 0) / responseData.length)
                      : 0}d
                  </p>
                </div>
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* NPS Trend Line Chart */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            NPS & Response Rate Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
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
              <Line
                type="monotone"
                dataKey="responseRate"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                name="Response Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* NPS Composition (Stacked Area) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            NPS Composition Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="promoters"
                stackId="1"
                stroke="#22c55e"
                fill="#22c55e"
                name="Promoters"
              />
              <Area
                type="monotone"
                dataKey="passives"
                stackId="1"
                stroke="#f59e0b"
                fill="#f59e0b"
                name="Passives"
              />
              <Area
                type="monotone"
                dataKey="detractors"
                stackId="1"
                stroke="#ef4444"
                fill="#ef4444"
                name="Detractors"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Time-to-Feedback vs Response Rate (Scatter) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Time-to-Feedback vs Response Rate
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                type="number"
                dataKey="avgTimeToFeedback"
                name="Avg Time (days)"
                stroke="#666"
                label={{ value: 'Avg Time to Feedback (days)', position: 'bottom' }}
              />
              <YAxis
                type="number"
                dataKey="responseRate"
                name="Response Rate"
                stroke="#666"
                label={{ value: 'Response Rate (%)', angle: -90, position: 'left' }}
              />
              <ZAxis range={[100, 400]} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Months" data={responseData} fill="#8b5cf6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Feedback Themes (Bar Chart) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Feedback Themes
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={insights.slice(0, 8)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis type="number" stroke="#666" />
              <YAxis dataKey="theme" type="category" stroke="#666" width={120} />
              <Tooltip />
              <Bar
                dataKey="count"
                fill="#4f46e5"
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights & Notable Events */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Insights & Notable Events
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.slice(0, 6).map((insight: any, idx: number) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-2 ${
                insight.sentiment === 'POSITIVE'
                  ? 'bg-green-50 border-green-200'
                  : insight.sentiment === 'NEGATIVE'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{insight.theme}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Mentioned {insight.count} times
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${
                      insight.sentiment === 'POSITIVE'
                        ? 'bg-green-100 text-green-700'
                        : insight.sentiment === 'NEGATIVE'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {insight.sentiment}
                  </span>
                </div>
                {insight.sentiment === 'POSITIVE' ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

