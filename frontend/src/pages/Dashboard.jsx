import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Layers,
  FileImage,
  Film,
  Mic,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  AlertOctagon,
  Lock,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import apiClient from '../api/client';
import RiskBadge from '../components/RiskBadge';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/analysis/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center space-y-3">
        <RefreshCw className="w-8 h-8 text-[#6e78d5] animate-spin mx-auto" />
        <span className="text-xs font-mono-code text-[#71737a] block tracking-wider uppercase font-medium">
          Querying Immutable Audit Ledger...
        </span>
      </div>
    );
  }

  // Format score distribution using Linear color series
  const distData = [
    { range: '0–19', count: stats?.score_distribution?.['0-19'] || 0, color: '#92681b', label: 'Critical Deepfake' },
    { range: '20–39', count: stats?.score_distribution?.['20-39'] || 0, color: '#6d6b6b', label: 'Elevated Suspicion' },
    { range: '40–59', count: stats?.score_distribution?.['40-59'] || 0, color: '#a3a1a1', label: 'Inconclusive' },
    { range: '60–79', count: stats?.score_distribution?.['60-79'] || 0, color: '#6e78d5', label: 'Moderate Authenticity' },
    { range: '80–100', count: stats?.score_distribution?.['80-100'] || 0, color: '#02755c', label: 'Calibrated Authentic' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#ececef] border border-[#e8e8e8] text-[#71737a] text-[10px] font-mono-code font-medium">
            <Terminal className="w-3 h-3 text-[#6e78d5]" />
            <span>TELEMETRY CONSOLE // SEC-OPS-01</span>
          </div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-[#1b1b1b] tracking-tight flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-[#6e78d5]" />
            Cybersecurity Forensics Telemetry
          </h1>
          <p className="text-xs text-[#71737a] font-mono-code">
            Real-time forensic threat intelligence and multimodal audit metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-[6px] bg-white hover:bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] shadow-xs transition-all"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/workspace"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-[6px] text-xs font-medium bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-xs transition-all font-mono-code active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>New Media Audit</span>
          </Link>
        </div>
      </div>

      {/* Metric KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Analyses */}
        <div className="cyber-card p-5 space-y-2 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#71737a] text-xs font-mono-code">
            <span>AUDIT RECORDS</span>
            <div className="p-1.5 rounded-[4px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-display font-semibold text-[#1b1b1b] tracking-tight">
            {stats?.total_analyses || 0}
          </div>
          <span className="text-[11px] text-[#71737a] font-mono-code block">
            Cryptographically signed ledger
          </span>
        </div>

        {/* Modality Breakdown */}
        <div className="cyber-card p-5 space-y-2 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#71737a] text-xs font-mono-code">
            <span>MODALITY SPLIT</span>
            <div className="p-1.5 rounded-[4px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5]">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono-code font-semibold pt-1">
            <span className="text-[#1b1b1b] flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5 text-[#6e78d5]" /> {stats?.image_count || 0}
            </span>
            <span className="text-[#1b1b1b] flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-[#6d6b6b]" /> {stats?.video_count || 0}
            </span>
            <span className="text-[#1b1b1b] flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-[#a3a1a1]" /> {stats?.audio_count || 0}
            </span>
          </div>
          <span className="text-[11px] text-[#71737a] font-mono-code block">
            Image • Video • Audio
          </span>
        </div>

        {/* Mean Trust Score */}
        <div className="cyber-card p-5 space-y-2 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#71737a] text-xs font-mono-code">
            <span>MEAN TRUST SCORE</span>
            <div className="p-1.5 rounded-[4px] bg-[#02755c]/10 border border-[#02755c]/30 text-[#02755c]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-display font-semibold text-[#02755c] tracking-tight">
            {stats?.average_trust_score || 100}
            <span className="text-xs text-[#71737a] font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-[#71737a] font-mono-code block">
            Platt ECE Calibrated Mean
          </span>
        </div>

        {/* Threat Detections */}
        <div className="cyber-card p-5 space-y-2 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-[#71737a] text-xs font-mono-code">
            <span>SYNTHETIC DETECTIONS</span>
            <div className="p-1.5 rounded-[4px] bg-[#92681b]/10 border border-[#92681b]/30 text-[#92681b]">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-3xl font-display font-semibold text-[#92681b] tracking-tight">
            {stats?.manipulated_count || 0}
          </div>
          <span className="text-[11px] text-[#71737a] font-mono-code block">
            {stats?.inconclusive_count || 0} flagged inconclusive
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Score Distribution Chart */}
        <div className="lg:col-span-7 cyber-card p-6 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
            <div>
              <h4 className="text-sm font-semibold text-[#1b1b1b] font-display">
                Trust Score Population Distribution
              </h4>
              <p className="text-xs text-[#71737a] font-mono-code">
                Binned frequency across calibrated Platt confidence brackets
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
                <XAxis dataKey="range" stroke="#71737a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71737a" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-white border border-[#e8e8e8] p-2.5 rounded-[6px] text-xs font-mono-code space-y-1 shadow-xs text-[#1b1b1b]">
                          <div className="font-semibold text-[#1b1b1b]">Trust Range: {d.range}</div>
                          <div className="text-[#71737a]">Classification: {d.label}</div>
                          <div className="text-[#6e78d5] font-semibold">Total Audits: {d.count}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {distData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Audit Feed */}
        <div className="lg:col-span-5 cyber-card p-6 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
          <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
            <h4 className="text-sm font-semibold text-[#1b1b1b] font-display">
              Recent Forensic Audits
            </h4>
            <Link to="/history" className="text-xs text-[#6e78d5] hover:underline font-mono-code font-medium">
              Ledger View →
            </Link>
          </div>

          {stats?.recent_analyses?.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71737a] font-mono-code">
              No recent audit commits. Ingest a file in Workspace to begin.
            </div>
          ) : (
            <div className="space-y-2">
              {stats?.recent_analyses?.map((item) => (
                <Link
                  key={item.id}
                  to={`/analysis/${item.id}`}
                  className="p-3 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8] hover:border-[#6e78d5] transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-[#1b1b1b] truncate block group-hover:text-[#6e78d5] font-display">
                      {item.original_filename}
                    </span>
                    <span className="text-[10px] font-mono-code text-[#71737a] uppercase block mt-0.5">
                      {item.media_type} • Trust Score: {item.trust_score}/100
                    </span>
                  </div>

                  <RiskBadge riskLevel={item.risk_level} size="sm" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
