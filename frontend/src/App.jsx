import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import DetectionWorkspace from './pages/DetectionWorkspace';
import AnalysisResults from './pages/AnalysisResults';
import Dashboard from './pages/Dashboard';
import AnalysisHistory from './pages/AnalysisHistory';
import Methodology from './pages/Methodology';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#070a13] text-slate-100 cyber-grid-bg selection:bg-cyan-500 selection:text-slate-950">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/workspace" element={<DetectionWorkspace />} />
            <Route path="/analysis/:id" element={<AnalysisResults />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<AnalysisHistory />} />
            <Route path="/methodology" element={<Methodology />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
