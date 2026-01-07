import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from 'react-leaflet';
import { useGeographicRegions, useGeographicMapData, useGeographicInsights } from '../api/queries/geographic.queries';
import { Loader2, MapPin, TrendingUp, Users, Globe } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Helper function to get color based on NPS
const getNPSColor = (nps: number) => {
  if (nps >= 50) return '#22c55e'; // Green
  if (nps >= 0) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
};

export default function Geographic() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const { data: regionsData, isLoading: regionsLoading } = useGeographicRegions();
  const { data: mapData } = useGeographicMapData();
  const { data: insightsData } = useGeographicInsights({ region: selectedRegion || undefined });

  const regions = regionsData?.regions || [];
  const insights = insightsData || {};

  // Calculate overall metrics
  const overallMetrics = useMemo(() => {
    if (regions.length === 0) return { avgNPS: 0, totalCandidates: 0, avgResponseRate: 0 };
    
    const avgNPS = Math.round(
      regions.reduce((sum, r) => sum + r.nps, 0) / regions.length
    );
    const totalCandidates = regions.reduce((sum, r) => sum + r.totalCandidates, 0);
    const avgResponseRate = Math.round(
      regions.reduce((sum, r) => sum + r.responseRate, 0) / regions.length
    );

    return { avgNPS, totalCandidates, avgResponseRate };
  }, [regions]);

  if (regionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Geographic Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Regional NPS performance and insights
        </p>
      </div>

      {/* Global Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Global NPS</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overallMetrics.avgNPS}</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <Globe className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Candidates</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overallMetrics.totalCandidates}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{overallMetrics.avgResponseRate}%</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Global NPS Heatmap
        </h3>
        <div className="h-[500px] rounded-lg overflow-hidden border border-gray-200">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render circle markers for each region */}
            {regions.map((region, idx) => {
              // Mock coordinates - in production, you'd have real lat/lon data
              const lat = 20 + Math.random() * 40 - 20;
              const lng = Math.random() * 360 - 180;
              
              return (
                <CircleMarker
                  key={idx}
                  center={[lat, lng]}
                  radius={10 + (region.totalCandidates / 10)}
                  fillColor={getNPSColor(region.nps)}
                  color={getNPSColor(region.nps)}
                  weight={2}
                  opacity={0.8}
                  fillOpacity={0.6}
                  eventHandlers={{
                    click: () => setSelectedRegion(region.country)
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <h4 className="font-semibold text-gray-900">{region.country}</h4>
                      <p className="text-sm text-gray-600 mt-1">NPS: {region.nps}</p>
                      <p className="text-sm text-gray-600">Response Rate: {region.responseRate}%</p>
                      <p className="text-sm text-gray-600">Candidates: {region.totalCandidates}</p>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">NPS ≥ 50 (Excellent)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm text-gray-600">NPS 0-49 (Good)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">NPS < 0 (Needs Improvement)</span>
          </div>
        </div>
      </div>

      {/* Selected Region Insights */}
      {selectedRegion && insights.region && (
        <div className="bg-indigo-50 rounded-xl shadow-sm p-6 border-2 border-indigo-200">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">
              {insights.region} - Detailed Insights
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">NPS Score</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {insights.metrics?.nps || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Response Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {insights.metrics?.responseRate || 0}%
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Candidates</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {insights.metrics?.totalCandidates || 0}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Regions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {insights.metrics?.regionCount || 0}
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedRegion(null)}
            className="mt-4 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Regional Performance Table */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Regional Performance Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Region</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">NPS</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Response Rate</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Candidates</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Avg Time to Feedback</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition"
                  onClick={() => setSelectedRegion(region.country)}
                >
                  <td className="py-3 px-4 font-medium text-gray-900">{region.country}</td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium ${
                        region.nps >= 50
                          ? 'bg-green-100 text-green-800'
                          : region.nps >= 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {region.nps}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">{region.responseRate}%</td>
                  <td className="text-center py-3 px-4">{region.totalCandidates}</td>
                  <td className="text-center py-3 px-4">{region.medianTimeToFeedback || '-'}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic Insights & Actions */}
      {insights.insights && insights.insights.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Regional Insights */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Regional Insights
            </h3>
            <div className="space-y-3">
              {insights.insights.slice(0, 5).map((insight: any, idx: number) => (
                <div key={idx} className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{insight.country}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        NPS: {insight.nps} • Trend: {insight.trend}
                      </p>
                    </div>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Actions */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Related Actions
            </h3>
            <div className="space-y-3">
              {insights.actions && insights.actions.map((action: any, idx: number) => (
                <div key={idx} className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-gray-900">{action.title}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        action.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                        action.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {action.priority}
                    </span>
                    <span className="text-xs text-gray-600">{action.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

