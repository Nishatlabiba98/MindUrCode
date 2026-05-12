// Canonical icon set shared by Sidebar.jsx (tool pages) and Dashboard.jsx.
// Each icon represents exactly one concept — no overlap. All 16×16, all using
// currentColor so they inherit theme color.
import React from 'react';

export const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="2" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="2" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
  </svg>
);

// Coverage = shield with check ("tested / protected")
export const CoverageIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5L2.5 3.5v4c0 3 2.4 5.3 5.5 6.5 3.1-1.2 5.5-3.5 5.5-6.5v-4L8 1.5z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 7.8l1.7 1.7L10.5 6" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Clarity = magnifying glass ("looking closely at naming")
export const ClarityIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

// Docs = document with lines ("generated docs")
export const DocsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3.5 2h6L13 5v8.5a.5.5 0 01-.5.5h-9a.5.5 0 01-.5-.5V2.5a.5.5 0 01.5-.5z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M9.5 2v3H13M5.5 8h5M5.5 11h5" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round"/>
  </svg>
);

// Refactor = cycle arrows ("transform / restructure")
export const RefactorIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8a5 5 0 018.66-3.36L13 6M13 8a5 5 0 01-8.66 3.36L3 10"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M11 3v3h-3M5 13v-3h3" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Simplify = 4-point sparkle ("cleanup / polish")
export const SimplifyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5l1.6 4.9 4.9 1.6-4.9 1.6L8 14.5l-1.6-4.9L1.5 8l4.9-1.6L8 1.5z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
  </svg>
);

// Back arrow — used on Dashboard sidebar to go back to Landing
export const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 8H3M7 12L3 8l4-4" stroke="currentColor" strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const SunIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1"
      stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

export const MoonIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M13 9.5A5.5 5.5 0 1 1 6.5 3a4.5 4.5 0 0 0 6.5 6.5z"
      stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);
