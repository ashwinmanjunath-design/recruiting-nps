import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tantml:parameter>
import apiClient from '../../api/client';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Download,
  AlertCircle,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

type ImportType = 'CANDIDATES' | 'SURVEY_RESPONSES' | 'COHORTS';

interface ImportJob {
  id: string;
  fileName: string;
  importType: ImportType;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalRows: number;
  successRows: number;
  errorCount: number;
  createdAt: string;
  completedAt?: string;
}

export default function BulkImport() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importType, setImportType] = useState<ImportType>('CANDIDATES');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Fetch import history
  const { data: importsData, isLoading } = useQuery({
    queryKey: ['admin', 'imports'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/imports');
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Upload file mutation
  const uploadMutation = useMutation({
    mutationFn: async ({ file, type }: { file: File; type: ImportType }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('importType', type);

      const response = await apiClient.post('/admin/imports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'imports'] });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      addToast({ type: 'success', message: 'File uploaded and queued for processing' });
    },
    onError: (error: any) => {
      addToast({
        type: 'error',
        message: error.response?.data?.error || 'Failed to upload file',
      });
    },
  });

  const imports: ImportJob[] = importsData?.imports || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validExtensions = ['.csv', '.xls', '.xlsx'];
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (!validExtensions.includes(extension)) {
        addToast({
          type: 'error',
          message: 'Invalid file type. Please upload CSV, XLS, or XLSX files only.',
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate({ file: selectedFile, type: importType });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-50';
      case 'FAILED':
        return 'text-red-600 bg-red-50';
      case 'PROCESSING':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4" />;
      case 'FAILED':
        return <XCircle className="w-4 h-4" />;
      case 'PROCESSING':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

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
        <h2 className="text-xl font-semibold text-gray-900">Bulk Import</h2>
        <p className="text-sm text-gray-600 mt-1">
          Upload CSV or Excel files to import candidates, survey responses, or cohorts
        </p>
      </div>

      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 mb-6">
        <div className="text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload File
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            Supported formats: CSV, XLS, XLSX (Max size: 10MB)
          </p>

          {/* Import Type Selector */}
          <div className="max-w-md mx-auto mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
              Import Type
            </label>
            <select
              value={importType}
              onChange={(e) => setImportType(e.target.value as ImportType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="CANDIDATES">Candidates</option>
              <option value="SURVEY_RESPONSES">Survey Responses</option>
              <option value="COHORTS">Cohort Definitions</option>
            </select>
          </div>

          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xls,.xlsx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {selectedFile ? (
            <div className="max-w-md mx-auto bg-white border border-gray-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-indigo-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-red-600 hover:text-red-700 text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border-2 border-gray-300 transition"
            >
              Choose File
            </button>
          )}

          {selectedFile && (
            <button
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition"
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload & Process'}
            </button>
          )}
        </div>
      </div>

      {/* Template Downloads */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-start space-x-3">
          <Download className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-900 mb-2">Download Templates</p>
            <div className="flex items-center space-x-4 text-sm">
              <a href="#" className="text-blue-700 hover:underline font-medium">
                Candidates Template
              </a>
              <a href="#" className="text-blue-700 hover:underline font-medium">
                Survey Responses Template
              </a>
              <a href="#" className="text-blue-700 hover:underline font-medium">
                Cohorts Template
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Import History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Import History</h3>
        
        {imports.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No imports yet. Upload your first file above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {imports.map((importJob) => (
              <div
                key={importJob.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{importJob.fileName}</h4>
                      <span
                        className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          importJob.status
                        )}`}
                      >
                        {getStatusIcon(importJob.status)}
                        <span>{importJob.status}</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium text-gray-900">{importJob.importType}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Rows</p>
                        <p className="font-medium text-gray-900">{importJob.totalRows}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success</p>
                        <p className="font-medium text-green-600">{importJob.successRows}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Errors</p>
                        <p className="font-medium text-red-600">{importJob.errorCount}</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Uploaded: {new Date(importJob.createdAt).toLocaleString()}
                      {importJob.completedAt &&
                        ` • Completed: ${new Date(importJob.completedAt).toLocaleString()}`}
                    </p>
                  </div>

                  {importJob.errorCount > 0 && (
                    <button className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition flex items-center space-x-1">
                      <AlertCircle className="w-4 h-4" />
                      <span>View Errors</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                {importJob.status === 'PROCESSING' && (
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${
                            importJob.totalRows > 0
                              ? (importJob.successRows / importJob.totalRows) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

