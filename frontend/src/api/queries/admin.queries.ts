import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { useUIStore } from '../../store/uiStore';

// User Management
export const useUsers = () => {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/users');
      return response.data;
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/admin/users', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      addToast({ type: 'success', message: 'User created successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to create user' });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      addToast({ type: 'success', message: 'User updated successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to update user' });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      addToast({ type: 'success', message: 'User deleted successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to delete user' });
    },
  });
};

// Integrations
export const useIntegrations = () => {
  return useQuery({
    queryKey: ['admin', 'integrations'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/integrations');
      return response.data;
    },
  });
};

export const useSaveSmartRecruitersConfig = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: { apiKey: string; baseUrl: string }) => {
      const response = await apiClient.post('/admin/integrations/smartrecruiters', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations'] });
      addToast({ type: 'success', message: 'SmartRecruiters integration configured successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to save configuration' });
    },
  });
};

export const useTriggerSync = () => {
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/admin/integrations/smartrecruiters/sync');
      return response.data;
    },
    onSuccess: () => {
      addToast({ type: 'success', message: 'Sync started successfully. This may take a few minutes.' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to trigger sync' });
    },
  });
};

// Imports
export const useImports = () => {
  return useQuery({
    queryKey: ['admin', 'imports'],
    queryFn: async () => {
      const response = await apiClient.get('/admin/imports');
      return response.data;
    },
  });
};

export const useUploadImport = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ file, importType }: { file: File; importType: string }) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('importType', importType);

      const response = await apiClient.post('/admin/imports/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'imports'] });
      addToast({ type: 'success', message: 'File uploaded successfully. Processing started.' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to upload file' });
    },
  });
};

export const useImportDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin', 'imports', id],
    queryFn: async () => {
      const response = await apiClient.get(`/admin/imports/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
