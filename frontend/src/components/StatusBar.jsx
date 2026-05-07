import React from 'react';
import { C } from '../theme';

export default function StatusBar({ language, file, lineCount, parser = 'Parser 4.12', extras }) {
  return (
    <div style={{
      height: 30, background: 'oklch(18% 0.02 260)', color: 'oklch(82% 0.01 260)',
      display: 'flex', alignItems: 'center', padding: '0 14px',
      fontSize: 11.5, fontFamily: '"JetBrains Mono", monospace', gap: 18,
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.good }} />
        Ready
      </span>
      <span>{language}</span>
      <span>{parser}</span>
      {extras}
      <div style={{ flex: 1 }} />
      <span>{file} — {lineCount} lines</span>
    </div>
  );
}
