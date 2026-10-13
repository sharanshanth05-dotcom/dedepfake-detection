import React from 'react';
import { Eye, Clock, ShieldAlert, Cpu, Hash, Waves, Sparkles } from 'lucide-react';

export default function EvidenceCard({ evidence = [] }) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="cyber-card p-6 text-center text-slate-500 font-mono-code text-xs">
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
            className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start gap-3.5"
          >
            <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 mt-0.5 shrink-0">
              <Icon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-slate-200 capitalize">
                  {item.evidence_type?.replace(/_/g, ' ')}
                </span>
                {item.timestamp_or_region && (
                  <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.timestamp_or_region}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {item.evidence_description}
              </p>

              {item.evidence_reference && (
                <div className="mt-2 text-[10px] font-mono-code text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3 text-cyan-500" />
                  <span>Ref: {item.evidence_reference}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
