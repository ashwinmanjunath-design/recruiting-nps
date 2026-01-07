import axios from 'axios';
import { SurveyAudience } from '../../../shared/types/enums';

const API_URL = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Common params interface with audience filtering
interface AudienceParams {
  audience?: SurveyAudience;
  [key: string]: any;
}

// Auth
export const login = (email: string, password: string) => 
  api.post('/auth/login', { email, password });

export const register = (data: any) => 
  api.post('/auth/register', data);

// Dashboard - all endpoints support audience filtering
export const getDashboardOverview = (params?: AudienceParams) => 
  api.get('/dashboard/overview', { params });

export const getDashboardInsights = (params?: AudienceParams) => 
  api.get('/dashboard/insights', { params });

export const getDashboardCohorts = (params?: AudienceParams) => 
  api.get('/dashboard/cohorts', { params });

// Hiring Manager specific dashboard
export interface HiringManagerDashboardParams {
  location?: string;
  quarter?: string;
  year?: number;
}

export const getHiringManagerDashboard = (params?: HiringManagerDashboardParams) =>
  api.get('/dashboard/hiring-manager', { params });

// Trends - all endpoints support audience filtering
export const getTrendsHistory = (params?: AudienceParams) => 
  api.get('/trends/history', { params });

export const getTrendsComposition = (params?: AudienceParams) => 
  api.get('/trends/composition', { params });

export const getTrendsResponse = (params?: AudienceParams) => 
  api.get('/trends/response', { params });

export const getTrendsResponseRate = (params?: AudienceParams) => 
  api.get('/trends/response-rate', { params });

export const getTrendsInsights = (params?: AudienceParams) => 
  api.get('/trends/insights', { params });

export const getTrendsSummary = (params?: AudienceParams) => 
  api.get('/trends/summary', { params });

// Geographic - all endpoints support audience filtering
export const getGeographicRegions = (params?: AudienceParams) => 
  api.get('/geographic/regions', { params });

export const getGeographicMapData = (params?: AudienceParams) => 
  api.get('/geographic/map-data', { params });

export const getGeographicInsights = (params?: AudienceParams) => 
  api.get('/geographic/insights', { params });

// Cohorts - all endpoints support audience filtering
export const getCohortsAnalysis = (params?: AudienceParams) => 
  api.get('/cohorts/analysis', { params });

export const getCohortsComparison = (cohort1: string, cohort2: string, audience?: SurveyAudience) => 
  api.get('/cohorts/comparison', { params: { cohort1, cohort2, audience } });

export const getCohortsFeedbackThemes = (params?: AudienceParams) => 
  api.get('/cohorts/feedback-themes', { params });

export const getCohortsScatterData = (params?: AudienceParams) => 
  api.get('/cohorts/scatter-data', { params });

// Actions
export const getActions = (params?: any) => 
  api.get('/actions', { params });

export const getActionsThemes = () => 
  api.get('/actions/themes');

export const createAction = (data: any) => 
  api.post('/actions', data);

export const updateAction = (id: string, data: any) => 
  api.patch(`/actions/${id}`, data);

export const deleteAction = (id: string) => 
  api.delete(`/actions/${id}`);

export const getActionsHistory = (limit?: number) => 
  api.get('/actions/history', { params: { limit } });

// Surveys
export const getSurveys = (params?: any) => 
  api.get('/surveys', { params });

export const getSurveyByToken = (token: string) => 
  api.get(`/surveys/${token}`);

export const submitSurvey = (data: any) => 
  api.post('/surveys/submit', data);

export const createSurvey = (data: any) => 
  api.post('/surveys/create', data);

export const createSurveyWithSend = (data: any) => 
  api.post('/surveys', data);

export const sendSurveyEmails = (data: {
  surveyName: string;
  recipients: string[];
  fromEmail: string;
  targetCohort?: string | null;
  sendImmediately: boolean;
}) => {
  console.log('[Frontend API] Calling POST /api/surveys/send with:', data);
  return api.post('/surveys/send', data);
};

// Survey Management
export const getSurveyManagementSurveys = (params?: any) => 
  api.get('/survey-management/surveys', { params });

export const getSurveyTemplates = () => 
  api.get('/survey-management/templates');

export const createSurveyTemplate = (data: any) => 
  api.post('/survey-management/templates', data);

export const distributeSurvey = (data: any) => 
  api.post('/survey-management/distribute', data);

export const getQuestionBank = () => 
  api.get('/survey-management/question-bank');

export const getSurveyStats = () => 
  api.get('/survey-management/stats');

export default api;

