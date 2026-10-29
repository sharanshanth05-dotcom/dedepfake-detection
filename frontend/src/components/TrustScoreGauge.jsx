import React from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, Sparkles } from 'lucide-react';
import RiskBadge from './RiskBadge';
import CometDial from './CometDial';
import GlassSurface from './GlassSurface';

export default function TrustScoreGauge({ trustScore = 100, manipulationProb = 0, confidence = 0.9, riskLevel = 'low' }) {
  const score = Math.round(trustScore);
  const authProb = Math.max(0, Math.min(100, Math.round((1 - manipulationProb) * 100)));
  const manipProb = Math.max(0, Math.min(100, Math.round(manipulationProb * 100)));
  const confPct = Math.round(confidence * 100);

  let scoreColor = '#02755c'; // Linear chart-2

  if (score < 20) {
    scoreColor = '#92681b'; // Linear destructive
  } else if (score < 40) {
    scoreColor = '#6d6b6b'; // Linear chart-1
  } else if (score < 60) {
    scoreColor = '#a3a1a1'; // Linear chart-3
  } else if (score < 80) {
    scoreColor = '#6e78d5'; // Linear primary
  }

  return (
    <GlassSurface
      width="100%"
      height="auto"
      borderRadius={12}
      backgroundOpacity={0.06}
      blur={16}
      brightness={55}
      className="cyber-card p-0 border-[#e8e8e8] shadow-xs"
      contentClassName="p-6 flex flex-col items-center text-center w-full block"
    >
      <div className="w-full flex items-center justify-between mb-2">
        <span className="text-xs font-mono-code uppercase text-[#71737a] tracking-wider flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-[#6e78d5]" />
          Forensic Assessment
        </span>
        <RiskBadge riskLevel={riskLevel} size="sm" />
      </div>

      {/* Interactive Comet Dial Radial Gauge */}
      <div className="relative flex items-center justify-center my-3 py-1">
        <CometDial
          value={score}
          defaultValue={score}
          min={0}
          max={100}
          step={1}
          unit="/100"
          label="Forensic Trust Score"
          accent={scoreColor}
          ink="#ececef"
          size={230}
          sweep={300}
          thickness={6}
          speed={32}
          tapBounce={0.25}
          flickBounce={0.12}
          momentum={1}
          cometReach={180}
          cometWidth={14}
        />
      </div>

      {/* Probability Breakdown Matrix */}
      <div className="w-full grid grid-cols-3 gap-2 mt-2 pt-4 border-t border-[#e8e8e8] text-left">
        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[10px] font-mono-code text-[#71737a] block">P(Authentic)</span>
          <span className="text-sm font-semibold text-[#02755c]">{authProb}%</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[10px] font-mono-code text-[#71737a] block">P(Manipulated)</span>
          <span className="text-sm font-semibold text-[#92681b]">{manipProb}%</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[10px] font-mono-code text-[#71737a] block">Confidence</span>
          <span className="text-sm font-semibold text-[#6e78d5]">{confPct}%</span>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[#71737a] leading-normal italic">
        Trust Score = 100 × P(authentic). Calibrated probability distinguishes model confidence from class likelihood.
      </p>
    </GlassSurface>
  );
}
