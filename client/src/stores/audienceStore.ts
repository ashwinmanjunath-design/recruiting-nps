// ============================================
// GLOBAL AUDIENCE STORE (Zustand)
// ============================================
// This store manages the selected audience across all pages.
// When a user selects an audience (e.g., from Experience Suite),
// it persists as they navigate between Dashboard, Trends, Cohorts, etc.
// ============================================

import { create } from 'zustand';
import { SurveyAudience } from '../../../shared/types/enums';

interface AudienceState {
  audience: SurveyAudience;
  setAudience: (audience: SurveyAudience) => void;
}

export const useAudienceStore = create<AudienceState>((set) => ({
  // Default audience is CANDIDATE
  audience: SurveyAudience.CANDIDATE,
  
  // Action to update the audience
  setAudience: (audience: SurveyAudience) => set({ audience }),
}));

