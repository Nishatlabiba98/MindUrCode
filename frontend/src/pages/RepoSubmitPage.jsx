import React, { useState } from 'react';
import { submitRepo } from '../api';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../ThemeContext';

export default function RepoSubmitPage() {
  const { C, btnStyle } = useTheme();
  const [name, setName] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit() {
    if (!name || !sourcePath || !userId) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const run = await submitRepo(name, sourcePath, userId);
      setResult(run);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    fontSize: 13, padding: '7px 10px', borderRadius: 6,
    border: `1px solid ${C.border}`, background: C.bg,
    color: C.text, width: '100%', marginBottom: 12,
    fontFamily: 'inherit',
  };

  return (
    <AppShell>
      <MenuBar />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar />
        <div style={{ padding: 32, maxWidth: 480 }}>
        <h2 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600 }}>Submit Repository</h2>
        <label style={{ fontSize: 12, color: C.textDim, display: 'block', marginBottom: 4 }}>Repo Name</label>
        <input placeholder="e.g. MyProject" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
        <label style={{ fontSize: 12, color: C.textDim, display: 'block', marginBottom: 4 }}>Local Path or GitHub URL</label>
        <input placeholder="e.g. /Users/you/MyProject or https://github.com/..." value={sourcePath} onChange={e => setSourcePath(e.target.value)} style={inputStyle} />
        <label style={{ fontSize: 12, color: C.textDim, display: 'block', marginBottom: 4 }}>Your User ID (UUID)</label>
        <input placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" value={userId} onChange={e => setUserId(e.target.value)} style={inputStyle} />
        <button onClick={handleSubmit} disabled={loading} style={btnStyle(true)}>
          {loading ? 'Submitting…' : 'Submit Repo'}
        </button>
        {error && <div style={{ color: 'red', marginTop: 12, fontSize: 13 }}>{error}</div>}
        {result && (
          <div style={{ marginTop: 16, fontSize: 13, padding: 12, background: C.accentSoft, borderRadius: 6 }}>
            <strong>Repo submitted!</strong> Copy this Repo ID to use in the analysis tools:
            <div style={{ fontFamily: 'monospace', marginTop: 6, wordBreak: 'break-all' }}>{result.repository?.id ?? 'check backend'}</div>
          </div>
        )}
      </div>
      </div>
    </AppShell>
  );
}
