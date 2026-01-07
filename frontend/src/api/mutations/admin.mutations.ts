import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { useUIStore } from '../../store/uiStore';

// User Management Mutations
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

// SmartRecruiters Integration Mutations
export const useConfigureSmartRecruiters = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: { apiKey: string; baseUrl: string }) => {
      const response = await apiClient.post('/admin/integrations/smartrecruiters', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'integrations'] });
      addToast({ type: 'success', message: 'SmartRecruiters configured successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to configure integration' });
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
      addToast({ type: 'success', message: 'Sync started successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to trigger sync' });
    },
  });
};

// Bulk Import Mutations
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
      addToast({ type: 'success', message: 'File uploaded and queued for processing' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to upload file' });
    },
  });
};
