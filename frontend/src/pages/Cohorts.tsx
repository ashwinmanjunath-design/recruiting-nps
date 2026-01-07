import React, { useState } from 'react';
import {
  useCohortsAnalysis,
  useCohortsComparison,
  useCohortsFeedbackThemes,
  useCohortsScatterData
} from '../api/queries/cohorts.queries';
import {
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis
} from 'recharts';
import { Loader2, Filter, Users, TrendingUp } from 'lucide-react';

export default function Cohorts() {
  // Cohort 1 filters
  const [role1, setRole1] = useState('');
  const [source1, setSource1] = useState('');
  const [location1, setLocation1] = useState('');

  // Cohort 2 filters
  const [cohort1Id, setCohort1Id] = useState('');
  const [cohort2Id, setCohort2Id] = useState('');
  
  const { data: analysis1, isLoading: analysis1Loading } = useCohortsAnalysis({
    role: role1,
    source: source1,
    location: location1
  });

  const { data: comparisonData, isLoading: comparisonLoading } = useCohortsComparison(
    cohort1Id,
    cohort2Id
  );

  const { data: themesData } = useCohortsFeedbackThemes();
  const { data: scatterData } = useCohortsScatterData();

  const cohort1 = analysis1?.cohort;
  const cohort2 = comparisonData?.cohort2;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cohort Analysis & Comparison</h1>
        <p className="text-gray-600 mt-1">
          Build, compare and analyze candidate cohorts
        </p>
      </div>

      {/* Cohort Builder */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-900">Cohort Builder</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={role1}
              onChange={(e) => setRole1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Roles</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Product Manager">Product Manager</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Designer">Designer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source
            </label>
            <select
              value={source1}
              onChange={(e) => setSource1(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Referral">Referral</option>
              <option value="Career Site">Career Site</option>
              <option value="Agency">Agency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={location1}
              onChange={(e) => setLocation1(e.target.value)}
              placeholder="e.g., San Francisco"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setRole1('');
                setSource1('');
                setLocation1('');
              }}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Cohort Comparison Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cohort 1 Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-indigo-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Cohort 1</h3>
            {analysis1Loading && <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />}
          </div>

          {cohort1 && (
            <div className="space-y-4">
              {/* Size */}
              <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-indigo-600" />
                  <span className="font-medium text-gray-700">Size</span>
                </div>
                <span className="text-xl font-bold text-indigo-600">{cohort1.size}</span>
              </div>

              {/* NPS */}
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="font-medium text-gray-700">NPS Score</span>
                <span className="text-xl font-bold text-green-600">{cohort1.nps}</span>
              </div>

              {/* Response Rate */}
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="font-medium text-gray-700">Response Rate</span>
                <span className="text-xl font-bold text-blue-600">{cohort1.responseRate}%</span>
              </div>

              {/* Distribution */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-700 mb-2">Distribution</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-sm text-gray-600">Promoters</p>
                    <p className="text-lg font-bold text-green-600">{cohort1.promoters}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Passives</p>
                    <p className="text-lg font-bold text-yellow-600">{cohort1.passives}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Detractors</p>
                    <p className="text-lg font-bold text-red-600">{cohort1.detractors}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!cohort1 && !analysis1Loading && (
            <p className="text-center text-gray-500 py-12">
              Apply filters to analyze this cohort
            </p>
          )}
        </div>

        {/* Cohort 2 Card (Placeholder for comparison) */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort 2</h3>
          <p className="text-center text-gray-500 py-12">
            Select a cohort to compare
          </p>
        </div>
      </div>

      {/* Comparison Table */}
      {cohort1 && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Cohort Comparison Table
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Metric</th>
                  <th className="text-center py-3 px-4 font-semibold text-indigo-600">Cohort 1</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-600">Cohort 2</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">Difference</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Size</td>
                  <td className="text-center py-3 px-4">{cohort1.size}</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">NPS Score</td>
                  <td className="text-center py-3 px-4 font-bold text-green-600">{cohort1.nps}</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Response Rate</td>
                  <td className="text-center py-3 px-4">{cohort1.responseRate}%</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3 px-4 font-medium text-gray-700">Promoters</td>
                  <td className="text-center py-3 px-4">{cohort1.promoters}</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium text-gray-700">Detractors</td>
                  <td className="text-center py-3 px-4">{cohort1.detractors}</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                  <td className="text-center py-3 px-4 text-gray-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Scatter Plot Visualization */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cohort Scatter Plot (NPS vs Response Rate)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              type="number"
              dataKey="nps"
              name="NPS"
              stroke="#666"
              label={{ value: 'NPS Score', position: 'bottom' }}
            />
            <YAxis
              type="number"
              dataKey="responseRate"
              name="Response Rate"
              stroke="#666"
              label={{ value: 'Response Rate (%)', angle: -90, position: 'left' }}
            />
            <ZAxis type="number" dataKey="size" range={[100, 1000]} name="Size" />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                      <p className="font-semibold text-gray-900">{data.cohortName}</p>
                      <p className="text-sm text-gray-600">NPS: {data.nps}</p>
                      <p className="text-sm text-gray-600">Response Rate: {data.responseRate}%</p>
                      <p className="text-sm text-gray-600">Size: {data.size}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Scatter name="Cohorts" data={scatterData?.data || []} fill="#8b5cf6" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Feedback Themes by Cohort */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Feedback Themes
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={themesData?.themes?.slice(0, 10) || []} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="theme" stroke="#666" angle={-45} textAnchor="end" height={100} />
            <YAxis stroke="#666" />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

