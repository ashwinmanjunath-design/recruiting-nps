// ============================================
// SHARED AUDIENCE SELECTOR COMPONENT
// Reusable component for switching between survey audiences
// Used across Dashboard, Trends, Cohorts, Actions, Surveys pages
// ============================================

import { Users, Briefcase, Building2, Monitor } from 'lucide-react';
import { SurveyAudience } from '../../../shared/types/enums';

// Hiring Manager location options
export const HIRING_MANAGER_LOCATIONS = [
  { value: 'all', label: 'All Locations' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'prague', label: 'Prague' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'bengaluru', label: 'Bengaluru' },
  { value: 'singapore', label: 'Singapore' },
  { value: 'brazil', label: 'Brazil' },
] as const;

export type HiringManagerLocation = typeof HIRING_MANAGER_LOCATIONS[number]['value'];

// Audience configuration
export const AUDIENCE_CONFIG = {
  [SurveyAudience.CANDIDATE]: {
    label: 'Candidate',
    icon: Users,
    color: 'teal',
    activeClass: 'bg-teal-50 text-teal-700 border-teal-200',
    description: 'Candidate interview experience',
    badgeClass: 'bg-teal-100 text-teal-700',
  },
  [SurveyAudience.HIRING_MANAGER]: {
    label: 'Hiring Manager',
    icon: Briefcase,
    color: 'purple',
    activeClass: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Feedback on Talent Acquisition support',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  [SurveyAudience.WORKPLACE]: {
    label: 'Workplace',
    icon: Building2,
    color: 'amber',
    activeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Workplace experience',
    badgeClass: 'bg-amber-100 text-amber-700',
  },
  [SurveyAudience.IT_SUPPORT]: {
    label: 'IT Support',
    icon: Monitor,
    color: 'blue',
    activeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'IT onboarding & support',
    badgeClass: 'bg-blue-100 text-blue-700',
  },
} as const;

interface AudienceSelectorProps {
  selectedAudience: SurveyAudience;
  onAudienceChange: (audience: SurveyAudience) => void;
  // Optional: location filter for Hiring Manager
  selectedLocation?: HiringManagerLocation;
  onLocationChange?: (location: HiringManagerLocation) => void;
  showLocationFilter?: boolean;
  className?: string;
}

export function AudienceSelector({
  selectedAudience,
  onAudienceChange,
  selectedLocation = 'all',
  onLocationChange,
  showLocationFilter = false,
  className = '',
}: AudienceSelectorProps) {
  const config = AUDIENCE_CONFIG[selectedAudience];
  const showLocation = showLocationFilter && selectedAudience === SurveyAudience.HIRING_MANAGER;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Audience Tabs */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {(Object.keys(AUDIENCE_CONFIG) as SurveyAudience[]).map((audience) => {
          const cfg = AUDIENCE_CONFIG[audience];
          const Icon = cfg.icon;
          const isActive = selectedAudience === audience;
          
          return (
            <button
              key={audience}
              onClick={() => onAudienceChange(audience)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                ${isActive 
                  ? `bg-white shadow-sm ${cfg.activeClass}` 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
              title={cfg.description}
            >
              <Icon className={`w-4 h-4 ${isActive ? '' : 'text-gray-400'}`} />
              <span className="hidden sm:inline">{cfg.label}</span>
            </button>
          );
        })}
      </div>

      {/* Audience Description + Optional Location Filter */}
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-xs text-gray-500">
          Showing <span className="font-medium text-gray-700">{config.label}</span> feedback data • {config.description}
        </p>

        {/* Location filter for Hiring Manager */}
        {showLocation && onLocationChange && (
          <select
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value as HiringManagerLocation)}
            className="px-3 py-1.5 text-xs font-medium rounded-full border border-purple-200 bg-purple-50 text-purple-700 cursor-pointer transition-all hover:border-purple-300"
          >
            {HIRING_MANAGER_LOCATIONS.map((loc) => (
              <option key={loc.value} value={loc.value}>
                {loc.label}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
}

// Audience badge component for tables
export function AudienceBadge({ audience }: { audience: SurveyAudience }) {
  const config = AUDIENCE_CONFIG[audience];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${config.badgeClass}`}>
      {config.label}
    </span>
  );
}

export default AudienceSelector;

