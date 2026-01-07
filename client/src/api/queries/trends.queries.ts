/**
 * Trends API Functions
 * 
 * These functions call the backend trends analytics endpoints.
 * They can be upgraded to use React Query later for better caching and state management.
 */

import axios from 'axios';

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

import { SurveyAudience } from '../../../../shared/types/enums';

export interface TrendsFilters {
  interval?: 'weekly' | 'monthly' | 'quarterly';
  baseline?: 'engineers-q1' | 'designers-q1' | 'all-roles';
  from?: string;
  to?: string;
  audience?: SurveyAudience;
  location?: string;
}

export interface NpsCompositionDataPoint {
  period: string;
  promotersPercentage: number;
  passivesPercentage: number;
  detractorsPercentage: number;
  npsScore: number;
  totalResponses: number;
}

export interface ResponseRateDataPoint {
  period: string;
  responseRatePercentage: number;
  timeToFeedbackHours: number;
  totalSent: number;
  totalResponded: number;
}

export interface TrendInsight {
  severity: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  description: string;
  period?: string;
  resolved?: boolean;
}

export interface TrendSummary {
  currentNps: number;
  npsChange: number;
  currentResponseRate: number;
  responseRateChange: number;
  avgTimeToFeedback: number;
  timeToFeedbackChange: number;
}

/**
 * Fetch NPS composition trend (stacked percentages + NPS score line)
 */
export const getTrendsComposition = (filters?: TrendsFilters) =>
  api.get<{ data: NpsCompositionDataPoint[] }>('/trends/composition', { params: filters });

/**
 * Fetch response rate and time-to-feedback trend
 */
export const getTrendsResponse = (filters?: TrendsFilters) =>
  api.get<{ data: ResponseRateDataPoint[] }>('/trends/response', { params: filters });

/**
 * Fetch noteworthy insights and events
 */
export const getTrendsInsights = (filters?: TrendsFilters) =>
  api.get<{ insights: TrendInsight[] }>('/trends/insights', { params: filters });

/**
 * Fetch trends summary statistics
 */
export const getTrendsSummary = (filters?: TrendsFilters) =>
  api.get<TrendSummary>('/trends/summary', { params: filters });
