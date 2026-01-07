import { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Users, Save, Eye, TrendingUp, TrendingDown, Briefcase, Building2, Monitor } from 'lucide-react';
import { SurveyAudience } from '../../../shared/types/enums';
import { useAudienceStore } from '../stores/audienceStore';

// Import mock data
import {
  ROLE_OPTIONS,
  STAGE_OPTIONS,
  PERIOD_OPTIONS,
  generateCohortName,
  getMockCandidateCount,
  generateMockCohortRows,
  generateMockTrendData,
  DEFAULT_COMPARISON_COHORT,
  type CohortSelection,
  type CohortRow,
  type CohortTrendPoint,
} from '../mocks/cohortAnalyticsMock';

import {
  getThemesForCohort,
  type CohortThemes,
  type ThemeItem,
} from '../mocks/cohortThemes';

// AUDIENCE-SPECIFIC COHORTS CONFIG - distinct labels per audience to avoid confusion
const AUDIENCE_CONFIG = {
  [SurveyAudience.CANDIDATE]: {
    label: 'Candidate', icon: Users,
    title: 'Candidate Cohort Analysis',
    subtitle: 'Compare interview experience across candidate segments',
    npsLabel: 'Candidate NPS', entityLabel: 'candidates',
    chartTitle: 'Candidate NPS Trend by Cohort',
    positiveTheme: 'What Candidates Love', negativeTheme: 'What Candidates Dislike',
    // Filter configuration
    filter1Label: 'Role',
    filter1Options: ['All Roles', 'Engineers', 'Product Designers', 'Data Scientists', 'Product Managers'],
    filter2Label: 'Stage',
    filter2Options: ['All Stages', 'Phone Screen', 'Technical Interview', 'Onsite', 'Final Round'],
  },
  [SurveyAudience.HIRING_MANAGER]: {
    label: 'Hiring Manager', icon: Briefcase,
    title: 'Hiring Manager Cohort Analysis',
    subtitle: 'Compare TA satisfaction by department, location, or level',
    npsLabel: 'Hiring Manager NPS', entityLabel: 'hiring managers',
    chartTitle: 'Hiring Manager NPS Trend by Cohort',
    positiveTheme: 'What HMs Appreciate', negativeTheme: 'HM Improvement Areas',
    // Filter configuration - different from Candidate
    filter1Label: 'Department',
    filter1Options: ['All Departments', 'Engineering', 'Product', 'Design', 'Data Science', 'Marketing'],
    filter2Label: 'Location',
    filter2Options: ['All Locations', 'US - San Francisco', 'US - New York', 'UK - London', 'Singapore', 'India - Bangalore'],
  },
  [SurveyAudience.WORKPLACE]: {
    label: 'Workplace', icon: Building2,
    title: 'Workplace Cohort Analysis',
    subtitle: 'Compare employee satisfaction by office, team, or tenure',
    npsLabel: 'Workplace NPS', entityLabel: 'employees',
    chartTitle: 'Workplace NPS Trend by Cohort',
    positiveTheme: 'Workplace Strengths', negativeTheme: 'Workplace Improvements',
    // Filter configuration
    filter1Label: 'Office',
    filter1Options: ['All Offices', 'HQ - San Francisco', 'NYC Office', 'London Office', 'Singapore Office'],
    filter2Label: 'Tenure',
    filter2Options: ['All Tenures', '0-6 months', '6-12 months', '1-2 years', '2+ years'],
  },
  [SurveyAudience.IT_SUPPORT]: {
    label: 'IT Support', icon: Monitor,
    title: 'IT Support Cohort Analysis',
    subtitle: 'Compare IT experience by role, office, or onboarding date',
    npsLabel: 'IT NPS', entityLabel: 'users',
    chartTitle: 'IT Support NPS Trend by Cohort',
    positiveTheme: 'IT Strengths', negativeTheme: 'IT Improvement Areas',
    // Filter configuration
    filter1Label: 'Role Type',
    filter1Options: ['All Roles', 'Engineering', 'Non-Engineering', 'Executive', 'Contractor'],
    filter2Label: 'Office',
    filter2Options: ['All Offices', 'HQ - San Francisco', 'NYC Office', 'London Office', 'Remote'],
  },
};

// ============================================
// COHORTS PAGE COMPONENT
// ============================================
export default function Cohorts() {
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // ============================================
  const { audience: selectedAudience, setAudience: setSelectedAudience } = useAudienceStore();
  
  // Cohort Builder state - dynamic based on audience
  const [selectedFilter1, setSelectedFilter1] = useState<string>('Engineers');
  const [selectedFilter2, setSelectedFilter2] = useState<string>('Final Round');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Q4 2024');
  
  // Get current audience config
  const audienceConfig = AUDIENCE_CONFIG[selectedAudience];
  
  // Reset filters when audience changes (to use appropriate defaults)
  const filter1Options = audienceConfig.filter1Options || ['All'];
  const filter2Options = audienceConfig.filter2Options || ['All'];
  
  // Preview state - populated when "Preview Cohort" is clicked
  const [hasPreview, setHasPreview] = useState<boolean>(false);
  const [cohortRows, setCohortRows] = useState<CohortRow[]>([]);
  const [trendData, setTrendData] = useState<CohortTrendPoint[]>([]);
  const [primaryThemes, setPrimaryThemes] = useState<CohortThemes | null>(null);
  const [comparisonThemes, setComparisonThemes] = useState<CohortThemes | null>(null);

  // Current selection object
  const currentSelection: CohortSelection = useMemo(() => ({
    role: selectedFilter1,
    stage: selectedFilter2,
    period: selectedPeriod,
  }), [selectedFilter1, selectedFilter2, selectedPeriod]);

  // Generated cohort name and candidate count
  const primaryCohortName = useMemo(() => generateCohortName(currentSelection), [currentSelection]);
  const candidateCount = useMemo(() => getMockCandidateCount(currentSelection), [currentSelection]);
  const comparisonCohortName = useMemo(() => generateCohortName(DEFAULT_COMPARISON_COHORT), []);

  // Handle Preview Cohort click
  const handlePreviewCohort = () => {
    // TODO: Replace with real Cohort analytics API (GET /api/cohorts/analytics)
    const rows = generateMockCohortRows(currentSelection, DEFAULT_COMPARISON_COHORT);
    const trends = generateMockTrendData(primaryCohortName, comparisonCohortName);
    const primary = getThemesForCohort(selectedFilter1);
    const comparison = getThemesForCohort(DEFAULT_COMPARISON_COHORT.role);

    setCohortRows(rows);
    setTrendData(trends);
    setPrimaryThemes(primary);
    setComparisonThemes(comparison);
    setHasPreview(true);
  };

  // Handle Save Cohort click
  const handleSaveCohort = () => {
    // TODO: Replace with real Save Cohort API (POST /api/cohorts)
    alert(`Cohort "${primaryCohortName}" saved! (mock)`);
  };

  // Theme level badge color
  const getLevelBadgeClass = (level: string, isPositive: boolean) => {
    if (isPositive) {
      return level === 'High' ? 'bg-green-100 text-green-700' :
             level === 'Medium' ? 'bg-green-50 text-green-600' :
             'bg-gray-100 text-gray-600';
    } else {
      return level === 'High' ? 'bg-red-100 text-red-700' :
             level === 'Medium' ? 'bg-red-50 text-red-600' :
             'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Audience Tabs */}
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
          Analyzing cohorts for <span className="font-medium text-gray-700">{audienceConfig.label}</span> feedback
        </p>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
        {audienceConfig.title}
      </h1>
      <p className="text-sm text-gray-500 mt-1">{audienceConfig.subtitle}</p>

      {/* ============================================ */}
      {/* 1) COHORT BUILDER */}
      {/* ============================================ */}
      <div className="card">
        <div className="flex items-center gap-2 mb-5">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold text-gray-900">Cohort Builder</h3>
        </div>
        
        {/* Filter Controls - Dynamic based on audience */}
        <div className="flex flex-wrap items-end gap-4 mb-4">
          {/* Filter 1 Dropdown (Role for Candidates, Department for HM, etc.) */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{audienceConfig.filter1Label}</label>
            <select 
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={selectedFilter1}
              onChange={(e) => setSelectedFilter1(e.target.value)}
            >
              {filter1Options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Filter 2 Dropdown (Stage for Candidates, Location for HM, etc.) */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">{audienceConfig.filter2Label}</label>
            <select 
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={selectedFilter2}
              onChange={(e) => setSelectedFilter2(e.target.value)}
            >
              {filter2Options.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Time Period Dropdown */}
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Time Period</label>
            <select 
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              {PERIOD_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button 
              onClick={handlePreviewCohort}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Preview Cohort
            </button>
            <button 
              onClick={handleSaveCohort}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Cohort
            </button>
          </div>
        </div>

        {/* Summary Line */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-900">{primaryCohortName}</span>
            <span className="mx-2">•</span>
            <span className="text-primary font-medium">{candidateCount} {audienceConfig.entityLabel}</span>
            <span className="text-xs text-slate-400 ml-2">(mock data)</span>
          </p>
        </div>
      </div>

      {/* ============================================ */}
      {/* 2) COHORT COMPARISON TABLE & 3) VISUAL COMPARISON */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparison Table */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Cohort Comparison Table</h3>
          
          {!hasPreview ? (
            <div className="flex items-center justify-center h-48 text-center">
              <p className="text-sm text-slate-500">
                No cohorts yet. Use the Cohort Builder above and click <span className="font-medium text-primary">"Preview Cohort"</span>.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cohort Name</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Avg Feedback Time</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">vs Prev Period</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">NPS Score</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time Period</th>
                    <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {cohortRows.map((row, idx) => (
                    <tr key={row.id} className={`border-b border-gray-100 ${idx === 0 ? 'bg-teal-50/50' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: idx === 0 ? '#14b8a6' : '#f97316' }}
                          />
                          <span className="text-sm text-gray-900 font-medium">{row.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-center text-sm text-gray-700">{row.medianFeedbackHours}h</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-sm font-medium ${
                          row.changeVsPrevious.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {row.changeVsPrevious.startsWith('+') ? 
                            <TrendingUp className="w-3.5 h-3.5" /> : 
                            <TrendingDown className="w-3.5 h-3.5" />
                          }
                          {row.changeVsPrevious}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="text-sm font-semibold text-primary">{row.nps}</span>
                      </td>
                      <td className="py-3 px-3 text-center text-sm text-gray-600">{row.periodLabel}</td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                          row.createdBy === 'Primary' 
                            ? 'bg-teal-100 text-teal-700' 
                            : 'bg-orange-100 text-orange-700'
                        }`}>
                          {row.createdBy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Visual Comparison Chart */}
        <div className="card">
          <h3 className="text-base font-semibold text-gray-900 mb-4">Visual Comparison</h3>
          
          {!hasPreview ? (
            <div className="flex items-center justify-center h-48 text-center">
              <p className="text-sm text-slate-500">
                No cohorts selected yet. Use <span className="font-medium text-primary">"Preview Cohort"</span> above to see a trend comparison.
              </p>
            </div>
          ) : (
            <>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                    <XAxis 
                      dataKey="period" 
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      stroke="#d1d5db"
                      tickLine={false}
                    />
                    <YAxis 
                      domain={[40, 90]}
                      tick={{ fontSize: 12, fill: '#9ca3af' }}
                      stroke="#d1d5db"
                      tickLine={false}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      }}
                      formatter={(value: number, name: string) => [
                        `NPS: ${value.toFixed(0)}`,
                        name === 'cohort1Nps' ? 'Primary Cohort' : 'Comparison Cohort'
                      ]}
                    />
                    <Line 
                      type="natural" 
                      dataKey="cohort1Nps" 
                      stroke="#14b8a6" 
                      strokeWidth={2.5}
                      dot={{ fill: '#fff', stroke: '#14b8a6', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#14b8a6', strokeWidth: 2 }}
                      name="cohort1Nps"
                    />
                    <Line 
                      type="natural" 
                      dataKey="cohort2Nps" 
                      stroke="#f97316" 
                      strokeWidth={2.5}
                      dot={{ fill: '#fff', stroke: '#f97316', strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: '#f97316', strokeWidth: 2 }}
                      name="cohort2Nps"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Custom Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-teal-500"></span>
                  <span className="text-xs text-gray-600">{cohortRows[0]?.name || 'Primary Cohort'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                  <span className="text-xs text-gray-600">{cohortRows[1]?.name || 'Comparison Cohort'}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* 4) FEEDBACK THEMES BY COHORT */}
      {/* ============================================ */}
      {hasPreview && primaryThemes && comparisonThemes && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Primary Cohort Themes */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-teal-500"></span>
              <h3 className="text-base font-semibold text-gray-900">{cohortRows[0]?.name}</h3>
            </div>
            
            {/* Positive Themes */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-green-700 mb-3">{audienceConfig.positiveTheme} (Positive Themes)</h4>
              <ul className="space-y-2">
                {primaryThemes.positives.slice(0, 4).map((theme: ThemeItem) => (
                  <li key={theme.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 flex-1">{theme.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelBadgeClass(theme.level, true)}`}>
                      {theme.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Negative Themes */}
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-3">{audienceConfig.negativeTheme} (Negative Themes)</h4>
              <ul className="space-y-2">
                {primaryThemes.negatives.slice(0, 3).map((theme: ThemeItem) => (
                  <li key={theme.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 flex-1">{theme.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelBadgeClass(theme.level, false)}`}>
                      {theme.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Comparison Cohort Themes */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              <h3 className="text-base font-semibold text-gray-900">{cohortRows[1]?.name}</h3>
            </div>
            
            {/* Positive Themes */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-green-700 mb-3">{audienceConfig.positiveTheme} (Positive Themes)</h4>
              <ul className="space-y-2">
                {comparisonThemes.positives.slice(0, 4).map((theme: ThemeItem) => (
                  <li key={theme.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 flex-1">{theme.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelBadgeClass(theme.level, true)}`}>
                      {theme.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Negative Themes */}
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-3">{audienceConfig.negativeTheme} (Negative Themes)</h4>
              <ul className="space-y-2">
                {comparisonThemes.negatives.slice(0, 3).map((theme: ThemeItem) => (
                  <li key={theme.id} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                    <span className="text-sm text-gray-700 flex-1">{theme.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelBadgeClass(theme.level, false)}`}>
                      {theme.level}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Empty state for themes when no preview */}
      {!hasPreview && (
        <div className="card">
          <div className="flex items-center justify-center h-32 text-center">
            <p className="text-sm text-slate-500">
              Feedback themes will appear here after you preview a cohort.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
