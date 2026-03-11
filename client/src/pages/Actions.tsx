import { useState, useMemo } from 'react';
import { Plus, Search, X, Clock, CheckCircle2, Circle, AlertCircle, Users, Briefcase, Building2, Monitor } from 'lucide-react';
import { SurveyAudience } from '../../../shared/types/enums';
import { useAudienceStore } from '../stores/audienceStore';

// ============================================
// TYPES
// ============================================
type ActionStatus = 'Open' | 'In Progress' | 'Done';

interface ActionItem {
  id: string;
  title: string;
  description?: string;
  sourceInsight: string;
  owner: string;
  dueDate?: string;
  status: ActionStatus;
  createdAt: string;
  createdBy: string;
  audience: SurveyAudience;
  location?: string;
  department?: string;
}

// AUDIENCE-SPECIFIC ACTIONS CONFIG - distinct labels per audience to avoid confusion
const AUDIENCE_CONFIG = {
  [SurveyAudience.CANDIDATE]: {
    label: 'Candidate', icon: Users,
    title: 'Actions from Candidate Feedback',
    subtitle: 'Improve interview experience based on candidate NPS',
    emptyState: 'No actions created from candidate feedback yet',
    badgeClass: 'bg-teal-100 text-teal-700',
  },
  [SurveyAudience.HIRING_MANAGER]: {
    label: 'Hiring Manager', icon: Briefcase,
    title: 'Actions from Hiring Manager Feedback',
    subtitle: 'Improve TA support based on hiring manager satisfaction (Q1-Q7)',
    emptyState: 'No actions created from hiring manager feedback yet',
    badgeClass: 'bg-purple-100 text-purple-700',
    // ─────────────────────────────────────────────────────────────────────────
    // ACTIONS SOURCE INSIGHTS (Q1-Q7 metrics)
    // Q1 – Hiring Manager NPS | Q2 – Candidate Quality | Q3 – Role Fit
    // Q4 – Process Speed | Q5 – Scheduling | Q6 – Communication & Partnership
    // Q7 – Market Guidance | Q8-Q10 – Open text themes
    // ─────────────────────────────────────────────────────────────────────────
    sourceInsightOptions: [
      'Hiring Manager NPS',               // Q1
      'Candidate Quality Satisfaction',   // Q2
      'Role Fit Alignment',               // Q3
      'Process Speed Satisfaction',       // Q4
      'Scheduling & Coordination',        // Q5
      'Communication & Partnership',      // Q6
      'Market Guidance',                  // Q7
      'HM Open Feedback Themes',          // Q8-Q10
    ],
  },
  [SurveyAudience.WORKPLACE]: {
    label: 'Workplace', icon: Building2,
    title: 'Actions from Workplace Feedback',
    subtitle: 'Improve employee experience based on workplace surveys',
    emptyState: 'No actions created from workplace feedback yet',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  [SurveyAudience.IT_SUPPORT]: {
    label: 'IT Support', icon: Monitor,
    title: 'Actions from IT Support Feedback',
    subtitle: 'Improve IT onboarding and support based on feedback',
    emptyState: 'No actions created from IT support feedback yet',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
};

interface HistoryEntry {
  id: string;
  timestamp: string;
  actionId: string;
  actionTitle: string;
  event: string;
  performedBy: string;
}

// ============================================
// ============================================
// INITIAL DATA (empty — actions come from API)
// ============================================
const INITIAL_ACTIONS: ActionItem[] = [];

const INITIAL_HISTORY: HistoryEntry[] = [];

const SOURCE_INSIGHT_OPTIONS = [
  'NPS Trend',
  'Cohort Comparison',
  'Geographic Insights',
  'Candidate Themes',
];

const STATUS_OPTIONS: ActionStatus[] = ['Open', 'In Progress', 'Done'];

// Positive and Negative themes mock data
const POSITIVE_THEMES = [
  { name: 'Structured Interview Process', count: 245 },
  { name: 'Fast Communication', count: 198 },
  { name: 'Friendly Recruiters', count: 176 },
  { name: 'Clear Job Descriptions', count: 142 },
];

const NEGATIVE_THEMES = [
  { name: 'Long Wait Between Rounds', count: 312 },
  { name: 'Unclear Job Requirements', count: 187 },
  { name: 'Lack of Feedback After Rejection', count: 156 },
  { name: 'Generic Rejection Emails', count: 134 },
];

// ============================================
// HELPER FUNCTIONS
// ============================================
const generateId = () => `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateHistoryId = () => `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return then.toLocaleDateString();
};

const getStatusBadgeClass = (status: ActionStatus): string => {
  switch (status) {
    case 'Open':
      return 'bg-teal-100 text-teal-700';
    case 'In Progress':
      return 'bg-amber-100 text-amber-700';
    case 'Done':
      return 'bg-slate-100 text-slate-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

const getStatusIcon = (status: ActionStatus) => {
  switch (status) {
    case 'Open':
      return <Circle className="w-3.5 h-3.5" />;
    case 'In Progress':
      return <Clock className="w-3.5 h-3.5" />;
    case 'Done':
      return <CheckCircle2 className="w-3.5 h-3.5" />;
    default:
      return null;
  }
};

// ============================================
// ACTION FORM MODAL COMPONENT
// ============================================
interface ActionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (action: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => void;
  editingAction?: ActionItem | null;
}

function ActionFormModal({ isOpen, onClose, onSave, editingAction }: ActionFormModalProps) {
  const [title, setTitle] = useState(editingAction?.title || '');
  const [description, setDescription] = useState(editingAction?.description || '');
  const [sourceInsight, setSourceInsight] = useState(editingAction?.sourceInsight || SOURCE_INSIGHT_OPTIONS[0]);
  const [owner, setOwner] = useState(editingAction?.owner || '');
  const [dueDate, setDueDate] = useState(editingAction?.dueDate || '');
  const [status, setStatus] = useState<ActionStatus>(editingAction?.status || 'Open');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes or editing action changes
  useState(() => {
    if (editingAction) {
      setTitle(editingAction.title);
      setDescription(editingAction.description || '');
      setSourceInsight(editingAction.sourceInsight);
      setOwner(editingAction.owner);
      setDueDate(editingAction.dueDate || '');
      setStatus(editingAction.status);
    } else {
      setTitle('');
      setDescription('');
      setSourceInsight(SOURCE_INSIGHT_OPTIONS[0]);
      setOwner('');
      setDueDate('');
      setStatus('Open');
    }
    setError('');
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Action title is required');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      sourceInsight,
      owner: owner.trim() || 'Unassigned',
      dueDate: dueDate || undefined,
      status,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSourceInsight(SOURCE_INSIGHT_OPTIONS[0]);
    setOwner('');
    setDueDate('');
    setStatus('Open');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingAction ? 'Edit Action' : 'Create New Action'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Action Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g., Reduce interview wait times"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                error ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this action..."
              rows={3}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
            />
          </div>

          {/* Source Insight & Owner */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Source Insight
              </label>
              <select
                value={sourceInsight}
                onChange={(e) => setSourceInsight(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                {SOURCE_INSIGHT_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Owner
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., Recruiting Ops"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
          </div>

          {/* Due Date & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ActionStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {editingAction ? 'Save Changes' : 'Save Action'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ACTIONS PAGE COMPONENT
// ============================================
export default function Actions() {
  // State
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);
  const [history, setHistory] = useState<HistoryEntry[]>(INITIAL_HISTORY);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState<ActionItem | null>(null);
  
  // ============================================
  // GLOBAL AUDIENCE STATE (from Zustand store)
  // The selected audience persists across all pages
  // ============================================
  const { audience: selectedAudience, setAudience: setSelectedAudience } = useAudienceStore();

  // Get current audience config
  const audienceConfig = AUDIENCE_CONFIG[selectedAudience];

  // Filtered actions based on audience and search
  const filteredActions = useMemo(() => {
    // First filter by audience
    let filtered = actions.filter(action => action.audience === selectedAudience);
    
    // Then filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(action => 
        action.title.toLowerCase().includes(query) ||
        action.sourceInsight.toLowerCase().includes(query) ||
        action.owner.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [actions, searchQuery, selectedAudience]);

  // Sorted history (most recent first)
  const sortedHistory = useMemo(() => {
    return [...history].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [history]);

  // Handle creating new action
  const handleCreateAction = (actionData: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => {
    const newAction: ActionItem = {
      ...actionData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      createdBy: 'Ashwin', // TODO: Replace with actual user
    };

    // TODO: Replace with API call to POST /api/actions
    setActions(prev => [newAction, ...prev]);

    // Add history entry
    const historyEntry: HistoryEntry = {
      id: generateHistoryId(),
      timestamp: new Date().toISOString(),
      actionId: newAction.id,
      actionTitle: newAction.title,
      event: 'Created',
      performedBy: 'Ashwin',
    };
    setHistory(prev => [historyEntry, ...prev]);

    setIsModalOpen(false);
    setEditingAction(null);
  };

  // Handle updating existing action
  const handleUpdateAction = (actionData: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => {
    if (!editingAction) return;

    const statusChanged = editingAction.status !== actionData.status;

    // TODO: Replace with API call to PUT /api/actions/:id
    setActions(prev => prev.map(action => 
      action.id === editingAction.id
        ? { ...action, ...actionData }
        : action
    ));

    // Add history entry if status changed
    if (statusChanged) {
      const historyEntry: HistoryEntry = {
        id: generateHistoryId(),
        timestamp: new Date().toISOString(),
        actionId: editingAction.id,
        actionTitle: actionData.title,
        event: `Status updated to ${actionData.status}`,
        performedBy: 'Ashwin',
      };
      setHistory(prev => [historyEntry, ...prev]);
    }

    setIsModalOpen(false);
    setEditingAction(null);
  };

  // Handle row click to edit
  const handleRowClick = (action: ActionItem) => {
    setEditingAction(action);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAction(null);
  };

  // Handle save (create or update)
  const handleSave = (actionData: Omit<ActionItem, 'id' | 'createdAt' | 'createdBy'>) => {
    if (editingAction) {
      handleUpdateAction(actionData);
    } else {
      handleCreateAction(actionData);
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
          Showing actions for <span className="font-medium text-gray-700">{audienceConfig.label}</span> feedback
        </p>
      </div>

      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
        {audienceConfig.title}
      </h1>
      <p className="text-sm text-gray-500 mt-1">{audienceConfig.subtitle}</p>

      {/* Header: Search & Create Button */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actions or themes"
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-72 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <button 
          onClick={() => { setEditingAction(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Action
        </button>
      </div>

      {/* ============================================ */}
      {/* FEEDBACK THEMES */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Themes */}
        <div className="card bg-green-50/50 border border-green-200">
          <h3 className="text-base font-semibold text-green-900 mb-1">Top Candidate Love Feedback Themes</h3>
          <p className="text-xs text-green-700 mb-4">What Candidates Love (Positive Themes)</p>
          <ul className="space-y-2">
            {POSITIVE_THEMES.map((theme, idx) => (
              <li key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-green-100">
                <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-gray-800 flex-1">{theme.name}</span>
                <span className="text-xs text-green-600 font-medium">{theme.count} mentions</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Negative Themes */}
        <div className="card bg-red-50/50 border border-red-200">
          <h3 className="text-base font-semibold text-red-900 mb-1">Top Candidate Dislike Themes</h3>
          <p className="text-xs text-red-700 mb-4">What Candidates Dislike (Negative Themes)</p>
          <ul className="space-y-2">
            {NEGATIVE_THEMES.map((theme, idx) => (
              <li key={idx} className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-red-100">
                <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                <span className="text-sm text-gray-800 flex-1">{theme.name}</span>
                <span className="text-xs text-red-600 font-medium">{theme.count} mentions</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ============================================ */}
      {/* ACTION ITEMS TABLE */}
      {/* ============================================ */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Action Items</h3>
        
        {actions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500">
              No actions yet. Click <span className="font-medium text-primary">"Create New Action"</span> to add your first improvement item.
            </p>
          </div>
        ) : filteredActions.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">No actions match your search.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Action Item</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Source Insight</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Owner</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Due Date</th>
                  <th className="text-left py-2.5 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredActions.map((action) => (
                  <tr 
                    key={action.id} 
                    onClick={() => handleRowClick(action)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <p className="text-sm text-gray-900 font-medium">{action.title}</p>
                      {action.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{action.description}</p>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded">
                        {action.sourceInsight}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{action.owner}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {action.dueDate ? new Date(action.dueDate).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      }) : '—'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(action.status)}`}>
                        {getStatusIcon(action.status)}
                        {action.status}
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
      {/* HISTORY LOG */}
      {/* ============================================ */}
      <div className="card">
        <h3 className="text-base font-semibold text-gray-900 mb-4">History Log</h3>
        
        {history.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-gray-500">No activity yet. New actions and updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedHistory.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{entry.event}</span>
                    <span className="text-gray-400 mx-2">—</span>
                    <span className="text-gray-600">{entry.actionTitle}</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">by {entry.performedBy}</p>
                </div>
                <span className="text-xs text-gray-400 flex-shrink-0">
                  {getTimeAgo(entry.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Form Modal */}
      <ActionFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        editingAction={editingAction}
      />
    </div>
  );
}
