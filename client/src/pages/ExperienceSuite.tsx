// ============================================
// C360 EXPERIENCE SUITE - Landing Page
// ============================================
// This page appears after login as the main entry point.
// Users choose which experience (audience) they want to explore.
// Clicking a card sets the global audience store and navigates to dashboard.
// The selected audience persists across all pages (Dashboard, Trends, etc.)
// ============================================

import { useNavigate } from 'react-router-dom';
import { useAudienceStore } from '../stores/audienceStore';
import { SurveyAudience } from '../../../shared/types/enums';
import { Users, Briefcase, Building2, Monitor, ArrowRight } from 'lucide-react';

// Experience card data with professional icons
const EXPERIENCES = [
  {
    id: 'CANDIDATE',
    Icon: Users,
    title: 'Candidate Experience',
    description: 'Post-interview NPS scores, candidate journey analytics, and hiring process feedback.',
    buttonText: 'Open Dashboard',
    accentColor: '#0d9488', // teal-600
    lightBg: 'bg-teal-50/80',
    borderColor: 'border-teal-200/60',
    iconColor: 'text-teal-600',
    buttonBg: 'bg-teal-600 hover:bg-teal-700',
  },
  {
    id: 'HIRING_MANAGER',
    Icon: Briefcase,
    title: 'Hiring Manager Experience',
    description: 'Talent Acquisition support feedback, recruiter satisfaction, and hiring efficiency metrics.',
    buttonText: 'Open Dashboard',
    accentColor: '#7c3aed', // violet-600
    lightBg: 'bg-violet-50/80',
    borderColor: 'border-violet-200/60',
    iconColor: 'text-violet-600',
    buttonBg: 'bg-violet-600 hover:bg-violet-700',
  },
  {
    id: 'WORKPLACE',
    Icon: Building2,
    title: 'Workplace Experience',
    description: 'Office environment, company culture, and employee onboarding experience insights.',
    buttonText: 'Open Dashboard',
    accentColor: '#d97706', // amber-600
    lightBg: 'bg-amber-50/80',
    borderColor: 'border-amber-200/60',
    iconColor: 'text-amber-600',
    buttonBg: 'bg-amber-600 hover:bg-amber-700',
  },
  {
    id: 'IT_SUPPORT',
    Icon: Monitor,
    title: 'IT Support Experience',
    description: 'Technology onboarding, system access, and IT support quality feedback.',
    buttonText: 'Open Dashboard',
    accentColor: '#2563eb', // blue-600
    lightBg: 'bg-blue-50/80',
    borderColor: 'border-blue-200/60',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
  },
];

export default function ExperienceSuite() {
  const navigate = useNavigate();
  const setAudience = useAudienceStore((state) => state.setAudience);

  const handleCardClick = (audienceId: string) => {
    // Set the global audience store BEFORE navigating
    // This ensures all pages read the correct audience from the store
    setAudience(audienceId as SurveyAudience);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="pt-16 pb-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Centered Logo Box */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-xl shadow-teal-200/50">
              <span className="text-white text-2xl font-bold tracking-tight">C360</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3" style={{ letterSpacing: '-0.025em' }}>
            Experience Suite
          </h1>
          <p className="text-base text-slate-500 max-w-lg mx-auto leading-relaxed">
            Select an experience domain to view detailed analytics and insights.
          </p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EXPERIENCES.map((exp) => {
              const IconComponent = exp.Icon;
              return (
                <div
                  key={exp.id}
                  onClick={() => handleCardClick(exp.id)}
                  className={`
                    relative bg-white rounded-xl p-6 border ${exp.borderColor}
                    shadow-sm hover:shadow-md transition-all duration-200
                    cursor-pointer group
                  `}
                >
                  {/* Icon Container - Centered */}
                  <div className="flex justify-center mb-5">
                    <div className={`
                      w-14 h-14 rounded-xl ${exp.lightBg}
                      flex items-center justify-center
                      group-hover:scale-105 transition-transform duration-200
                    `}>
                      <IconComponent className={`w-7 h-7 ${exp.iconColor}`} strokeWidth={1.5} />
                    </div>
                  </div>

                  {/* Title - Centered */}
                  <h2 className="text-lg font-semibold text-slate-900 mb-2 text-center">
                    {exp.title}
                  </h2>

                  {/* Description - Centered */}
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed text-center">
                    {exp.description}
                  </p>

                  {/* Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(exp.id);
                    }}
                    className={`
                      w-full py-2.5 px-4 rounded-lg text-sm font-medium text-white
                      ${exp.buttonBg} transition-all duration-200
                      flex items-center justify-center gap-2
                      group-hover:gap-3
                    `}
                  >
                    {exp.buttonText}
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>

                  {/* Subtle top accent line */}
                  <div 
                    className="absolute top-0 left-6 right-6 h-0.5 rounded-full opacity-60"
                    style={{ backgroundColor: exp.accentColor }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pb-10 text-center">
        <p className="text-xs text-slate-400">
          Switch between experiences anytime using the navigation tabs.
        </p>
      </div>
    </div>
  );
}
