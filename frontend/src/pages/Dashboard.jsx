import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitRepo, getReposByUser, deleteRepo } from '../api';
import './Dashboard.css';

const TOOLS = [
  { id: 'coverage', badge: 'Coverage', title: 'Test Coverage',   desc: 'Finds untested methods and suggests specific test cases to plug the gaps.',  route: '/coverage' },
  { id: 'clarity',  badge: 'Clarity',  title: 'Clarity Scanner', desc: 'Flags confusing names and misleading method implementations.',                route: '/clarity'  },
  { id: 'docs',     badge: 'Docs',     title: 'Documentation',   desc: 'Generates Javadoc for every undocumented class and method.',                  route: '/docs'     },
  { id: 'refactor', badge: 'Refactor', title: 'Refactoring',     desc: 'Detects code smells and suggests actionable refactoring steps.',              route: '/refactor' },
  { id: 'simplify', badge: 'Simplify', title: 'Simplification',  desc: 'Replaces overly nested code with cleaner Java patterns.',                     route: '/simplify' },
];

const TOOL_TYPE_MAP = {
  coverage: 'COVERAGE', clarity: 'CLARITY', docs: 'DOCUMENTATION',
  refactor: 'REFACTORING', simplify: 'SIMPLIFICATION',
};

const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
    <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h9M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Dashboard() {
  const navigate = useNavigate();
  const [selected, setSelected]     = useState(() => new Set(['coverage']));
  const [repo,     setRepo]         = useState('');
  const [name,     setName]         = useState('');
  const [userId,   setUserId]       = useState(localStorage.getItem('mindurcode_userId') || '');
  const [loading,  setLoading]      = useState(false);
  const [error,    setError]        = useState(null);
  const [repos,    setRepos]        = useState([]);
  const [reposLoading, setReposLoading] = useState(false);

  // Auto-load repos if we have a saved userId
  useEffect(() => {
    const saved = localStorage.getItem('mindurcode_userId');
    if (saved) loadUserRepos(saved);
  }, []);

  async function loadUserRepos(uid) {
    if (!uid?.trim()) return;
    setReposLoading(true);
    try {
      const data = await getReposByUser(uid.trim());
      setRepos(data || []);
    } catch {
      setRepos([]);
    } finally {
      setReposLoading(false);
    }
  }

  async function handleDelete(repoId) {
    try {
      await deleteRepo(repoId);
      setRepos(prev => prev.filter(r => r.id !== repoId));
      if (localStorage.getItem('mindurcode_repoId') === repoId)
        localStorage.removeItem('mindurcode_repoId');
    } catch { /* silently ignore */ }
  }

  function toggle(id) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const canRun = name.trim() && repo.trim() && userId.trim() && selected.size > 0;

  async function run() {
    if (!canRun || loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await submitRepo(name.trim(), repo.trim(), userId.trim());
      const repoId = result.repository?.id || result.repositoryId || result.id;
      localStorage.setItem('mindurcode_repoId', repoId);
      localStorage.setItem('mindurcode_userId', userId.trim());
      loadUserRepos(userId.trim());

      const pending = [...selected].map(id => TOOL_TYPE_MAP[id]).filter(Boolean);
      localStorage.setItem('mindurcode_pendingRun', JSON.stringify(pending));

      const first = TOOLS.find(t => selected.has(t.id));
      navigate(first?.route || '/coverage');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const sel = selected.size;

  return (
    <div className="dash">
      <div className="dash__bg" aria-hidden="true" />

      <div className="dash__app">
        {/* ── Menu bar ── */}
        <div className="dash__menubar">
          <span className="item active">File</span>
          <span className="item">Edit</span>
          <span className="item">View</span>
          <span className="item">Export</span>
          <span className="item">Help</span>
          <span className="brand"><span className="dot" />MindUrCode · v1.0.0</span>
        </div>

        {/* ── Body ── */}
        <div className="dash__body">
          {/* Sidebar */}
          <aside className="dash__sidebar">
            <button className="icn active" title="Dashboard" type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
                <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              </svg>
            </button>
            <button className="icn" title="Coverage" type="button" onClick={() => navigate('/coverage')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icn" title="Clarity" type="button" onClick={() => navigate('/clarity')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icn" title="Docs" type="button" onClick={() => navigate('/docs')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="icn" title="Refactor" type="button" onClick={() => navigate('/refactor')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h9M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="icn" title="Simplify" type="button" onClick={() => navigate('/simplify')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 4h10M3 8h7M3 12h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </button>
            <div className="sep" />
            <button className="icn" title="Back to start" type="button" onClick={() => navigate('/')}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </aside>

          {/* Main */}
          <main className="dash__main">
            <div className="dash__header">
              <div>
                <h1 className="dash__title">MindUrCode</h1>
                <p className="dash__subtitle">
                  AI-powered Java code review — submit a repository, pick your tools, then approve every suggestion before it lands.
                </p>
              </div>
              <div className="dash__meta">
                {userId && <div className="session">USER · {userId.slice(0, 23)}</div>}
                <div>Local model · Qwen2.5-coder</div>
                <div>Parser · JavaParser 3.25</div>
              </div>
            </div>

            {/* Repo row */}
            <div className="dash__repo">
              <label className="dash__field">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M8 6v4M6 8h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="GitHub URL or local path"
                  value={repo}
                  onChange={e => setRepo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canRun && run()}
                />
              </label>
              <label className="dash__field">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <rect x="2.5" y="3.5" width="11" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M5 6.5h6M5 9.5h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="Repository name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && canRun && run()}
                />
              </label>
              <label className="dash__field dash__field--mono">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="6" r="3" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M2 14c0-3 2.7-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  placeholder="User ID (UUID)"
                  value={userId}
                  onChange={e => {
                    setUserId(e.target.value);
                    if (e.target.value.trim().length > 10) loadUserRepos(e.target.value.trim());
                  }}
                  onBlur={e => e.target.value.trim() && loadUserRepos(e.target.value.trim())}
                  onKeyDown={e => e.key === 'Enter' && canRun && run()}
                />
              </label>
              <button
                className="dash__run"
                type="button"
                onClick={run}
                disabled={!canRun || loading}
              >
                {loading ? 'Submitting…' : `Run ${sel} ${sel === 1 ? 'tool' : 'tools'}`}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h9M9 4l4 4-4 4" stroke="#061026" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            {error && <p className="dash__error">{error}</p>}

            {/* Tool tiles */}
            <div className="dash__sechead">
              <h2>Analysis Tools</h2>
              <span className="hint">Click a tile to toggle, or open it directly.</span>
              <span className="count">{sel} selected</span>
            </div>

            <div className="dash__tools">
              {TOOLS.map(t => {
                const isSelected = selected.has(t.id);
                return (
                  <div
                    key={t.id}
                    className={`dash__tool ${t.id} ${isSelected ? 'selected' : ''}`}
                    onClick={e => {
                      if (e.target.closest('.open')) { navigate(t.route); return; }
                      toggle(t.id);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(t.id); }
                    }}
                  >
                    <span className="check" aria-hidden="true"><CheckIcon /></span>
                    <div className="badge">{t.badge}</div>
                    <h3>{t.title}</h3>
                    <p>{t.desc}</p>
                    <span className="open">Open tool <ArrowIcon /></span>
                  </div>
                );
              })}
            </div>

            {/* Your repositories */}
            {(repos.length > 0 || reposLoading) && (
              <div className="dash__repo-section">
                <div className="dash__sechead">
                  <h2>Your Repositories</h2>
                </div>
                <div className="dash__repo-list">
                  {reposLoading ? (
                    <p className="dash__repo-loading">Loading…</p>
                  ) : repos.map((r, i) => (
                    <div key={r.id} className={`dash__repo-row${i > 0 ? ' bordered' : ''}`}>
                      <div className="dash__repo-info">
                        <span className="dash__repo-name">{r.name}</span>
                        <span className="dash__repo-path">{r.sourcePath}</span>
                      </div>
                      {r.addedAt && (
                        <span className="dash__repo-date">
                          {new Date(r.addedAt).toLocaleDateString()}
                        </span>
                      )}
                      <button
                        className="dash__repo-del"
                        onClick={() => handleDelete(r.id)}
                        title="Delete repository"
                      >×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How it works */}
            <div className="dash__steps">
              <div className="label">How it works</div>
              {[
                ['1', 'Submit a repo',  'Paste a GitHub URL or local path'],
                ['2', 'Pick tools',     'Select one or all five tools'],
                ['3', 'AI analyzes',    'Each method sent to local AI'],
                ['4', 'Review',         'Approve or reject every suggestion'],
              ].map(([n, t, d]) => (
                <div key={n} className="dash__step">
                  <div className="num">{n}</div>
                  <div><strong>{t}</strong><span>{d}</span></div>
                </div>
              ))}
            </div>
          </main>
        </div>

        {/* ── Status bar ── */}
        <div className="dash__status">
          <span className="ready"><span className="pulse" />Ready</span>
          <span>Java 17</span>
          <span>JavaParser 3.25</span>
          <span className="spacer" />
          <span>Qwen2.5-coder · localhost:11434</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
