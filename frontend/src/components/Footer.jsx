import React from 'react';
import { ShieldCheck, AlertCircle, Cpu, Eye, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-slate-800/80 bg-[#06080f]/90 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-base text-white tracking-wider">
                TRUTH<span className="text-cyan-400">LENS</span> AI
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-cyan-950 text-cyan-300 border border-cyan-800">
                FORENSICS PLATFORM
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed max-w-md">
              Full-stack cybersecurity and media forensics platform powered by Vision Transformer (ViT) 
              attention attribution, inter-frame temporal consistency, and acoustic spectral resonance analysis.
            </p>
            <div className="flex items-center gap-3 text-slate-500 font-mono-code text-[11px]">
              <span>IEEE Standards</span>
              <span>•</span>
              <span>ECE Calibration</span>
              <span>•</span>
              <span>Explainable AI</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wider text-xs uppercase font-mono-code">Platform Modules</h4>
            <ul className="space-y-2">
              <li><Link to="/workspace" className="hover:text-cyan-400 transition-colors">Detection Workspace</Link></li>
              <li><Link to="/dashboard" className="hover:text-cyan-400 transition-colors">Forensics Dashboard</Link></li>
              <li><Link to="/history" className="hover:text-cyan-400 transition-colors">Audit & Analysis History</Link></li>
              <li><Link to="/methodology" className="hover:text-cyan-400 transition-colors">Architecture & Methodology</Link></li>
            </ul>
          </div>

          {/* Forensic Ethics */}
          <div>
            <h4 className="text-slate-200 font-semibold mb-3 tracking-wider text-xs uppercase font-mono-code">Responsible Use</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              TruthLens AI computes calibrated probabilistic scores. Model assessments must complement qualified expert verification and never be used as sole determinative legal evidence.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <div>
            © 2026 TruthLens AI — Multimodal Deepfake Detection & Cybersecurity Platform.
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="hover:text-slate-400">Zero-Retention Ingestion</span>
            <span>•</span>
            <span className="hover:text-slate-400">SHA-256 Provenance Hashing</span>
            <span>•</span>
            <span className="hover:text-slate-400">Privacy Preserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
