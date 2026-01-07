import { useState, useMemo, useEffect } from 'react';
import { Search, MessageSquare, FileText, Users, CheckSquare, Briefcase, Building2, Monitor } from 'lucide-react';
import { surveyTemplates, SURVEY_CATEGORIES, getTemplatesByAudience } from '../mocks/surveyTemplates';
import { CreateSurveyModal } from '../components/surveys/CreateSurveyModal';
import type { CreateSurveyPayload } from '../../../shared/types/models/survey.types';
import { SurveyAudience, SurveyAudienceLabels, SurveyAudienceColors } from '../../../shared/types/enums';
import { createSurveyWithSend } from '../api/client';
import { useAudienceStore } from '../stores/audienceStore';

// ============================================
// TYPES
// ============================================
interface Survey {
  id: string;
  name: string;
  targetCohort: string;
  audience: SurveyAudience;
  dateSent: string;
  responseRate: number;
  owner: string;
  status: 'Live' | 'Scheduled' | 'Draft';
}

// Audience filter options
const AUDIENCE_FILTER_OPTIONS = [
  { value: 'ALL', label: 'All', icon: null },
  { value: SurveyAudience.CANDIDATE, label: 'Candidate', icon: Users, color: 'teal' },
  { value: SurveyAudience.HIRING_MANAGER, label: 'Hiring Manager', icon: Briefcase, color: 'purple' },
  { value: SurveyAudience.WORKPLACE, label: 'Workplace', icon: Building2, color: 'amber' },
  { value: SurveyAudience.IT_SUPPORT, label: 'IT Support', icon: Monitor, color: 'blue' },
] as const;

// ============================================
// MOCK DATA
// TODO: Replace with real Survey API (GET /api/surveys)
// ============================================
const INITIAL_SURVEYS: Survey[] = [
  {
    id: 'survey-1',
    name: 'Post-interview – Engineers',
    targetCohort: 'Backend – India Q4',
    audience: SurveyAudience.CANDIDATE,
    dateSent: '24 Nov 2024',
    responseRate: 68,
    owner: 'Sarah K.',
    status: 'Live',
  },
  {
    id: 'survey-2',
    name: 'Final Round – Designers',
    targetCohort: 'Product Design – Global',
    audience: SurveyAudience.CANDIDATE,
    dateSent: '30 Nov 2024',
    responseRate: 54,
    owner: 'Hiring Ops',
    status: 'Live',
  },
  {
    id: 'survey-3',
    name: 'Post-interview – General',
    targetCohort: 'All Candidates Q4',
    audience: SurveyAudience.CANDIDATE,
    dateSent: '15 Dec 2024',
    responseRate: 0,
    owner: 'Recruiting Team',
    status: 'Scheduled',
  },
  {
    id: 'survey-4',
    name: 'Hiring Manager Feedback Q4',
    targetCohort: 'Engineering Managers',
    audience: SurveyAudience.HIRING_MANAGER,
    dateSent: '01 Dec 2024',
    responseRate: 72,
    owner: 'Recruiting Ops',
    status: 'Live',
  },
  {
    id: 'survey-5',
    name: 'Workplace Experience - Dec',
    targetCohort: 'All Employees',
    audience: SurveyAudience.WORKPLACE,
    dateSent: '10 Dec 2024',
    responseRate: 45,
    owner: 'HR Team',
    status: 'Live',
  },
  {
    id: 'survey-6',
    name: 'IT Onboarding Feedback',
    targetCohort: 'New Hires Q4',
    audience: SurveyAudience.IT_SUPPORT,
    dateSent: '05 Dec 2024',
    responseRate: 81,
    owner: 'IT Support',
    status: 'Live',
  },
];

// ============================================
// SURVEY MANAGEMENT PAGE COMPONENT
// ============================================
export default function SurveyManagement() {
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // Initialize the filter based on global audience selection
  // ============================================
  const { audience: globalAudience, setAudience: setGlobalAudience } = useAudienceStore();
  
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  // Initialize filter from global audience (unless it's CANDIDATE which defaults to showing ALL)
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<string>(
    globalAudience === SurveyAudience.CANDIDATE ? 'ALL' : globalAudience
  );
  
  // Sync filter when global audience changes (e.g., from Experience Suite)
  useEffect(() => {
    if (globalAudience !== SurveyAudience.CANDIDATE) {
      setSelectedAudienceFilter(globalAudience);
    }
  }, [globalAudience]);

  // Filtered surveys based on search and audience
  const filteredSurveys = useMemo(() => {
    let filtered = surveys;
    
    // Filter by audience
    if (selectedAudienceFilter !== 'ALL') {
      filtered = filtered.filter(s => s.audience === selectedAudienceFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(query) ||
        s.targetCohort.toLowerCase().includes(query) ||
        s.owner.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [surveys, searchQuery, selectedAudienceFilter]);

  // Filtered templates based on category
  const filteredTemplates = useMemo(() => {
    if (!surveyTemplates || !Array.isArray(surveyTemplates)) return [];
    if (selectedCategory === 'All') return surveyTemplates;
    return surveyTemplates.filter(t => t && t.category === selectedCategory);
  }, [selectedCategory]);

  // Get audience badge component
  const getAudienceBadge = (audience: SurveyAudience) => {
    const colors = SurveyAudienceColors[audience];
    const label = SurveyAudienceLabels[audience].replace(' Survey', '');
    return (
      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
        {label}
      </span>
    );
  };

  // Handle creating new survey from modal
  const handleSurveyCreated = async (payload: CreateSurveyPayload) => {
    try {
      console.log('[SurveyManagement] Creating survey with payload:', payload);

      // Call backend API
      const response = await createSurveyWithSend(payload);
      const result = response.data;

      console.log('[SurveyManagement] Survey created successfully:', result);

      // Create local survey object for UI
      const newSurvey: Survey = {
        id: result.surveyId || `survey-${Date.now()}`,
        name: payload.survey.name,
        targetCohort: payload.survey.targetCohort || 'All Candidates',
        audience: payload.survey.audience || SurveyAudience.CANDIDATE,
        dateSent: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        responseRate: 0,
        owner: 'Recruiting Team',
        status: payload.email.sendImmediately ? 'Live' : 'Scheduled',
      };

      // Update local state
      setSurveys(prev => [newSurvey, ...prev]);

      // Close modal on success
      setIsCreateModalOpen(false);

      // Show success message
      if (payload.email.sendImmediately) {
        alert(`✅ Survey sent successfully to ${result.recipientCount || payload.email.recipients.length} recipient(s)!`);
      } else {
        alert(`✅ Survey saved successfully!`);
      }
    } catch (error: any) {
      console.error('[SurveyManagement] Error creating survey:', error);
      
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create survey';
      const errorDetails = error.response?.data?.details;
      
      let fullErrorMessage = `Failed to ${payload.email.sendImmediately ? 'send' : 'save'} survey. ${errorMessage}`;
      
      if (errorDetails && Array.isArray(errorDetails)) {
        fullErrorMessage += '\n\nEmail errors:';
        errorDetails.forEach((detail: any) => {
          fullErrorMessage += `\n- ${detail.email}: ${detail.error}`;
        });
      }
      
      alert(fullErrorMessage);
      // Don't close modal on error - let user fix and retry
    }
  };

  // Get status badge class
  const getStatusBadgeClass = (status: Survey['status']) => {
    switch (status) {
      case 'Live':
        return 'bg-green-100 text-green-700';
      case 'Scheduled':
        return 'bg-blue-100 text-blue-700';
      case 'Draft':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
        Candidate Surveys & Feedback Management
      </h1>

      {/* Header: Search & Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search surveys..."
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        {/* IMPORTANT: no Link, no navigation – just onClick */}
        <button
          type="button"
          className="rounded-full bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + Create New Survey
        </button>
      </div>

      {/* Audience Filter Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 font-medium">Filter by audience:</span>
        {AUDIENCE_FILTER_OPTIONS.map((opt) => {
          const isActive = selectedAudienceFilter === opt.value;
          const Icon = opt.icon;
          return (
            <button
              key={opt.value}
              onClick={() => setSelectedAudienceFilter(opt.value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-all
                ${isActive 
                  ? opt.value === 'ALL' 
                    ? 'bg-gray-800 text-white' 
                    : `bg-${opt.color}-500 text-white`
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* ============================================ */}
          {/* LIVE & SCHEDULED SURVEYS */}
          {/* ============================================ */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Live & Scheduled Surveys</h3>
            
            {filteredSurveys.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-sm text-gray-500">No surveys found. Create your first survey to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Survey Name</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Audience</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Target Cohort</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date Sent</th>
                      <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Response Rate</th>
                      <th className="text-left py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                      <th className="text-center py-2.5 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSurveys.map((survey) => (
                      <tr key={survey.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-3">
                          <p className="text-sm text-gray-900 font-medium">{survey.name}</p>
                        </td>
                        <td className="py-3 px-3">
                          {getAudienceBadge(survey.audience)}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-700">{survey.targetCohort}</td>
                        <td className="py-3 px-3 text-sm text-gray-600">{survey.dateSent}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-sm font-medium text-primary">{survey.responseRate}%</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-700">{survey.owner}</td>
                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStatusBadgeClass(survey.status)}`}>
                            {survey.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ============================================ */}
          {/* SURVEY TEMPLATES */}
          {/* ============================================ */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-gray-900">Survey Templates</h3>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-gray-500">Category:</span>
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  selectedCategory === 'All'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {(SURVEY_CATEGORIES || []).map((cat: string) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    selectedCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template Cards */}
            <div className="space-y-3">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                      <p className="text-xs text-gray-500">
                        {template.category} • {template.questions.length} questions
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">{template.description}</p>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-3 py-1.5 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ============================================ */}
          {/* FEEDBACK QUESTION BANK */}
          {/* ============================================ */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Feedback Question Bank</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">NPS Question</p>
                  <p className="text-xs text-gray-500">Standard 0-10 recommendation scale</p>
                </div>
                <span className="text-xs text-gray-400">Used in 4 templates</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Overall Satisfaction</p>
                  <p className="text-xs text-gray-500">5-point satisfaction scale</p>
                </div>
                <span className="text-xs text-gray-400">Used in 4 templates</span>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Open Feedback</p>
                  <p className="text-xs text-gray-500">Free-text response for detailed feedback</p>
                </div>
                <span className="text-xs text-gray-400">Used in 4 templates</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================ */}
        {/* RIGHT SIDEBAR */}
        {/* ============================================ */}
        <div className="space-y-6">
          {/* Bulk Send Surveys */}
          <div className="card bg-gray-50">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-gray-900">Bulk Send Surveys</h3>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm text-gray-700">To All Candidates</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm text-gray-700">By Specific Cohort</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300" />
                <span className="text-sm text-gray-700">By Interview Stage</span>
              </label>
            </div>
            <button className="mt-4 w-full px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              Send Bulk Survey
            </button>
          </div>

          {/* Linkage */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Linkage</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckSquare className="w-3 h-3 text-green-600" />
                </div>
                <p className="text-sm text-gray-700">Feedback feeds into:</p>
              </div>
              
              <div className="pl-7 space-y-2 text-sm text-gray-600">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Dashboard NPS score and trends
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Cohort analysis and comparison
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Geographic performance map
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                  Action item recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Surveys</span>
                <span className="text-sm font-semibold text-gray-900">{surveys.filter(s => s.status === 'Live').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Scheduled</span>
                <span className="text-sm font-semibold text-gray-900">{surveys.filter(s => s.status === 'Scheduled').length}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">Avg. Response Rate</span>
                <span className="text-sm font-semibold text-primary">
                  {Math.round(surveys.filter(s => s.responseRate > 0).reduce((acc, s) => acc + s.responseRate, 0) / surveys.filter(s => s.responseRate > 0).length || 0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Survey Modal */}
      <CreateSurveyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleSurveyCreated}
      />
    </div>
  );
}
