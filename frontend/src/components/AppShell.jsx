import React from 'react';
import { useTheme } from '../ThemeContext';

export default function AppShell({ children }) {
  const { C } = useTheme();
  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex', flexDirection: 'column',
      background: C.bg, overflow: 'hidden',
      fontFamily: '"Inter", system-ui, sans-serif', color: C.text,
    }}>
      {children}
    </div>
  );
}
