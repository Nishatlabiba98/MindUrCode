import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { LIGHT, DARK } from './theme';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem('mindurcode_theme') === 'dark'
  );

  // Mirror the theme onto <html data-theme="…"> so the CSS-variable system
  // used by Dashboard.css and Landing.css can flip via [data-theme="light"].
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      localStorage.setItem('mindurcode_theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  const C = isDark ? DARK : LIGHT;

  const btnStyle = useCallback((primary) => ({
    height: 32, padding: '0 14px', fontSize: 12.5, fontWeight: 500,
    background: primary ? C.text : C.panel,
    color:      primary ? (isDark ? C.bg : '#fff') : C.text,
    border:     `1px solid ${primary ? C.text : C.border}`,
    borderRadius: 8, cursor: 'pointer', fontFamily: 'inherit',
  }), [C, isDark]);

  const iconBtn = useCallback((strong) => ({
    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: C.panel, border: `1px solid ${C.border}`, borderRadius: 6,
    color: strong ? C.good : C.textDim, cursor: 'pointer',
  }), [C]);

  const value = useMemo(
    () => ({ C, isDark, toggle, btnStyle, iconBtn }),
    [C, isDark, toggle, btnStyle, iconBtn]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
