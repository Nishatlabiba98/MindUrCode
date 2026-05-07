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

export default function CoverageAnalyzer() {
  const [language, setLanguage] = useState('java');
  const sample = SAMPLES[language];

  // TODO: replace with real coverage data from JaCoCo / Coverage.py / Istanbul
  const lineMeta = sample.original.map((_, i) => {
    const covered = i % 5 !== 3;
    return { gutterStripe: covered ? C.covGreen : C.covRed };
  });

  const findings = [
    { sev: 'red', tag: 'Uncovered branch', tagColor: 'red',
      title: 'Inner null-check branch never executed in tests',
      desc: 'Line 7 — no test exercises the case where u.getEmail() is null.',
      loc: `${sample.file}:7`, actions: ['Generate test'] },
    { sev: 'yellow', tag: 'Partial branch', tagColor: 'orange',
      title: 'Loop body partially covered',
      desc: '8 of 12 statements in the loop have test coverage.',
      loc: `${sample.file}:3–12`, actions: ['View report'] },
  ];

  return (
    <AppShell tab="MindUrCode — Coverage" url="minduurcode.app/coverage">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/coverage/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: 'Run tests' }, { label: 'Refresh', primary: true }]}
        extras={
          <span style={{ fontSize: 12, color: C.textDim, marginRight: 8 }}>
            Coverage: <strong style={{ color: C.text }}>78%</strong>
          </span>
        }
      />
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
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
