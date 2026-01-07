import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../client';
import { useUIStore } from '../../store/uiStore';

export const useSurveys = (params?: any) => {
  return useQuery({
    queryKey: ['surveys', params],
    queryFn: async () => {
      const response = await apiClient.get('/survey-management/surveys', { params });
      return response.data;
    },
  });
};

export const useSurveyTemplates = () => {
  return useQuery({
    queryKey: ['surveys', 'templates'],
    queryFn: async () => {
      const response = await apiClient.get('/survey-management/templates');
      return response.data;
    },
  });
};

export const useQuestionBank = () => {
  return useQuery({
    queryKey: ['surveys', 'question-bank'],
    queryFn: async () => {
      const response = await apiClient.get('/survey-management/question-bank');
      return response.data;
    },
  });
};

export const useSurveyStats = () => {
  return useQuery({
    queryKey: ['surveys', 'stats'],
    queryFn: async () => {
      const response = await apiClient.get('/survey-management/stats');
      return response.data;
    },
  });
};

// Mutations
export const useDistributeSurvey = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/survey-management/distribute', data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['surveys'] });
      addToast({ 
        type: 'success', 
        message: `Successfully distributed ${data.count} surveys` 
      });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to distribute surveys' 
      });
    },
  });
};

export const useCreateSurveyTemplate = () => {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post('/survey-management/templates', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surveys', 'templates'] });
      addToast({ type: 'success', message: 'Template created successfully' });
    },
    onError: (error: any) => {
      addToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Failed to create template' 
      });
    },
  });
};

