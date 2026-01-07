import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserRole, Permission, ROLE_PERMISSIONS } from '../../../shared/types/enums';
import type { AuthUser } from '../../../shared/types/models';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;
  permissions: Permission[];
  isAuthenticated: boolean;
  
  // Actions
  setAuth: (user: AuthUser, token: string, refreshToken: string) => void;
  clearAuth: () => void;
  hasPermission: (permission: Permission) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyPermission: (...permissions: Permission[]) => boolean;
  hasAllPermissions: (...permissions: Permission[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      permissions: [],
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => {
        const permissions = ROLE_PERMISSIONS[user.role];
        set({
          user,
          token,
          refreshToken,
          permissions,
          isAuthenticated: true,
        });
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
      },

      clearAuth: () => {
        set({
          user: null,
          token: null,
          refreshToken: null,
          permissions: [],
          isAuthenticated: false,
        });
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
      },

      hasPermission: (permission) => {
        return get().permissions.includes(permission);
      },

      hasRole: (role) => {
        return get().user?.role === role;
      },

      hasAnyPermission: (...permissions) => {
        const userPermissions = get().permissions;
        return permissions.some((p) => userPermissions.includes(p));
      },

      hasAllPermissions: (...permissions) => {
        const userPermissions = get().permissions;
        return permissions.every((p) => userPermissions.includes(p));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

