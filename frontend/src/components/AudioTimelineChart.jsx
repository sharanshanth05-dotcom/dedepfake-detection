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
      <div className="cyber-card p-6 text-center text-[#71737a] font-mono-code text-xs bg-[#fbfbfb] border border-[#e8e8e8] rounded-[6px]">
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
    <div className="cyber-card p-5 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e8] pb-3">
        <div>
          <h4 className="text-sm font-semibold text-[#1b1b1b] flex items-center gap-2">
            <Mic className="w-4 h-4 text-[#6e78d5]" />
            Acoustic Segment Suspicion Timeline
          </h4>
          <p className="text-xs text-[#71737a]">
            Localized synthetic vocoder & pitch flatness detection across temporal intervals
          </p>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono-code">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#02755c]"></span>
            <span className="text-[#71737a]">Authentic Band (&lt;50%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#92681b]"></span>
            <span className="text-[#71737a]">Vocoder Anomaly (≥50%)</span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="interval" stroke="#71737a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71737a" fontSize={11} domain={[0, 100]} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#e8e8e8] p-2.5 rounded-[6px] shadow-xs text-xs font-mono-code space-y-1">
                      <div className="text-[#6e78d5] font-semibold">{data.range}</div>
                      <div className="text-[#1b1b1b]">
                        Synthesis Likelihood: <span className={data.suspicion >= 50 ? 'text-[#92681b] font-semibold' : 'text-[#02755c] font-semibold'}>{data.suspicion}%</span>
                      </div>
                      <div className="text-[#71737a]">Trust: {data.trust}/100</div>
                      <div className="text-[#71737a]">High-Freq Energy: {data.hfRatio}%</div>
                      <div className="text-[#71737a]">Centroid: {data.centroid} Hz</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={50} stroke="#92681b" strokeDasharray="4 4" />
            <Bar dataKey="suspicion" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.suspicion >= 50 ? '#92681b' : '#02755c'}
                  opacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Acoustic Telemetry */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono-code">
        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">TOTAL SEGMENTS</span>
          <span className="text-[#1b1b1b] font-semibold">{timeline.length}</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">SUSPICIOUS INTERVALS</span>
          <span className={suspiciousIntervals.length > 0 ? 'text-[#92681b] font-semibold' : 'text-[#02755c] font-semibold'}>
            {suspiciousIntervals.length}
          </span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">SPECTRAL CENTROID</span>
          <span className="text-[#6e78d5] font-semibold">{globalFeatures.spectral_centroid || 0} Hz</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">ZERO-CROSSING RATE</span>
          <span className="text-[#6d6b6b] font-semibold">{globalFeatures.zero_crossing_rate || 0.0}</span>
        </div>
      </div>
    </div>
  );
}
