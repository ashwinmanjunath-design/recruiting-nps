/**
 * Design System Theme Configuration
 * 
 * Centralized colors, shadows, and sizing for the Candidate 360° NPS Platform
 */

export const theme = {
  // Color Palette
  colors: {
    // Primary (Teal)
    primary: {
      DEFAULT: '#14b8a6', // teal-500
      dark: '#0d9488',    // teal-600
      light: '#5eead4',   // teal-300
    },
    
    // NPS Categories
    nps: {
      promoters: '#10b981',  // green-500
      passives: '#f59e0b',   // amber-500
      detractors: '#ef4444', // red-500
    },
    
    // Accent Colors
    accent: {
      orange: '#f97316',   // orange-500
      pink: '#ec4899',     // pink-500
      blue: '#3b82f6',     // blue-500
      purple: '#a855f7',   // purple-500
    },
    
    // Greys
    grey: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
      muted: '#94a3b8',  // Muted text color
    },
    
    // Backgrounds
    background: {
      page: {
        from: '#f3fbff',
        via: '#eff8fa',
        to: '#e5f4f7',
      },
      sidebar: 'rgba(248, 250, 252, 0.8)', // Frosted white
    },
    
    // Semantic Colors
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Card Styling
  card: {
    borderRadius: '24px',
    shadow: '0 18px 45px rgba(15, 23, 42, 0.08)',
    padding: '24px',
    background: '#ffffff',
    border: 'none',
  },
  
  // Typography
  typography: {
    pageTitle: {
      fontSize: '24px',
      fontWeight: '600',
      letterSpacing: '-0.02em',
    },
    cardTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937', // grey-800
    },
    label: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#6b7280', // grey-500
    },
    caption: {
      fontSize: '12px',
      fontWeight: '400',
      color: '#94a3b8', // grey-muted
    },
  },
  
  // Layout Heights
  heights: {
    hero: '200px',
    chart: {
      small: '240px',
      medium: '280px',
      large: '320px',
    },
    kpi: '120px',
  },
  
  // Spacing
  spacing: {
    section: '16px',      // gap between major sections
    card: '16px',         // gap between cards in a row
    cardInternal: '24px', // padding inside cards
  },
} as const;

export type Theme = typeof theme;

export default theme;

