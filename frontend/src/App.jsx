import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import SubmitRepo from './pages/SubmitRepo';
import SimplificationEngine from './tools/SimplificationEngine';
import CoverageAnalyzer from './tools/CoverageAnalyzer';
import ClarityScanner from './tools/ClarityScanner';
import DocumentationAssistant from './tools/DocumentationAssistant';
import RefactoringAdvisor from './tools/RefactoringAdvisor';

export default function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/repos"     element={<SubmitRepo />} />
        <Route path="/coverage"  element={<CoverageAnalyzer />} />
        <Route path="/clarity"   element={<ClarityScanner />} />
        <Route path="/docs"      element={<DocumentationAssistant />} />
        <Route path="/refactor"  element={<RefactoringAdvisor />} />
        <Route path="/simplify"  element={<SimplificationEngine />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ThemeProvider>
  );
}
