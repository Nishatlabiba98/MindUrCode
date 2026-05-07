import React from 'react';
import { C } from '../theme';

export default function AppShell({ children }) {
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
