import React, { createContext, useContext, useState, useEffect } from 'react';
import { Sun, Moon, Waves } from 'lucide-react';

const ThemeContext = createContext();

export const THEMES = [
  {
    id: 'dark',
    name: 'Dark Theme',
    icon: Moon,
    emoji: '🌙',
    color: '#9470F8',
    description: 'Classic dark mode with violet accents'
  },
  {
    id: 'ocean',
    name: 'Ocean Theme',
    icon: Waves,
    emoji: '🌊',
    color: '#06B6D4',
    description: 'Deep oceanic blue with cyan glow'
  },
  {
    id: 'light',
    name: 'Light Theme',
    icon: Sun,
    emoji: '☀️',
    color: '#6366F1',
    description: 'Clean light mode with vibrant indigo'
  }
];

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved = localStorage.getItem('app_theme');
    return saved && ['dark', 'light', 'ocean'].includes(saved) ? saved : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (['dark', 'light', 'ocean'].includes(newTheme)) {
      setThemeState(newTheme);
    }
  };

  const activeThemeObject = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, activeTheme: activeThemeObject, THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
