import React, { useState } from 'react';
import { C } from '../theme';
import { sevColor, tagPalette } from '../syntax';

// -----------------------------------------------------------------
// Lightweight markdown renderer — no external dependency needed.
// Handles the patterns Ollama actually produces in its responses.
// -----------------------------------------------------------------

function renderInline(text) {
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
          <li key={i} style={{ lineHeight: 1.7, color: C.textDim }}>{renderInline(li)}</li>
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
          {renderInline(heading[2])}
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
        <div key={i} style={{ lineHeight: 1.7, color: C.textDim }}>{renderInline(line)}</div>
      );
    }
  });
  flushList();
  return <div>{elements}</div>;
}

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

function FindingRow({ f, onSelect, onAction, selected }) {
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

export default function FindingsPanel({ tabs, findings, height = 360, onSelect, onAction, selectedId }) {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div style={{ height, display: 'flex', flexDirection: 'column', background: C.panel }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: `1px solid ${C.border}`, background: C.panel }}>
        {tabs.map((t, i) => (
          <Tab key={i} label={t.label} count={t.count} active={i === activeTab} onClick={() => setActiveTab(i)} />
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {findings.map((f, i) => (
          <FindingRow key={i} f={f} onSelect={onSelect} onAction={onAction} selected={f.id === selectedId} />
        ))}
      </div>
    </div>
  );
}
