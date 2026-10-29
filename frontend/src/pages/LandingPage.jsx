import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import GlassSurface from '../components/GlassSurface';
import {
  ShieldAlert,
  ShieldCheck,
  Eye,
  Film,
  Mic,
  Cpu,
  Lock,
  ArrowRight,
  Activity,
  FileCheck,
  Zap,
  CheckCircle2,
  Sparkles,
  Layers,
  Terminal,
  Scan,
  Hash,
  Database,
  FileCode,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const [activePreviewMode, setActivePreviewMode] = useState('heatmap'); // 'heatmap', 'raw'

  const modalityFeatures = [
    {
      title: 'Visual Media Forensics',
      backbone: 'Vision Transformer (ViT-Base/16)',
      icon: Eye,
      tag: 'Attention Rollout',
      accent: 'bg-[#d9dcea]/30 border-[#e8e8e8] text-[#6e78d5]',
      description:
        'Computes patch-level self-attention across 12 transformer encoder blocks, isolating boundary artifacts, GAN frequency grids, and latent diffusion inconsistencies.',
      capabilities: [
        'Layer-12 Attention Rollout saliency map',
        'Facial boundary & blending localization',
        'Calibrated manipulation probability',
        'SHA-256 image provenance hashing',
      ],
      linkText: 'Audit Image',
      mediaType: 'image',
    },
    {
      title: 'Video Temporal Inspection',
      backbone: 'Multi-Frame ViT + BiGRU',
      icon: Film,
      tag: 'Temporal Consistency',
      accent: 'bg-[#d9dcea]/30 border-[#e8e8e8] text-[#6e78d5]',
      description:
        'Samples video streams at calibrated 1.0 FPS, tracking biometric facial landmarks and modeling inter-frame jitter, optical flow deltas, and frame warping.',
      capabilities: [
        'Frame-by-frame suspicion timeline',
        'Optical delta temporal jitter analysis',
        'Facial boundary continuity tracking',
        'Dual-stream synchronized audio audit',
      ],
      linkText: 'Audit Video',
      mediaType: 'video',
    },
    {
      title: 'Acoustic & Voice Cloning',
      backbone: 'Wav2Vec 2.0 + Mel-Spectrogram',
      icon: Mic,
      tag: 'Vocoder Forensics',
      accent: 'bg-[#d9dcea]/30 border-[#e8e8e8] text-[#6e78d5]',
      description:
        'Audits audio tracks standardized to 16kHz mono, detecting neural vocoder harmonic cutoffs (HiFi-GAN, MelGAN) and synthetic phase discontinuities.',
      capabilities: [
        'Time-series vocal suspicion segments',
        'Vocoder high-frequency spectral cutoff',
        'Zero-crossing & spectral centroid audits',
        'Voice clone & TTS synthesizer detection',
      ],
      linkText: 'Audit Audio',
      mediaType: 'audio',
    },
  ];

  const standards = [
    { title: 'NIST AI 100-1', subtitle: 'Risk Management Framework' },
    { title: 'IEEE P3333.1.4', subtitle: 'Synthetic Media Quality' },
    { title: 'Platt Calibration', subtitle: 'Expected Calibration Error < 0.05' },
    { title: 'Zero Retention', subtitle: 'Ephemeral Memory Architecture' },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Cryptographic Ingestion',
      desc: 'Computes irreversible SHA-256 hash, verifies magic-byte MIME integrity, and applies decompression bomb defense.',
      icon: Lock,
    },
    {
      step: '02',
      title: 'Neural Transformer Core',
      desc: 'Processes suspect media through ViT patch embeddings, temporal BiGRU recurrent modeling, and acoustic spectral tensors.',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Attention Attribution & Evidence',
      desc: 'Extracts self-attention rollout matrices, optical frame jitter spikes, and vocoder harmonic phase irregularities.',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'Certified Audit Reporting',
      desc: 'Computes ECE-calibrated Trust Score (0–100) and exports cryptographically verifiable certified PDF & JSON forensic reports.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Subtle Linear Wash */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-80px] left-1/3 w-[500px] h-[350px] bg-[#d9dcea]/20 rounded-full blur-[140px]" />
        <div className="absolute top-[40px] right-1/4 w-[400px] h-[300px] bg-[#6e78d5]/10 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        
        {/* ===================== HERO SECTION ===================== */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Institutional Clearance Tag */}
          <GlassSurface
            width="auto"
            height="auto"
            borderRadius={9999}
            backgroundOpacity={0.06}
            blur={10}
            brightness={60}
            className="inline-flex shadow-xs border border-[#e8e8e8]"
            contentClassName="px-3.5 py-1.5 gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-[#6e78d5] animate-pulse" />
            <span className="font-medium tracking-wide uppercase text-[11px] text-[#1b1b1b] font-mono-code">
              Institutional Media Forensics Suite • NIST AI 100-1 Reference
            </span>
          </GlassSurface>

          {/* Main Headline */}
          <h1 className="font-display font-semibold text-4xl sm:text-6xl lg:text-7xl tracking-tight text-[#1b1b1b] leading-[1.1]">
            Can You Trust What You <br />
            <span className="text-[#6e78d5]">See and Hear?</span>
          </h1>

          {/* Authoritative Subheading */}
          <p className="text-base sm:text-lg text-[#71737a] max-w-2xl mx-auto leading-relaxed">
            TruthLens AI delivers enterprise-grade deepfake and synthetic media forensics using fine-tuned{' '}
            <strong className="text-[#1b1b1b] font-medium">Vision Transformers (ViT)</strong>, temporal optical flow analysis, 
            and acoustic spectral resonance modeling with explainable attention localization.
          </p>

          {/* Action Callouts */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[6px] font-medium text-sm bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-xs transition-all active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              Launch Forensic Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] font-medium text-sm bg-white hover:bg-[#ececef] text-[#1b1b1b] border border-[#e8e8e8] transition-all shadow-xs"
            >
              <Cpu className="w-4 h-4 text-[#6e78d5]" />
              Technical Methodology & ViT
            </Link>
          </div>

          {/* Key Forensic Standards & Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-[#e8e8e8] text-left max-w-4xl mx-auto">
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] shadow-xs">
              <span className="text-2xl font-display font-semibold text-[#1b1b1b] block">94.2%</span>
              <span className="text-[11px] text-[#71737a] font-mono-code">ViT Benchmark Acc</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] shadow-xs">
              <span className="text-2xl font-display font-semibold text-[#6e78d5] block">3 Modalities</span>
              <span className="text-[11px] text-[#71737a] font-mono-code">Image • Video • Audio</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] shadow-xs">
              <span className="text-2xl font-display font-semibold text-[#02755c] block">0.042 ECE</span>
              <span className="text-[11px] text-[#71737a] font-mono-code">Platt Calibrated Error</span>
            </div>
            <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] shadow-xs">
              <span className="text-2xl font-display font-semibold text-[#6d6b6b] block">SHA-256</span>
              <span className="text-[11px] text-[#71737a] font-mono-code">Cryptographic Ledger</span>
            </div>
          </div>
        </div>

        {/* ===================== INTERACTIVE FORENSIC HUD SIMULATOR ===================== */}
        <div className="mt-16 max-w-5xl mx-auto">
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={14}
            backgroundOpacity={0.06}
            blur={16}
            brightness={55}
            className="cyber-card p-0 border-[#e8e8e8] shadow-xs relative overflow-hidden"
            contentClassName="p-6 block w-full"
          >
            <div className="scanline-effect" />
            
            {/* HUD Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-4 border-b border-[#e8e8e8]">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-[6px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5]">
                  <Scan className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#1b1b1b] font-display">
                    Interactive Forensic Inspection Terminal
                  </h3>
                  <span className="text-[10px] font-mono-code text-[#71737a]">
                    SAMPLE AUDIT // TARGET_ID: FFPP-77291 // SHA256: 8f4a9b...c3e0
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center gap-1 bg-[#ececef] p-1 rounded-[6px] border border-[#e8e8e8] text-xs font-mono-code">
                <button
                  onClick={() => setActivePreviewMode('heatmap')}
                  className={`px-3 py-1 rounded-[4px] transition-all ${
                    activePreviewMode === 'heatmap'
                      ? 'bg-[#6e78d5] text-white font-medium shadow-xs'
                      : 'text-[#71737a] hover:text-[#1b1b1b]'
                  }`}
                >
                  Attention Rollout
                </button>
                <button
                  onClick={() => setActivePreviewMode('raw')}
                  className={`px-3 py-1 rounded-[4px] transition-all ${
                    activePreviewMode === 'raw'
                      ? 'bg-[#6e78d5] text-white font-medium shadow-xs'
                      : 'text-[#71737a] hover:text-[#1b1b1b]'
                  }`}
                >
                  Raw Ingestion
                </button>
              </div>
            </div>

            {/* HUD Body Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Media Viewport */}
              <div className="md:col-span-7 relative rounded-xl overflow-hidden bg-[#fbfbfb] border border-[#e8e8e8] p-2 reticle-box">
                <div className="relative aspect-video rounded-[6px] overflow-hidden bg-slate-900 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80"
                    alt="Forensic Test Subject"
                    className="w-full h-full object-cover filter contrast-105"
                  />

                  {/* Attention Rollout Overlay */}
                  {activePreviewMode === 'heatmap' && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/35 via-amber-500/25 to-[#6e78d5]/20 mix-blend-color-dodge pointer-events-none">
                      <div className="absolute top-[28%] left-[32%] w-36 h-36 rounded-full border-2 border-rose-400/80 bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse" />
                      <div className="absolute top-[32%] left-[36%] px-2 py-0.5 rounded bg-rose-950/90 border border-rose-500 text-[10px] font-mono-code text-rose-300">
                        ANOMALY: PERIMETER WARP 98.4%
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#101011]/80 border border-white/[0.08] text-[9px] font-mono-code text-white">
                    FPS: 60.0 // ISO: 100 // 16×16 PATCH GRIDS
                  </div>
                </div>
              </div>

              {/* Telemetry Stats Panel */}
              <div className="md:col-span-5 space-y-4">
                <div className="p-4 rounded-xl bg-[#fbfbfb] border border-[#e8e8e8] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code text-[#71737a] uppercase tracking-wider font-medium">
                      Forensic Verdict
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-code font-medium bg-[#92681b]/15 text-[#92681b] border border-[#92681b]/30">
                      CRITICAL MANIPULATION
                    </span>
                  </div>

                  {/* Trust Score Indicator */}
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-display font-semibold text-[#92681b]">
                      12<span className="text-xl text-[#71737a]">/100</span>
                    </span>
                    <span className="text-xs text-[#71737a] font-mono-code">
                      Trust Score (ECE Calibrated)
                    </span>
                  </div>

                  {/* Probability bars */}
                  <div className="space-y-1.5 pt-1 text-xs font-mono-code">
                    <div className="flex justify-between text-[#1b1b1b] text-[11px]">
                      <span>P(Manipulated)</span>
                      <span className="text-[#92681b] font-medium">88.0%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#ececef] overflow-hidden">
                      <div className="h-full bg-[#92681b] rounded-full w-[88%]" />
                    </div>

                    <div className="flex justify-between text-[#1b1b1b] text-[11px] pt-1">
                      <span>Model Confidence</span>
                      <span className="text-[#6e78d5] font-medium">96.5%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#ececef] overflow-hidden">
                      <div className="h-full bg-[#6e78d5] rounded-full w-[96.5%]" />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono-code text-[#71737a]">
                    Ready to audit suspect evidence?
                  </span>
                  <Link
                    to="/workspace"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6e78d5] hover:text-[#5d67c8] font-mono-code"
                  >
                    Open Lab <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          </GlassSurface>
        </div>

        {/* ===================== MODALITY ENGINES ===================== */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono-code text-[#6e78d5] uppercase tracking-widest block mb-1 font-medium">
              Multimodal Neural Architecture
            </span>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-[#1b1b1b]">
              Purpose-Built Forensic Backbones
            </h2>
            <p className="text-sm text-[#71737a] mt-2">
              Three specialized neural pipelines designed to capture spatial diffusion noise, temporal optical jitter, and vocoder acoustic anomalies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modalityFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="cyber-card p-6 flex flex-col justify-between hover:border-[#6e78d5] transition-all duration-200 group relative overflow-hidden rounded-xl bg-white border border-[#e8e8e8] shadow-xs"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Backbone Badge */}
                    <div className="flex items-center justify-between">
                      <div className={`p-2.5 rounded-[6px] border ${feat.accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-[4px] bg-[#ececef] text-[#71737a] border border-[#e8e8e8]">
                        {feat.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-semibold text-lg text-[#1b1b1b] group-hover:text-[#6e78d5] transition-colors">
                        {feat.title}
                      </h3>
                      <span className="text-[11px] font-mono-code text-[#6e78d5] block mt-0.5 font-medium">
                        {feat.backbone}
                      </span>
                    </div>

                    <p className="text-xs text-[#71737a] leading-relaxed">
                      {feat.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-[#e8e8e8]">
                      {feat.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#1b1b1b]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#6e78d5] shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      to="/workspace"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6e78d5] group-hover:text-[#5d67c8] transition-colors font-mono-code"
                    >
                      {feat.linkText}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================== WORKFLOW PIPELINE ===================== */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-mono-code text-[#6e78d5] uppercase tracking-widest block mb-1 font-medium">
              Operational Lifecycle
            </span>
            <h2 className="font-display font-semibold text-3xl sm:text-4xl text-[#1b1b1b]">
              End-to-End Forensic Audit Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((wf) => {
              const Icon = wf.icon;
              return (
                <div
                  key={wf.step}
                  className="cyber-card p-6 relative group hover:border-[#6e78d5] transition-all duration-200 bg-white border border-[#e8e8e8] rounded-xl shadow-xs"
                >
                  <span className="text-2xl font-display font-semibold text-[#71737a]/50 block mb-3 font-mono-code">
                    {wf.step}
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-[6px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5]">
                      <Icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-semibold text-[#1b1b1b]">{wf.title}</h4>
                  </div>
                  <p className="text-xs text-[#71737a] leading-relaxed">
                    {wf.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ===================== INSTITUTIONAL STANDARDS STRIP ===================== */}
        <div className="mt-24 p-6 rounded-xl bg-white border border-[#e8e8e8] shadow-xs">
          <div className="text-center max-w-xl mx-auto mb-6">
            <span className="text-[11px] font-mono-code uppercase text-[#71737a] tracking-wider flex items-center justify-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-[#6e78d5]" />
              Institutional Adherence & Calibration Standards
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {standards.map((st, i) => (
              <div key={i} className="p-3.5 rounded-[6px] bg-[#fbfbfb] border border-[#e8e8e8]">
                <h5 className="font-display font-semibold text-sm text-[#1b1b1b]">{st.title}</h5>
                <span className="text-[10px] font-mono-code text-[#71737a] block mt-0.5">{st.subtitle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===================== ZERO-RETENTION PRIVACY BANNER ===================== */}
        <div className="mt-16">
          <GlassSurface
            width="100%"
            height="auto"
            borderRadius={12}
            backgroundOpacity={0.06}
            blur={14}
            brightness={55}
            className="cyber-card p-0 border-[#e8e8e8] shadow-xs"
            contentClassName="p-8 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-[#6e78d5] font-mono-code text-xs uppercase font-medium">
                <Lock className="w-4 h-4" />
                <span>Zero Retention & Cryptographic Integrity</span>
              </div>
              <h3 className="font-display font-semibold text-xl sm:text-2xl text-[#1b1b1b]">
                Ephemeral Processing with Uncompromising Privacy
              </h3>
              <p className="text-xs text-[#71737a] leading-relaxed">
                Uploaded media buffers exist exclusively in volatile memory and are purged immediately post-inference. 
                TruthLens pairs deep learning predictions with Platt temperature calibration to provide legally defensible, 
                explainable evidence reports.
              </p>
            </div>

            <Link
              to="/workspace"
              className="shrink-0 px-5 py-2.5 rounded-[6px] text-xs font-medium bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-xs transition-all active:scale-[0.98]"
            >
              Start Media Analysis
            </Link>
          </GlassSurface>
        </div>

      </div>
    </div>
  );
}
