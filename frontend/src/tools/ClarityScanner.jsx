import React, { useState, useEffect } from 'react';
import { SAMPLES, LANGUAGES } from '../data/samples';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import ToolStrip from '../components/ToolStrip';
import Sidebar from '../components/Sidebar';
import CodePane from '../components/CodePane';
import FindingsPanel from '../components/FindingsPanel';
import StatusBar from '../components/StatusBar';
import { runAnalysis, approveResult, rejectResult, mapToFinding, sortFindings, fetchMethod, fetchLatestResults } from '../api';
import RepoPicker from '../components/RepoPicker';
import { useTheme } from '../ThemeContext';

export default function ClarityScanner() {
  const { C, btnStyle } = useTheme();
  const [language, setLanguage] = useState('java');
  const [repoId, setRepoId] = useState(localStorage.getItem('mindurcode_repoId') || '');
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedFinding, setSelectedFinding] = useState(null);
  const [methodCode, setMethodCode] = useState('');
  const [showSnippet, setShowSnippet] = useState(false);
  const [snippet, setSnippet] = useState('');
  const sample = SAMPLES[language];

  useEffect(() => {
    let isActive = true;
    setError(null);
    setFindings([]);

    if (!repoId) {
      return () => {
        isActive = false;
      };
    }

    fetchLatestResults(repoId, 'CLARITY')
      .then(results => {
        if (!isActive) return;
        const mapped = sortFindings(results.map(mapToFinding).filter(Boolean));
        if (mapped.length) { setFindings(mapped); return; }
        const pending = JSON.parse(localStorage.getItem('mindurcode_pendingRun') || '[]');
        if (pending.includes('CLARITY')) {
          const updated = pending.filter(t => t !== 'CLARITY');
          updated.length
            ? localStorage.setItem('mindurcode_pendingRun', JSON.stringify(updated))
            : localStorage.removeItem('mindurcode_pendingRun');
          handleRun();
        }
      })
      .catch((e) => {
        if (!isActive) return;
        setFindings([]);
        setError(e?.message || 'Failed to load latest CLARITY results.');
      });

    return () => {
      isActive = false;
    };
  }, [repoId]);

  async function handleRun() {
    if (!repoId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await runAnalysis(repoId, 'CLARITY');
      setFindings(sortFindings(results.map(mapToFinding).filter(Boolean)));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSnippetSubmit() {
    if (!snippet.trim()) return;
    setMethodCode(snippet.trim());
    setShowSnippet(false);
    setFindings([{
      id: 'snippet-1',
      sev: 'blue',
      tag: 'PENDING',
      tagColor: 'blue',
      title: 'Snippet loaded — run Scan to analyze',
      desc: 'Your code snippet is loaded in the Method pane. Connect Ollama and click Scan with a Repo ID to get AI suggestions, or review the code manually.',
      loc: 'Snippet',
      actions: [],
      _raw: { methodId: 'snippet-1' },
    }]);
    setSelectedFinding(null);
  }

  async function handleSelect(finding) {
    setSelectedFinding(finding);
    if (finding.id.startsWith('snippet')) return;
    try {
      const method = await fetchMethod(finding._raw.methodId);
      setMethodCode(method.rawCode || '');
    } catch (e) {
      setMethodCode('Could not load method code.');
    }
  }

  async function handleAction(action, finding) {
    if (action === 'Edit') {
      setFindings(prev => prev.map(x => x.id === finding.id ? finding : x));
    } else if (action === 'Approve') {
      if (finding.id.startsWith('snippet')) return;
      const updated = await approveResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    } else if (action === 'Reject') {
      if (finding.id.startsWith('snippet')) return;
      const updated = await rejectResult(finding.id);
      setFindings(f => f.map(x => x.id === updated.id ? mapToFinding(updated) : x));
    }
  }

  return (
    <AppShell tab="MindUrCode — Clarity" url="minduurcode.app/clarity">
      <MenuBar />
      <ToolStrip
        url={`minduurcode.app/clarity/${sample.file}`}
        language={language} setLanguage={setLanguage} languages={LANGUAGES}
        actions={[
          { label: 'Test a small snippet', primary: false, onClick: () => setShowSnippet(true) },
          { label: loading ? 'Scanning…' : 'Scan', primary: true, onClick: handleRun },
        ]}
        extras={<RepoPicker onRepoId={setRepoId} />}
      />

      {/* Snippet modal */}
      {showSnippet && (
        <div style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(0,0,0,0.4)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:C.panel, border:`1px solid ${C.border}`, borderRadius:12, padding:24, width:560, display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:14, fontWeight:600, color:C.text }}>Paste a code snippet</div>
            <p style={{ fontSize:12, color:C.textDim, margin:0 }}>Paste any Java method or class. It will load into the Method pane so you can review it. Connect Ollama to get AI analysis.</p>
            <textarea
              value={snippet}
              onChange={e => setSnippet(e.target.value)}
              placeholder="public String getUserData(int id) {\n    return database.delete(id);\n}"
              rows={10}
              style={{ width:'100%', fontFamily:'"JetBrains Mono", monospace', fontSize:12.5, padding:'10px 12px', background:C.bg, color:C.text, border:`1px solid ${C.borderStrong}`, borderRadius:6, resize:'vertical', outline:'none' }}
            />
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button onClick={() => setShowSnippet(false)} style={{ ...btnStyle(false), height:34, fontSize:13 }}>Cancel</button>
              <button onClick={handleSnippetSubmit} disabled={!snippet.trim()} style={{ ...btnStyle(true), height:34, fontSize:13, opacity:snippet.trim()?1:0.4 }}>Load snippet</button>
            </div>
          </div>
        </div>
      )}

      {error && <div style={{ padding:'4px 12px', fontSize:12, color:'red' }}>{error}</div>}
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        <Sidebar activeIdx={2} />
        <div style={{ flex:1, display:'flex', minWidth:0 }}>
          <CodePane
            title="Method" badge={`${findings.length} issues`} badgeKind="warn"
            lines={[]} totalLines={0}
            rawText={methodCode || ''}
            placeholder='Click "Test a small snippet" or select a finding below.'
          />
          <CodePane
            title="AI Suggestion" badge="Clarity" badgeKind="info"
            lines={[]} totalLines={0}
            rawText={selectedFinding ? (selectedFinding.code || selectedFinding.desc) : ''}
            placeholder="Select a finding below to view the suggestion."
          />
        </div>
      </div>
      <FindingsPanel
        tabs={[{ label:'Issues', count:findings.length }, { label:'Metrics' }, { label:'History' }]}
        findings={findings}
        onSelect={handleSelect}
        onAction={handleAction}
        selectedId={selectedFinding?.id}
      />
      <StatusBar language={sample.label} file={sample.file} lineCount={sample.lineCount} />
    </AppShell>
  );
}
