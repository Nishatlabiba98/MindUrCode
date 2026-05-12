import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();

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
