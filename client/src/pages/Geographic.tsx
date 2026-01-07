import { useEffect, useState } from 'react';
import { getGeographicRegions, getGeographicInsights } from '../api/client';
import { TrendingUp, TrendingDown, CheckCircle2, Globe, MapPin, Calendar, RotateCcw, Users, Briefcase, Building2, Monitor } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
// @ts-ignore - react-simple-maps doesn't have type definitions
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps';
import { SurveyAudience } from '../../../shared/types/enums';
import { useAudienceStore } from '../stores/audienceStore';

// World map TopoJSON
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// ============================================
// MARKER STYLE CONFIGURATION
// Centralized styling for consistent markers
// ============================================
const MARKER_STYLE = {
  radius: 5,            // Fixed consistent radius for ALL markers
  strokeWidth: 1.5,     // White border around marker
  fillOpacity: 1,       // Main circle opacity (solid)
  strokeOpacity: 1,     // Border opacity
  glowRadius: 2,        // Extra radius for outer glow
  glowOpacity: 0.15,    // Outer glow opacity (subtle)
};

// ============================================
// LABEL STYLE CONFIGURATION
// Centralized styling for labels
// ============================================
const LABEL_STYLE = {
  fontSize: 9,          // City name font size (px)
  npsFontSize: 8,       // NPS value font size (px)
  fontWeight: 600,      // Font weight for city name
  fontFamily: 'system-ui, -apple-system, sans-serif',
  textColor: '#374151', // City name color (gray-700)
  npsColor: '#6b7280',  // NPS value color (gray-500)
  pillWidth: 58,        // White background pill width
  pillHeight: 18,       // White background pill height
  pillRadius: 3,        // Pill border radius
  pillOpacity: 0.9,     // Pill background opacity
  defaultOffsetY: 20,   // Default Y offset from marker center
};

// ============================================
// LABEL OFFSETS FOR DENSE AREAS
// Prevents overlapping in crowded regions
// dx/dy are pixel offsets from marker center
// ============================================
const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  // Europe - spread labels to avoid overlap
  london:    { dx: -38, dy: -16 },   // Left and up
  berlin:    { dx: 32, dy: -16 },    // Right and up  
  prague:    { dx: 0, dy: 22 },      // Below (default position)
  
  // Asia - slight adjustments
  tokyo:     { dx: 26, dy: -8 },     // Right and slightly up
  singapore: { dx: 0, dy: 22 },      // Below
  bangalore: { dx: 0, dy: 22 },      // Below
  
  // Americas
  sf:        { dx: 0, dy: 22 },      // Below
  ny:        { dx: 32, dy: 0 },      // Right
  saopaulo:  { dx: 0, dy: 22 },      // Below
  sydney:    { dx: 0, dy: 22 },      // Below
};

// ============================================
// REGION DATA
// Accurate lat/lng coordinates for react-simple-maps [lng, lat]
// ============================================
const REGION_DATA = [
  // North America
  { id: 'sf', name: 'San Francisco', coordinates: [-122.4194, 37.7749], nps: 72, responseRate: 85, candidates: 650, change: 5 },
  { id: 'ny', name: 'New York', coordinates: [-74.0060, 40.7128], nps: 74, responseRate: 87, candidates: 820, change: 4 },
  
  // Europe
  { id: 'prague', name: 'Prague', coordinates: [14.4378, 50.0755], nps: 78, responseRate: 88, candidates: 480, change: 8 },
  { id: 'london', name: 'London', coordinates: [-0.1278, 51.5074], nps: 76, responseRate: 86, candidates: 680, change: 4 },
  { id: 'berlin', name: 'Berlin', coordinates: [13.4050, 52.5200], nps: 74, responseRate: 84, candidates: 520, change: 3 },
  
  // Asia Pacific
  { id: 'bangalore', name: 'Bangalore', coordinates: [77.5946, 12.9716], nps: 82, responseRate: 90, candidates: 1520, change: 12 },
  { id: 'singapore', name: 'Singapore', coordinates: [103.8198, 1.3521], nps: 79, responseRate: 91, candidates: 380, change: 7 },
  { id: 'tokyo', name: 'Tokyo', coordinates: [139.6503, 35.6762], nps: 75, responseRate: 92, candidates: 420, change: 6 },
  { id: 'sydney', name: 'Sydney', coordinates: [151.2093, -33.8688], nps: 68, responseRate: 82, candidates: 295, change: 2 },
  
  // South America
  { id: 'saopaulo', name: 'São Paulo', coordinates: [-46.6333, -23.5505], nps: 60, responseRate: 65, candidates: 385, change: -3 },
];

// Date range presets
type DatePreset = 'last7' | 'last30' | 'last3m' | 'last6m' | 'ytd' | 'custom' | 'all';

const DATE_PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'last7', label: 'Last 7 days' },
  { id: 'last30', label: 'Last 30 days' },
  { id: 'last3m', label: 'Last 3 months' },
  { id: 'last6m', label: 'Last 6 months' },
  { id: 'ytd', label: 'Year to Date' },
];

// ============================================
// AUDIENCE-SPECIFIC CONFIG
// ============================================
const AUDIENCE_CONFIG = {
  [SurveyAudience.CANDIDATE]: {
    label: 'Candidate',
    icon: Users,
    title: 'Candidate Geographic Performance',
    subtitle: 'NPS by location for candidate experience',
  },
  [SurveyAudience.HIRING_MANAGER]: {
    label: 'Hiring Manager',
    icon: Briefcase,
    title: 'Hiring Manager Geographic Performance',
    subtitle: 'NPS by location for hiring manager satisfaction',
  },
  [SurveyAudience.WORKPLACE]: {
    label: 'Workplace',
    icon: Building2,
    title: 'Workplace Geographic Performance',
    subtitle: 'NPS by location for workplace experience',
  },
  [SurveyAudience.IT_SUPPORT]: {
    label: 'IT Support',
    icon: Monitor,
    title: 'IT Support Geographic Performance',
    subtitle: 'NPS by location for IT support satisfaction',
  },
};

// Helper to calculate date from preset
const getDateFromPreset = (preset: DatePreset): { start: string; end: string } => {
  const today = new Date();
  const endDate = new Date().toISOString().split('T')[0];
  let start = '';
  
  switch (preset) {
    case 'last7':
      start = new Date(today.setDate(today.getDate() - 7)).toISOString().split('T')[0];
      break;
    case 'last30':
      start = new Date(today.setDate(today.getDate() - 30)).toISOString().split('T')[0];
      break;
    case 'last3m':
      start = new Date(today.setMonth(today.getMonth() - 3)).toISOString().split('T')[0];
      break;
    case 'last6m':
      start = new Date(today.setMonth(today.getMonth() - 6)).toISOString().split('T')[0];
      break;
    case 'ytd':
      start = `${new Date().getFullYear()}-01-01`;
      break;
    default:
      start = '';
  }
  
  return { start, end: endDate };
};

// NPS color helper
const getNpsColor = (nps: number) => {
  if (nps >= 80) return '#10b981'; // green-500
  if (nps >= 70) return '#34d399'; // green-400
  if (nps >= 50) return '#fbbf24'; // amber-400
  return '#ef4444'; // red-500
};

/**
 * Get consistent marker radius - same size for all locations
 * @returns Fixed radius from MARKER_STYLE config
 */
const getMarkerRadius = (): number => {
  return MARKER_STYLE.radius;
};

/**
 * Get label offset for a location
 * Uses LABEL_OFFSETS config or falls back to default
 */
const getLabelOffset = (locationId: string): { dx: number; dy: number } => {
  return LABEL_OFFSETS[locationId] || { dx: 0, dy: LABEL_STYLE.defaultOffsetY };
};

export default function Geographic() {
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // ============================================
  const { audience: selectedAudience, setAudience: setSelectedAudience } = useAudienceStore();
  
  // Get current audience config
  const audienceConfig = AUDIENCE_CONFIG[selectedAudience];

  const [regions, setRegions] = useState<any[]>(REGION_DATA);
  const [selectedRegion, setSelectedRegion] = useState<any>(REGION_DATA[0]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [compareWith, setCompareWith] = useState('all');
  
  // Date range filter state
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [appliedDateRange, setAppliedDateRange] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [regionsRes, insightsRes] = await Promise.all([
        getGeographicRegions(),
        getGeographicInsights()
      ]);
      // Merge API data with our coordinates
      if (regionsRes.data && regionsRes.data.length > 0) {
        const mergedRegions = REGION_DATA.map(r => {
          const apiRegion = regionsRes.data.find((ar: any) => 
            ar.region?.toLowerCase().includes(r.name.toLowerCase()) ||
            r.name.toLowerCase().includes(ar.region?.toLowerCase())
          );
          return apiRegion ? { ...r, ...apiRegion } : r;
        });
        setRegions(mergedRegions);
        setSelectedRegion(mergedRegions[0]);
      }
      if (insightsRes.data && insightsRes.data.length > 0) {
        setInsights(insightsRes.data);
      } else {
        // Fallback insights
        setInsights([
          { title: 'India shows highest NPS growth (+12%) this quarter', type: 'positive', checked: false },
          { title: 'Brazil response rate needs attention (65%)', type: 'negative', checked: false },
          { title: 'Europe maintaining strong performance consistently', type: 'positive', checked: true },
          { title: 'Consider expanding survey reach in Australia', type: 'info', checked: false },
        ]);
      }
    } catch (error) {
      console.error('Error fetching geographic data:', error);
      // Use fallback data
      setInsights([
        { title: 'India shows highest NPS growth (+12%) this quarter', type: 'positive', checked: false },
        { title: 'Brazil response rate needs attention (65%)', type: 'negative', checked: false },
        { title: 'Europe maintaining strong performance consistently', type: 'positive', checked: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Trend data for selected region
  const getTrendData = () => [
    { month: 'Jan', nps: selectedRegion.nps - 8 },
    { month: 'Feb', nps: selectedRegion.nps - 5 },
    { month: 'Mar', nps: selectedRegion.nps - 3 },
    { month: 'Apr', nps: selectedRegion.nps - 1 },
    { month: 'May', nps: selectedRegion.nps + 1 },
    { month: 'Jun', nps: selectedRegion.nps },
  ];

  // Handle preset selection - auto applies
  const handlePresetSelect = (preset: DatePreset) => {
    setDatePreset(preset);
    if (preset !== 'custom' && preset !== 'all') {
      const range = getDateFromPreset(preset);
      setAppliedDateRange(range);
      setCustomStartDate('');
      setCustomEndDate('');
      // TODO: Refetch data with new date range
      console.log('Applied date range:', range);
    }
  };

  // Handle custom date apply
  const handleApplyCustomRange = () => {
    if (customStartDate && customEndDate) {
      setDatePreset('custom');
      setAppliedDateRange({ start: customStartDate, end: customEndDate });
      // TODO: Refetch data with new date range
      console.log('Applied custom range:', { start: customStartDate, end: customEndDate });
    }
  };

  // Handle reset
  const handleResetDateFilter = () => {
    setDatePreset('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setAppliedDateRange(null);
    // TODO: Refetch full dataset
    console.log('Reset to full dataset');
  };

  // Format date for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
          Showing <span className="font-medium text-gray-700">{audienceConfig.label}</span> geographic data
        </p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
          {audienceConfig.title}
        </h1>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col lg:flex-row lg:items-end gap-6">
          {/* Compare With */}
          <div className="flex-shrink-0">
            <label className="block text-sm font-medium text-gray-700 mb-2">Compare With:</label>
            <select 
              className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white min-w-[160px]"
              value={compareWith}
              onChange={(e) => setCompareWith(e.target.value)}
            >
              <option value="all">vs All Regions</option>
              <option value="na">vs North America</option>
              <option value="eu">vs Europe</option>
              <option value="apac">vs APAC</option>
            </select>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px h-12 bg-gray-200"></div>

          {/* Date Range Filter */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Date Range:
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {/* Preset Buttons */}
              <div className="flex flex-wrap gap-2">
                {DATE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      datePreset === preset.id
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary hover:text-primary'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Divider */}
              <div className="hidden sm:block w-px h-8 bg-gray-200"></div>

              {/* Custom Range Inputs */}
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => {
                    setCustomStartDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white w-[140px]"
                  placeholder="Start Date"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => {
                    setCustomEndDate(e.target.value);
                    setDatePreset('custom');
                  }}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg bg-white w-[140px]"
                  placeholder="End Date"
                />
                <button
                  onClick={handleApplyCustomRange}
                  disabled={!customStartDate || !customEndDate}
                  className="px-4 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>

              {/* Reset Button */}
              {(datePreset !== 'all' || appliedDateRange) && (
                <button
                  onClick={handleResetDateFilter}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>

            {/* Applied Range Display */}
            {appliedDateRange && (
              <p className="text-xs text-gray-500 mt-2">
                Showing data from {formatDateDisplay(appliedDateRange.start)} to {formatDateDisplay(appliedDateRange.end)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* World Map Visualization */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">NPS Performance by Region</h3>
          
          {/* World Map with react-simple-maps */}
          <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 rounded-xl overflow-hidden" style={{ height: '380px' }}>
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                scale: 120,
                center: [20, 20]
              }}
              style={{ width: '100%', height: '100%' }}
            >
              <ZoomableGroup>
                <Geographies geography={geoUrl}>
                  {({ geographies }: { geographies: any[] }) =>
                    geographies.map((geo: any) => (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill="#e2e8f0"
                        stroke="#cbd5e1"
                        strokeWidth={0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { fill: '#cbd5e1', outline: 'none' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    ))
                  }
                </Geographies>
                
                {/* Region Markers - Using centralized MARKER_STYLE and LABEL_STYLE */}
                {regions.map((region) => {
                  // Get consistent marker radius (same for all locations)
                  const radius = getMarkerRadius();
                  
                  // Get label offset from config (handles dense areas like Europe)
                  const offset = getLabelOffset(region.id);
                  const labelX = offset.dx;
                  const labelY = offset.dy;
                  
                  // Determine if we need a connector line (for non-default positions)
                  const needsConnector = labelX !== 0 || labelY < 0;
                  
                  return (
                    <Marker
                      key={region.id}
                      coordinates={region.coordinates}
                      onClick={() => setSelectedRegion(region)}
                    >
                      {/* Outer glow - subtle highlight */}
                      <circle
                        r={radius + MARKER_STYLE.glowRadius}
                        fill={getNpsColor(region.nps)}
                        fillOpacity={MARKER_STYLE.glowOpacity}
                      />
                      
                      {/* Main marker circle */}
                      <circle
                        r={radius}
                        fill={getNpsColor(region.nps)}
                        fillOpacity={MARKER_STYLE.fillOpacity}
                        stroke="#fff"
                        strokeWidth={MARKER_STYLE.strokeWidth}
                        strokeOpacity={MARKER_STYLE.strokeOpacity}
                        style={{ cursor: 'pointer' }}
                      />
                      
                      {/* Connector line for offset labels */}
                      {needsConnector && (
                        <line
                          x1={0}
                          y1={0}
                          x2={labelX * 0.7}
                          y2={labelY * 0.7}
                          stroke="#9ca3af"
                          strokeWidth={0.8}
                          strokeDasharray="2,2"
                          strokeOpacity={0.6}
                        />
                      )}
                      
                      {/* Label pill background */}
                      <rect
                        x={labelX - LABEL_STYLE.pillWidth / 2}
                        y={labelY - LABEL_STYLE.pillHeight / 2}
                        width={LABEL_STYLE.pillWidth}
                        height={LABEL_STYLE.pillHeight}
                        rx={LABEL_STYLE.pillRadius}
                        fill="white"
                        fillOpacity={LABEL_STYLE.pillOpacity}
                      />
                      
                      {/* City name label */}
                      <text
                        x={labelX}
                        y={labelY - 3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontFamily: LABEL_STYLE.fontFamily,
                          fontSize: `${LABEL_STYLE.fontSize}px`,
                          fontWeight: LABEL_STYLE.fontWeight,
                          fill: LABEL_STYLE.textColor,
                        }}
                      >
                        {region.name}
                      </text>
                      
                      {/* NPS value label */}
                      <text
                        x={labelX}
                        y={labelY + 6}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontFamily: LABEL_STYLE.fontFamily,
                          fontSize: `${LABEL_STYLE.npsFontSize}px`,
                          fontWeight: 500,
                          fill: LABEL_STYLE.npsColor,
                        }}
                      >
                        NPS: {region.nps}
                      </text>
                    </Marker>
                  );
                })}
              </ZoomableGroup>
            </ComposableMap>
          </div>

          {/* Legend - Properly spaced and responsive */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-xs sm:text-sm">
              <span className="text-gray-500 font-medium">Legend:</span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0"></span>
                <span className="text-gray-600">NPS: 0-50</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0"></span>
                <span className="text-gray-600">NPS: 51-70</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0"></span>
                <span className="text-gray-600">NPS: 71-80</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0"></span>
                <span className="text-gray-600">NPS: 81-100</span>
              </span>
            </div>
          </div>
        </div>

        {/* Selected Region Insights */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">{selectedRegion.name}</h3>
          </div>
          
          {/* NPS Score */}
          <div className="text-center mb-6 p-4 bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl">
            <p className="text-sm text-gray-600 mb-2">Average NPS</p>
            <div className="flex items-center justify-center gap-3">
              <div className="w-20 h-20">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ value: selectedRegion.nps }, { value: 100 - selectedRegion.nps }]}
                      cx="50%"
                      cy="50%"
                      innerRadius={28}
                      outerRadius={38}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill={getNpsColor(selectedRegion.nps)} />
                      <Cell fill="#e5e7eb" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="text-left">
                <h3 className="text-4xl font-bold text-gray-900">{selectedRegion.nps}</h3>
                <span className={`text-sm font-medium flex items-center ${selectedRegion.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {selectedRegion.change >= 0 ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                  {selectedRegion.change >= 0 ? '+' : ''}{selectedRegion.change}%
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Response Rate</span>
              <span className="font-semibold text-gray-900">{selectedRegion.responseRate}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Total Candidates</span>
              <span className="font-semibold text-gray-900">{selectedRegion.candidates.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-700">Median Feedback Time</span>
              <span className="font-semibold text-gray-900">18 Hours</span>
            </div>
          </div>

          {/* Mini Trend Chart */}
          <div className="mt-4">
            <p className="text-sm text-gray-700 mb-2">NPS Trend (6 Months)</p>
            <div className="h-16">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getTrendData()}>
                  <defs>
                    <linearGradient id="npsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area 
                    type="natural" 
                    dataKey="nps" 
                    stroke="#14b8a6" 
                    strokeWidth={2} 
                    fill="url(#npsGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Performance Breakdown Table + Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Region</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">NPS</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Change</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Response Rate</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Candidates</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Trend</th>
                </tr>
              </thead>
              <tbody>
                {regions.map((region, idx) => (
                  <tr 
                    key={idx} 
                    className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${selectedRegion.id === region.id ? 'bg-teal-50' : ''}`}
                    onClick={() => setSelectedRegion(region)}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{region.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span 
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white text-sm font-bold"
                        style={{ backgroundColor: getNpsColor(region.nps) }}
                      >
                        {region.nps}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-sm font-medium ${region.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {region.change >= 0 ? '+' : ''}{region.change}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{region.responseRate}%</td>
                    <td className="py-3 px-4 text-center text-sm text-gray-600">{region.candidates.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="w-20 h-8 mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[
                            { v: region.nps - 5 },
                            { v: region.nps - 2 },
                            { v: region.nps + 1 },
                            { v: region.nps }
                          ]}>
                            <Line 
                              type="natural" 
                              dataKey="v" 
                              stroke={getNpsColor(region.nps)} 
                              strokeWidth={2} 
                              dot={false} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Geographic Insights */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Insights</h3>
          <div className="space-y-3">
            {insights.map((insight: any, idx: number) => (
              <div 
                key={idx} 
                className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                  insight.checked 
                    ? 'bg-green-50 border-green-200' 
                    : insight.type === 'negative' 
                      ? 'bg-red-50 border-red-200' 
                      : insight.type === 'positive'
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                }`}
              >
                <input 
                  type="checkbox" 
                  defaultChecked={insight.checked} 
                  className="mt-1 w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" 
                />
                <p className="text-sm text-gray-800 flex-1">{insight.title}</p>
                {insight.checked && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
              </div>
            ))}
          </div>
          <button className="mt-4 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-full font-medium">
            Mark as Done
          </button>
        </div>
      </div>
    </div>
  );
}
