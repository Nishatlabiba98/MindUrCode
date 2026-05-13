import React, { useState, useEffect } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';
import { runAnalysis, approveResult, rejectResult, undoResult, mapToFinding, sortFindings, fetchMethod, fetchLatestResults } from '../api';
import RepoPicker from '../components/RepoPicker';
import { useTheme } from '../ThemeContext';

export default function RefactoringAdvisor() {
  const { C } = useTheme();
  const [language, setLanguage] = useState('java');
  const [repoId, setRepoId] = useState(localStorage.getItem('mindurcode_repoId') || '');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [methodCode, setMethodCode] = useState('');
  const sample = SAMPLES[language];

  // Poll for results every 5s while empty — see CoverageAnalyzer for rationale.
  useEffect(() => {
    if (!repoId || findings.length > 0) return;
    const tick = () => fetchLatestResults(repoId, 'REFACTORING')
      .then(results => {
        const mapped = sortFindings(results.map(mapToFinding).filter(Boolean));
        if (mapped.length) setFindings(mapped);
      })
      .catch(() => {});
    tick();
    const id = setInterval(tick, 5000);
    return () => clearInterval(id);
  }, [repoId, findings.length]);

  async function handleRun() {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await runAnalysis(repoId, 'REFACTORING');
      setFindings(sortFindings(results.map(mapToFinding).filter(Boolean)));
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
    } else if (action === 'Undo') {
      const updated = await undoResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    }
  }

  return (
    <AppShell tab="MindUrCode — Refactor" url="minduurcode.app/refactor">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/refactor/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: loading ? 'Analyzing…' : 'Analyze', primary: true, onClick: handleRun }]}
        extras={<RepoPicker onRepoId={setRepoId} />}
      />
      {error && <div style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}>{error}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title="Method" badge="Before" badgeKind="neutral"
            lines={[]} totalLines={0}
            rawText={methodCode || ''}
            placeholder="Select a finding below to view the method code."
          />
          <CodePane
            title="AI Suggestion" badge="After" badgeKind="good"
            lines={[]} totalLines={0}
            rawText={selectedFinding ? (selectedFinding.code || selectedFinding.desc) : ''}
            placeholder="Select a finding below to view the suggestion."
          />
        </div>
      </div>
      <FindingsPanel
        findings={findings}
        onSelect={handleSelect}
        onAction={handleAction}
        selectedId={selectedFinding?.id}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
