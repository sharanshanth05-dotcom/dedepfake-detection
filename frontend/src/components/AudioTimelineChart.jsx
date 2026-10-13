import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine
} from 'recharts';
import { Mic, Waves, AlertTriangle } from 'lucide-react';

export default function AudioTimelineChart({ timeline = [], suspiciousIntervals = [], globalFeatures = {} }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="cyber-card p-6 text-center text-slate-500 font-mono-code text-xs">
        No audio timeline segmentation available.
      </div>
    );
  }

  const chartData = timeline.map((seg) => ({
    interval: `${seg.start_time}s`,
    suspicion: Math.round(seg.suspicion_score * 100),
    trust: seg.trust_score,
    hfRatio: Math.round((seg.high_freq_ratio || 0) * 100),
    centroid: seg.spectral_centroid,
    range: `${seg.start_time}s - ${seg.end_time}s`,
    isSuspicious: seg.is_suspicious
  }));

  return (
    <div className="cyber-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Mic className="w-4 h-4 text-cyan-400" />
            Acoustic Segment Suspicion Timeline
          </h4>
          <p className="text-xs text-slate-400">
            Localized synthetic vocoder & pitch flatness detection across temporal intervals
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono-code">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            <span className="text-slate-300">Authentic Band (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
            <span className="text-slate-300">Vocoder Anomaly (≥50%)</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="interval" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono-code space-y-1">
                      <div className="text-cyan-400 font-bold">{data.range}</div>
                      <div className="text-slate-300">
                        Synthesis Likelihood: <span className={data.suspicion >= 50 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>{data.suspicion}%</span>
                      </div>
                      <div className="text-slate-400">Trust: {data.trust}/100</div>
                      <div className="text-slate-400">High-Freq Energy: {data.hfRatio}%</div>
                      <div className="text-slate-400">Centroid: {data.centroid} Hz</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="4 4" />
            <Bar dataKey="suspicion" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.suspicion >= 50 ? '#f43f5e' : '#10b981'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Acoustic Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono-code">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">TOTAL SEGMENTS</span>
          <span className="text-white font-semibold">{timeline.length}</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">SUSPICIOUS INTERVALS</span>
          <span className={suspiciousIntervals.length > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {suspiciousIntervals.length}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">SPECTRAL CENTROID</span>
          <span className="text-cyan-400 font-semibold">{globalFeatures.spectral_centroid || 0} Hz</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">ZERO-CROSSING RATE</span>
          <span className="text-amber-400 font-semibold">{globalFeatures.zero_crossing_rate || 0.0}</span>
        </div>
      </div>
    </div>
  );
}
