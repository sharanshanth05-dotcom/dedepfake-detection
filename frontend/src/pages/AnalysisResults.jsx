import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  FileText,
  FileCode,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import apiClient from '../api/client';
import TrustScoreGauge from '../components/TrustScoreGauge';
import RiskBadge from '../components/RiskBadge';
import AttentionHeatmapViewer from '../components/AttentionHeatmapViewer';
import FrameTimelineChart from '../components/FrameTimelineChart';
import AudioTimelineChart from '../components/AudioTimelineChart';
import EvidenceCard from '../components/EvidenceCard';
import ModelInfoCard from '../components/ModelInfoCard';

export default function AnalysisResults() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/analysis/${id}`);
        setAnalysis(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load forensic analysis details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAnalysis();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="inline-block p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800 text-cyan-400 animate-spin">
          <RefreshCw className="w-8 h-8" />
        </div>
        <h3 className="font-display font-semibold text-lg text-white">
          Compiling Forensic Audit Report...
        </h3>
        <p className="text-xs text-slate-400 font-mono-code">
          Retrieving SHA-256 provenance hash, transformer rollout, and calibrated probability matrices
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 text-rose-400 inline-block">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="font-display font-bold text-xl text-white">Forensic Audit Record Not Found</h3>
        <p className="text-xs text-slate-400">{error || 'The requested analysis ID could not be retrieved.'}</p>
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold text-xs hover:bg-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Workspace
        </Link>
      </div>
    );
  }

  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top action header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link
              to="/workspace"
              className="text-xs font-mono-code text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Workspace
            </Link>
            <span className="text-slate-600">/</span>
            <span className="text-xs font-mono-code text-cyan-400">
              AUDIT-{analysis.id.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl text-white flex items-center gap-2.5">
            Forensic Analysis Report
            <RiskBadge riskLevel={analysis.risk_level} size="md" />
          </h1>
          <p className="text-xs text-slate-400 font-mono-code">
            Target: <span className="text-slate-200">{analysis.original_filename}</span> • Modality:{' '}
            <span className="text-cyan-400 uppercase">{analysis.media_type}</span>
          </p>
        </div>

        {/* Download Certified Reports */}
        <div className="flex items-center gap-2.5">
          <a
            href={`${API_BASE_URL}/analysis/${analysis.id}/pdf`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)] transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            Download Certified PDF
          </a>

          <a
            href={`${API_BASE_URL}/analysis/${analysis.id}/json`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-colors"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-400" />
            JSON Export
          </a>
        </div>
      </div>

      {/* Main Grid: Left Column (Gauge + Findings) | Right Column (Visualizer & Evidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (4 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TrustScoreGauge
            trustScore={analysis.trust_score}
            manipulationProb={analysis.manipulation_probability}
            confidence={analysis.model_confidence}
            riskLevel={analysis.risk_level}
          />

          {/* Technical Narrative Explanation */}
          <div className="cyber-card p-5 space-y-2">
            <h4 className="text-xs font-mono-code uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Forensic Technical Summary
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {analysis.explanation}
            </p>
          </div>

          <ModelInfoCard
            modelVersion={analysis.model_version}
            duration={analysis.processing_time}
            fileHash={analysis.file_hash}
            limitations={analysis.limitations}
            mediaType={analysis.media_type}
          />
        </div>

        {/* Right Column (7 cols): Modality Specific Visualizations & Evidence */}
        <div className="lg:col-span-7 space-y-6">
          {/* Modality Visualization Component */}
          {analysis.media_type === 'image' && (
            <AttentionHeatmapViewer
              originalPreview={analysis.details?.visualizations?.original_preview}
              overlayPreview={analysis.details?.visualizations?.attention_overlay}
              peakPatch={analysis.details?.visualizations?.max_attention_patch}
              faceCount={analysis.details?.faces_detected_count}
            />
          )}

          {analysis.media_type === 'video' && (
            <FrameTimelineChart
              timeline={analysis.details?.timeline}
              suspiciousTimestamps={analysis.details?.suspicious_timestamps}
              temporalMetrics={analysis.details?.temporal_metrics}
            />
          )}

          {analysis.media_type === 'audio' && (
            <AudioTimelineChart
              timeline={analysis.details?.timeline}
              suspiciousIntervals={analysis.details?.suspicious_intervals}
              globalFeatures={analysis.details?.global_spectral_features}
            />
          )}

          {/* Forensic Evidence Items */}
          <div className="cyber-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                Isolated Forensic Evidence Items
              </h4>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                {analysis.evidence_items?.length || 0} Artifacts
              </span>
            </div>

            <EvidenceCard evidence={analysis.evidence_items} />
          </div>
        </div>
      </div>
    </div>
  );
}
