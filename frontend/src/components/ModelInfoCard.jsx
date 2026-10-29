import React from 'react';
import { Cpu, Clock, Hash, AlertCircle, FileCheck } from 'lucide-react';

export default function ModelInfoCard({ modelVersion, duration, fileHash, limitations, mediaType }) {
  return (
    <div className="cyber-card p-5 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
      <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
        <h4 className="text-sm font-semibold text-[#1b1b1b] flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#6e78d5]" />
          Model Specifications & Provenance
        </h4>
        <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-[4px] bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] font-medium">
          CERTIFIED ENGINE
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono-code">
        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">DEPLOYED DETECTOR</span>
          <span className="text-[#1b1b1b] font-semibold">{modelVersion || 'TruthLens-v1.0'}</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">PROCESSING LATENCY</span>
          <span className="text-[#02755c] font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {duration ? `${duration} seconds` : 'Sub-second'}
          </span>
        </div>
      </div>

      {/* SHA-256 Hash Display */}
      {fileHash && (
        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8] text-xs font-mono-code">
          <span className="text-[#71737a] block text-[10px] mb-1 flex items-center gap-1">
            <Hash className="w-3 h-3 text-[#6e78d5]" />
            SHA-256 FILE PROVENANCE HASH
          </span>
          <div className="p-1.5 rounded-[4px] bg-white text-[11px] text-[#1b1b1b] break-all select-all border border-[#e8e8e8] font-medium">
            {fileHash}
          </div>
        </div>
      )}

      {/* Limitations note */}
      {limitations && (
        <div className="p-3 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8] text-xs leading-relaxed flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#92681b] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#1b1b1b] block mb-0.5">Model Domain Limitations:</span>
            <span className="text-[#71737a]">{limitations}</span>
          </div>
        </div>
      )}
    </div>
  );
}
