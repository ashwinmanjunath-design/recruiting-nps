import { useState, useMemo, useEffect } from 'react';
import { Search, MessageSquare, FileText, Users, CheckSquare, Briefcase, Building2, Monitor } from 'lucide-react';
import { surveyTemplates, SURVEY_CATEGORIES } from '../mocks/surveyTemplates';
import { CreateSurveyModal } from '../components/surveys/CreateSurveyModal';
import type { CreateSurveyPayload } from '../../../shared/types/models/survey.types';
import { SurveyAudience, SurveyAudienceLabels, SurveyAudienceColors } from '../../../shared/types/enums';
import {
  createSurveyWithSend,
  createSurveyTemplate,
  getQuestionBank,
  getSurveyTemplates,
  sendSurveyEmails,
  saveQuestionBankQuestions,
} from '../api/client';
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

type BuilderQuestionType = 'NPS' | 'TEXT' | 'RATING' | 'MULTIPLE_CHOICE';

interface QuestionBankItem {
  id: string;
  question: string;
  type: BuilderQuestionType;
  required: boolean;
  source: 'existing' | 'draft';
}

interface SavedSurveyTemplate {
  id: string;
  name: string;
  description?: string;
  questionCount: number;
  usageCount: number;
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
// INITIAL DATA (empty — surveys come from API)
// ============================================
const INITIAL_SURVEYS: Survey[] = [];

// ============================================
// SURVEY MANAGEMENT PAGE COMPONENT
// ============================================
export default function SurveyManagement() {
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // Initialize the filter based on global audience selection
  // ============================================
  const { audience: globalAudience } = useAudienceStore();
  
  const [surveys, setSurveys] = useState<Survey[]>(INITIAL_SURVEYS);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<BuilderQuestionType>('TEXT');
  const [newQuestionRequired, setNewQuestionRequired] = useState(true);
  const [questionPool, setQuestionPool] = useState<QuestionBankItem[]>([]);
  const [existingQuestionBank, setExistingQuestionBank] = useState<QuestionBankItem[]>([]);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [savedSurveyTemplates, setSavedSurveyTemplates] = useState<SavedSurveyTemplate[]>([]);
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

  const allQuestions = useMemo(
    () => [...existingQuestionBank, ...questionPool],
    [existingQuestionBank, questionPool]
  );

  const mapQuestionTypeFromBackend = (typeKey: string): BuilderQuestionType => {
    if (typeKey === 'NPS_SCALE') return 'NPS';
    if (typeKey === 'RATING') return 'RATING';
    if (typeKey === 'MULTIPLE_CHOICE') return 'MULTIPLE_CHOICE';
    return 'TEXT';
  };

  const loadQuestionBank = async () => {
    try {
      const response = await getQuestionBank();
      const grouped = response?.data?.questionBank || {};
      const mapped: QuestionBankItem[] = [];

      Object.entries(grouped).forEach(([typeKey, list]) => {
        if (!Array.isArray(list)) return;

        list.forEach((item: any) => {
          mapped.push({
            id: item.id || `existing-${Math.random().toString(36).slice(2, 10)}`,
            question: item.question,
            type: mapQuestionTypeFromBackend(typeKey),
            required: item.required ?? true,
            source: 'existing',
          });
        });
      });

      setExistingQuestionBank(mapped);
    } catch (error) {
      console.warn('[SurveyManagement] Could not load question bank from backend');
    }
  };

  const loadSavedSurveys = async () => {
    try {
      const response = await getSurveyTemplates();
      const templates = response?.data?.templates || [];
      setSavedSurveyTemplates(
        templates.filter((t: any) => t.name !== '__QUESTION_BANK_LIBRARY__')
      );
    } catch (error) {
      console.warn('[SurveyManagement] Could not load saved surveys');
    }
  };

  useEffect(() => {
    loadQuestionBank();
    loadSavedSurveys();
  }, []);

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

  const addQuestionToPool = () => {
    const questionText = newQuestionText.trim();
    if (!questionText) {
      alert('Please enter a question before adding.');
      return;
    }

    const newQuestion: QuestionBankItem = {
      id: `draft-${Date.now()}`,
      question: questionText,
      type: newQuestionType,
      required: newQuestionRequired,
      source: 'draft',
    };

    setQuestionPool((prev) => [newQuestion, ...prev]);
    setSelectedQuestionIds((prev) => [newQuestion.id, ...prev]);
    setNewQuestionText('');
  };

  const removeQuestionFromPool = (id: string) => {
    setQuestionPool((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionIds((prev) => prev.filter((qId) => qId !== id));
  };

  const toggleQuestionSelection = (id: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((qId) => qId !== id) : [...prev, id]
    );
  };

  const handleSaveSelectedQuestionsToBank = async () => {
    const draftSelected = allQuestions
      .filter((q) => selectedQuestionIds.includes(q.id) && q.source === 'draft');

    if (draftSelected.length === 0) {
      alert('Select at least one draft question to save to question bank.');
      return;
    }

    try {
      const payload = {
        questions: draftSelected.map((q) => ({
          type: q.type,
          question: q.question,
          required: q.required,
        })),
      };

      const response = await saveQuestionBankQuestions(payload);
      const savedCount = response?.data?.savedCount ?? draftSelected.length;

      alert(`✅ Saved ${savedCount} question(s) to question bank.`);

      await loadQuestionBank();
      setQuestionPool((prev) => prev.filter((q) => !selectedQuestionIds.includes(q.id)));
      setSelectedQuestionIds((prev) =>
        prev.filter((id) => !draftSelected.some((q) => q.id === id))
      );
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to save questions';
      alert(`❌ ${message}`);
    }
  };

  const handleCreateSurveyFromSelected = async () => {
    const selectedQuestions = allQuestions.filter((q) => selectedQuestionIds.includes(q.id));

    if (!templateName.trim()) {
      alert('Please enter a survey name.');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Please select at least one question for the survey.');
      return;
    }

    try {
      const payload = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        audience: SurveyAudience.CANDIDATE,
        questions: selectedQuestions.map((q) => ({
          type: q.type,
          question: q.question,
          required: q.required,
        })),
      };

      await createSurveyTemplate(payload);

      alert(`✅ Survey "${templateName.trim()}" created with ${selectedQuestions.length} question(s).`);

      await loadQuestionBank();
      await loadSavedSurveys();

      // Reset builder
      setTemplateName('');
      setTemplateDescription('');
      setQuestionPool([]);
      setSelectedQuestionIds([]);
    } catch (error: any) {
      const message = error?.response?.data?.error || error?.message || 'Failed to create survey';
      alert(`❌ ${message}`);
    }
  };

  const handleSendSavedSurvey = async (template: SavedSurveyTemplate) => {
    const recipientsInput = window.prompt(
      `Enter recipient email(s) for "${template.name}"\nUse comma-separated values:`,
      ''
    );

    if (!recipientsInput) return;

    const recipients = recipientsInput
      .split(',')
      .map((email) => email.trim())
      .filter(Boolean);

    if (recipients.length === 0) {
      alert('Please enter at least one recipient email.');
      return;
    }

    const fromEmail =
      window.prompt('From email address:', 'noreply@company.com')?.trim() || '';

    if (!fromEmail) {
      alert('From email is required.');
      return;
    }

    try {
      const response = await sendSurveyEmails({
        templateId: template.id,
        surveyName: template.name,
        recipients,
        fromEmail,
        sendImmediately: true,
      });

      alert(`✅ Sent "${template.name}" to ${response?.data?.sentTo ?? recipients.length} recipient(s).`);
    } catch (error: any) {
      const baseMessage =
        error?.response?.data?.message || error?.response?.data?.error || error?.message;
      const detailedErrors = error?.response?.data?.errors;

      if (Array.isArray(detailedErrors) && detailedErrors.length > 0) {
        const formatted = detailedErrors
          .map((e: any) => `- ${e.email}: ${e.error}`)
          .join('\n');
        alert(`❌ Failed to send survey: ${baseMessage || 'Unknown error'}\n\n${formatted}`);
      } else {
        alert(`❌ Failed to send survey: ${baseMessage || 'Unknown error'}`);
      }
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
            <div className="space-y-4">
              {/* Add question to pool */}
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
                <p className="text-sm font-medium text-gray-900">1) Add Questions To Pool</p>
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="Type your survey question"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as BuilderQuestionType)}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NPS">NPS</option>
                    <option value="RATING">Rating</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={newQuestionRequired}
                      onChange={(e) => setNewQuestionRequired(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    Required
                  </label>
                  <button
                    type="button"
                    onClick={addQuestionToPool}
                    className="px-3 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Add Question
                  </button>
                </div>
              </div>

              {/* Review and select all questions */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-900">
                  2) Review All Questions Together ({allQuestions.length})
                </p>
                {allQuestions.length === 0 ? (
                  <p className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg p-4">
                    No questions added yet. Add questions above or load existing ones from backend.
                  </p>
                ) : (
                  allQuestions.map((question) => (
                    <div key={question.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(question.id)}
                        onChange={() => toggleQuestionSelection(question.id)}
                        className="w-4 h-4 rounded border-gray-300"
                      />
                      <div className="w-9 h-9 bg-teal-100 rounded-lg flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-teal-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{question.question}</p>
                        <p className="text-xs text-gray-500">
                          {question.type} • {question.required ? 'Required' : 'Optional'} • {question.source === 'draft' ? 'Draft' : 'Existing'}
                        </p>
                      </div>
                      {question.source === 'draft' && (
                        <button
                          type="button"
                          onClick={() => removeQuestionFromPool(question.id)}
                          className="text-xs px-2 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Save questions and create survey */}
              <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
                <p className="text-sm font-medium text-gray-900">
                  3) Save Questions And Create Survey ({selectedQuestionIds.length} selected)
                </p>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Survey name (e.g., Post-Interview Core)"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Optional template description"
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleSaveSelectedQuestionsToBank}
                    className="px-4 py-2 text-sm font-medium border border-teal-500 text-teal-700 rounded-lg hover:bg-teal-50"
                  >
                    Save Selected Questions
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateSurveyFromSelected}
                    className="px-4 py-2 text-sm font-medium bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                  >
                    Create Survey
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================ */}
          {/* SAVED SURVEYS */}
          {/* ============================================ */}
          <div className="card">
            <h3 className="text-base font-semibold text-gray-900 mb-4">Saved Surveys ({savedSurveyTemplates.length})</h3>
            {savedSurveyTemplates.length === 0 ? (
              <p className="text-sm text-gray-500">No saved surveys yet. Create one from selected questions above.</p>
            ) : (
              <div className="space-y-2">
                {savedSurveyTemplates.map((template) => (
                  <div key={template.id} className="border border-gray-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500">
                      {template.questionCount} questions • used {template.usageCount} times
                    </p>
                    {template.description && (
                      <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSendSavedSurvey(template)}
                      className="mt-2 px-3 py-1.5 text-xs font-medium bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                    >
                      Send Survey
                    </button>
                  </div>
                ))}
              </div>
            )}
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
