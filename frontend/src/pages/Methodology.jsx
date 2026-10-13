import React from 'react';
import {
  Cpu,
  Layers,
  Sparkles,
  Film,
  Mic,
  Calculator,
  ShieldAlert,
  Database,
  BarChart3,
  CheckCircle2,
} from 'lucide-react';

export default function Methodology() {
  const datasets = [
    {
      name: 'FaceForensics++ (FF++)',
      modalities: 'Images & Videos',
      description: 'Standard benchmark with Deepfakes, Face2Face, FaceSwap, and NeuralTextures at c23 and c40 compression levels.',
      samples: '1,000 raw sequences / 500k frames',
    },
    {
      name: 'Celeb-DF (v2)',
      modalities: 'High-Fidelity Videos',
      description: 'High-quality deepfake video dataset with reduced visual artifacts, challenging temporal detection.',
      samples: '5,639 videos (430K frames)',
    },
    {
      name: 'DFDC (DeepFake Detection Challenge)',
      modalities: 'In-The-Wild Video',
      description: 'Diverse real-world lighting, variable codecs, actor ethnicities, and complex compression environments.',
      samples: '100,000+ video clips',
    },
    {
      name: 'ASVspoof 2021 (LA/DF)',
      modalities: 'Speech & Synthetic Audio',
      description: 'Logical Access and Deepfake evaluations covering advanced neural vocoders, voice cloning, and TTS algorithms.',
      samples: '600,000+ speech utterances',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="space-y-2 border-b border-slate-800/80 pb-6">
        <span className="text-xs font-mono-code text-cyan-400 uppercase tracking-widest block">
          Technical Specifications
        </span>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
          Architecture & Forensic Methodology
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
          Comprehensive documentation of TruthLens AI neural architectures, Vision Transformer (ViT) 
          attention attribution, temporal continuity metrics, calibration mathematics, and domain limitations.
        </p>
      </div>

      {/* 1. VISION TRANSFORMER (ViT) EXPLAINABILITY */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <Cpu className="w-5 h-5" />
          <h2 className="font-display font-bold text-xl text-white">
            1. Vision Transformer (ViT) & Attention Rollout
          </h2>
        </div>

        <div className="cyber-card p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Unlike traditional Convolutional Neural Networks (CNNs) constrained by localized receptive fields, the 
            <strong> Vision Transformer (ViT-Base/16)</strong> processes visual media globally by partitioning input images 
            of dimension \(224 \times 224\) into a grid of non-overlapping \(16 \times 16\) pixel patches:
          </p>

          <div className="p-3.5 rounded-lg bg-slate-950 font-mono-code text-cyan-300 border border-slate-800 text-[11px]">
            N = (H × W) / P² = (224 × 224) / (16 × 16) = 196 Patches (14 × 14 Spatial Grid)
          </div>

          <p>
            Each patch is linearly projected into a \(768\)-dimensional embedding and prepended with a learnable 
            <code> [CLS] </code> token before passing through 12 multi-head self-attention (MHSA) encoder blocks.
          </p>

          <h4 className="font-semibold text-white pt-2 text-sm flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Transformer Attention Rollout Attribution
          </h4>
          <p>
            For explainable AI (XAI), TruthLens computes <strong>Attention Rollout</strong> across the self-attention matrices:
          </p>
          <div className="p-3 rounded-lg bg-slate-950 font-mono-code text-indigo-300 border border-slate-800 text-[11px]">
            A_rollout = 0.5 × W_attn + 0.5 × I
          </div>
          <p>
            By isolating the attention distribution from the <code>[CLS]</code> token to the 196 image patches in the final transformer layer, 
            TruthLens maps exactly which spatial regions triggered the synthesis prediction and projects the normalized weights 
            onto the original canvas using the OpenCV <code>COLORMAP_JET</code> spectrum.
          </p>
        </div>
      </section>

      {/* 2. VIDEO TEMPORAL CONSISTENCY */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-indigo-400">
          <Film className="w-5 h-5" />
          <h2 className="font-display font-bold text-xl text-white">
            2. Video Frame Sampling & Temporal Inconsistency Modeling
          </h2>
        </div>

        <div className="cyber-card p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Deepfake video synthesis often produces frame-to-frame boundary jitter, micro-flicker, or lighting discrepancies 
            due to independent per-frame face swapping. TruthLens implements a multi-stage sequential inspection pipeline:
          </p>
          <ul className="space-y-2 list-disc list-inside text-slate-400">
            <li><strong>Uniform Sampling:</strong> Samples frames at 1.0 FPS up to 30 representative frames to ensure temporal coverage.</li>
            <li><strong>Facial Tracking:</strong> Applies Haar Cascade boundary isolation to measure face ROI stability.</li>
            <li><strong>Frame-by-Frame ViT Inference:</strong> Computes an independent manipulation probability for each extracted frame.</li>
            <li><strong>Inter-Frame Optical Delta:</strong> Evaluates pixel differential variance across adjacent transitions to detect anomalous spikes (\(&gt; 2.2 \sigma\)).</li>
          </ul>
        </div>
      </section>

      {/* 3. AUDIO FORENSICS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-purple-400">
          <Mic className="w-5 h-5" />
          <h2 className="font-display font-bold text-xl text-white">
            3. Synthetic Speech & Acoustic Vocoder Analysis
          </h2>
        </div>

        <div className="cyber-card p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Neural speech synthesizers (such as HiFi-GAN, MelGAN, and VITS) reconstruct speech from spectrograms, frequently leaving 
            subtle acoustic signatures absent in organic human vocal tracts:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-slate-300 font-mono-code text-[11px]">
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-cyan-400 block font-semibold mb-1">High-Frequency Cutoff</span>
              Vocoder low-pass roll-off &gt; 7.5kHz
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-indigo-400 block font-semibold mb-1">Spectral Centroid</span>
              Unnatural harmonic energy clustering
            </div>
            <div className="p-3 rounded bg-slate-900 border border-slate-800">
              <span className="text-purple-400 block font-semibold mb-1">Zero Crossing Rate</span>
              Robotic phase-lock continuity
            </div>
          </div>
        </div>
      </section>

      {/* 4. CALIBRATION & TRUST SCORE MATHEMATICS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <Calculator className="w-5 h-5" />
          <h2 className="font-display font-bold text-xl text-white">
            4. Calibrated Trust Score Formulation
          </h2>
        </div>

        <div className="cyber-card p-6 space-y-4 text-xs leading-relaxed text-slate-300">
          <p>
            Raw softmax outputs from deep neural networks are notoriously overconfident and cannot be interpreted as true probabilities. 
            TruthLens applies <strong>Platt Temperature Scaling</strong> calibrated against held-out validation sets:
          </p>

          <div className="p-4 rounded-xl bg-slate-950 font-mono-code border border-slate-800 text-[11px] space-y-2">
            <div className="text-emerald-400 font-bold">Trust Score = 100 × P(authentic | x)</div>
            <div className="text-rose-400">P(manipulated | x) = 1.0 - P(authentic | x)</div>
          </div>

          <h4 className="font-semibold text-white pt-2 text-sm">Calibrated Decision Brackets</h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] font-mono-code">
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
              <span className="font-bold block">80 – 100</span>
              Higher Authenticity
            </div>
            <div className="p-2.5 rounded bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
              <span className="font-bold block">60 – 79</span>
              Moderate Authenticity
            </div>
            <div className="p-2.5 rounded bg-amber-950/40 border border-amber-500/30 text-amber-300">
              <span className="font-bold block">40 – 59</span>
              Inconclusive / Mixed
            </div>
            <div className="p-2.5 rounded bg-orange-950/40 border border-orange-500/30 text-orange-300">
              <span className="font-bold block">20 – 39</span>
              Elevated Manipulation
            </div>
            <div className="p-2.5 rounded bg-rose-950/40 border border-rose-500/30 text-rose-300">
              <span className="font-bold block">0 – 19</span>
              Critical Manipulation
            </div>
          </div>
        </div>
      </section>

      {/* 5. DATASETS & BENCHMARK METRICS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-blue-400">
          <Database className="w-5 h-5" />
          <h2 className="font-display font-bold text-xl text-white">
            5. Benchmark Datasets & Performance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {datasets.map((d) => (
            <div key={d.name} className="cyber-card p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">{d.name}</span>
                <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                  {d.modalities}
                </span>
              </div>
              <p className="text-slate-400">{d.description}</p>
              <span className="text-[10px] font-mono-code text-slate-500 block">
                Scale: {d.samples}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 6. ETHICAL DISCLOSURES & LIMITATIONS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2.5 text-amber-400">
          <ShieldAlert className="w-5 h-5" />
          <h2 className="font-display font-bold text-xl text-white">
            6. Limitations & Chain of Custody
          </h2>
        </div>

        <div className="cyber-card p-6 space-y-3 text-xs leading-relaxed text-slate-300 border-amber-500/30">
          <p>
            Automated deepfake detection remains a dynamic cybersecurity challenge. Analysts should consider the following bounds:
          </p>
          <ul className="space-y-1.5 list-disc list-inside text-slate-400">
            <li>Low-resolution uploads or extreme lossy compression (WhatsApp, TikTok re-encoding) can introduce false-positive frequency artifacts.</li>
            <li>Sparse video frame sampling cannot mathematically guarantee detection of brief sub-second manipulations.</li>
            <li>Voice recordings captured with low-fidelity microphones or loud background ambient noise may return inconclusive scores.</li>
            <li>Trust scores represent statistical inference—never legal or judicial determinations of fact.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
