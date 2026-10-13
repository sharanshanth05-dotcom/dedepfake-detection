import numpy as np
from pathlib import Path
from typing import Tuple, List, Dict, Any, Optional
import soundfile as sf
from scipy import signal

TARGET_SAMPLE_RATE = 16000

def load_and_standardize_audio(audio_path: Path) -> Tuple[np.ndarray, int, Dict[str, Any]]:
    """
    Loads audio file via soundfile, converts stereo to mono,
    resamples to 16kHz if needed, and returns normalized waveform.
    """
    try:
        data, sample_rate = sf.read(str(audio_path))
    except Exception as e:
        raise ValueError(f"Failed to read audio file format: {str(e)}")
        
    # Convert multi-channel/stereo to mono
    if len(data.shape) > 1:
        data = np.mean(data, axis=1)
        
    original_duration = len(data) / sample_rate
    
    # Resample to 16,000 Hz if different
    if sample_rate != TARGET_SAMPLE_RATE:
        num_samples = int(len(data) * TARGET_SAMPLE_RATE / sample_rate)
        data = signal.resample(data, num_samples)
        sample_rate = TARGET_SAMPLE_RATE
        
    # Normalize amplitude to [-1.0, 1.0]
    max_amp = np.max(np.abs(data))
    if max_amp > 1e-5:
        data = data / max_amp
        
    metadata = {
        "sample_rate": sample_rate,
        "duration_seconds": round(original_duration, 2),
        "total_samples": len(data),
        "channels": 1
    }
    
    return data.astype(np.float32), sample_rate, metadata

def segment_audio(
    waveform: np.ndarray,
    sample_rate: int = TARGET_SAMPLE_RATE,
    segment_duration_sec: float = 2.5
) -> List[Dict[str, Any]]:
    """
    Divides waveform into uniform segments with start and end timestamps.
    """
    segment_length = int(segment_duration_sec * sample_rate)
    total_samples = len(waveform)
    
    segments = []
    start_sample = 0
    seg_idx = 0
    
    while start_sample < total_samples:
        end_sample = min(start_sample + segment_length, total_samples)
        seg_data = waveform[start_sample:end_sample]
        
        # Pad short tail segments if longer than 0.5s
        if len(seg_data) < segment_length:
            if len(seg_data) < int(0.5 * sample_rate):
                break
            seg_data = np.pad(seg_data, (0, segment_length - len(seg_data)))
            
        start_time = round(start_sample / sample_rate, 2)
        end_time = round(end_sample / sample_rate, 2)
        
        segments.append({
            "segment_index": seg_idx,
            "start_time": start_time,
            "end_time": end_time,
            "waveform": seg_data
        })
        
        start_sample += segment_length
        seg_idx += 1
        
    return segments

def extract_spectral_features(waveform: np.ndarray, sample_rate: int = TARGET_SAMPLE_RATE) -> Dict[str, float]:
    """
    Calculates acoustic signatures:
    - Spectral centroid: detects unnatural frequency clustering
    - High-frequency energy ratio: TTS vocoders often lack high-freq breath harmonics
    - Zero crossing rate: unvoiced speech vs robotic phase lock
    """
    if len(waveform) < 512:
        return {"spectral_centroid": 0.0, "high_freq_ratio": 0.0, "zero_crossing_rate": 0.0}
        
    # FFT magnitude
    freqs, times, spec = signal.spectrogram(waveform, fs=sample_rate, nperseg=512)
    mag = np.abs(spec)
    
    # Spectral Centroid
    freq_grid = freqs[:, np.newaxis]
    sum_mag = np.sum(mag, axis=0) + 1e-8
    centroid = np.mean(np.sum(freq_grid * mag, axis=0) / sum_mag)
    
    # High-frequency ratio (> 6kHz)
    high_freq_idx = np.where(freqs >= 6000)[0]
    if len(high_freq_idx) > 0:
        high_energy = np.sum(mag[high_freq_idx, :])
        total_energy = np.sum(mag) + 1e-8
        hf_ratio = float(high_energy / total_energy)
    else:
        hf_ratio = 0.0
        
    # Zero crossing rate
    zero_crossings = np.mean(np.abs(np.diff(np.sign(waveform))) > 0)
    
    return {
        "spectral_centroid": round(float(centroid), 2),
        "high_freq_ratio": round(float(hf_ratio), 4),
        "zero_crossing_rate": round(float(zero_crossings), 4)
    }
