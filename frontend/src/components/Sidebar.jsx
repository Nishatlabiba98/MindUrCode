import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

const NAV = [
  {
    path: '/simplify',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    </svg>,
  },
  {
    path: '/coverage',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 4h10M3 8h7M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>,
  },
  {
    path: '/clarity',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>,
  },
  {
    path: '/docs',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>,
  },
  {
    path: '/refactor',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h9M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>,
  },
  {
    path: '/repos',
    icon: <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.4"/>
      <path d="M8 6v4M6 8h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>,
  },
];

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13.5 10A6 6 0 016 2.5a6 6 0 100 11A6 6 0 0013.5 10z"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Sidebar({ activeIdx }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { C, isDark, toggle } = useTheme();

  return (
    <div style={{
      width: 56, borderRight: `1px solid ${C.border}`,
      padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 4,
      background: C.panelAlt,
    }}>
      {NAV.map((item, i) => {
        const active = activeIdx !== undefined ? i === activeIdx : location.pathname === item.path;
        return (
          <div key={i} onClick={() => navigate(item.path)} style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8,
            background: active ? C.accentSoft : 'transparent',
            color: active ? C.text : C.textMute,
            cursor: 'pointer',
          }}>{item.icon}</div>
        );
      })}

      {/* Push toggle to bottom */}
      <div style={{ flex: 1 }} />

      <button
        onClick={toggle}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, border: 'none', cursor: 'pointer',
          background: 'transparent', color: C.textMute,
        }}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );
}
