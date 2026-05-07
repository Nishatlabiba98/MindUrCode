import React, { useState } from 'react';
import { C } from '../theme';
import { sevColor, tagPalette } from '../syntax';

function Tab({ label, active, count, onClick }) {
  return (
    <div onClick={onClick} style={{
      padding: '12px 4px', marginRight: 22, fontSize: 13,
      borderBottom: active ? `2px solid ${C.text}` : '2px solid transparent',
      color: active ? C.text : C.textDim, fontWeight: active ? 600 : 500,
      cursor: 'pointer',
    }}>
      {label}{count != null && ` (${count})`}
    </div>
  );
}

function FindingRow({ f }) {
  const tag = tagPalette[f.tagColor] || tagPalette.gray;
  return (
    <div style={{
      display: 'flex', gap: 14, padding: '14px 18px',
      borderBottom: `1px solid ${C.border}`,
      alignItems: 'flex-start',
    }}>
      <div style={{
        width: 9, height: 9, borderRadius: '50%',
        background: sevColor(f.sev), marginTop: 6, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600, marginBottom: 3 }}>{f.title}</div>
        <div style={{ fontSize: 12.5, color: C.textDim, marginBottom: 8 }}>{f.desc}</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{
            padding: '2px 9px', borderRadius: 999, fontSize: 11,
            background: tag.bg, color: tag.text, border: `1px solid ${tag.border}`,
            fontWeight: 500,
          }}>{f.tag}</span>
          {f.actions && f.actions.map((a, i) => (
            <span key={i} style={{
              padding: '2px 9px', borderRadius: 6, fontSize: 11,
              background: C.panel, color: C.text,
              border: `1px solid ${C.border}`, fontWeight: 500, cursor: 'pointer',
            }}>{a}</span>
          ))}
        </div>
      </div>
      <div style={{ fontSize: 12, color: C.textMute, whiteSpace: 'nowrap', marginTop: 4 }}>{f.loc}</div>
    </div>
  );
}

export default function FindingsPanel({ tabs, findings, height = 360 }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column', background: C.panel }}>
      <div style={{
        display: 'flex', alignItems: 'center',
        padding: '0 18px', borderBottom: `1px solid ${C.border}`, background: C.panel,
      }}>
        {tabs.map((t, i) => (
          <Tab key={i} label={t.label} count={t.count}
            active={i === activeTab} onClick={() => setActiveTab(i)} />
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {findings.map((f, i) => <FindingRow key={i} f={f} />)}
      </div>
    </div>
  );
}
