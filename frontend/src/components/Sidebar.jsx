import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import {
  DashboardIcon, CoverageIcon, ClarityIcon, DocsIcon, RefactorIcon, SimplifyIcon,
  SunIcon, MoonIcon,
} from './icons';

// Dashboard sits FIRST and uses the 4-square-grid icon — same icon, same
// meaning on both the Dashboard page and every tool page. Each tool below it
// has a unique, distinct icon (see icons.jsx). No icon is reused for two
// concepts anywhere in the app.
const NAV = [
  { path: '/dashboard', title: 'Dashboard', icon: <DashboardIcon /> },
  { path: '/coverage',  title: 'Coverage',  icon: <CoverageIcon /> },
  { path: '/clarity',   title: 'Clarity',   icon: <ClarityIcon /> },
  { path: '/docs',      title: 'Docs',      icon: <DocsIcon /> },
  { path: '/refactor',  title: 'Refactor',  icon: <RefactorIcon /> },
  { path: '/simplify',  title: 'Simplify',  icon: <SimplifyIcon /> },
];

// `activeIdx` is still accepted for backward compatibility but is no longer
// needed — the active state is derived from the URL by default.
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
          <div
            key={item.path}
            onClick={() => navigate(item.path)}
            title={item.title}
            style={{
              width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
              background: active ? C.accentSoft : 'transparent',
              color: active ? C.text : C.textMute,
              cursor: 'pointer',
            }}
          >
            {item.icon}
          </div>
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
