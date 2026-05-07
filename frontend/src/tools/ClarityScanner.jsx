import React, { useState } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';

export default function ClarityScanner() {
  const [language, setLanguage] = useState('java');
  const sample = SAMPLES[language];

  // TODO: backend should compute cyclomatic complexity, naming heuristics, length metrics
  const findings = [
    { sev: 'orange', tag: 'Naming', tagColor: 'orange',
      title: 'Variable name "u" is too short',
      desc: 'Use a descriptive name like "user" to improve readability.',
      loc: `${sample.file}:4`, actions: ['Rename'] },
    { sev: 'yellow', tag: 'Complexity', tagColor: 'orange',
      title: 'Cyclomatic complexity is 7 (target ≤ 5)',
      desc: 'Consider extracting the inner branches into a helper method.',
      loc: `${sample.file}:1`, actions: ['Extract method'] },
    { sev: 'blue', tag: 'Length', tagColor: 'blue',
      title: 'Function exceeds 10 lines',
      desc: 'Long functions hurt readability. Consider splitting.',
      loc: `${sample.file}:1–14` },
  ];

  return (
    <AppShell tab="MindUrCode — Clarity" url="minduurcode.app/clarity">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/clarity/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: 'Scan' }, { label: 'Auto-fix', primary: true }]}
      />
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
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
