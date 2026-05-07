import React from 'react';
import BrowserWindow from './BrowserWindow';
import { C } from '../theme';

export default function AppShell({ tab, url, children }) {
  return (
    <div style={{
      width: '100%', minHeight: '100vh',
      background: 'oklch(95% 0.005 260)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 32, boxSizing: 'border-box',
      fontFamily: '"Inter", system-ui, sans-serif', color: C.text,
    }}>
      <BrowserWindow
        tabs={[{ title: tab }, { title: 'Docs' }]}
        activeIndex={0} url={url} width={1280} height={880}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.bg }}>
          {children}
        </div>
      </BrowserWindow>
    </div>
  );
}
