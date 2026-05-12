import React, { useState } from 'react';
import { fetchRepos } from '../api';
import { useTheme } from '../ThemeContext';

export default function RepoSelector({ repoId, setRepoId }) {
  const { C } = useTheme();
  const [userId, setUserId] = useState('');
  const [repos, setRepos] = useState([]);
  const [error, setError] = useState(null);

  async function handleLoad() {
    if (!userId) return;
    setError(null);
    try {
      const data = await fetchRepos(userId);
      setRepos(data);
      if (data.length > 0) setRepoId(data[0].id);
    } catch (e) {
      setError('Could not load repos');
    }
  }

  const inputStyle = {
    fontSize: 12, padding: '2px 6px', borderRadius: 4,
    border: `1px solid ${C.border}`, background: C.bg, color: C.text,
  };

  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginRight: 8 }}>
      <input
        placeholder="User ID"
        value={userId}
        onChange={e => setUserId(e.target.value)}
        style={{ ...inputStyle, width: 200 }}
      />
      <button
        onClick={handleLoad}
        style={{ ...inputStyle, cursor: 'pointer', padding: '2px 8px' }}
      >
        Load
      </button>
      {repos.length > 0 && (
        <select
          value={repoId}
          onChange={e => setRepoId(e.target.value)}
          style={{ ...inputStyle, maxWidth: 200 }}
        >
          {repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      )}
      {error && <span style={{ fontSize: 11, color: 'red' }}>{error}</span>}
    </div>
  );
}
