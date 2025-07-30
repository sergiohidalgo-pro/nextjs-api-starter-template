'use client';

import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Get stored theme preference or default to system
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      setTheme(stored);
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    // Set initial resolved theme
    if (theme === 'system') {
      setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    // Apply theme to document
    const root = document.documentElement;
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      setResolvedTheme(theme as 'light' | 'dark');
      root.classList.toggle('dark', theme === 'dark');
    }

    // Store preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  return {
    theme,
    setTheme,
    resolvedTheme,
  };
}