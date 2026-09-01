import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppThemeId, APP_THEMES, ThemeDefinition } from '../theme/themeConfig';

interface ThemeContextType {
  themeId: AppThemeId;
  darkMode: boolean;
  activeTheme: ThemeDefinition;
  setThemeId: (id: AppThemeId) => void;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{
  children: React.ReactNode;
  initialTheme?: AppThemeId;
  initialDarkMode?: boolean;
  onThemeChange?: (theme: AppThemeId, darkMode: boolean) => void;
}> = ({ children, initialTheme = 'eco-green', initialDarkMode = true, onThemeChange }) => {
  const [themeId, setThemeIdState] = useState<AppThemeId>(() => {
    const saved = localStorage.getItem('ecoeat_theme_id') as AppThemeId;
    if (saved && APP_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return initialTheme;
  });

  const [darkMode, setDarkModeState] = useState<boolean>(() => {
    const saved = localStorage.getItem('ecoeat_dark_mode');
    if (saved !== null) {
      return saved === 'true';
    }
    return initialDarkMode;
  });

  const activeTheme = APP_THEMES.find((t) => t.id === themeId) || APP_THEMES[0];

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', themeId);
    root.setAttribute('data-mode', darkMode ? 'dark' : 'light');
    if (darkMode) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }

    localStorage.setItem('ecoeat_theme_id', themeId);
    localStorage.setItem('ecoeat_dark_mode', darkMode.toString());

    if (onThemeChange) {
      onThemeChange(themeId, darkMode);
    }
  }, [themeId, darkMode, onThemeChange]);

  const setThemeId = (newTheme: AppThemeId) => {
    setThemeIdState(newTheme);
  };

  const setDarkMode = (isDark: boolean) => {
    setDarkModeState(isDark);
  };

  const toggleDarkMode = () => {
    setDarkModeState((prev) => !prev);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeId,
        darkMode,
        activeTheme,
        setThemeId,
        setDarkMode,
        toggleDarkMode,
        availableThemes: APP_THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
