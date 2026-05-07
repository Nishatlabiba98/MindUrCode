import React, { useState } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';

export default function RefactoringAdvisor() {
  const [language, setLanguage] = useState('java');
  const sample = SAMPLES[language];

  // TODO: backend should detect smells (long method, dead code, duplication, etc.)
  const findings = [
    { sev: 'purple', tag: 'Extract method', tagColor: 'purple',
      title: 'Pull validation chain into isEligible(user)',
      desc: 'The non-null + isActive + email check is a single concept. Extract for reuse.',
      loc: `${sample.file}:5–7`, actions: ['Apply', 'Preview'] },
    { sev: 'blue', tag: 'Replace loop', tagColor: 'blue',
      title: 'Use enhanced for-loop / for-of',
      desc: 'Index variable is only used to read users[i]. Switch to a direct iteration.',
      loc: `${sample.file}:3`, actions: ['Apply'] },
    { sev: 'orange', tag: 'Smell: Long method', tagColor: 'orange',
      title: 'Method is doing too much',
      desc: 'Filtering and projecting are two responsibilities. Consider splitting.',
      loc: `${sample.file}:1` },
  ];

  return (
    <AppShell tab="MindUrCode — Refactor" url="minduurcode.app/refactor">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/refactor/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: 'Analyze' }, { label: 'Apply all', primary: true }]}
      />
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <Sidebar activeIdx={4} />
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <CodePane
            title={sample.file} badge="Before" badgeKind="neutral"
            lines={sample.original} totalLines={sample.lineCount}
          />
          <CodePane
            title={sample.file.replace(/\.(\w+)$/, '.refactored.$1')}
            badge="After" badgeKind="good"
            lines={sample.original} totalLines={sample.lineCount}
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label: 'Recommendations', count: findings.length }, { label: 'Applied' }, { label: 'Diff' }]}
        findings={findings}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
