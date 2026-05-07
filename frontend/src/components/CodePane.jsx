import React from 'react';
import { C } from '../theme';
import { tokColor } from '../syntax';

function CodeLine({ tokens, bg }) {
  return (
    <div style={{
      minHeight: 22, lineHeight: '22px', whiteSpace: 'pre',
      background: bg || 'transparent',
      paddingLeft: 16, paddingRight: 16, marginLeft: -16, marginRight: -16,
    }}>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: tokColor[t.cls] || C.text }}>{t.text}</span>
      ))}
    </div>
  );
}

export default function CodePane({
  title, badge, badgeKind, lines, totalLines, actions,
  lineMeta = [], rightContent,
}) {
  const visibleNums = Array.from({ length: totalLines }, (_, i) => i + 1);
  const badgePalette = {
    good:    { bg: C.goodSoft, fg: C.good, br: 'oklch(85% 0.07 145)' },
    warn:    { bg: C.warnSoft, fg: 'oklch(45% 0.13 60)', br: 'oklch(85% 0.07 60)' },
    info:    { bg: C.accentSoft, fg: C.accent, br: 'oklch(85% 0.06 250)' },
    neutral: { bg: C.panelAlt, fg: C.textDim, br: C.border },
  };
  const bp = badgePalette[badgeKind] || badgePalette.warn;

  return (
    <div style={{
      flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column',
      borderRight: `1px solid ${C.border}`,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 14px', borderBottom: `1px solid ${C.border}`, background: C.panel,
      }}>
        <span style={{
          padding: '4px 10px', borderRadius: 6,
          border: `1px solid ${C.border}`, background: C.panelAlt,
          fontSize: 12, color: C.text, fontFamily: '"JetBrains Mono", monospace',
        }}>{title}</span>
        {badge && (
          <span style={{
            padding: '4px 10px', borderRadius: 999, fontSize: 11.5, fontWeight: 500,
            background: bp.bg, color: bp.fg, border: `1px solid ${bp.br}`,
          }}>{badge}</span>
        )}
        <div style={{ flex: 1 }} />
        {actions}
      </div>

      {rightContent ? (
        <div style={{ flex: 1, minHeight: 0, overflow: 'auto', background: C.panel }}>
          {rightContent}
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', minHeight: 0, overflow: 'hidden', background: C.panel }}>
          <div style={{
            width: 44, flexShrink: 0,
            background: C.gutterBg,
            borderRight: `1px solid ${C.border}`,
            padding: '12px 0',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12, lineHeight: '22px',
            color: C.gutterText, userSelect: 'none',
            display: 'flex', flexDirection: 'column',
          }}>
            {visibleNums.map(n => {
              const meta = lineMeta[n - 1] || {};
              return (
                <div key={n} style={{
                  height: 22, display: 'flex', alignItems: 'center',
                  justifyContent: 'flex-end', position: 'relative',
                }}>
                  <span style={{ paddingRight: 10 }}>{n}</span>
                  {meta.gutterStripe && (
                    <span style={{
                      position: 'absolute', right: 0, top: 0, bottom: 0,
                      width: 3, background: meta.gutterStripe,
                    }} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{
            flex: 1, minWidth: 0, overflow: 'auto', padding: '12px 16px',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12.5, lineHeight: '22px', color: C.text,
          }}>
            {lines.map((toks, i) => (
              <CodeLine key={i} tokens={toks} bg={(lineMeta[i] || {}).bg} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
