import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import './Landing.css';

const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);
const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggle } = useTheme();

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

  return (
    <div className="landing" data-screen-label="01 Landing">
      <button
        className="landing__toggle"
        type="button"
        onClick={toggle}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </button>

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
        >
          <span>Start</span>
          <span className="arrow" aria-hidden="true">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h9M9 4l4 4-4 4" stroke="#061026" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  );
}
