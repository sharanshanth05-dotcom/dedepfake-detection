import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle } from 'lucide-react';

export default function RiskBadge({ riskLevel, size = 'md' }) {
  const level = (riskLevel || 'inconclusive').toLowerCase();

  const configs = {
    low: {
      label: 'Calibrated Authenticity',
      shortLabel: 'LOW THREAT',
      color: 'text-[#02755c] bg-[#02755c]/10 border-[#02755c]/30 shadow-xs',
      dotColor: 'bg-[#02755c]',
      icon: ShieldCheck,
    },
    moderate: {
      label: 'Moderate Authenticity',
      shortLabel: 'MODERATE',
      color: 'text-[#6e78d5] bg-[#6e78d5]/10 border-[#6e78d5]/30 shadow-xs',
      dotColor: 'bg-[#6e78d5]',
      icon: ShieldCheck,
    },
    inconclusive: {
      label: 'Inconclusive / Mixed Evidence',
      shortLabel: 'INCONCLUSIVE',
      color: 'text-[#1b1b1b] bg-[#ececef] border-[#e8e8e8] shadow-xs',
      dotColor: 'bg-[#6d6b6b]',
      icon: HelpCircle,
    },
    elevated: {
      label: 'Elevated Manipulation Indicators',
      shortLabel: 'ELEVATED RISK',
      color: 'text-[#92681b] bg-[#92681b]/10 border-[#92681b]/30 shadow-xs',
      dotColor: 'bg-[#92681b]',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Critical Deepfake / Synthetic Artifacts',
      shortLabel: 'CRITICAL THREAT',
      color: 'text-[#92681b] bg-[#92681b]/15 border-[#92681b]/40 shadow-xs',
      dotColor: 'bg-[#92681b] animate-pulse',
      icon: AlertOctagon,
    },
  };

  const cfg = configs[level] || configs.inconclusive;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1.5 font-medium',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border font-mono-code uppercase tracking-wider ${cfg.color} ${sizeClasses[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor}`} />
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{size === 'lg' ? cfg.label : cfg.shortLabel}</span>
    </span>
  );
}
