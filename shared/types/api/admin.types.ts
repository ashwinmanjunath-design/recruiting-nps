import { UserRole, ImportType, ImportStatus } from '../enums';

// User Management
export interface UserInviteRequest {
  email: string;
  name: string;
  role: UserRole;
}

export interface UserUpdateRequest {
  name?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  invitedBy?: string;
  invitedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Integrations
export interface IntegrationConfigResponse {
  provider: string;
  apiUrl: string;
  webhookUrl?: string;
  isActive: boolean;
  useMockMode: boolean;
  syncInterval: number;
  lastSyncAt?: string;
  lastSyncStatus?: string;
  metadata?: any;
}

export interface IntegrationConfigUpdateRequest {
  apiKey?: string;
  apiUrl?: string;
  webhookSecret?: string;
  isActive?: boolean;
  useMockMode?: boolean;
  syncInterval?: number;
}

export interface SyncTriggerRequest {
  syncType: 'candidates' | 'jobs' | 'full';
  limit?: number;
}

export interface SyncResult {
  success: boolean;
  recordsSynced: number;
  errors?: string[];
  startedAt: string;
  completedAt: string;
}

export interface SyncLogResponse {
  id: string;
  syncType: string;
  status: string;
  recordsSynced: number;
  errors?: any;
  startedAt: string;
  completedAt?: string;
}

// Bulk Imports
export interface ImportJobResponse {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  importType: ImportType;
  status: ImportStatus;
  uploadedBy: string;
  totalRows: number;
  successRows: number;
  failedRows: number;
  startedAt?: string;
  completedAt?: string;
  errors?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ImportErrorDetail {
  row: number;
  field?: string;
  error: string;
  rawData?: any;
}

export interface ImportValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  errors: ImportErrorDetail[];
  warnings?: ImportErrorDetail[];
}

export interface ProcessImportRequest {
  importId: string;
}

export interface ProcessImportResponse {
  importId: string;
  status: ImportStatus;
  message: string;
}

