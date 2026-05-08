import React, { useState } from 'react';
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

export default function DocumentationAssistant() {
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
      const results = await runAnalysis(repoId, 'DOCUMENTATION');
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
    <AppShell tab="MindUrCode — Docs" url="minduurcode.app/docs">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/docs/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: loading ? 'Generating…' : 'Generate', primary: true, onClick: handleRun }]}
        extras={<RepoPicker onRepoId={setRepoId} />}
      />
      {error && <div style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}>{error}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar activeIdx={3} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title={sample.file} badge="Source" badgeKind="neutral"
            lines={sample.original} totalLines={sample.lineCount}
          />
          <CodePane
            title={sample.file.replace(/\.(\w+)$/, '.documented.$1')}
            badge="With docs" badgeKind="info"
            lines={sample.original} totalLines={sample.lineCount}
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Suggestions', count: findings.length }, { label: 'Inserted', count: 0 }]}
        findings={findings}
        onAction={handleAction}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
