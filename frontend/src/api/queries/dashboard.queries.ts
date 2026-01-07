import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';
import type { DashboardOverviewResponse, DashboardInsightsResponse } from '../../../../shared/types/api/dashboard.types';

export const useDashboardOverview = (filters?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['dashboard', 'overview', filters],
    queryFn: async () => {
      const response = await apiClient.get<DashboardOverviewResponse>('/dashboard/overview', {
        params: filters
      });
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard
  });
};

export const useDashboardInsights = () => {
  return useQuery({
    queryKey: ['dashboard', 'insights'],
    queryFn: async () => {
      const response = await apiClient.get<DashboardInsightsResponse>('/dashboard/insights');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useDashboardCohorts = () => {
  return useQuery({
    queryKey: ['dashboard', 'cohorts'],
    queryFn: async () => {
      const response = await apiClient.get('/dashboard/cohorts');
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

