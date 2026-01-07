import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/react-query';
import { useAuthStore } from './store/authStore';
import { Permission } from '../../shared/types/enums';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Toast from './components/Toast';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Trends from './pages/Trends';
import Cohorts from './pages/Cohorts';
import Geographic from './pages/Geographic';
import Actions from './pages/Actions';
import SurveyManagement from './pages/SurveyManagement';
import Settings from './pages/Settings';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Route - Login */}
            <Route
              path="/login"
              element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
              }
            />

            {/* Protected Routes with Layout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />

              {/* Dashboard - VIEW_DASHBOARD permission */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_DASHBOARD]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {/* Trends - VIEW_TRENDS permission */}
              <Route
                path="trends"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_TRENDS]}>
                    <Trends />
                  </ProtectedRoute>
                }
              />

              {/* Cohorts - VIEW_COHORTS permission */}
              <Route
                path="cohorts"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_COHORTS]}>
                    <Cohorts />
                  </ProtectedRoute>
                }
              />

              {/* Geographic - VIEW_GEOGRAPHIC permission */}
              <Route
                path="geographic"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_GEOGRAPHIC]}>
                    <Geographic />
                  </ProtectedRoute>
                }
              />

              {/* Actions - VIEW_ACTIONS permission */}
              <Route
                path="actions"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_ACTIONS]}>
                    <Actions />
                  </ProtectedRoute>
                }
              />

              {/* Survey Management - VIEW_SURVEYS permission */}
              <Route
                path="surveys"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_SURVEYS]}>
                    <SurveyManagement />
                  </ProtectedRoute>
                }
              />

              {/* Admin & Settings - VIEW_ADMIN permission */}
              <Route
                path="settings"
                element={
                  <ProtectedRoute requiredPermissions={[Permission.VIEW_ADMIN]}>
                    <Settings />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Catch-all */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-8">Page not found</p>
                    <a
                      href="/dashboard"
                      className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition"
                    >
                      Go to Dashboard
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>

          {/* Toast Notifications */}
          <Toast />
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;

