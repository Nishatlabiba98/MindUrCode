import React, { useState } from 'react';
import { C } from '../theme';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';
import { runAnalysis, approveResult, rejectResult, mapToFinding } from '../api';
import RepoPicker from '../components/RepoPicker';

export default function SimplificationEngine() {
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
      const results = await runAnalysis(repoId, 'SIMPLIFICATION');
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
    <AppShell tab="MindUrCode — Simplification" url="minduurcode.app/simplify">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/simplify/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: loading ? 'Analyzing…' : 'Analyze', primary: true, onClick: handleRun }]}
        extras={<RepoPicker onRepoId={setRepoId} />}
      />
      {error && <div style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}>{error}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar activeIdx={0} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title={sample.file} badge="Original" badgeKind="neutral"
            lines={sample.original} totalLines={sample.lineCount}
          />
          <CodePane
            title={sample.file.replace(/\.(\w+)$/, '.simplified.$1')}
            badge="Simplified" badgeKind="good"
            lines={sample.original} totalLines={sample.lineCount}
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Suggestions', count: findings.length }, { label: 'Applied', count: 0 }, { label: 'History' }]}
        findings={findings}
        onAction={handleAction}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
