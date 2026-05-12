import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { getReposByUser, deleteRepo } from '../api';

const KEY_USER = 'mindurcode_userId';
const KEY_REPO = 'mindurcode_repoId';

export default function RepoPicker({ onRepoId }) {
  const { C, btnStyle } = useTheme();
  const [userId, setUserId] = useState('');
  const [repos, setRepos] = useState(null);
  const [selectedRepoId, setSelectedRepoId] = useState(localStorage.getItem(KEY_REPO) || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // On mount: restore saved userId and auto-load repos
  useEffect(() => {
    const savedUser = localStorage.getItem(KEY_USER);
    if (savedUser) {
      setUserId(savedUser);
      loadRepos(savedUser);
    }
  }, []);

  async function loadRepos(uid) {
    if (!uid || !uid.trim()) return;
    setLoading(true);
    setError(null);
    setRepos(null);
    onRepoId('');
    try {
      const data = await getReposByUser(uid.trim());
      setRepos(data);

      // Auto-select saved repo if it's in the list
      const savedRepo = localStorage.getItem(KEY_REPO);
      if (savedRepo && data.find(r => r.id === savedRepo)) {
        setSelectedRepoId(savedRepo);
        onRepoId(savedRepo);
      } else if (data.length === 1) {
        setSelectedRepoId(data[0].id);
        localStorage.setItem(KEY_REPO, data[0].id);
        onRepoId(data[0].id);
      } else {
        setSelectedRepoId('');
      }
    } catch (e) {
      setError('No repos found');
    } finally {
      setLoading(false);
    }
  }

  function handleUserChange(e) {
    setUserId(e.target.value);
    localStorage.setItem(KEY_USER, e.target.value);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') loadRepos(userId);
  }

  function handleRepoChange(e) {
    const id = e.target.value;
    setSelectedRepoId(id);
    localStorage.setItem(KEY_REPO, id);
    onRepoId(id);
  }

  async function handleDelete(repoId) {
    try {
      await deleteRepo(repoId);
      const updated = (repos || []).filter(r => r.id !== repoId);
      setRepos(updated);
      if (selectedRepoId === repoId) {
        setSelectedRepoId('');
        localStorage.removeItem(KEY_REPO);
        onRepoId('');
      }
    } catch {
      // silently ignore
    }
  }

  const inputStyle = {
    height: 28, padding: '0 8px', fontSize: 12,
    background: C.bg, color: C.text,
    border: `1px solid ${C.border}`, borderRadius: 6,
    fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 6 }}>
      <input
        placeholder="User ID"
        value={userId}
        onChange={handleUserChange}
        onKeyDown={handleKeyDown}
        style={{ ...inputStyle, width: 200, fontFamily: 'monospace', fontSize: 11 }}
      />
      <button
        onClick={() => loadRepos(userId)}
        disabled={!userId.trim() || loading}
        style={{
          ...btnStyle(false),
          height: 28, fontSize: 12,
          opacity: !userId.trim() || loading ? 0.5 : 1,
          cursor: !userId.trim() || loading ? 'default' : 'pointer',
        }}
      >
        {loading ? '…' : 'Load'}
      </button>

      {repos !== null && (
        repos.length === 0 ? (
          <span style={{ fontSize: 11, color: C.textMute }}>No repos</span>
        ) : (
          <>
            <select
              value={selectedRepoId}
              onChange={handleRepoChange}
              style={{ ...inputStyle, width: 180, cursor: 'pointer' }}
            >
              {repos.length > 1 && <option value="" disabled>Pick a repo…</option>}
              {repos.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {selectedRepoId && (
              <button
                title="Delete this repository"
                onClick={() => handleDelete(selectedRepoId)}
                style={{ width:22, height:22, border:'none', borderRadius:4, background:'transparent', color:C.textMute, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, lineHeight:1, padding:0, flexShrink:0 }}
                onMouseEnter={e => { e.currentTarget.style.color='oklch(58% 0.21 25)'; e.currentTarget.style.background='oklch(95% 0.02 25)'; }}
                onMouseLeave={e => { e.currentTarget.style.color=C.textMute; e.currentTarget.style.background='transparent'; }}
              >×</button>
            )}
          </>
        )
      )}

      {error && (
        <span style={{ fontSize: 11, color: 'oklch(60% 0.19 25)' }}>{error}</span>
      )}
    </div>
  );
}
