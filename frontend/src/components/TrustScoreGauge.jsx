import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, HelpCircle } from 'lucide-react';
import RiskBadge from './RiskBadge';

export default function TrustScoreGauge({ trustScore = 100, manipulationProb = 0, confidence = 0.9, riskLevel = 'low' }) {
  const score = Math.round(trustScore);
  const authProb = Math.max(0, Math.min(100, Math.round((1 - manipulationProb) * 100)));
  const manipProb = Math.max(0, Math.min(100, Math.round(manipulationProb * 100)));
  const confPct = Math.round(confidence * 100);

  // Gauge circle math
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let scoreColor = '#10b981'; // emerald
  let glowColor = 'rgba(16, 185, 129, 0.3)';

  if (score < 20) {
    scoreColor = '#f43f5e'; // rose
    glowColor = 'rgba(244, 63, 94, 0.35)';
  } else if (score < 40) {
    scoreColor = '#f97316'; // orange
    glowColor = 'rgba(249, 115, 22, 0.3)';
  } else if (score < 60) {
    scoreColor = '#f59e0b'; // amber
    glowColor = 'rgba(245, 158, 11, 0.3)';
  } else if (score < 80) {
    scoreColor = '#06b6d4'; // cyan
    glowColor = 'rgba(6, 182, 212, 0.3)';
  }

  return (
    <div className="cyber-card p-6 flex flex-col items-center text-center relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute w-44 h-44 rounded-full blur-3xl -top-10 -right-10 pointer-events-none opacity-40 transition-all"
        style={{ background: glowColor }}
      />

      <div className="w-full flex items-center justify-between mb-4">
        <span className="text-xs font-mono-code uppercase text-slate-400 tracking-wider">
          Forensic Assessment
        </span>
        <RiskBadge riskLevel={riskLevel} size="sm" />
      </div>

      {/* Circular Radial Gauge */}
      <div className="relative w-44 h-44 flex items-center justify-center my-2">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Background Track */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke="#1e293b"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Active Progress Arc */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            stroke={scoreColor}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: 'stroke-dashoffset 1s ease-in-out',
              filter: `drop-shadow(0 0 8px ${glowColor})`
            }}
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-4xl font-display font-extrabold tracking-tight text-white">
            {score}
          </span>
          <span className="text-[10px] font-mono-code text-slate-400 uppercase tracking-widest mt-0.5">
            Trust Score
          </span>
          <span className="text-[9px] text-slate-500 font-mono-code">/ 100</span>
        </div>
      </div>

      {/* Probability Breakdown Matrix */}
      <div className="w-full grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/80 text-left">
        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono-code text-slate-400 block">P(Authentic)</span>
          <span className="text-sm font-semibold text-emerald-400">{authProb}%</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono-code text-slate-400 block">P(Manipulated)</span>
          <span className="text-sm font-semibold text-rose-400">{manipProb}%</span>
        </div>

        <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] font-mono-code text-slate-400 block">Confidence</span>
          <span className="text-sm font-semibold text-cyan-400">{confPct}%</span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-slate-500 leading-normal italic">
        Trust Score = 100 × P(authentic). Calibrated probability distinguishes model confidence from class likelihood.
      </p>
    </div>
  );
}
