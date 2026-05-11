import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SubmitRepo from './pages/SubmitRepo';
import SimplificationEngine from './tools/SimplificationEngine';
import CoverageAnalyzer from './tools/CoverageAnalyzer';
import ClarityScanner from './tools/ClarityScanner';
import DocumentationAssistant from './tools/DocumentationAssistant';
import RefactoringAdvisor from './tools/RefactoringAdvisor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<LandingPage />} />
        <Route path="/repos"    element={<SubmitRepo />} />
        <Route path="/coverage" element={<CoverageAnalyzer />} />
        <Route path="/clarity"  element={<ClarityScanner />} />
        <Route path="/docs"     element={<DocumentationAssistant />} />
        <Route path="/refactor" element={<RefactoringAdvisor />} />
        <Route path="/simplify" element={<SimplificationEngine />} />
        <Route path="*"         element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}
