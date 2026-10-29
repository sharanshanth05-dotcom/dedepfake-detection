import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DotGrid from './components/DotGrid';
import LandingPage from './pages/LandingPage';
import DetectionWorkspace from './pages/DetectionWorkspace';
import AnalysisResults from './pages/AnalysisResults';
import Dashboard from './pages/Dashboard';
import AnalysisHistory from './pages/AnalysisHistory';
import Methodology from './pages/Methodology';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#fbfbfb] text-[#1b1b1b] relative selection:bg-[#6e78d5] selection:text-white font-sans antialiased">
        {/* Interactive WebGL2 Dot Grid Background (Linear Spring Physics & Shockwaves) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
          <DotGrid
            dotSize={4}
            gap={20}
            baseColor="#d9dcea"
            activeColor="#6e78d5"
            proximity={160}
            shockRadius={340}
            shockStrength={4.5}
            returnDuration={0.8}
            swell={0.7}
            stretch={0.55}
            glow={0.6}
            opacity={0.85}
            shape="circle"
            intro={true}
            clickShock={true}
            mouseInteraction={true}
          />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 flex-1 flex flex-col pointer-events-auto">
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
      </div>
    </BrowserRouter>
  );
}
