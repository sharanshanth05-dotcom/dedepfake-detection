import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';
import { Film, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function FrameTimelineChart({ timeline = [], suspiciousTimestamps = [], temporalMetrics = {} }) {
  if (!timeline || timeline.length === 0) {
    return (
      <div className="cyber-card p-6 text-center text-slate-500 font-mono-code text-xs">
        No frame timeline data available.
      </div>
    );
  }

  // Format data for Recharts
  const chartData = timeline.map((f) => ({
    time: `${f.timestamp}s`,
    suspicion: Math.round(f.suspicion_score * 100),
    trust: f.trust_score,
    faces: f.face_count,
    frameIndex: f.frame_index,
  }));

  return (
    <div className="cyber-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            Video Frame Suspicion Timeline
          </h4>
          <p className="text-xs text-slate-400">
            Temporal trajectory of manipulation likelihood sampled across consecutive frames
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono-code">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-cyan-500"></span>
            <span className="text-slate-300">Suspicion %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-500"></span>
            <span className="text-rose-400">Threat Cutoff (50%)</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="suspicionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded shadow-xl text-xs font-mono-code space-y-1">
                      <div className="text-cyan-400 font-bold">{data.time} (Frame #{data.frameIndex})</div>
                      <div className="text-slate-300">Suspicion: <span className={data.suspicion >= 50 ? 'text-rose-400 font-semibold' : 'text-emerald-400'}>{data.suspicion}%</span></div>
                      <div className="text-slate-400">Trust: {data.trust}/100</div>
                      <div className="text-slate-400">Faces: {data.faces}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={50} stroke="#f43f5e" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="suspicion"
              stroke="#06b6d4"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#suspicionGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Frame Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono-code">
        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">FRAMES ANALYZED</span>
          <span className="text-white font-semibold">{timeline.length}</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">SUSPICIOUS FRAMES</span>
          <span className={suspiciousTimestamps.length > 0 ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
            {suspiciousTimestamps.length}
          </span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">TEMPORAL ANOMALIES</span>
          <span className="text-amber-400 font-semibold">{temporalMetrics.temporal_anomaly_count || 0}</span>
        </div>

        <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">JITTER INDEX</span>
          <span className="text-cyan-400 font-semibold">{temporalMetrics.jitter_score || 0.0}</span>
        </div>
      </div>
    </div>
  );
}
