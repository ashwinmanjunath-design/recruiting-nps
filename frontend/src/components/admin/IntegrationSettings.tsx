import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../api/client';
import { RefreshCw, CheckCircle, XCircle, Settings, Loader2, AlertCircle } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

export default function IntegrationSettings() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Fetch integrations
  const { data: integrationsData, isLoading } = useQuery({
    queryKey: ['admin', 'integrations'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/integrations');
      return response.data;
    },
  });

  // Configure SmartRecruiters mutation
  const configureMutation = useMutation({
    mutationFn: async (data: { apiKey: string; baseUrl: string }) => {
      const response = await apiClient.post('/admin/integrations/smartrecruiters', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations'] });
      setShowConfigModal(false);
      addToast({ type: 'success', message: 'SmartRecruiters configured successfully' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to configure integration',
      });
    },
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/integrations/smartrecruiters/sync');
      return response.data;
    },
    onSuccess: () => {
      addToast({ type: 'success', message: 'Sync started successfully' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to trigger sync',
      });
    },
  });

  const integrations = integrationsData?.integrations || [];
  const smartRecruiters = integrations.find((i: any) => i.provider === 'SMARTRECRUITERS');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Integrations</h2>
        <p className="text-sm text-gray-600 mt-1">
          Connect with external systems to sync candidate data
        </p>
      </div>

      {/* SmartRecruiters Integration Card */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <img
                  src="https://logo.clearbit.com/smartrecruiters.com"
                  alt="SmartRecruiters"
                  className="w-10 h-10"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=SR';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">SmartRecruiters</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Sync candidates, jobs, and interview data from SmartRecruiters ATS
                </p>
                <div className="flex items-center space-x-4 mt-3">
                  {smartRecruiters?.isActive ? (
                    <span className="inline-flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-gray-500 text-sm font-medium">
                      <XCircle className="w-4 h-4 mr-1" />
                      Not Connected
                    </span>
                  )}
                  {smartRecruiters?.lastSyncAt && (
                    <span className="text-sm text-gray-600">
                      Last sync: {new Date(smartRecruiters.lastSyncAt).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowConfigModal(true)}
                className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Configure</span>
              </button>
              {smartRecruiters?.isActive && (
                <button
                  onClick={() => syncMutation.mutate()}
                  disabled={syncMutation.isPending}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition flex items-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                  <span>{syncMutation.isPending ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Configuration Details */}
        {smartRecruiters?.isActive && (
          <div className="p-6 bg-white border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Sync Configuration</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Auto-Sync Schedule</p>
                <p className="font-medium text-gray-900 mt-1">Every 15 minutes</p>
              </div>
              <div>
                <p className="text-gray-600">Data Synced</p>
                <p className="font-medium text-gray-900 mt-1">Candidates, Jobs, Interviews</p>
              </div>
            </div>
          </div>
        )}

        {/* Feature List */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Features</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Automatic candidate data sync</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Job requisition tracking</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Interview stage mapping</span>
            </li>
            <li className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Real-time webhook support</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-800">
          <p className="font-medium">Integration Tips</p>
          <p className="mt-1">
            Ensure your SmartRecruiters API key has read permissions for candidates, jobs, and interviews.
            The system will automatically sync data every 15 minutes, or you can trigger a manual sync anytime.
          </p>
        </div>
      </div>

      {/* Configure Modal */}
      {showConfigModal && (
        <ConfigureModal
          onClose={() => setShowConfigModal(false)}
          onSubmit={(data) => configureMutation.mutate(data)}
          isLoading={configureMutation.isPending}
        />
      )}
    </div>
  );
}

// Configure Modal Component
function ConfigureModal({
  onClose,
  onSubmit,
  isLoading,
}: {
  onClose: () => void;
  onSubmit: (data: { apiKey: string; baseUrl: string }) => void;
  isLoading: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('https://api.smartrecruiters.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ apiKey, baseUrl });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Configure SmartRecruiters
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your SmartRecruiters API key"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Find your API key in SmartRecruiters Settings → API Keys
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

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Your API key will be encrypted before storage.
              Make sure the key has read permissions for candidates, jobs, and interviews.
            </p>
          </div>

          <div className="flex items-center space-x-3 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
            >
              {isLoading ? 'Saving...' : 'Save Configuration'}
            </button>
            <button
              type="button"
              onClick={onClose}
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

