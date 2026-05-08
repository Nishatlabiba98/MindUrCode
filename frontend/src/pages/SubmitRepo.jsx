import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { C, btnStyle } from '../theme';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import { submitRepo } from '../api';

export default function SubmitRepo() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const run = await submitRepo(name.trim(), sourcePath.trim(), userId.trim());
      setResult(run);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <MenuBar />

      {/* top bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', height: 44,
        borderBottom: `1px solid ${C.border}`, background: C.panel,
        fontSize: 12, color: C.textDim,
      }}>
        <span style={{ fontWeight: 600, color: C.text, fontSize: 13 }}>Submit Repository</span>
        <span style={{ fontFamily: 'monospace' }}>mindurcode.app/repos</span>
      </div>

      {/* centered form area */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: C.bg, padding: 32,
      }}>
        <div style={{
          width: '100%', maxWidth: 480,
          background: C.panel, border: `1px solid ${C.border}`,
          borderRadius: 12, padding: 32,
        }}>

          {result ? (
            <Success run={result} onGoToTool={() => navigate('/simplify')} />
          ) : (
            <>
              <h2 style={{ margin: '0 0 6px', fontSize: 18, fontWeight: 600, color: C.text }}>
                Submit a Repository
              </h2>
              <p style={{ margin: '0 0 28px', fontSize: 13, color: C.textDim, lineHeight: 1.5 }}>
                Enter a local path or GitHub URL to ingest the code and extract all methods.
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <Field
                  label="Repository Name"
                  placeholder="e.g. my-spring-app"
                  value={name}
                  onChange={setName}
                />
                <Field
                  label="Local Path or GitHub URL"
                  placeholder="e.g. /home/dev/project  or  https://github.com/org/repo"
                  value={sourcePath}
                  onChange={setSourcePath}
                />
                <Field
                  label="User ID"
                  placeholder="e.g. 3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  value={userId}
                  onChange={setUserId}
                  mono
                />

                {error && (
                  <p style={{ margin: 0, fontSize: 12, color: 'oklch(60% 0.19 25)' }}>
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || !name || !sourcePath || !userId}
                  style={{
                    ...btnStyle(true),
                    height: 40, fontSize: 13, marginTop: 4,
                    opacity: loading || !name || !sourcePath || !userId ? 0.5 : 1,
                    cursor: loading || !name || !sourcePath || !userId ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Ingesting…' : 'Submit Repository'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, placeholder, value, onChange, mono }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 500, color: C.text }}>{label}</label>
      <input
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          height: 36, padding: '0 10px', fontSize: 13,
          fontFamily: mono ? 'monospace' : 'inherit',
          background: C.bg, color: C.text,
          border: `1px solid ${C.border}`, borderRadius: 6,
          outline: 'none',
        }}
      />
    </div>
  );
}

function Success({ run, onGoToTool }) {
  return (
    <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center' }}>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: 'oklch(95% 0.04 145)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22,
      }}>✓</div>
      <div>
        <p style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 600, color: C.text }}>
          Repository ingested
        </p>
        <p style={{ margin: 0, fontSize: 12, color: C.textDim }}>
          Analysis run <code style={{ fontFamily: 'monospace', color: C.accent }}>{run.id}</code> is {run.status?.toLowerCase()}.
        </p>
      </div>
      <button onClick={onGoToTool} style={{ ...btnStyle(true), height: 38, fontSize: 13 }}>
        Go to Analysis Tools →
      </button>
    </div>
  );
}
