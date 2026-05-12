import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import Sidebar from '../components/Sidebar';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { C, isDark } = useTheme();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navigate('/dashboard');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  const landingStyle = isDark ? {
    '--bg-0': '#04060f',
    '--bg-1': '#0a0d1f',
    '--cyan': '#4dd2ff',
    '--blue': '#5b8bff',
    '--purple': '#a674ff',
    '--ink': '#e9eefb',
    '--ink-dim': '#9aa3bf',
  } : {
    '--bg-0': '#f5f7fb',
    '--bg-1': '#fafbfc',
    '--cyan': '#0891b2',
    '--blue': '#2563eb',
    '--purple': '#7c3aed',
    '--ink': '#0f172a',
    '--ink-dim': '#64748b',
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <div className="landing" style={landingStyle} data-screen-label="01 Landing">
        <main className="landing__panel">
          <div className="landing__meta">
            <span className="dot" />
            Local AI · Ready
          </div>

          <div className="landing__logo-wrap">
            <img className="landing__logo" src="/logo.png" alt="MindUrCode" />
          </div>

          <button
            type="button"
            className="landing__start"
            onClick={() => navigate('/dashboard')}
            aria-label="Start MindUrCode"
            style={{
              color: isDark ? '#061026' : '#ffffff',
            }}
          >
            <span>Start</span>
            <span className="arrow" aria-hidden="true">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h9M9 4l4 4-4 4" stroke={isDark ? '#061026' : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </button>

          <div className="landing__hint">
            Press <kbd>Enter</kbd> to begin · v1.0.0 · Java + Local Models
          </div>
        </main>

        <div className="landing__corner">
          <span>MindUrCode · Final Project</span>
          <span className="right">One App · One Responsibility · Five Tools</span>
        </div>
      </div>
    </div>
  );
}
