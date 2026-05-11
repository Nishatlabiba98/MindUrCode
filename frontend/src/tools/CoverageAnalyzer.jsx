import React, { useState, useEffect } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';
import { runAnalysis, approveResult, rejectResult, mapToFinding, fetchMethod, fetchLatestResults } from '../api';
import RepoPicker from '../components/RepoPicker';
import { C } from '../theme';

export default function CoverageAnalyzer() {
  const [language, setLanguage] = useState('java');
  const [repoId, setRepoId] = useState(localStorage.getItem('mindurcode_repoId') || '');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [methodCode, setMethodCode] = useState('');
  const sample = SAMPLES[language];

  useEffect(() => {
    if (!repoId) return;
    fetchLatestResults(repoId, 'COVERAGE')
      .then(results => { if (results.length) setFindings(results.map(mapToFinding).filter(Boolean)); })
      .catch(() => {});
  }, [repoId]);

  async function handleRun() {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await runAnalysis(repoId, 'COVERAGE');
      setFindings(results.map(mapToFinding).filter(Boolean));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelect(finding) {
    setSelectedFinding(finding);
    try {
      const method = await fetchMethod(finding._raw.methodId);
      setMethodCode(method.rawCode || '');
    } catch (e) {
      setMethodCode('Could not load method code.');
    }
  }

  async function handleAction(action, finding) {
    if (action === 'Approve') {
      const updated = await approveResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    } else if (action === 'Edit') {
      setFindings(prev => prev.map(x => x.id === finding.id ? finding : x));
    } else if (action === 'Reject') {
      const updated = await rejectResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    }
  }

  return (
    <AppShell tab="MindUrCode — Coverage" url="minduurcode.app/coverage">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/coverage/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: loading ? 'Running…' : 'Run Coverage', primary: true, onClick: handleRun }]}
        extras={<RepoPicker onRepoId={setRepoId} />}
      />
      {error && <div style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}>{error}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar activeIdx={1} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title="Method" badge="Coverage map" badgeKind="info"
            lines={[]} totalLines={0}
            rawText={methodCode || ''}
            placeholder="Select a finding below to view the method code."
          />
          <CodePane
            title="AI Suggestion" badge="Test gaps" badgeKind="warn"
            lines={[]} totalLines={0}
            rawText={selectedFinding ? (selectedFinding.code || selectedFinding.desc) : ''}
            placeholder="Select a finding below to view the suggestion."
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Gaps', count: findings.length }, { label: 'Files' }, { label: 'Report' }]}
        findings={findings}
        onSelect={handleSelect}
        onAction={handleAction}
        selectedId={selectedFinding?.id}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
