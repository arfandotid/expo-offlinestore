export const lightColors = {
  primary: '#16a34a',       // emerald-600
  primaryLight: '#dcfce7',  // emerald-100
  primaryDark: '#15803d',   // emerald-700
  primarySoft: '#f0fdf4',   // emerald-50

  background: '#f8fafc',    // slate-50
  surface: '#ffffff',

  text: '#0f172a',          // slate-900
  textSecondary: '#64748b', // slate-500
  textMuted: '#94a3b8',     // slate-400

  border: '#e2e8f0',        // slate-200
  borderLight: '#f1f5f9',   // slate-100

  danger: '#ef4444',        // red-500
  dangerLight: '#fee2e2',   // red-100
  dangerDark: '#b91c1c',    // red-700

  badgeBg: '#f1f5f9',
  badgeText: '#475569',

  infoBg: '#eff6ff',        // blue-50
  infoText: '#1d4ed8',      // blue-700
};

export const darkColors = {
  primary: '#22c55e',       // emerald-500
  primaryLight: '#14532d',  // emerald-900
  primaryDark: '#4ade80',   // emerald-400
  primarySoft: '#052e16',   // emerald-950

  background: '#0f172a',    // slate-900
  surface: '#1e293b',       // slate-800

  text: '#f1f5f9',          // slate-100
  textSecondary: '#94a3b8', // slate-400
  textMuted: '#64748b',     // slate-500

  border: '#334155',        // slate-700
  borderLight: '#293548',

  danger: '#f87171',        // red-400
  dangerLight: '#450a0a',   // red-950
  dangerDark: '#fca5a5',    // red-300

  badgeBg: '#334155',
  badgeText: '#cbd5e1',     // slate-300

  infoBg: '#1e3a5f',        // dark blue-800
  infoText: '#93c5fd',      // blue-300
};

export const THEME = {
  colors: lightColors,
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },
  shadow: {
    card: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    fab: {
      shadowColor: '#16a34a',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 6,
      elevation: 6,
    },
  },
};
