import React from 'react';
import { ShieldCheck, AlertCircle, Cpu, Eye, FileText, Lock, Award, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-28 border-t border-[#e8e8e8] bg-[#fbfbfb] text-[#71737a] text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Institutional Brand & Purpose */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-lg text-[#1b1b1b] tracking-wider">
                TRUTH<span className="text-[#6e78d5]">LENS</span> AI
              </span>
              <span className="px-2 py-0.5 rounded-[4px] text-[10px] font-mono-code bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] font-medium">
                ENTERPRISE MEDIA FORENSICS
              </span>
            </div>
            <p className="text-[#71737a] leading-relaxed max-w-md text-xs">
              Autonomous cybersecurity platform engineered to evaluate digital imagery, video streams, 
              and vocal audio for synthetic manipulation using Vision Transformer attention attribution, 
              inter-frame temporal continuity modeling, and Platt temperature calibration.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[#71737a] font-mono-code text-[11px] pt-1">
              <span className="flex items-center gap-1 text-[#1b1b1b]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6e78d5]" /> IEEE P3333.1.4
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#1b1b1b]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#02755c]" /> NIST AI 100-1
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#1b1b1b]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#6d6b6b]" /> Platt ECE &lt; 0.05
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-[#1b1b1b] font-semibold mb-3 tracking-wider text-xs uppercase font-mono-code">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/workspace" className="hover:text-[#6e78d5] transition-colors">
                  Forensic Workspace
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#6e78d5] transition-colors">
                  Telemetry Dashboard
                </Link>
              </li>
              <li>
                <Link to="/history" className="hover:text-[#6e78d5] transition-colors">
                  Cryptographic Audit Ledger
                </Link>
              </li>
              <li>
                <Link to="/methodology" className="hover:text-[#6e78d5] transition-colors">
                  Technical Architecture & ViT
                </Link>
              </li>
            </ul>
          </div>

          {/* Forensic Ethics & Admissibility */}
          <div>
            <h4 className="text-[#1b1b1b] font-semibold mb-3 tracking-wider text-xs uppercase font-mono-code">
              Forensic Integrity
            </h4>
            <p className="text-[#71737a] leading-relaxed text-[11px]">
              TruthLens AI provides calibrated probabilistic trust scoring. Model verdicts must complement 
              qualified human expert verification and should not be used as sole determinative legal evidence.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] font-mono-code text-[#6e78d5] font-medium">
              <Lock className="w-3 h-3" />
              <span>Zero-Retention Ephemeral Storage</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-[#e8e8e8] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#71737a] text-[11px] font-mono-code">
          <div>
            © 2026 TruthLens AI — Multimodal Deepfake Forensics & Synthetic Media Verification.
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#1b1b1b]">SHA-256 Provenance Hashing</span>
            <span>•</span>
            <span className="text-[#1b1b1b]">Platt Calibrated</span>
            <span>•</span>
            <span className="text-[#1b1b1b]">v1.0.0 Production Core</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
