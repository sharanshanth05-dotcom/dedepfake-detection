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
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
        <span className="text-sm font-mono-code text-slate-400">Aggregating telemetry from audit ledger...</span>
      </div>
    );
  }

  // Format score distribution for Recharts
  const distData = [
    { range: '0-19', count: stats?.score_distribution?.['0-19'] || 0, color: '#f43f5e', label: 'Critical' },
    { range: '20-39', count: stats?.score_distribution?.['20-39'] || 0, color: '#f97316', label: 'Elevated' },
    { range: '40-59', count: stats?.score_distribution?.['40-59'] || 0, color: '#f59e0b', label: 'Inconclusive' },
    { range: '60-79', count: stats?.score_distribution?.['60-79'] || 0, color: '#06b6d4', label: 'Moderate' },
    { range: '80-100', count: stats?.score_distribution?.['80-100'] || 0, color: '#10b981', label: 'Authentic' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Cybersecurity Forensics Dashboard
          </h1>
          <p className="text-xs text-slate-400 font-mono-code">
            Real-time threat monitoring and multimodal forensic audit analytics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/workspace"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
          >
            New Media Audit
          </Link>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Analyses */}
        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-code">
            <span>TOTAL ANALYSES</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-white">
            {stats?.total_analyses || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-mono-code">
            Ledger audits committed
          </span>
        </div>

        {/* Modality Split */}
        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-code">
            <span>MODALITY INGESTION</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-center gap-3 text-sm font-mono-code font-semibold">
            <span className="text-cyan-400 flex items-center gap-1">
              <FileImage className="w-3.5 h-3.5" /> {stats?.image_count || 0}
            </span>
            <span className="text-indigo-400 flex items-center gap-1">
              <Film className="w-3.5 h-3.5" /> {stats?.video_count || 0}
            </span>
            <span className="text-purple-400 flex items-center gap-1">
              <Mic className="w-3.5 h-3.5" /> {stats?.audio_count || 0}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono-code">Images • Videos • Audios</span>
        </div>

        {/* Mean Trust Score */}
        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-code">
            <span>MEAN TRUST SCORE</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-emerald-400">
            {stats?.average_trust_score || 100}
            <span className="text-xs text-slate-500 font-normal"> / 100</span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono-code">Cross-modality average</span>
        </div>

        {/* Manipulated Threats */}
        <div className="cyber-card p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono-code">
            <span>THREAT DETECTIONS</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-3xl font-display font-extrabold text-rose-400">
            {stats?.manipulated_count || 0}
          </div>
          <span className="text-[11px] text-slate-500 font-mono-code">
            {stats?.inconclusive_count || 0} inconclusive files
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Score Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 cyber-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h4 className="text-sm font-semibold text-white">Trust Score Distribution</h4>
              <p className="text-xs text-slate-400 font-mono-code">
                Frequency distribution across calibrated trust brackets
              </p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2 rounded text-xs font-mono-code space-y-1">
                          <div className="font-bold text-white">Bracket: {d.range}</div>
                          <div className="text-slate-300">Category: {d.label}</div>
                          <div className="text-cyan-400">Total Audits: {d.count}</div>
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

        {/* Recent Incident Feed (5 cols) */}
        <div className="lg:col-span-5 cyber-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-semibold text-white">Recent Forensic Analyses</h4>
            <Link to="/history" className="text-xs text-cyan-400 hover:underline font-mono-code">
              View All
            </Link>
          </div>

          {stats?.recent_analyses?.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono-code">
              No recent analyses recorded. Upload a file in Workspace to begin.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats?.recent_analyses?.map((item) => (
                <Link
                  key={item.id}
                  to={`/analysis/${item.id}`}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <span className="text-xs font-semibold text-slate-200 truncate block group-hover:text-cyan-300">
                      {item.original_filename}
                    </span>
                    <span className="text-[10px] font-mono-code text-slate-500 uppercase">
                      {item.media_type} • Trust: {item.trust_score}/100
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
