import React, { useState } from 'react';
import {
  useActions,
  useActionsThemes,
  useActionsHistory,
  useCreateAction,
  useUpdateAction,
  useDeleteAction
} from '../api/queries/actions.queries';
import {
  Plus,
  Edit,
  Trash2,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Filter
} from 'lucide-react';

export default function Actions() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAction, setEditingAction] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const { data: actionsData, isLoading: actionsLoading } = useActions({
    status: statusFilter || undefined,
    priority: priorityFilter || undefined
  });
  const { data: themesData } = useActionsThemes();
  const { data: historyData } = useActionsHistory(10);

  const createMutation = useCreateAction();
  const updateMutation = useUpdateAction();
  const deleteMutation = useDeleteAction();

  const actions = actionsData?.actions || [];
  const themes = themesData || { positive: [], negative: [] };
  const history = historyData?.history || [];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assignedTo: '',
    dueDate: '',
    themeId: ''
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync(formData);
    setShowCreateModal(false);
    setFormData({ title: '', description: '', priority: 'MEDIUM', assignedTo: '', dueDate: '', themeId: '' });
  };

  const handleUpdate = async (id: string, data: any) => {
    await updateMutation.mutateAsync({ id, data });
    setEditingAction(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this action?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (actionsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900">Actions Management</h1>
          <p className="text-gray-600 mt-1">
            Track and manage action items from feedback insights
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Action</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="URGENT">Urgent</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        {(statusFilter || priorityFilter) && (
          <button
            onClick={() => { setStatusFilter(''); setPriorityFilter(''); }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Feedback Themes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Positive Themes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <ThumbsUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">Positive Feedback Themes</h3>
          </div>
          <div className="space-y-2">
            {themes.positive?.slice(0, 5).map((theme: any) => (
              <div key={theme.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <p className="font-medium text-gray-900">{theme.theme}</p>
                  <p className="text-sm text-gray-600">{theme.category}</p>
                </div>
                <span className="text-sm font-semibold text-green-600">{theme.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Negative Themes */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center space-x-2 mb-4">
            <ThumbsDown className="w-5 h-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Negative Feedback Themes</h3>
          </div>
          <div className="space-y-2">
            {themes.negative?.slice(0, 5).map((theme: any) => (
              <div key={theme.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <p className="font-medium text-gray-900">{theme.theme}</p>
                  <p className="text-sm text-gray-600">{theme.category}</p>
                </div>
                <span className="text-sm font-semibold text-red-600">{theme.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Action Items</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Title</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Priority</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Assigned To</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Due Date</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((action: any) => (
                <tr key={action.id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-gray-900">{action.title}</p>
                      {action.description && (
                        <p className="text-sm text-gray-600 mt-1">{action.description}</p>
                      )}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${getPriorityColor(action.priority)}`}>
                      {action.priority === 'URGENT' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {action.priority}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(action.status)}`}>
                      {action.status}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {action.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {action.dueDate ? new Date(action.dueDate).toLocaleDateString() : '-'}
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      {action.status !== 'COMPLETED' && (
                        <button
                          onClick={() => handleUpdate(action.id, { status: 'COMPLETED' })}
                          className="p-1.5 text-gray-600 hover:text-green-600 transition"
                          title="Mark as completed"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setEditingAction(action)}
                        className="p-1.5 text-gray-600 hover:text-indigo-600 transition"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(action.id)}
                        className="p-1.5 text-gray-600 hover:text-red-600 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {actions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No actions found. Create your first action item above.
            </div>
          )}
        </div>
      </div>

      {/* History Log */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Changes</h3>
        <div className="space-y-3">
          {history.map((item: any, idx: number) => (
            <div key={idx} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-600">
                  <span>Status: {item.status}</span>
                  <span>Updated: {new Date(item.updatedAt).toLocaleString()}</span>
                  {item.updatedBy && <span>By: {item.updatedBy}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingAction) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingAction ? 'Edit Action' : 'Create New Action'}
            </h3>
            
            <form onSubmit={editingAction ? (e) => { e.preventDefault(); handleUpdate(editingAction.id, formData); } : handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  placeholder="Email or name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : editingAction ? 'Update Action' : 'Create Action'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setEditingAction(null); }}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

