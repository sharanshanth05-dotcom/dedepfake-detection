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
} from 'lucide-react';
import apiClient from '../api/client';

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
  const [errorMsg, setErrorMsg] = useState(null);
  const abortControllerRef = useRef(null);

  const tabConfigs = {
    image: {
      label: 'Image Forensics',
      icon: FileImage,
      accept: '.jpg,.jpeg,.png,.webp',
      maxSizeMB: 15,
      formats: 'JPG, JPEG, PNG, WebP',
      endpoint: '/detect/image',
    },
    video: {
      label: 'Video Forensics',
      icon: Film,
      accept: '.mp4,.mov,.webm',
      maxSizeMB: 100,
      formats: 'MP4, MOV, WebM',
      endpoint: '/detect/video',
    },
    audio: {
      label: 'Audio Forensics',
      icon: Mic,
      accept: '.wav,.mp3,.flac,.m4a',
      maxSizeMB: 40,
      formats: 'WAV, MP3, FLAC, M4A',
      endpoint: '/detect/audio',
    },
  };

  const currentConfig = tabConfigs[activeTab];

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

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsAnalyzing(false);
    setProgressPercent(0);
    setProgressStage('');
    setErrorMsg('Forensic audit was cancelled by user.');
  };

  const startAnalysis = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setErrorMsg(null);
    setProgressPercent(15);
    setProgressStage('Validating magic bytes & file structure...');

    abortControllerRef.current = new AbortController();

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Progress simulation steps
      const t1 = setTimeout(() => {
        setProgressPercent(45);
        setProgressStage(
          activeTab === 'image'
            ? 'Running Vision Transformer (ViT-Base/16) forward pass...'
            : activeTab === 'video'
            ? 'Sampling frames & analyzing temporal consistency...'
            : 'Extracting 16kHz spectral features & vocoder frequencies...'
        );
      }, 700);

      const t2 = setTimeout(() => {
        setProgressPercent(80);
        setProgressStage('Extracting attention rollout & computing calibrated trust score...');
      }, 2000);

      const res = await apiClient.post(currentConfig.endpoint, formData, {
        signal: abortControllerRef.current.signal,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearTimeout(t1);
      clearTimeout(t2);

      setProgressPercent(100);
      setProgressStage('Analysis complete. Generating forensic report...');

      setTimeout(() => {
        navigate(`/analysis/${res.data.id}`);
      }, 500);
    } catch (err) {
      if (err.name === 'CanceledError' || err.message === 'canceled') {
        // Handled in cancelAnalysis
        return;
      }
      setIsAnalyzing(false);
      setErrorMsg(err.message || 'Forensics detection failed. Please try a different media file.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <h1 className="font-display font-bold text-3xl text-white">
          Forensic Detection Workspace
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          Upload suspect media to evaluate synthetic manipulation probabilities, 
          inspect Vision Transformer attention rollout, and generate forensic evidence reports.
        </p>
      </div>

      {/* Modality Tabs */}
      <div className="flex justify-center">
        <div className="p-1 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center gap-1 shadow-lg">
          {Object.entries(tabConfigs).map(([key, cfg]) => {
            const Icon = cfg.icon;
            const isActive = activeTab === key;
            return (
              <button
                key={key}
                onClick={() => handleTabChange(key)}
                disabled={isAnalyzing}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 disabled:opacity-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload / Analysis Card */}
      <div className="cyber-card p-6 sm:p-8 space-y-6">
        {!selectedFile ? (
          /* Drop Zone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all flex flex-col items-center justify-center min-h-[300px] cursor-pointer ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
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

            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="font-display font-semibold text-base text-white mb-1">
              Drag & Drop your {activeTab} file here
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              or click to browse local files from your system
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono-code text-slate-500">
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Formats: {currentConfig.formats}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                Max Limit: {currentConfig.maxSizeMB} MB
              </span>
            </div>
          </div>
        ) : (
          /* File Preview & Actions */
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2.5 rounded-lg bg-cyan-950/70 border border-cyan-800/60 text-cyan-400 shrink-0">
                  <currentConfig.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-semibold text-white truncate block max-w-sm">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs font-mono-code text-slate-400">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.type || activeTab.toUpperCase()}
                  </span>
                </div>
              </div>

              {!isAnalyzing && (
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Media Preview Box */}
            <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-4 flex items-center justify-center min-h-[260px] max-h-[360px] overflow-hidden">
              {activeTab === 'image' && filePreview && (
                <img
                  src={filePreview}
                  alt="Upload Preview"
                  className="max-h-[320px] w-auto object-contain rounded-lg border border-slate-800"
                />
              )}

              {activeTab === 'video' && filePreview && (
                <video
                  src={filePreview}
                  controls
                  className="max-h-[320px] w-auto rounded-lg border border-slate-800"
                />
              )}

              {activeTab === 'audio' && filePreview && (
                <div className="w-full max-w-md text-center space-y-4 py-6">
                  <div className="p-4 rounded-full bg-cyan-950/60 border border-cyan-800/60 inline-flex text-cyan-400">
                    <Mic className="w-8 h-8 animate-pulse" />
                  </div>
                  <audio src={filePreview} controls className="w-full mt-2" />
                </div>
              )}
            </div>

            {/* Progress / Status display */}
            {isAnalyzing && (
              <div className="space-y-3 p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
                <div className="flex items-center justify-between text-xs font-mono-code">
                  <span className="text-cyan-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    {progressStage}
                  </span>
                  <span className="text-cyan-400 font-bold">{progressPercent}%</span>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-cyan-950">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={cancelAnalysis}
                    className="text-xs font-mono-code text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" />
                    Cancel Analysis
                  </button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {errorMsg && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5">Forensic Audit Error:</span>
                  <span>{errorMsg}</span>
                </div>
              </div>
            )}

            {/* Action Button */}
            {!isAnalyzing && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>

                <button
                  onClick={startAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-xs bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  Execute Forensic Analysis
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pipeline Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono-code text-slate-400">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>Zero Media Retention: Uploaded files wiped after inference</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <Layers className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>Multimodal Backbones: Specialized ViT & Wav2Vec 2.0</span>
        </div>
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Calibrated Trust Score: ECE scaled validation scoring</span>
        </div>
      </div>
    </div>
  );
}
