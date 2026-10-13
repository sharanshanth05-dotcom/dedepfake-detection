import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HelpCircle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ riskLevel, size = 'md' }) {
  const level = (riskLevel || 'inconclusive').toLowerCase();

  const configs = {
    low: {
      label: 'Higher Estimated Authenticity',
      shortLabel: 'LOW RISK',
      color: 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]',
      icon: ShieldCheck,
    },
    moderate: {
      label: 'Moderate Estimated Authenticity',
      shortLabel: 'MODERATE RISK',
      color: 'text-cyan-400 bg-cyan-950/60 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]',
      icon: ShieldCheck,
    },
    inconclusive: {
      label: 'Inconclusive / Mixed Evidence',
      shortLabel: 'INCONCLUSIVE',
      color: 'text-amber-400 bg-amber-950/60 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.2)]',
      icon: HelpCircle,
    },
    elevated: {
      label: 'Elevated Manipulation Indicators',
      shortLabel: 'ELEVATED RISK',
      color: 'text-orange-400 bg-orange-950/60 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.2)]',
      icon: AlertTriangle,
    },
    critical: {
      label: 'Strong Manipulation Indicators',
      shortLabel: 'CRITICAL THREAT',
      color: 'text-rose-400 bg-rose-950/60 border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]',
      icon: AlertOctagon,
    },
  };

  const cfg = configs[level] || configs.inconclusive;
  const Icon = cfg.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2 font-semibold',
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-mono-code ${cfg.color} ${sizeClasses[size]}`}>
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      <span>{size === 'lg' ? cfg.label : cfg.shortLabel}</span>
    </span>
  );
}
