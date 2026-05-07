import React from 'react';
import { C, btnStyle } from '../theme';

export default function ToolStrip({ url, language, setLanguage, languages, actions, extras }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 16px', borderBottom: `1px solid ${C.border}`,
      background: C.panel,
    }}>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        height: 34, padding: '0 14px', borderRadius: 8,
        background: 'oklch(22% 0.02 260)', color: 'oklch(85% 0.01 260)',
        fontFamily: '"JetBrains Mono", monospace', fontSize: 12.5,
        boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3)',
      }}>
        <span style={{ color: 'oklch(60% 0.02 260)' }}>https://</span>
        <span>{url}</span>
      </div>
      {extras}
      {actions && actions.map((a, i) => (
        <button key={i} style={btnStyle(a.primary)}>{a.label}</button>
      ))}
      <div style={{ width: 1, height: 22, background: C.border, margin: '0 4px' }} />
      <div style={{ display: 'flex', gap: 0, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
        {languages.map(([k, label]) => (
          <button
            key={k}
            onClick={() => setLanguage(k)}
            style={{
              border: 0, padding: '6px 12px', fontSize: 12,
              background: language === k ? C.accentSoft : C.panel,
              color: language === k ? C.accent : C.textDim,
              fontWeight: language === k ? 600 : 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >{label}</button>
        ))}
      </div>
    </div>
  );
}
