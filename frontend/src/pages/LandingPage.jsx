import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../components/AppShell';
import MenuBar from '../components/MenuBar';
import Sidebar from '../components/Sidebar';
import StatusBar from '../components/StatusBar';
import { C, btnStyle } from '../theme';
import { submitRepo } from '../api';

const TOOLS = [
  { id:'coverage', path:'/coverage', label:'Test Coverage',   tag:'COVERAGE', desc:'Finds untested methods and suggests specific test cases.',      color:C.good,      soft:C.goodSoft },
  { id:'clarity',  path:'/clarity',  label:'Clarity Scanner', tag:'CLARITY',  desc:'Flags confusing names and misleading method implementations.',  color:C.accent,    soft:C.accentSoft },
  { id:'docs',     path:'/docs',     label:'Documentation',   tag:'DOCS',     desc:'Generates Javadoc for every undocumented class and method.',    color:C.sevBlue,   soft:'oklch(95% 0.03 245)' },
  { id:'refactor', path:'/refactor', label:'Refactoring',     tag:'REFACTOR', desc:'Detects code smells and suggests actionable refactoring steps.',color:C.warn,      soft:C.warnSoft },
  { id:'simplify', path:'/simplify', label:'Simplification',  tag:'SIMPLIFY', desc:'Replaces overly nested code with cleaner Java patterns.',       color:C.sevPurple, soft:'oklch(95% 0.03 300)' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [name,       setName]       = useState('');
  const [sourcePath, setSourcePath] = useState('');
  const [userId,     setUserId]     = useState(localStorage.getItem('mindurcode_userId') || '');
  const [selected,   setSelected]   = useState(new Set(['coverage']));
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);

  function toggleTool(id) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else { next.add(id); }
      return next;
    });
  }

  const TOOL_TYPE_MAP = { coverage: 'COVERAGE', clarity: 'CLARITY', docs: 'DOCUMENTATION', refactor: 'REFACTORING', simplify: 'SIMPLIFICATION' };

  async function handleRun() {
    if (!name.trim() || !sourcePath.trim() || !userId.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const run = await submitRepo(name.trim(), sourcePath.trim(), userId.trim());
      const repoId = run.repository?.id || run.repositoryId || run.id;
      localStorage.setItem('mindurcode_repoId', repoId);
      localStorage.setItem('mindurcode_userId', userId.trim());

      // Save selected tools as a pending run queue so each tool page auto-runs on load
      const pending = [...selected].map(id => TOOL_TYPE_MAP[id]).filter(Boolean);
      localStorage.setItem('mindurcode_pendingRun', JSON.stringify(pending));

      const firstTool = TOOLS.find(t => selected.has(t.id));
      navigate(firstTool?.path || '/coverage');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const canRun = name.trim() && sourcePath.trim() && userId.trim();
  const inp = { height:36, padding:'0 10px', fontSize:13, fontFamily:'inherit', background:C.bg, color:C.text, border:`1px solid ${C.border}`, borderRadius:6, outline:'none', minWidth:0, flex:1 };

  return (
    <AppShell tab="MindUrCode" url="mindurcode.app">
      <MenuBar />
      <div style={{ flex:1, display:'flex', minHeight:0 }}>
        <Sidebar />
        <div style={{ flex:1, overflowY:'auto', background:C.bg }}>
          <div style={{ background:C.panel, borderBottom:`1px solid ${C.border}`, padding:'36px 32px 28px' }}>
            <h2 style={{ margin:'0 0 6px', fontSize:20, fontWeight:600, color:C.text }}>MindUrCode</h2>
            <p style={{ margin:'0 0 22px', fontSize:13, color:C.textDim, lineHeight:1.6 }}>
              AI-powered Java code review — submit a repo, pick your tools, approve every suggestion.
            </p>
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Repository name" style={inp} />
              <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="User ID (UUID)" style={{...inp, fontFamily:'monospace', fontSize:11, flex:'none', width:220}} />
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={sourcePath} onChange={e=>setSourcePath(e.target.value)} placeholder="GitHub URL or local path" style={inp} onKeyDown={e=>e.key==='Enter'&&canRun&&handleRun()} />
              <button onClick={handleRun} disabled={!canRun||loading} style={{...btnStyle(true), height:36, fontSize:13, whiteSpace:'nowrap', flexShrink:0, opacity:canRun&&!loading?1:0.4, cursor:canRun&&!loading?'pointer':'not-allowed'}}>
                {loading ? 'Submitting…' : `Run ${selected.size} tool${selected.size>1?'s':''} →`}
              </button>
            </div>
            {error && <p style={{margin:'8px 0 0',fontSize:12,color:C.sevRed}}>{error}</p>}
          </div>

          <div style={{ padding:'22px 32px 0' }}>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:12 }}>
              <span style={{ fontSize:13, fontWeight:600, color:C.text }}>Analysis tools</span>
              <span style={{ fontSize:12, color:C.textMute }}>{selected.size} selected — click to toggle</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px,1fr))', gap:8 }}>
              {TOOLS.map(tool => {
                const sel = selected.has(tool.id);
                return (
                  <div key={tool.id} onClick={()=>toggleTool(tool.id)} style={{ background:sel?tool.soft:C.panel, border:`${sel?'1.5':'0.5'}px solid ${sel?tool.color:C.border}`, borderRadius:10, padding:'14px 14px 16px', cursor:'pointer', position:'relative', transition:'border-color 0.12s,background 0.12s' }}>
                    {sel && <div style={{ position:'absolute', top:10, right:10, width:18, height:18, borderRadius:'50%', background:tool.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'#fff', fontWeight:700 }}>✓</div>}
                    <div style={{ display:'inline-block', fontSize:10, fontWeight:600, color:tool.color, background:tool.soft, padding:'2px 7px', borderRadius:4, marginBottom:10, letterSpacing:'0.04em' }}>{tool.tag}</div>
                    <p style={{ fontSize:13, fontWeight:600, color:C.text, margin:'0 0 5px' }}>{tool.label}</p>
                    <p style={{ fontSize:12, color:C.textDim, margin:'0 0 12px', lineHeight:1.55 }}>{tool.desc}</p>
                    <span onClick={e=>{e.stopPropagation();navigate(tool.path);}} style={{ fontSize:11.5, color:tool.color, fontWeight:500, cursor:'pointer' }}>Open tool →</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ margin:'22px 32px 32px', padding:'16px 20px', background:C.panel, border:`1px solid ${C.border}`, borderRadius:10 }}>
            <p style={{ fontSize:10, fontWeight:600, color:C.textMute, margin:'0 0 12px', textTransform:'uppercase', letterSpacing:'0.06em' }}>How it works</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:14 }}>
              {[['1','Submit a repo','Paste a GitHub URL or local path'],['2','Pick tools','Select one or all five tools'],['3','AI analyzes','Each method sent to local AI'],['4','Review','Approve or reject every suggestion']].map(([n,t,d])=>(
                <div key={n} style={{ display:'flex', gap:8 }}>
                  <div style={{ width:20, height:20, borderRadius:10, background:C.accentSoft, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:600, color:C.accent }}>{n}</div>
                  <div>
                    <p style={{ fontSize:12, fontWeight:600, color:C.text, margin:'0 0 2px' }}>{t}</p>
                    <p style={{ fontSize:11.5, color:C.textMute, margin:0, lineHeight:1.5 }}>{d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <StatusBar language="Java" file="—" lineCount={0} />
    </AppShell>
  );
}
