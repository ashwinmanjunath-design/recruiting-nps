import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

export const useTrendsHistory = (params?: { period?: string; months?: number }) => {
  return useQuery({
    queryKey: ['trends', 'history', params],
    queryFn: async () => {
      const response = await apiClient.get('/trends/history', { params });
      return response.data;
    },
  });
};

export const useTrendsResponseRate = (params?: { months?: number }) => {
  return useQuery({
    queryKey: ['trends', 'response-rate', params],
    queryFn: async () => {
      const response = await apiClient.get('/trends/response-rate', { params });
      return response.data;
    },
  });
};

export const useTrendsInsights = () => {
  return useQuery({
    queryKey: ['trends', 'insights'],
    queryFn: async () => {
      const response = await apiClient.get('/trends/insights');
      return response.data;
    },
  });
};

