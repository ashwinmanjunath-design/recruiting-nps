import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { useUIStore } from '../../store/uiStore';

export const useActions = (params?: any) => {
  return useQuery({
    queryKey: ['actions', params],
    queryFn: async () => {
      const response = await apiClient.get('/actions', { params });
      return response.data;
    },
  });
};

export const useActionsThemes = () => {
  return useQuery({
    queryKey: ['actions', 'themes'],
    queryFn: async () => {
      const response = await apiClient.get('/actions/themes');
      return response.data;
    },
  });
};

export const useActionsHistory = (limit?: number) => {
  return useQuery({
    queryKey: ['actions', 'history', limit],
    queryFn: async () => {
      const response = await apiClient.get('/actions/history', { params: { limit } });
      return response.data;
    },
  });
};

// Mutations
export const useCreateAction = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/actions', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      addToast({ type: 'success', message: 'Action created successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to create action' });
    },
  });
};

export const useUpdateAction = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.patch(`/actions/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      addToast({ type: 'success', message: 'Action updated successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to update action' });
    },
  });
};

export const useDeleteAction = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/actions/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['actions'] });
      addToast({ type: 'success', message: 'Action deleted successfully' });
    },
    onError: (error: any) => {
      addToast({ type: 'error', message: error.response?.data?.error || 'Failed to delete action' });
    },
  });
};

