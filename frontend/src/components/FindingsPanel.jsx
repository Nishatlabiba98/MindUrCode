import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { makeSevColor, makeTagPalette } from '../syntax';

// -----------------------------------------------------------------
// Lightweight markdown renderer — no external dependency needed.
// Handles the patterns Ollama actually produces in its responses.
// -----------------------------------------------------------------

// renderInline accepts C as a parameter since it's a plain function (not a hook)
function renderInline(text, C) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: C.text, fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11.5, background: C.panelAlt, color: C.accent, padding: '1px 5px', borderRadius: 4 }}>{part.slice(1, -1)}</code>;
    return part;
  });
}

function MarkdownBlock({ text }) {
  const { C } = useTheme();
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];
  let listType = null;

  function flushList() {
    if (!listItems.length) return;
    const Tag = listType === 'ol' ? 'ol' : 'ul';
    elements.push(
      <Tag key={elements.length} style={{ margin: '4px 0', paddingLeft: 22 }}>
        {listItems.map((li, i) => (
          <li key={i} style={{ lineHeight: 1.7, color: C.textDim }}>{renderInline(li, C)}</li>
        ))}
      </Tag>
    );
    listItems = [];
    listType = null;
  }

  lines.forEach((line, i) => {
    const heading = line.match(/^(#{1,3})\s+(.+)/);
    const bullet  = line.match(/^[-*]\s+(.*)/);
    const ordered = line.match(/^\d+\.\s+(.*)/);
    const blank   = line.trim() === '';

    if (heading) {
      flushList();
      const size = heading[1].length === 1 ? 14 : 13;
      elements.push(
        <div key={i} style={{ fontSize: size, fontWeight: 700, color: C.text, marginTop: 10, marginBottom: 4, paddingBottom: 3, borderBottom: `1px solid ${C.border}` }}>
          {renderInline(heading[2], C)}
        </div>
      );
    } else if (bullet) {
      if (listType === 'ol') flushList();
      listType = 'ul';
      listItems.push(bullet[1]);
    } else if (ordered) {
      if (listType === 'ul') flushList();
      listType = 'ol';
      listItems.push(ordered[1]);
    } else if (blank) {
      flushList();
      elements.push(<div key={i} style={{ height: 6 }} />);
    } else {
      flushList();
      elements.push(
        <div key={i} style={{ lineHeight: 1.7, color: C.textDim }}>{renderInline(line, C)}</div>
      );
    }
  });
  flushList();
  return <div>{elements}</div>;
}

function Tab({ label, active, count, onClick }) {
  const { C } = useTheme();
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

function FindingRow({ f, onSelect, onAction, selected }) {
  const { C, isDark } = useTheme();
  const sevColor = makeSevColor(C);
  const tagPalette = makeTagPalette(isDark);
  const tag = tagPalette[f.tagColor] || tagPalette.gray;
  const [editing, setEditing] = useState(false);
  const [editedDesc, setEditedDesc] = useState(f.desc);
  const [expanded, setExpanded] = useState(false);

  function handleSave() {
    const updated = { ...f, desc: editedDesc };
    onAction && onAction('Edit', updated);
    setEditing(false);
  }

  return (
    <div onClick={() => !editing && onSelect && onSelect(f)} style={{
      display: 'flex', gap: 14, padding: '14px 18px',
      borderBottom: `1px solid ${C.border}`,
      alignItems: 'flex-start', cursor: editing ? 'default' : 'pointer',
      background: selected ? C.accentSoft : 'transparent',
    }}>
      <div style={{
        width: 9, height: 9, borderRadius: '50%',
        background: sevColor(f.sev), marginTop: 6, flexShrink: 0,
      }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, color: C.text, fontWeight: 600, marginBottom: 3 }}>{f.title}</div>

        {editing ? (
          <div onClick={e => e.stopPropagation()}>
            <textarea
              value={editedDesc}
              onChange={e => setEditedDesc(e.target.value)}
              rows={4}
              style={{
                width: '100%', fontSize: 12.5, fontFamily: 'inherit',
                color: C.text, background: C.bg,
                border: `1px solid ${C.borderStrong}`,
                borderRadius: 6, padding: '8px 10px',
                resize: 'vertical', outline: 'none', marginBottom: 8,
              }}
            />
            <div style={{ display: 'flex', gap: 6 }}>
              <span onClick={handleSave} style={{ padding: '2px 10px', borderRadius: 6, fontSize: 11, background: C.text, color: C.panel, fontWeight: 500, cursor: 'pointer' }}>Save</span>
              <span onClick={() => { setEditing(false); setEditedDesc(f.desc); }} style={{ padding: '2px 10px', borderRadius: 6, fontSize: 11, background: C.panel, color: C.text, border: `1px solid ${C.border}`, fontWeight: 500, cursor: 'pointer' }}>Cancel</span>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
              <span style={{ padding: '2px 9px', borderRadius: 999, fontSize: 11, background: tag.bg, color: tag.text, border: `1px solid ${tag.border}`, fontWeight: 500 }}>{f.tag}</span>
              {f.actions && f.actions.map((a, i) => (
                <span key={i}
                  onClick={e => {
                    e.stopPropagation();
                    if (a === 'Edit') { setEditing(true); }
                    else { onAction && onAction(a, f); }
                  }}
                  style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, background: C.panel, color: C.text, border: `1px solid ${C.border}`, fontWeight: 500, cursor: 'pointer' }}>
                  {a}
                </span>
              ))}
              {editedDesc ? (
                <span
                  onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
                  style={{ padding: '2px 9px', borderRadius: 6, fontSize: 11, background: C.panel, color: C.textDim, border: `1px solid ${C.border}`, fontWeight: 500, cursor: 'pointer' }}>
                  {expanded ? '▲ Hide explanation' : '▼ Explanation'}
                </span>
              ) : null}
            </div>

            {expanded && editedDesc && (
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  marginTop: 6, padding: '10px 14px',
                  background: C.bg, borderRadius: 6,
                  border: `1px solid ${C.border}`,
                  fontSize: 12.5,
                }}>
                <MarkdownBlock text={editedDesc} />
              </div>
            )}
          </>
        )}
      </div>
      <div style={{ fontSize: 12, color: C.textMute, whiteSpace: 'nowrap', marginTop: 4 }}>{f.loc}</div>
    </div>
  );
}

// Standardized status tabs — replace the per-tool ad-hoc labels.
// All five tool pages now share the same Pending / Approved / Rejected filter.
const STATUS_TABS = [
  { key: 'PENDING',  label: 'Pending'  },
  { key: 'APPROVED', label: 'Approved' },
  { key: 'REJECTED', label: 'Rejected' },
];

export default function FindingsPanel({ findings, height: defaultHeight = 360, onSelect, onAction, selectedId }) {
  const { C } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const [panelHeight, setPanelHeight] = useState(defaultHeight);
  const [dragging, setDragging] = useState(false);

  function startDrag(e) {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = panelHeight;
    setDragging(true);

    function onMouseMove(ev) {
      const delta = startY - ev.clientY; // drag up → taller
      setPanelHeight(Math.max(120, Math.min(700, startHeight + delta)));
    }

    function onMouseUp() {
      setDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }

  return (
    <div style={{ height: panelHeight, display: 'flex', flexDirection: 'column', background: C.panel, userSelect: dragging ? 'none' : 'auto' }}>
      {/* Drag handle */}
      <div
        onMouseDown={startDrag}
        style={{
          height: 5, flexShrink: 0, cursor: 'ns-resize',
          background: dragging ? C.accent : C.border,
          transition: dragging ? 'none' : 'background 0.15s',
        }}
        onMouseEnter={e => { if (!dragging) e.currentTarget.style.background = C.accent; }}
        onMouseLeave={e => { if (!dragging) e.currentTarget.style.background = C.border; }}
      />
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        {STATUS_TABS.map((t, i) => {
          // Findings without a backend status (e.g. the ClarityScanner snippet stub)
          // default to PENDING so they remain visible somewhere.
          const count = findings.filter(f => (f._raw?.status || 'PENDING') === t.key).length;
          return (
            <Tab
              key={t.key}
              label={t.label}
              count={count}
              active={i === activeTab}
              onClick={() => setActiveTab(i)}
            />
          );
        })}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {findings
          .filter(f => (f._raw?.status || 'PENDING') === STATUS_TABS[activeTab].key)
          .map((f, i) => (
            <FindingRow key={f.id ?? i} f={f} onSelect={onSelect} onAction={onAction} selected={f.id === selectedId} />
          ))}
      </div>
    </div>
  );
}
