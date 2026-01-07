import { useAuthStore } from '../store/authStore';
import { useMutation } from '@tanstack/react-query';
import apiClient from '../api/client';
import type { LoginRequest, LoginResponse } from '../../../shared/types/api/auth.types';

export const useLogin = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
    },
  });
};

export const useLogout = () => {
  const { clearAuth, refreshToken } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    },
    onSuccess: () => {
      clearAuth();
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.refreshToken);
    },
  });
};

