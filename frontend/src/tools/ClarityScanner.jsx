import React, { useState } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';
import { C } from '../theme';
import { runAnalysis, approveResult, rejectResult, mapToFinding } from '../api';

export default function ClarityScanner() {
  const [language, setLanguage] = useState('java');
  const [repoId, setRepoId] = useState('');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sample = SAMPLES[language];

  async function handleRun() {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await runAnalysis(repoId, 'CLARITY');
      setFindings(results.map(mapToFinding));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(action, finding) {
    if (action === 'Approve') {
      const updated = await approveResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    } else if (action === 'Reject') {
      const updated = await rejectResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    }
  }

  return (
    <AppShell tab="MindUrCode — Clarity" url="minduurcode.app/clarity">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/clarity/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: loading ? 'Scanning…' : 'Scan', primary: true, onClick: handleRun }]}
        extras={
          <input
            placeholder="Repo ID"
            value={repoId}
            onChange={e => setRepoId(e.target.value)}
            style={{ fontSize: 12, padding: '2px 6px', marginRight: 8, borderRadius: 4,
              border: `1px solid ${C.border}`, background: C.bg, color: C.text, width: 280 }}
          />
        }
      />
      {error && <div style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}>{error}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar activeIdx={2} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title={sample.file} badge={`${findings.length} issues`} badgeKind="warn"
            lines={sample.original} totalLines={sample.lineCount}
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Issues', count: findings.length }, { label: 'Metrics' }, { label: 'History' }]}
        findings={findings}
        onAction={handleAction}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
