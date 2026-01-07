import { create } from 'zustand';
import dayjs, { Dayjs } from 'dayjs';

export interface DateRange {
  start: Dayjs;
  end: Dayjs;
}

interface FiltersState {
  // Date range
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  
  // Cohort filter
  selectedCohort: string | null;
  setSelectedCohort: (cohortId: string | null) => void;
  
  // Region filter
  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;
  
  // Role filter
  selectedRole: string | null;
  setSelectedRole: (role: string | null) => void;
  
  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Reset all filters
  resetFilters: () => void;
}

const DEFAULT_DATE_RANGE: DateRange = {
  start: dayjs().subtract(30, 'days'),
  end: dayjs(),
};

export const useFiltersStore = create<FiltersState>((set) => ({
  dateRange: DEFAULT_DATE_RANGE,
  selectedCohort: null,
  selectedRegion: null,
  selectedRole: null,
  searchQuery: '',

  setDateRange: (range) => set({ dateRange: range }),
  setSelectedCohort: (cohortId) => set({ selectedCohort: cohortId }),
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedRole: (role) => set({ selectedRole: role }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  resetFilters: () => set({
    dateRange: DEFAULT_DATE_RANGE,
    selectedCohort: null,
    selectedRegion: null,
    selectedRole: null,
    searchQuery: '',
  }),
}));

