import React from 'react';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';

export default function LandingPage() {
  const modalityFeatures = [
    {
      title: 'Image Forensics (ViT)',
      icon: Eye,
      tag: 'Vision Transformer',
      accent: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-400',
      description:
        'Uses fine-tuned Vision Transformer (ViT-Base/16) with Attention Rollout to isolate patch-level manipulation and boundary diffusion artifacts.',
      capabilities: [
        'Transformer Attention Rollout heatmaps',
        'Facial boundary & blending localization',
        'Calibrated manipulation probability',
      ],
      linkText: 'Analyze Image',
    },
    {
      title: 'Video Temporal Inspection',
      icon: Film,
      tag: 'Multi-Frame ViT + BiGRU',
      accent: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-400',
      description:
        'Evenly samples video frames, tracks facial boundaries across frames, and models inter-frame optical anomalies and jitter spikes.',
      capabilities: [
        'Frame-by-frame suspicion timeline',
        'Inter-frame temporal inconsistency modeling',
        'Audio track extraction & dual analysis',
      ],
      linkText: 'Analyze Video',
    },
    {
      title: 'Speech & Audio Verification',
      icon: Mic,
      tag: 'Wav2Vec 2.0 + Spectral',
      accent: 'from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400',
      description:
        'Audits audio recordings across 16kHz standard frequency domain, identifying vocoder harmonic cutoffs and robotic pitch continuity.',
      capabilities: [
        'Segment-level temporal timeline',
        'Vocoder synthesis detection (HiFi-GAN/MelGAN)',
        'Zero-crossing rate & spectral centroid audits',
      ],
      linkText: 'Analyze Audio',
    },
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Ingestion & Validation',
      desc: 'Cryptographic SHA-256 provenance hashing, magic-byte header inspection, and decompression bomb mitigation.',
      icon: Lock,
    },
    {
      step: '02',
      title: 'Deep Learning Inference',
      desc: 'Execution through specialized modality backbones (ViT-Base/16 for imagery, Wav2Vec 2.0 for acoustics).',
      icon: Cpu,
    },
    {
      step: '03',
      title: 'Explainability & Localisation',
      desc: 'Transformer attention rollout extraction, optical jitter differentials, and segment timeline localization.',
      icon: Sparkles,
    },
    {
      step: '04',
      title: 'Calibrated Forensic Audit',
      desc: 'Expected Calibration Error (ECE) scaled trust score generation and downloadable certified forensic PDF reports.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Cyber Glow Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-150px] left-1/4 w-[500px] h-[500px] bg-cyan-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-[50px] right-1/4 w-[450px] h-[450px] bg-indigo-600/15 rounded-full blur-[140px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono-code shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <ShieldAlert className="w-4 h-4 text-cyan-400" />
            <span>CYBERSECURITY MEDIA FORENSICS PLATFORM</span>
          </div>

          <h1 className="font-display font-extrabold text-4xl sm:text-6xl tracking-tight text-white leading-tight">
            Can You Trust What You <br />
            <span className="cyber-gradient-text">See and Hear?</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            TruthLens AI combines <strong>Vision Transformer (ViT)</strong> attention attribution, 
            multi-frame temporal modeling, and acoustic spectral analytics to detect synthetic media, 
            deepfake faces, and cloned voices with explainable evidence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/workspace"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.35)] transition-all"
            >
              <Zap className="w-4 h-4" />
              Launch Detection Workspace
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/methodology"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              Inspect Methodology & ViT
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 text-left max-w-3xl mx-auto">
            <div>
              <span className="text-2xl font-display font-bold text-white block">94.2%</span>
              <span className="text-xs text-slate-400 font-mono-code">ViT Benchmark Acc</span>
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-cyan-400 block">3 Modalities</span>
              <span className="text-xs text-slate-400 font-mono-code">Image, Video, Audio</span>
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-indigo-400 block">0.042 ECE</span>
              <span className="text-xs text-slate-400 font-mono-code">Calibrated Probability</span>
            </div>
            <div>
              <span className="text-2xl font-display font-bold text-emerald-400 block">SHA-256</span>
              <span className="text-xs text-slate-400 font-mono-code">Forensic Provenance</span>
            </div>
          </div>
        </div>

        {/* MODALITY CARDS */}
        <div className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Multimodal Detection Engines
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Dedicated neural network architectures designed specifically for visual, temporal, and acoustic artifact detection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modalityFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className="cyber-card p-6 flex flex-col justify-between hover:border-cyan-500/40 transition-all group relative overflow-hidden"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-xl bg-gradient-to-br border ${feat.accent}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                        {feat.tag}
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                      {feat.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      {feat.capabilities.map((cap, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{cap}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link
                      to="/workspace"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:text-cyan-300 transition-colors"
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

        {/* HOW IT WORKS / WORKFLOW */}
        <div className="mt-28">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono-code text-cyan-400 uppercase tracking-widest block mb-2">
              Forensic Workflow
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-white">
              Explainable Forensic Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((wf) => {
              const Icon = wf.icon;
              return (
                <div key={wf.step} className="p-5 rounded-xl bg-slate-900/40 border border-slate-800/80 relative">
                  <span className="text-3xl font-display font-extrabold text-slate-700 block mb-3 font-mono-code">
                    {wf.step}
                  </span>
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    <h4 className="text-sm font-semibold text-white">{wf.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {wf.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESPONSIBLE USE & ETHICS BANNER */}
        <div className="mt-28 cyber-card p-8 border-cyan-500/20 bg-gradient-to-r from-slate-900/80 to-[#070e1e]/90">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-cyan-400 font-mono-code text-xs uppercase font-semibold">
                <Lock className="w-4 h-4" />
                <span>Responsible AI & Data Privacy</span>
              </div>
              <h3 className="font-display font-bold text-xl text-white">
                Zero-Retention Ingestion & Transparent Uncertainty
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Uploaded media files are deleted immediately following neural inference. TruthLens never presents 
                model predictions as absolute proof, providing calibrated trust scores, clear error margins, and explicit 
                inconclusive classifications.
              </p>
            </div>

            <Link
              to="/workspace"
              className="shrink-0 px-5 py-2.5 rounded-lg text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              Analyze Your First File
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
