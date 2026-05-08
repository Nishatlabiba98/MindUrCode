import React, { useState } from 'react';
import { C, btnStyle } from '../theme';
import { getReposByUser } from '../api';

export default function RepoPicker({ onRepoId }) {
  const [userId, setUserId] = useState('');
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleLoad() {
    if (!userId.trim()) return;
    setLoading(true);
    setError(null);
    setRepos(null);
    onRepoId('');
    try {
      const data = await getReposByUser(userId.trim());
      setRepos(data);
      if (data.length === 1) onRepoId(data[0].id);
    } catch (e) {
      setError('No repos found');
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleLoad();
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
        onChange={e => setUserId(e.target.value)}
        onKeyDown={handleKeyDown}
        style={{ ...inputStyle, width: 200, fontFamily: 'monospace', fontSize: 11 }}
      />
      <button
        onClick={handleLoad}
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
          <select
            defaultValue=""
            onChange={e => onRepoId(e.target.value)}
            style={{ ...inputStyle, width: 180, cursor: 'pointer' }}
          >
            {repos.length > 1 && <option value="" disabled>Pick a repo…</option>}
            {repos.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        )
      )}

      {error && (
        <span style={{ fontSize: 11, color: 'oklch(60% 0.19 25)' }}>{error}</span>
      )}
    </div>
  );
}
