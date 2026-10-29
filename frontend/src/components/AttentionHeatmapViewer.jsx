import React, { useState } from 'react';
import { Eye, Layers, Split, Info, Sparkles } from 'lucide-react';

export default function AttentionHeatmapViewer({ originalPreview, overlayPreview, peakPatch, faceCount = 0 }) {
  const [viewMode, setViewMode] = useState('overlay'); // 'overlay', 'original', 'split'

  if (!originalPreview && !overlayPreview) {
    return (
      <div className="cyber-card p-8 text-center text-[#71737a] font-mono-code text-xs bg-[#fbfbfb] border border-[#e8e8e8] rounded-[6px]">
        No visual attention artifacts generated for this modality.
      </div>
    );
  }

  return (
    <div className="cyber-card p-5 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
      {/* Header controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e8e8e8] pb-3">
        <div>
          <h4 className="text-sm font-semibold text-[#1b1b1b] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6e78d5]" />
            Vision Transformer (ViT) Attention Rollout
          </h4>
          <p className="text-xs text-[#71737a]">
            Transformer patch attribution localized across 14×14 spatial tokens
          </p>
        </div>

        {/* View mode toggle buttons */}
        <div className="flex items-center gap-1 p-1 bg-[#ececef] rounded-[6px] border border-[#e8e8e8] text-xs font-mono-code">
          <button
            onClick={() => setViewMode('overlay')}
            className={`px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 ${
              viewMode === 'overlay' ? 'bg-white text-[#1b1b1b] font-medium shadow-xs border border-[#e8e8e8]' : 'text-[#71737a] hover:text-[#1b1b1b]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#6e78d5]" />
            Overlay
          </button>
          <button
            onClick={() => setViewMode('original')}
            className={`px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 ${
              viewMode === 'original' ? 'bg-white text-[#1b1b1b] font-medium shadow-xs border border-[#e8e8e8]' : 'text-[#71737a] hover:text-[#1b1b1b]'
            }`}
          >
            <Eye className="w-3.5 h-3.5 text-[#6e78d5]" />
            Original
          </button>
          <button
            onClick={() => setViewMode('split')}
            className={`px-2.5 py-1 rounded-[4px] transition-colors flex items-center gap-1.5 ${
              viewMode === 'split' ? 'bg-white text-[#1b1b1b] font-medium shadow-xs border border-[#e8e8e8]' : 'text-[#71737a] hover:text-[#1b1b1b]'
            }`}
          >
            <Split className="w-3.5 h-3.5 text-[#6e78d5]" />
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Image Display Area */}
      <div className="bg-[#fbfbfb] rounded-xl p-3 border border-[#e8e8e8] flex items-center justify-center min-h-[340px]">
        {viewMode === 'overlay' && (
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <img
              src={overlayPreview || originalPreview}
              alt="ViT Attention Overlay"
              className="rounded-[6px] max-h-[380px] w-auto object-contain border border-[#e8e8e8] shadow-xs"
            />
            <span className="mt-2 text-[11px] font-mono-code text-[#71737a] font-medium">
              Colormap JET indicates neural feature divergence (Red = Highest Saliency)
            </span>
          </div>
        )}

        {viewMode === 'original' && (
          <div className="relative max-w-lg w-full flex flex-col items-center">
            <img
              src={originalPreview}
              alt="Original Uploaded Media"
              className="rounded-[6px] max-h-[380px] w-auto object-contain border border-[#e8e8e8] shadow-xs"
            />
            <span className="mt-2 text-[11px] font-mono-code text-[#71737a]">
              Raw Image Source (Decoded RGB)
            </span>
          </div>
        )}

        {viewMode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono-code text-[#71737a] mb-1.5">Original Source</span>
              <img
                src={originalPreview}
                alt="Original"
                className="rounded-[6px] max-h-[280px] w-auto object-contain border border-[#e8e8e8]"
              />
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs font-mono-code text-[#6e78d5] font-medium mb-1.5">ViT Attention Rollout</span>
              <img
                src={overlayPreview}
                alt="Overlay"
                className="rounded-[6px] max-h-[280px] w-auto object-contain border border-[#e8e8e8]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Auxiliary Metadata Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono-code text-[#71737a] pt-1">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-[#6e78d5]" />
          <span>Biometric Regions Analyzed: <strong className="text-[#1b1b1b]">{faceCount} Face(s)</strong></span>
        </div>
        {peakPatch && (
          <div className="text-[11px]">
            Peak Saliency Patch: <span className="text-[#6e78d5] font-semibold">Token #{peakPatch}</span>
          </div>
        )}
      </div>
    </div>
  );
}
