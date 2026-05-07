import React from 'react';
import { C } from '../theme';

export default function MenuBar({ items = ['File', 'Edit', 'View', 'Analysis', 'Export', 'Help'] }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '0 18px', height: 38,
      borderBottom: `1px solid ${C.border}`,
      background: C.panel, fontSize: 13, color: C.text,
    }}>
      {items.map((it, i) => (
        <span key={i} style={{ cursor: 'default', color: i === 0 ? C.text : C.textDim }}>{it}</span>
      ))}
    </div>
  );
}
