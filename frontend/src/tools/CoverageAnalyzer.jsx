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
import RepoSelector from '../components/RepoSelector';

export default function CoverageAnalyzer() {
  const [language, setLanguage] = useState('java');
  const [repoId, setRepoId] = useState('');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const sample = SAMPLES[language];

  const lineMeta = sample.original.map((_, i) => {
    const covered = i % 5 !== 3;
    return { gutterStripe: covered ? C.covGreen : C.covRed };
  });

  async function handleRun() {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await runAnalysis(repoId, 'COVERAGE');
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
    <AppShell tab="MindUrCode — Coverage" url="minduurcode.app/coverage">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/coverage/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: loading ? 'Running…' : 'Run Coverage', primary: true, onClick: handleRun }]}
        extras={<RepoSelector repoId={repoId} setRepoId={setRepoId} />}
      />
      {error && <div style={{ padding: '4px 12px', fontSize: 12, color: 'red' }}>{error}</div>}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar activeIdx={1} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title={sample.file} badge="Coverage map" badgeKind="info"
            lines={sample.original} totalLines={sample.lineCount}
            lineMeta={lineMeta}
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Gaps', count: findings.length }, { label: 'Files' }, { label: 'Report' }]}
        findings={findings}
        onAction={handleAction}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
