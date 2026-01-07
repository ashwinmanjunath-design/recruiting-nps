import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Send,
  Calendar,
  Users,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

// Placeholder - Replace with actual API hooks
const useSurveys = () => ({ data: { surveys: [] }, isLoading: false });
const useTemplates = () => ({ data: { templates: [] }, isLoading: false });

export default function SurveyManagement() {
  const [activeTab, setActiveTab] = useState<'active' | 'scheduled' | 'templates'>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: surveysData, isLoading: surveysLoading } = useSurveys();
  const { data: templatesData, isLoading: templatesLoading } = useTemplates();

  const surveys = surveysData?.surveys || [];
  const templates = templatesData?.templates || [];

  // Mock data for demonstration
  const mockActiveSurveys = [
    {
      id: '1',
      name: 'Post-Interview NPS Survey',
      template: 'Post-Interview Feedback',
      status: 'ACTIVE',
      totalSent: 245,
      responses: 187,
      responseRate: 76,
      avgNPS: 42,
      lastSent: '2025-11-29T10:30:00',
    },
    {
      id: '2',
      name: 'Onboarding Experience Survey',
      template: 'Onboarding Feedback',
      status: 'ACTIVE',
      totalSent: 89,
      responses: 67,
      responseRate: 75,
      avgNPS: 58,
      lastSent: '2025-11-28T14:20:00',
    },
  ];

  const mockScheduledSurveys = [
    {
      id: '3',
      name: 'Q1 2025 Interview Process Review',
      template: 'Quarterly Review',
      scheduledFor: '2025-12-01T09:00:00',
      targetCandidates: 150,
      status: 'SCHEDULED',
    },
  ];

  const mockTemplates = [
    {
      id: 't1',
      name: 'Post-Interview NPS',
      description: 'Standard post-interview candidate feedback survey',
      questions: 8,
      avgCompletionTime: 4,
      lastUsed: '2025-11-29',
      timesUsed: 245,
    },
    {
      id: 't2',
      name: 'Onboarding Feedback',
      description: 'New hire onboarding experience survey',
      questions: 10,
      avgCompletionTime: 5,
      lastUsed: '2025-11-28',
      timesUsed: 89,
    },
    {
      id: 't3',
      name: 'Quarterly Review',
      description: 'Comprehensive quarterly interview process assessment',
      questions: 15,
      avgCompletionTime: 8,
      lastUsed: '2025-10-15',
      timesUsed: 12,
    },
  ];

  if (surveysLoading || templatesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Management</h1>
          <p className="text-gray-600 mt-1">
            Create, schedule, and manage candidate feedback surveys
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          <span>Create Survey</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Surveys Sent</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">334</p>
            </div>
            <div className="p-3 rounded-full bg-blue-100">
              <Send className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">This month</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">254</p>
            </div>
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-green-600 mt-4 font-medium">76% response rate</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Surveys</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">2</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Currently running</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">1</p>
            </div>
            <div className="p-3 rounded-full bg-orange-100">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4">Coming soon</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('active')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'active'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Active Surveys
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'scheduled'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Scheduled
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'templates'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Templates
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Active Surveys Tab */}
          {activeTab === 'active' && (
            <div className="space-y-4">
              {mockActiveSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {survey.name}
                        </h3>
                        <span className="px-2.5 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          {survey.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Template: {survey.template}
                      </p>

                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Total Sent</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {survey.totalSent}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Responses</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">
                            {survey.responses}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Response Rate</p>
                          <p className="text-lg font-bold text-green-600 mt-1">
                            {survey.responseRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Avg NPS</p>
                          <p className="text-lg font-bold text-indigo-600 mt-1">
                            {survey.avgNPS}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 mt-4 text-xs text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>
                          Last sent: {new Date(survey.lastSent).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                        title="Edit survey"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete survey"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Scheduled Surveys Tab */}
          {activeTab === 'scheduled' && (
            <div className="space-y-4">
              {mockScheduledSurveys.map((survey) => (
                <div
                  key={survey.id}
                  className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {survey.name}
                        </h3>
                        <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          {survey.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">
                        Template: {survey.template}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Scheduled For</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {new Date(survey.scheduledFor).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Target Candidates</p>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {survey.targetCandidates}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                        title="Edit survey"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Cancel survey"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-gray-600">
                  {mockTemplates.length} templates available
                </p>
                <button className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-medium rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New Template</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockTemplates.map((template) => (
                  <div
                    key={template.id}
                    className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {template.description}
                        </p>
                      </div>
                      <div className="p-2 bg-indigo-100 rounded-lg">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Questions</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {template.questions}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Avg Completion</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {template.avgCompletionTime} min
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span>Used {template.timesUsed} times</span>
                      <span>Last used: {template.lastUsed}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                        Use Template
                      </button>
                      <button className="p-2 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Survey Modal (Placeholder) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Create New Survey
            </h3>
            <p className="text-gray-600 mb-6">
              Survey creation form will be implemented here
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

