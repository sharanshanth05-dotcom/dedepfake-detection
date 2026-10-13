import React from 'react';
import { Cpu, Clock, Hash, AlertCircle, FileCheck } from 'lucide-react';

export default function ModelInfoCard({ modelVersion, duration, fileHash, limitations, mediaType }) {
  return (
    <div className="cyber-card p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h4 className="text-sm font-semibold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          Model Specifications & Provenance
        </h4>
        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
          CERTIFIED ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">DEPLOYED DETECTOR</span>
          <span className="text-slate-200 font-semibold">{modelVersion || 'TruthLens-v1.0'}</span>
        </div>

        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">PROCESSING LATENCY</span>
          <span className="text-emerald-400 font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration ? `${duration} seconds` : 'Sub-second'}
          </span>
        </div>
      </div>

      {/* SHA-256 Hash Display */}
      {fileHash && (
        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800 text-xs font-mono-code">
          <span className="text-slate-500 block text-[10px] mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-cyan-400" />
            SHA-256 FILE PROVENANCE HASH
          </span>
          <div className="p-1.5 rounded bg-slate-950 text-[11px] text-cyan-300 break-all select-all border border-slate-800/80">
            {fileHash}
          </div>
        </div>
      )}

      {/* Limitations note */}
      {limitations && (
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-xs text-amber-300/90 leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Model Domain Limitations:</span>
            <span className="text-slate-400">{limitations}</span>
          </div>
        </div>
      )}
    </div>
  );
}
