import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { settingsRepository } from '../db/settingsRepository';
import { lightColors, darkColors } from '../constants/theme';

const ThemeContext = createContext(null);

const MODES = ['light', 'dark', 'system'];

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState('system');

  useEffect(() => {
    try {
      const saved = settingsRepository.getSetting('theme_mode') || 'system';
      setModeState(MODES.includes(saved) ? saved : 'system');
    } catch (error) {
      console.error('[ThemeProvider] Error loading theme:', error);
    }
  }, []);

  const setMode = (next) => {
    setModeState(next);
    try {
      settingsRepository.saveSettings({ theme_mode: next });
    } catch (error) {
      console.error('[ThemeProvider] Error saving theme:', error);
    }
  };

  const value = useMemo(() => {
    const resolved = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
    const isDark = resolved === 'dark';
    return {
      mode,
      setMode,
      isDark,
      colors: isDark ? darkColors : lightColors,
    };
  }, [mode, systemScheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
