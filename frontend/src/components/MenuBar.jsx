import React from 'react';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme';

export default function MenuBar() {
  const navigate = useNavigate();
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 24,
      padding: '0 18px', height: 38,
      borderBottom: `1px solid ${C.border}`,
      background: C.panel, fontSize: 13, color: C.text,
    }}>
      <span onClick={() => navigate('/')} style={{ cursor:'pointer', color:C.text }}>File</span>
      <span style={{ cursor:'default', color:C.textDim }}>Edit</span>
      <span style={{ cursor:'default', color:C.textDim }}>View</span>
      <span onClick={() => window.print()} style={{ cursor:'pointer', color:C.textDim }}>Export</span>
      <span style={{ cursor:'default', color:C.textDim }}>Help</span>
    </div>
  );
}
