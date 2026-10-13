import React, { useState } from 'react';
import { Eye, Layers, Split, Info, Sparkles } from 'lucide-react';

export default function AttentionHeatmapViewer({ originalPreview, overlayPreview, peakPatch, faceCount = 0 }) {
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'original', 'split'

  if (!originalPreview && !overlayPreview) {
    return (
      <div className="cyber-card p-8 text-center text-slate-500 font-mono-code text-xs">
        No visual attention artifacts generated for this modality.
      </div>
    );
  }

  return (
    <div className="cyber-card p-5 space-y-4">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Vision Transformer (ViT) Attention Rollout
          </h4>
          <p className="text-xs text-slate-400">
            Transformer patch attribution localized across 14×14 spatial tokens
          </p>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono-code">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'overlay' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Overlay
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'original' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Original
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
              viewMode === 'split' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 flex items-center justify-center min-h-[340px]">
        {viewMode === 'overlay' && (
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <img
              src={overlayPreview || originalPreview}
              alt="ViT Attention Overlay"
              className="rounded-lg max-h-[380px] w-auto object-contain border border-slate-700/60 shadow-lg"
            />
            <span className="mt-2 text-[11px] font-mono-code text-cyan-400/90">
              Colormap JET indicates neural feature divergence (Red = Highest Saliency)
            </span>
          </div>
        )}

        {viewMode === 'original' && (
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <img
              src={originalPreview}
              alt="Original Uploaded Media"
              className="rounded-lg max-h-[380px] w-auto object-contain border border-slate-700/60 shadow-lg"
            />
            <span className="mt-2 text-[11px] font-mono-code text-slate-400">
              Raw Image Source (Decoded RGB)
            </span>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono-code text-slate-400 mb-1.5">Original Source</span>
              <img
                src={originalPreview}
                alt="Original"
                className="rounded-lg max-h-[280px] w-auto object-contain border border-slate-700/60"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono-code text-cyan-400 mb-1.5">ViT Attention Rollout</span>
              <img
                src={overlayPreview || originalPreview}
                alt="Heatmap Overlay"
                className="rounded-lg max-h-[280px] w-auto object-contain border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Forensic Telemetry Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono-code">
        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">PEAK ATTENTION PATCH</span>
          <span className="text-cyan-300 font-semibold">
            {peakPatch ? `Row ${peakPatch.row}, Col ${peakPatch.col}` : 'Patch [7, 7]'}
          </span>
        </div>

        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">FACIAL BOUNDARY ROIS</span>
          <span className="text-white font-semibold">
            {faceCount > 0 ? `${faceCount} Region(s) Isolated` : 'Global Frame Scan'}
          </span>
        </div>

        <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
          <span className="text-slate-500 block text-[10px]">TRANSFORMER ATTRIBUTION</span>
          <span className="text-emerald-400 font-semibold">Layer 12 CLS Rollout</span>
        </div>
      </div>
    </div>
  );
}
