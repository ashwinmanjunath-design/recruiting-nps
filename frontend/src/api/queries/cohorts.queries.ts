import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

export const useCohortsAnalysis = (filters?: any) => {
  return useQuery({
    queryKey: ['cohorts', 'analysis', filters],
    queryFn: async () => {
      const response = await apiClient.get('/cohorts/analysis', { params: filters });
      return response.data;
    },
  });
};

export const useCohortsComparison = (cohort1?: string, cohort2?: string) => {
  return useQuery({
    queryKey: ['cohorts', 'comparison', cohort1, cohort2],
    queryFn: async () => {
      const response = await apiClient.get('/cohorts/comparison', {
        params: { cohort1, cohort2 }
      });
      return response.data;
    },
    enabled: !!cohort1 && !!cohort2,
  });
};

export const useCohortsFeedbackThemes = (cohort?: string) => {
  return useQuery({
    queryKey: ['cohorts', 'feedback-themes', cohort],
    queryFn: async () => {
      const response = await apiClient.get('/cohorts/feedback-themes', {
        params: { cohort }
      });
      return response.data;
    },
  });
};

export const useCohortsScatterData = () => {
  return useQuery({
    queryKey: ['cohorts', 'scatter-data'],
    queryFn: async () => {
      const response = await apiClient.get('/cohorts/scatter-data');
      return response.data;
    },
  });
};

