import { useQuery } from '@tanstack/react-query';
import apiClient from '../client';

export const useGeographicRegions = (params?: any) => {
  return useQuery({
    queryKey: ['geographic', 'regions', params],
    queryFn: async () => {
      const response = await apiClient.get('/geographic/regions', { params });
      return response.data;
    },
  });
};

export const useGeographicMapData = () => {
  return useQuery({
    queryKey: ['geographic', 'map-data'],
    queryFn: async () => {
      const response = await apiClient.get('/geographic/map-data');
      return response.data;
    },
  });
};

export const useGeographicInsights = (params?: { region?: string }) => {
  return useQuery({
    queryKey: ['geographic', 'insights', params],
    queryFn: async () => {
      const response = await apiClient.get('/geographic/insights', { params });
      return response.data;
    },
  });
};

