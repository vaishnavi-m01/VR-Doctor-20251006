// Design System - Consistent styling constants for the entire app
export const DESIGN_SYSTEM = {
  // Color Palette
  colors: {
    // Primary Brand Colors
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7', 
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main green
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16',
    },
    
    // App-specific greens (updated with new button colors)
    brand: {
      'dark-green': '#0e4336',      // Main dark green (bottom nav, buttons)
      'accent-green': '#0ea06c',    // Accent green (indicators, highlights) - keeping original for top menu
      'light-green': '#ffffff',     // Light background - keeping original for top menu
      'border-green': '#d7ebe3',    // Light border green
      'text-green': '#2c4a43',      // Text on light backgrounds
    },
    
    // Neutral Colors
    neutral: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
      950: '#020617',
    },
    
    // Semantic Colors
    success: {
      light: '#dcfce7',
      main: '#16a34a',
      dark: '#15803d',
    },
    warning: {
      light: '#fef3c7',
      main: '#f59e0b',
      dark: '#d97706',
    },
    error: {
      light: '#fee2e2',
      main: '#ef4444',
      dark: '#dc2626',
    },
    info: {
      light: '#dbeafe',
      main: '#3b82f6',
      dark: '#2563eb',
    },
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: 'Zen Kaku Gothic Antique',
      'primary-bold': 'Zen Kaku Gothic Antique-Bold',
      'primary-medium': 'Zen Kaku Gothic Antique-Medium',
      'primary-light': 'Zen Kaku Gothic Antique-Light',
      fallback: 'sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px',
    '4xl': '40px',
    '5xl': '48px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
  
  // Component Specific Styles
  components: {
    button: {
      primary: {
        background: '#0e4336',
        text: '#ffffff',
        border: '#0e4336',
        hover: '#15803d',
        disabled: '#94a3b8',
      },
      secondary: {
        background: '#ffffff',
        text: '#2c4a43',
        border: '#d7ebe3',
        hover: '#e2e8f0',
        disabled: '#f1f5f9',
      },
      accent: {
        background: '#0ea06c',
        text: '#ffffff',
        border: '#0ea06c',
        hover: '#16a34a',
        disabled: '#94a3b8',
      },
    },
    
    input: {
      base: {
        background: '#ffffff',
        border: '#e2e8f0',
        text: '#334155',
        placeholder: '#94a3b8',
        focus: '#0ea06c',
        error: '#ef4444',
      },
    },
    
    card: {
      background: '#ffffff',
      border: '#e2e8f0',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      radius: '12px',
    },
    
    bottomNav: {
      background: '#0e4336',
      active: '#ffffff',
      inactive: '#ffffff80',
      indicator: '#0ea06c',
      radius: '24px',
    },
    
    tabs: {
      active: {
        background: '#0e4336',
        text: '#ffffff',
        border: '#0e4336',
      },
      inactive: {
        background: '#ffffff',
        text: '#2c4a43',
        border: '#d7ebe3',
      },
    },
  },
} as const;

// Utility functions for consistent styling
export const getColorValue = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = DESIGN_SYSTEM.colors;
  
  for (const key of keys) {
    value = value[key];
    if (!value) break;
  }
  
  return value || colorPath;
};

// Common style patterns
export const COMMON_STYLES = {
  // Layout
  container: 'flex-1 bg-white',
  safeArea: 'flex-1 bg-white',
  scrollContainer: 'flex-1',
  
  // Cards
  card: 'bg-white rounded-xl border border-gray-200 p-4 shadow-sm',
  cardLarge: 'bg-white rounded-xl border border-gray-200 p-6 shadow-md',
  
  // Buttons
  buttonPrimary: 'bg-[#0e4336] rounded-xl px-6 py-3 items-center justify-center',
  buttonSecondary: 'bg-[#ffffff] border border-[#d7ebe3] rounded-xl px-6 py-3 items-center justify-center',
  buttonAccent: 'bg-[#0ea06c] rounded-xl px-6 py-3 items-center justify-center',
  
  // Text
  textPrimary: 'text-[#334155] font-zen',
  textSecondary: 'text-[#64748b] font-zen',
  textWhite: 'text-white font-zen',
  textBrand: 'text-[#2c4a43] font-zen',
  
  // Headers
  headerTitle: 'text-2xl font-zen-bold text-[#334155]',
  headerSubtitle: 'text-base font-zen text-[#64748b]',
  
  // Forms
  input: 'border border-gray-300 rounded-lg px-3 py-3 font-zen text-sm text-[#334155]',
  inputError: 'border border-red-500 rounded-lg px-3 py-3 font-zen text-sm text-[#334155]',
  inputFocus: 'border border-[#0ea06c] rounded-lg px-3 py-3 font-zen text-sm text-[#334155]',
  label: 'text-sm font-zen-medium text-[#334155] mb-2',
  errorText: 'text-xs text-red-500 font-zen mt-1',
  
  // Spacing
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-3',
    lg: 'p-4',
    xl: 'p-6',
    '2xl': 'p-8',
  },
  
  // Margins
  margin: {
    xs: 'm-1',
    sm: 'm-2',
    md: 'm-3',
    lg: 'm-4',
    xl: 'm-6',
    '2xl': 'm-8',
  },
  
  // Gaps
  gap: {
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-3',
    lg: 'gap-4',
    xl: 'gap-6',
    '2xl': 'gap-8',
  },
} as const;
