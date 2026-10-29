import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Download,
  FileCode,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  RefreshCw,
  Lock,
  Copy,
  Check,
  Award,
  Hash,
} from 'lucide-react';
import apiClient from '../api/client';
import RiskBadge from '../components/RiskBadge';
import TrustScoreGauge from '../components/TrustScoreGauge';
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
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/analysis/${id}`);
        setAnalysis(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to retrieve forensic record.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalysis();
  }, [id]);

  const copyFileHash = () => {
    if (analysis?.file_hash) {
      navigator.clipboard.writeText(analysis.file_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4">
        <div className="p-3.5 rounded-xl bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5] inline-block animate-pulse">
          <RefreshCw className="w-7 h-7 animate-spin" />
        </div>
        <h3 className="font-display font-semibold text-xl text-[#1b1b1b]">
          Compiling Certified Forensic Dossier...
        </h3>
        <p className="text-xs text-[#71737a] font-mono-code leading-relaxed">
          Retrieving SHA-256 cryptographic provenance, ViT attention rollout tensors, and Platt temperature calibrated confidence matrices.
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <div className="p-3.5 rounded-xl bg-[#92681b]/10 border border-[#92681b]/30 text-[#92681b] inline-block">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className="font-display font-semibold text-xl text-[#1b1b1b]">Forensic Audit Record Not Found</h3>
        <p className="text-xs text-[#71737a]">{error || 'The requested analysis ID could not be retrieved from the audit ledger.'}</p>
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#6e78d5] text-white font-medium text-xs hover:bg-[#5d67c8] transition-colors font-mono-code shadow-xs"
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
      
      {/* Certified Forensic Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e8e8e8] pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <Link
              to="/workspace"
              className="text-xs font-mono-code text-[#71737a] hover:text-[#6e78d5] flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
            <span className="text-[#e8e8e8]">/</span>
            <span className="text-xs font-mono-code text-[#1b1b1b] font-medium px-2 py-0.5 rounded-[4px] bg-[#ececef] border border-[#e8e8e8]">
              AUDIT-{analysis.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-[10px] font-mono-code text-[#71737a] flex items-center gap-1">
              <Award className="w-3 h-3 text-[#6e78d5]" />
              ECE Calibrated Report
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <h1 className="font-display font-semibold text-2xl sm:text-3xl text-[#1b1b1b] tracking-tight">
              Certified Media Forensics Dossier
            </h1>
            <RiskBadge riskLevel={analysis.risk_level} size="md" />
          </div>

          {/* Cryptographic Hash line */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono-code text-[#71737a] pt-0.5">
            <span>
              Target: <strong className="text-[#1b1b1b] font-medium">{analysis.original_filename}</strong>
            </span>
            <span>•</span>
            <span className="text-[#6e78d5] uppercase font-medium">{analysis.media_type}</span>
            <span>•</span>
            <button
              onClick={copyFileHash}
              className="inline-flex items-center gap-1 text-[11px] text-[#71737a] hover:text-[#1b1b1b] transition-colors bg-[#ececef] px-2 py-0.5 rounded-[4px] border border-[#e8e8e8]"
              title="Copy cryptographic SHA-256 hash"
            >
              <Hash className="w-3 h-3 text-[#6e78d5]" />
              <span>{analysis.file_hash?.slice(0, 16)}...</span>
              {copiedHash ? <Check className="w-3 h-3 text-[#02755c]" /> : <Copy className="w-3 h-3 text-[#71737a]" />}
            </button>
          </div>
        </div>

        {/* Certified Report Download CTAs */}
        <div className="flex items-center gap-2.5">
          <a
            href={`${API_BASE_URL}/analysis/${analysis.id}/pdf`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] text-xs font-medium bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-xs transition-all font-mono-code active:scale-[0.98]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Certified PDF</span>
          </a>

          <a
            href={`${API_BASE_URL}/analysis/${analysis.id}/json`}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] text-xs font-medium bg-white hover:bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] transition-all font-mono-code shadow-xs"
          >
            <FileCode className="w-3.5 h-3.5 text-[#6e78d5]" />
            <span>JSON Ledger</span>
          </a>
        </div>
      </div>

      {/* Main Grid: Left Column (CometDial Gauge + Technical Summary) | Right Column (Visualizer & Evidence) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <TrustScoreGauge
            trustScore={analysis.trust_score}
            manipulationProb={analysis.manipulation_probability}
            confidence={analysis.model_confidence}
            riskLevel={analysis.risk_level}
          />

          {/* Technical Summary */}
          <div className="cyber-card p-6 space-y-3 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
            <h4 className="text-xs font-mono-code uppercase text-[#71737a] tracking-wider flex items-center gap-2 font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#6e78d5]" />
              <span>Forensic Technical Summary</span>
            </h4>
            <p className="text-xs text-[#1b1b1b] leading-relaxed font-sans">
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

        {/* Right Column (7 cols): Modality Visualizations & Evidence Artifacts */}
        <div className="lg:col-span-7 space-y-6">
          {/* Modality Specific Visualization */}
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
          <div className="cyber-card p-6 space-y-4 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
            <div className="flex items-center justify-between border-b border-[#e8e8e8] pb-3">
              <h4 className="text-sm font-semibold text-[#1b1b1b] flex items-center gap-2 font-display">
                <ShieldCheck className="w-4 h-4 text-[#6e78d5]" />
                <span>Isolated Forensic Evidence Artifacts</span>
              </h4>
              <span className="text-[10px] font-mono-code px-2.5 py-0.5 rounded-full bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] font-medium">
                {analysis.evidence_items?.length || 0} Artifacts Isolated
              </span>
            </div>

            <EvidenceCard evidence={analysis.evidence_items} />
          </div>
        </div>

      </div>
    </div>
  );
}
