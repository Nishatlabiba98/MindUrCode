import React, { useState } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';
import { runAnalysis, approveResult, rejectResult, mapToFinding, fetchMethod } from '../api';
import RepoPicker from '../components/RepoPicker';
import { C } from '../theme';

export default function RefactoringAdvisor() {
  const [language, setLanguage] = useState('java');
  const [repoId, setRepoId] = useState('');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [methodCode, setMethodCode] = useState('');
  const sample = SAMPLES[language];

  async function handleRun() {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await runAnalysis(repoId, 'REFACTORING');
      setFindings(results.map(mapToFinding));
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
    } else if (action === 'Reject') {
      const updated = await rejectResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    }
  }

  const preStyle = {
    margin: 0, padding: '12px 16px',
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: 12.5, color: C.text, whiteSpace: 'pre-wrap',
  };
  const placeholderStyle = { padding: 16, color: C.textMute, fontSize: 13 };

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
        <Sidebar activeIdx={4} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title="Method" badge="Before" badgeKind="neutral"
            lines={[]} totalLines={0}
            rightContent={
              methodCode
                ? <pre style={preStyle}>{methodCode}</pre>
                : <div style={placeholderStyle}>Select a finding below to view the method code.</div>
            }
          />
          <CodePane
            title="AI Suggestion" badge="After" badgeKind="good"
            lines={[]} totalLines={0}
            rightContent={
              selectedFinding
                ? <pre style={preStyle}>{selectedFinding.desc}</pre>
                : <div style={placeholderStyle}>Select a finding below to view the suggestion.</div>
            }
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Recommendations', count: findings.length }, { label: 'Applied' }, { label: 'Diff' }]}
        findings={findings}
        onSelect={handleSelect}
        onAction={handleAction}
        selectedId={selectedFinding?.id}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
