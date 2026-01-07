import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Permission } from '../../../shared/types/enums';
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useIntegrations,
  useSaveSmartRecruitersConfig,
  useTriggerSync,
  useImports,
  useUploadImport
} from '../api/queries/admin.queries';
import {
  Users,
  Settings,
  Upload,
  Plus,
  Edit2,
  Trash2,
  Shield,
  RefreshCw,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Key,
  Link as LinkIcon
} from 'lucide-react';

type Tab = 'users' | 'integrations' | 'imports';

export default function Settings() {
  const { hasPermission } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('users');

  // Check permissions
  const canManageUsers = hasPermission(Permission.MANAGE_USERS);
  const canManageIntegrations = hasPermission(Permission.MANAGE_INTEGRATIONS);
  const canManageImports = hasPermission(Permission.MANAGE_IMPORTS);

  if (!canManageUsers && !canManageIntegrations && !canManageImports) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <Shield className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access admin settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings & Administration</h1>
        <p className="text-gray-600 mt-1">
          Manage users, integrations, and data imports
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {canManageUsers && (
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'users'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>User Management</span>
                </div>
              </button>
            )}

            {canManageIntegrations && (
              <button
                onClick={() => setActiveTab('integrations')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'integrations'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <LinkIcon className="w-5 h-5" />
                  <span>Integrations</span>
                </div>
              </button>
            )}

            {canManageImports && (
              <button
                onClick={() => setActiveTab('imports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'imports'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Bulk Imports</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && canManageUsers && <UserManagement />}
          {activeTab === 'integrations' && canManageIntegrations && <IntegrationsTab />}
          {activeTab === 'imports' && canManageImports && <ImportsTab />}
        </div>
      </div>
    </div>
  );
}

// User Management Component
function UserManagement() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const { data: usersData, isLoading } = useUsers();
  const createUserMutation = useCreateUser();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const users = usersData?.users || [];

  const handleCreateUser = async (data: any) => {
    await createUserMutation.mutateAsync(data);
    setShowCreateModal(false);
  };

  const handleUpdateUser = async (id: string, data: any) => {
    await updateUserMutation.mutateAsync({ id, data });
    setEditingUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Users</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Invite User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Role</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Last Login</th>
              <th className="text-center py-3 px-4 font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user: any) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-900">{user.name}</td>
                <td className="py-3 px-4 text-gray-600">{user.email}</td>
                <td className="text-center py-3 px-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'ANALYST' ? 'bg-blue-100 text-blue-800' :
                    user.role === 'RECRUITER' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  {user.isActive ? (
                    <span className="inline-flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm">Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Inactive</span>
                    </span>
                  )}
                </td>
                <td className="text-center py-3 px-4 text-sm text-gray-600">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                </td>
                <td className="text-center py-3 px-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition"
                      title="Edit user"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete user ${user.name}?`)) {
                          deleteUserMutation.mutate(user.id);
                        }
                      }}
                      className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
                      title="Delete user"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <UserFormModal
          title="Invite New User"
          onSubmit={handleCreateUser}
          onCancel={() => setShowCreateModal(false)}
          isLoading={createUserMutation.isPending}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <UserFormModal
          title="Edit User"
          initialData={editingUser}
          onSubmit={(data) => handleUpdateUser(editingUser.id, data)}
          onCancel={() => setEditingUser(null)}
          isLoading={updateUserMutation.isPending}
        />
      )}
    </div>
  );
}

// User Form Modal Component
function UserFormModal({ title, initialData, onSubmit, onCancel, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    role: initialData?.role || 'VIEWER',
    isActive: initialData?.isActive ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">{title}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
              disabled={!!initialData}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ADMIN">Admin</option>
              <option value="ANALYST">Analyst</option>
              <option value="RECRUITER">Recruiter</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>

          {initialData && (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active
              </label>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
            >
              {isLoading ? 'Saving...' : initialData ? 'Update User' : 'Invite User'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Integrations Tab Component
function IntegrationsTab() {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.smartrecruiters.com');

  const { data: integrationsData, isLoading } = useIntegrations();
  const saveConfigMutation = useSaveSmartRecruitersConfig();
  const triggerSyncMutation = useTriggerSync();

  const integrations = integrationsData?.integrations || [];
  const srIntegration = integrations.find((i: any) => i.provider === 'SMARTRECRUITERS');

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveConfigMutation.mutateAsync({ apiKey, baseUrl });
    setApiKey('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">SmartRecruiters Integration</h3>

      {/* Status Card */}
      {srIntegration && (
        <div className={`p-4 rounded-lg border-2 ${
          srIntegration.isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Status</p>
              <p className={`text-sm mt-1 ${srIntegration.isActive ? 'text-green-600' : 'text-gray-600'}`}>
                {srIntegration.isActive ? 'Active' : 'Inactive'}
              </p>
            </div>
            {srIntegration.lastSyncAt && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Last Sync</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(srIntegration.lastSyncAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {srIntegration.isActive && (
            <button
              onClick={() => triggerSyncMutation.mutate()}
              disabled={triggerSyncMutation.isPending}
              className="mt-4 flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${triggerSyncMutation.isPending ? 'animate-spin' : ''}`} />
              <span>{triggerSyncMutation.isPending ? 'Syncing...' : 'Trigger Manual Sync'}</span>
            </button>
          )}
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSaveConfig} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4" />
              <span>API Key</span>
            </div>
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your SmartRecruiters API key"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Your API key will be encrypted before storing
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Base URL
          </label>
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          disabled={saveConfigMutation.isPending}
          className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
        >
          {saveConfigMutation.isPending ? 'Saving...' : 'Save Configuration'}
        </button>
      </form>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">How it works</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Configure your SmartRecruiters API credentials above</li>
          <li>Automatic sync runs every 15 minutes to fetch candidates and jobs</li>
          <li>You can trigger manual sync anytime using the button above</li>
          <li>Synced data is used to automatically send surveys to candidates</li>
        </ul>
      </div>
    </div>
  );
}

// Imports Tab Component
function ImportsTab() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState('CANDIDATES');

  const { data: importsData, isLoading } = useImports();
  const uploadMutation = useUploadImport();

  const imports = importsData?.imports || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    await uploadMutation.mutateAsync({ file: selectedFile, importType });
    setSelectedFile(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Bulk Data Import</h3>

      {/* Upload Section */}
      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Upload File</h4>
          <p className="text-sm text-gray-600 mb-4">
            Supports CSV, XLS, and XLSX files
          </p>

          <div className="max-w-md mx-auto space-y-4">
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CANDIDATES">Candidates</option>
              <option value="SURVEY_RESPONSES">Survey Responses</option>
              <option value="COHORTS">Cohort Definitions</option>
            </select>

            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              onChange={handleFileSelect}
              className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />

            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-900">{selectedFile.name}</span>
                </div>
                <button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-medium rounded transition"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Import History */}
      <div>
        <h4 className="font-medium text-gray-900 mb-4">Import History</h4>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">File Name</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Type</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Rows</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Errors</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {imports.map((imp: any) => (
                <tr key={imp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{imp.fileName}</td>
                  <td className="text-center py-3 px-4">
                    <span className="text-sm text-gray-600">{imp.importType}</span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      imp.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      imp.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      imp.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {imp.status}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">
                    {imp.successRows}/{imp.totalRows}
                  </td>
                  <td className="text-center py-3 px-4">
                    {imp.errorCount > 0 ? (
                      <span className="text-red-600 font-medium">{imp.errorCount}</span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="text-center py-3 px-4 text-sm text-gray-600">
                    {new Date(imp.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
