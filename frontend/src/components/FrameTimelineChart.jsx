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
      <div className="cyber-card p-6 text-center text-[#71737a] font-mono-code text-xs bg-[#fbfbfb] border border-[#e8e8e8] rounded-[6px]">
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
    <div className="cyber-card p-5 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e8] pb-3">
        <div>
          <h4 className="text-sm font-semibold text-[#1b1b1b] flex items-center gap-2">
            <Film className="w-4 h-4 text-[#6e78d5]" />
            Video Frame Suspicion Timeline
          </h4>
          <p className="text-xs text-[#71737a]">
            Temporal trajectory of manipulation likelihood sampled across consecutive frames
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-mono-code">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#6e78d5]"></span>
            <span className="text-[#71737a]">Suspicion %</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#92681b]"></span>
            <span className="text-[#92681b]">Threat Cutoff (50%)</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="suspicionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6e78d5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6e78d5" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e8" />
            <XAxis dataKey="time" stroke="#71737a" fontSize={11} tickLine={false} />
            <YAxis stroke="#71737a" fontSize={11} domain={[0, 100]} tickLine={false} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white border border-[#e8e8e8] p-2.5 rounded-[6px] shadow-xs text-xs font-mono-code space-y-1">
                      <div className="text-[#6e78d5] font-semibold">{data.time} (Frame #{data.frameIndex})</div>
                      <div className="text-[#1b1b1b]">Suspicion: <span className={data.suspicion >= 50 ? 'text-[#92681b] font-semibold' : 'text-[#02755c] font-semibold'}>{data.suspicion}%</span></div>
                      <div className="text-[#71737a]">Trust: {data.trust}/100</div>
                      <div className="text-[#71737a]">Faces: {data.faces}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={50} stroke="#92681b" strokeDasharray="4 4" />
            <Area
              type="monotone"
              dataKey="suspicion"
              stroke="#6e78d5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#suspicionGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Frame Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs font-mono-code">
        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">FRAMES ANALYZED</span>
          <span className="text-[#1b1b1b] font-semibold">{timeline.length}</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">SUSPICIOUS FRAMES</span>
          <span className={suspiciousTimestamps.length > 0 ? 'text-[#92681b] font-semibold' : 'text-[#02755c] font-semibold'}>
            {suspiciousTimestamps.length}
          </span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">TEMPORAL ANOMALIES</span>
          <span className="text-[#6d6b6b] font-semibold">{temporalMetrics.temporal_anomaly_count || 0}</span>
        </div>

        <div className="p-2.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
          <span className="text-[#71737a] block text-[10px]">JITTER INDEX</span>
          <span className="text-[#6e78d5] font-semibold">{temporalMetrics.jitter_score || 0.0}</span>
        </div>
      </div>
    </div>
  );
}
