import React from 'react';
import { Eye, Clock, ShieldAlert, Cpu, Hash, Waves, Sparkles } from 'lucide-react';

export default function EvidenceCard({ evidence = [] }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="cyber-card p-6 text-center text-[#71737a] font-mono-code text-xs bg-[#fbfbfb] border border-[#e8e8e8] rounded-[6px]">
        No anomalous evidence items isolated for this media file.
      </div>
    );
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'visual_attention':
        return Sparkles;
      case 'face_boundary':
        return Eye;
      case 'temporal_inconsistency':
      case 'suspicious_timestamps':
        return Clock;
      case 'spectral_bandwidth':
      case 'synthetic_speech_interval':
        return Waves;
      default:
        return ShieldAlert;
    }
  };

  return (
    <div className="space-y-3">
      {evidence.map((item, idx) => {
        const Icon = getTypeIcon(item.evidence_type);
        return (
          <div
            key={item.id || idx}
            className="p-3.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8] hover:border-[#6e78d5] hover:bg-white transition-all flex items-start gap-3.5"
          >
            <div className="p-2 rounded-[4px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5] mt-0.5 shrink-0">
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-[#1b1b1b] capitalize">
                  {typeof item.evidence_type === 'string' ? item.evidence_type.replace(/_/g, ' ') : String(item.evidence_type ?? '')}
                </span>
                {item.timestamp_or_region && (
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-[4px] bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] font-medium">
                    {typeof item.timestamp_or_region === 'object' ? JSON.stringify(item.timestamp_or_region) : String(item.timestamp_or_region)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#71737a] leading-relaxed">
                {typeof item.evidence_description === 'object' ? JSON.stringify(item.evidence_description) : String(item.evidence_description ?? '')}
              </p>

              {item.evidence_reference && (
                <div className="mt-2 text-[10px] font-mono-code text-[#71737a] flex items-center gap-1">
                  <Hash className="w-3 h-3 text-[#6e78d5]" />
                  <span>Ref: {typeof item.evidence_reference === 'object' ? JSON.stringify(item.evidence_reference) : String(item.evidence_reference)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
