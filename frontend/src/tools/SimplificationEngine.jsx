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

export default function SimplificationEngine() {
  const [language, setLanguage] = useState('java');
  const sample = SAMPLES[language];

  // TODO: wire these to your backend
  const findings = [
    { sev: 'orange', tag: 'Nested conditionals', tagColor: 'orange',
      title: 'Three nested if-statements can be combined',
      desc: 'Lines 5–7 check non-null, isActive(), and email. Combine with && operators.',
      loc: `${sample.file}:5–11`, actions: ['Apply', 'Preview'] },
    { sev: 'blue', tag: 'For-loop → Stream', tagColor: 'blue',
      title: 'Use Stream API for filter/map/collect',
      desc: 'Index-based for-loop can be replaced with users.stream().filter(...).map(...).collect().',
      loc: `${sample.file}:3–12`, actions: ['Apply', 'Preview'] },
  ];

  return (
    <AppShell tab="MindUrCode — Simplification" url="minduurcode.app/simplify">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/simplify/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: 'Analyze' }, { label: 'Apply All', primary: true }]}
      />
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
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
