import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SimplificationEngine from './tools/SimplificationEngine';
import CoverageAnalyzer from './tools/CoverageAnalyzer';
import ClarityScanner from './tools/ClarityScanner';
import DocumentationAssistant from './tools/DocumentationAssistant';
import RefactoringAdvisor from './tools/RefactoringAdvisor';
import SubmitRepo from './pages/SubmitRepo';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/repos" replace />} />
        <Route path="/repos" element={<SubmitRepo />} />
        <Route path="/simplify" element={<SimplificationEngine />} />
        <Route path="/coverage" element={<CoverageAnalyzer />} />
        <Route path="/clarity" element={<ClarityScanner />} />
        <Route path="/docs" element={<DocumentationAssistant />} />
        <Route path="/refactor" element={<RefactoringAdvisor />} />
      </Routes>
    </BrowserRouter>
  );
}
