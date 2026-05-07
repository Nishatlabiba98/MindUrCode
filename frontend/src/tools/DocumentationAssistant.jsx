import React, { useState } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';

export default function DocumentationAssistant() {
  const [language, setLanguage] = useState('java');
  const sample = SAMPLES[language];

  // TODO: backend should call LLM to generate Javadoc / docstrings / TSDoc
  const findings = [
    { sev: 'blue', tag: 'Missing docstring', tagColor: 'blue',
      title: 'getActiveUsers has no documentation',
      desc: 'Generate a docstring with @param and @return tags.',
      loc: `${sample.file}:1`, actions: ['Generate', 'Insert'] },
    { sev: 'green', tag: 'Inline comment', tagColor: 'green',
      title: 'Add inline comment to nested check',
      desc: 'A short note explains the email-presence guard for future readers.',
      loc: `${sample.file}:7`, actions: ['Insert'] },
  ];

  return (
    <AppShell tab="MindUrCode — Docs" url="minduurcode.app/docs">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/docs/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[{ label: 'Generate' }, { label: 'Insert all', primary: true }]}
      />
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
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
