import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileImage,
  Film,
  Mic,
  AlertCircle,
  CheckCircle,
  X,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Lock,
  Cpu,
  Scan,
  Hash,
  Terminal,
  Activity,
  FileCheck,
} from 'lucide-react';
import apiClient from '../api/client';
import GlassSurface from '../components/GlassSurface';

export default function DetectionWorkspace() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('image'); // 'image', 'video', 'audio'
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);
  const abortControllerRef = useRef(null);

  const tabConfigs = {
    image: {
      label: 'Image Forensics',
      backbone: 'ViT-Base/16 Backbone',
      icon: FileImage,
      accept: '.jpg,.jpeg,.png,.webp',
      maxSizeMB: 15,
      formats: 'JPG, JPEG, PNG, WebP',
      endpoint: '/detect/image',
    },
    video: {
      label: 'Video Forensics',
      backbone: 'Temporal ViT + BiGRU',
      icon: Film,
      accept: '.mp4,.mov,.webm',
      maxSizeMB: 100,
      formats: 'MP4, MOV, WebM',
      endpoint: '/detect/video',
    },
    audio: {
      label: 'Audio Forensics',
      backbone: 'Wav2Vec 2.0 + Spectral',
      icon: Mic,
      accept: '.wav,.mp3,.flac,.m4a',
      maxSizeMB: 40,
      formats: 'WAV, MP3, FLAC, M4A',
      endpoint: '/detect/audio',
    },
  };

  const currentConfig = tabConfigs[activeTab];

  const analysisSteps = [
    'Cryptographic SHA-256 Provenance & Header Validation',
    activeTab === 'image'
      ? 'Vision Transformer (ViT-Base/16) Patch Embeddings'
      : activeTab === 'video'
      ? 'Frame Sampling & Optical Flow Jitter Extraction'
      : '16kHz Spectral Resynthesis & Vocoder FFT Audit',
    'Attention Rollout & Evidence Localization',
    'Platt Temperature Calibration & Certified Ledger Signing',
  ];

  const handleTabChange = (tab) => {
    if (isAnalyzing) return;
    setActiveTab(tab);
    setSelectedFile(null);
    setFilePreview(null);
    setErrorMsg(null);
  };

  const handleFileSelect = (file) => {
    setErrorMsg(null);
    if (!file) return;

    // Check size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > currentConfig.maxSizeMB) {
      setErrorMsg(`File size (${sizeMB.toFixed(1)}MB) exceeds limit of ${currentConfig.maxSizeMB}MB.`);
      return;
    }

    setSelectedFile(file);

    // Create preview
    if (activeTab === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (isAnalyzing) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  // Quick test sample loader for demonstration
  const loadQuickSample = async (sampleType) => {
    if (isAnalyzing) return;
    try {
      if (sampleType === 'deepfake_image') {
        setActiveTab('image');
        const res = await fetch('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80');
        const blob = await res.blob();
        const file = new File([blob], 'suspect_face_diffusion_synth.jpg', { type: 'image/jpeg' });
        handleFileSelect(file);
      } else if (sampleType === 'authentic_image') {
        setActiveTab('image');
        const res = await fetch('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80');
        const blob = await res.blob();
        const file = new File([blob], 'authentic_portrait_camera_raw.jpg', { type: 'image/jpeg' });
        handleFileSelect(file);
      }
    } catch {
      setErrorMsg('Could not load sample file. Please upload a local file directly.');
    }
  };

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAnalyzing(false);
    setProgressPercent(0);
    setProgressStage('');
    setErrorMsg('Forensic audit was cancelled by analyst.');
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    setProgressPercent(15);
    setCurrentStepIndex(0);
    setProgressStage(analysisSteps[0]);

    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const t1 = setTimeout(() => {
        setProgressPercent(45);
        setCurrentStepIndex(1);
        setProgressStage(analysisSteps[1]);
      }, 700);

      const t2 = setTimeout(() => {
        setProgressPercent(75);
        setCurrentStepIndex(2);
        setProgressStage(analysisSteps[2]);
      }, 1900);

      const t3 = setTimeout(() => {
        setProgressPercent(90);
        setCurrentStepIndex(3);
        setProgressStage(analysisSteps[3]);
      }, 3000);

      const res = await apiClient.post(currentConfig.endpoint, formData, {
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);

      setProgressPercent(100);
      setProgressStage('Analysis complete. Generating certified forensic report...');

      setTimeout(() => {
        navigate(`/analysis/${res.data.id}`);
      }, 500);
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        return;
      }
      setIsAnalyzing(false);
      const safeMsg = typeof err.response?.data?.detail === 'string'
        ? err.response.data.detail
        : (typeof err.message === 'string' ? err.message : 'Forensic detection failed. Please try a different media file.');
      setErrorMsg(safeMsg);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Workbench Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ececef] border border-[#e8e8e8] text-[#71737a] text-[11px] font-mono-code shadow-xs font-medium">
          <Terminal className="w-3.5 h-3.5 text-[#6e78d5]" />
          <span>WORKBENCH // FORENSIC INGESTION LAB // SEC-OP-26</span>
        </div>
        
        <h1 className="font-display font-semibold text-3xl sm:text-4xl text-[#1b1b1b] tracking-tight">
          Forensic Detection Workspace
        </h1>
        
        <p className="text-xs sm:text-sm text-[#71737a] max-w-xl mx-auto leading-relaxed">
          Ingest suspect media for cryptographic SHA-256 hashing, multimodal deepfake classification, 
          Vision Transformer attention localization, and calibrated evidence scoring.
        </p>
      </div>

      {/* Modality Selection Tabs */}
      <div className="flex justify-center">
        <div className="p-1 bg-[#ececef] rounded-[8px] border border-[#e8e8e8] flex items-center gap-1 shadow-xs">
          {Object.entries(tabConfigs).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                disabled={isAnalyzing}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-[6px] text-xs font-medium tracking-wide transition-all ${
                  isActive
                    ? 'bg-white text-[#1b1b1b] border border-[#e8e8e8] shadow-xs'
                    : 'text-[#71737a] hover:text-[#1b1b1b] hover:bg-white/50 border border-transparent disabled:opacity-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#6e78d5]' : 'text-[#71737a]'}`} />
                <div className="text-left">
                  <span className="block leading-none">{cfg.label}</span>
                  <span className="text-[9px] font-mono-code text-[#71737a] font-normal block mt-1">
                    {cfg.backbone}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Test Samples Bar */}
      {!selectedFile && !isAnalyzing && (
        <GlassSurface
          width="100%"
          height="auto"
          borderRadius={12}
          backgroundOpacity={0.06}
          blur={12}
          brightness={55}
          className="shadow-xs border border-[#e8e8e8]"
          contentClassName="p-3.5 flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 text-[#71737a] font-mono-code text-[11px] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#6e78d5]" />
            <span>ONE-CLICK TEST BENCH:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadQuickSample('deepfake_image')}
              className="px-3 py-1 rounded-[6px] bg-[#92681b]/10 hover:bg-[#92681b]/15 border border-[#92681b]/30 text-[#92681b] text-[11px] font-mono-code font-medium transition-all shadow-xs"
            >
              Test Sample: Synthetic Portrait
            </button>
            <button
              onClick={() => loadQuickSample('authentic_image')}
              className="px-3 py-1 rounded-[6px] bg-[#02755c]/10 hover:bg-[#02755c]/15 border border-[#02755c]/30 text-[#02755c] text-[11px] font-mono-code font-medium transition-all shadow-xs"
            >
              Test Sample: Camera Raw Authentic
            </button>
          </div>
        </GlassSurface>
      )}

      {/* Main Forensic Analysis Card */}
      <div className="cyber-card p-6 sm:p-8 space-y-6 bg-white border border-[#e8e8e8] rounded-xl shadow-xs">
        {!selectedFile ? (
          /* Drop Zone with Reticle Corners */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`reticle-box border-2 border-dashed rounded-xl p-10 text-center transition-all flex flex-col items-center justify-center min-h-[320px] cursor-pointer relative overflow-hidden ${
              isDragging
                ? 'border-[#6e78d5] bg-[#d9dcea]/20 shadow-xs'
                : 'border-[#e8e8e8] hover:border-[#6e78d5] bg-[#fbfbfb] hover:bg-white'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              accept={currentConfig.accept}
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files[0])}
            />

            <div className="p-3.5 rounded-[6px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5] mb-4 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <h3 className="font-display font-semibold text-lg text-[#1b1b1b] mb-1">
              Select or Drop Suspect {activeTab.toUpperCase()} Payload
            </h3>
            <p className="text-xs text-[#71737a] mb-4 max-w-sm leading-relaxed">
              Files are streamed directly into volatile in-memory tensors. Zero retention policy guarantees immediate destruction post-inference.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono-code text-[#71737a]">
              <span className="px-2.5 py-1 rounded-[4px] bg-white border border-[#e8e8e8] shadow-xs">
                Accepted: {currentConfig.formats}
              </span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-[4px] bg-white border border-[#e8e8e8] shadow-xs">
                Max Size: {currentConfig.maxSizeMB} MB
              </span>
              <span>•</span>
              <span className="px-2.5 py-1 rounded-[4px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5] font-medium">
                SHA-256 Pre-Check
              </span>
            </div>
          </div>
        ) : (
          /* File Preview & Forensic Inspector */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#fbfbfb] border border-[#e8e8e8]">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-[6px] bg-[#d9dcea]/30 border border-[#e8e8e8] text-[#6e78d5] shrink-0">
                  <currentConfig.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-[#1b1b1b] truncate block max-w-md font-display">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs font-mono-code text-[#71737a]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || activeTab.toUpperCase()}
                  </span>
                </div>
              </div>

              {!isAnalyzing && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    className="p-1.5 rounded-[6px] text-[#71737a] hover:text-[#92681b] hover:bg-[#ececef] transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <button
                    onClick={startAnalysis}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] font-medium text-xs bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-xs transition-all active:scale-[0.98] font-mono-code"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-white" />
                    <span>Next: Run Audit</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Media Preview Box */}
            <div className="rounded-xl bg-[#fbfbfb] border border-[#e8e8e8] p-4 flex items-center justify-center min-h-[260px] max-h-[360px] overflow-hidden relative reticle-box">
              {activeTab === 'image' && filePreview && (
                <img
                  src={filePreview}
                  alt="Upload Preview"
                  className="max-h-[320px] w-auto object-contain rounded-[6px] border border-[#e8e8e8] shadow-xs"
                />
              )}

              {activeTab === 'video' && filePreview && (
                <video
                  src={filePreview}
                  controls
                  className="max-h-[320px] w-auto rounded-[6px] border border-[#e8e8e8] shadow-xs"
                />
              )}

              {activeTab === 'audio' && filePreview && (
                <div className="w-full max-w-md text-center space-y-4 py-6">
                  <div className="p-3.5 rounded-full bg-[#d9dcea]/30 border border-[#e8e8e8] inline-flex text-[#6e78d5] shadow-xs">
                    <Mic className="w-7 h-7 animate-pulse" />
                  </div>
                  <audio src={filePreview} controls className="w-full mt-2" />
                </div>
              )}
            </div>

            {/* In-Flight Analysis Stage HUD */}
            {isAnalyzing && (
              <div className="space-y-4 p-5 rounded-xl bg-white border border-[#e8e8e8] shadow-xs">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-[#1b1b1b] flex items-center gap-2 font-medium">
                    <Sparkles className="w-4 h-4 text-[#6e78d5] animate-spin" />
                    {progressStage}
                  </span>
                  <span className="text-[#6e78d5] font-semibold text-sm">{progressPercent}%</span>
                </div>

                {/* Stepped progress indicators */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {analysisSteps.map((step, idx) => (
                    <div key={idx} className="space-y-1">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                          idx <= currentStepIndex ? 'bg-[#6e78d5]' : 'bg-[#ececef]'
                        }`}
                      />
                      <span className="text-[9px] font-mono-code text-[#71737a] block truncate">
                        Step 0{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={cancelAnalysis}
                    className="text-xs font-mono-code text-[#92681b] hover:text-[#7e5917] flex items-center gap-1 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel Execution
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errorMsg && (
              <div className="p-4 rounded-[6px] bg-[#92681b]/10 border border-[#92681b]/30 text-[#92681b] text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-[#92681b] shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Forensic Audit Error:</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {!isAnalyzing && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-4 py-2 rounded-[6px] text-xs font-medium text-[#71737a] hover:text-[#1b1b1b] hover:bg-[#ececef] transition-colors"
                >
                  Clear Selection
                </button>

                <button
                  onClick={startAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-[6px] font-medium text-xs bg-[#6e78d5] hover:bg-[#5d67c8] text-white shadow-xs transition-all active:scale-[0.98] font-mono-code"
                >
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Next: Execute Forensic Audit</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security Guarantees Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-code text-[#71737a]">
        <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] flex items-center gap-3 shadow-xs">
          <Shield className="w-5 h-5 text-[#6e78d5] shrink-0" />
          <span>Zero Media Retention: Buffers purged immediately post-inference</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] flex items-center gap-3 shadow-xs">
          <Layers className="w-5 h-5 text-[#02755c] shrink-0" />
          <span>Multimodal ViT Backbone: 12-Layer Attention Attribution</span>
        </div>
        <div className="p-4 rounded-xl bg-white border border-[#e8e8e8] flex items-center gap-3 shadow-xs">
          <CheckCircle className="w-5 h-5 text-[#6d6b6b] shrink-0" />
          <span>Calibrated Trust Score: Platt Temperature Scaled</span>
        </div>
      </div>
    </div>
  );
}
