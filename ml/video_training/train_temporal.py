"""
TruthLens AI — Video Temporal Consistency Model
Architecture: Pre-extracted ViT Frame Embeddings + Bi-directional GRU Sequence Forensics
Dataset: FaceForensics++ (C23) Video Benchmark
"""

import os
import sys
import time
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Any

import cv2
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score
from transformers import ViTModel, ViTImageProcessor
from PIL import Image

DEFAULT_RAW_DIR = r"D:\college work\datasets_cache\datasets\xdxd003\ff-c23\versions\1\FaceForensics++_C23"

class TemporalDeepfakeDetector(nn.Module):
    """
    Bi-directional GRU temporal anomaly detector operating on sequence
    of ViT patch/CLS frame embeddings.
    """
    def __init__(self, feature_dim: int = 768, hidden_dim: int = 256, num_layers: int = 2):
        super().__init__()
        self.gru = nn.GRU(
            input_size=feature_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True
        )
        self.fc = nn.Sequential(
            nn.Linear(hidden_dim * 2, 64),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(64, 2)
        )

    def forward(self, x):
        # x: [batch, sequence_length, feature_dim]
        gru_out, _ = self.gru(x)
        # Pool across sequence dimension (temporal average pooling)
        pooled = torch.mean(gru_out, dim=1)
        logits = self.fc(pooled)
        return logits

class VideoSequenceDataset(Dataset):
    """
    Loads sequences of ViT frame embeddings.
    """
    def __init__(self, sequences: List[torch.Tensor], labels: List[int]):
        self.sequences = sequences
        self.labels = labels

    def __len__(self):
        return len(self.sequences)

    def __getitem__(self, idx):
        return {
            "features": self.sequences[idx],
            "label": torch.tensor(self.labels[idx], dtype=torch.long)
        }

def extract_video_embedding_sequence(
    video_path: Path,
    feature_extractor: ViTModel,
    processor: ViTImageProcessor,
    seq_length: int = 6,
    device: torch.device = torch.device("cpu")
) -> torch.Tensor:
    """Extracts a sequence of CLS feature embeddings from evenly sampled video frames."""
    cap = cv2.VideoCapture(str(video_path))
    if not cap.isOpened():
        return torch.zeros((seq_length, 768))

    total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total < seq_length:
        cap.release()
        return torch.zeros((seq_length, 768))

    step = max(1, total // seq_length)
    frames = []
    for i in range(seq_length):
        cap.set(cv2.CAP_PROP_POS_FRAMES, min(total - 1, i * step))
        ret, frame = cap.read()
        if ret and frame is not None:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            frames.append(Image.fromarray(rgb))

    cap.release()

    if len(frames) < seq_length:
        return torch.zeros((seq_length, 768))

    # Process through ViT
    inputs = processor(images=frames, return_tensors="pt")["pixel_values"].to(device)
    with torch.no_grad():
        outputs = feature_extractor(pixel_values=inputs)
        # Extract CLS token embeddings (shape: [seq_length, 768])
        cls_tokens = outputs.last_hidden_state[:, 0, :].cpu()

    return cls_tokens

def train_temporal_model(
    raw_dir: str = DEFAULT_RAW_DIR,
    max_videos_per_class: int = 25,
    seq_length: int = 6,
    epochs: int = 4,
    batch_size: int = 8,
    lr: float = 1e-3,
    output_dir: str = "weights/temporal_gru"
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=" * 70)
    print("TruthLens AI — Video Temporal Consistency Model Training")
    print("=" * 70)
    print(f"Device:           {device}")
    print(f"Dataset Directory:{Path(raw_dir).resolve()}")
    print(f"Videos per Class: {max_videos_per_class}")
    print(f"Sequence Length:  {seq_length} frames / video")
    print(f"Epochs:           {epochs}")
    print("-" * 70)

    raw_path = Path(raw_dir)
    original_vids = sorted(list((raw_path / "original").glob("*.mp4")))[:max_videos_per_class]
    
    manip_types = ["Deepfakes", "FaceSwap", "Face2Face"]
    manip_vids = []
    quota = max(1, max_videos_per_class // len(manip_types))
    for mt in manip_types:
        d = raw_path / mt
        if d.exists():
            manip_vids.extend(sorted(list(d.glob("*.mp4")))[:quota])
    manip_vids = manip_vids[:max_videos_per_class]

    print(f"[*] Extracting sequences for {len(original_vids)} authentic & {len(manip_vids)} manipulated videos...")
    processor = ViTImageProcessor.from_pretrained("google/vit-base-patch16-224")
    vit_backbone = ViTModel.from_pretrained("google/vit-base-patch16-224").to(device)
    vit_backbone.eval()

    all_seqs, all_labels = [], []
    for v in original_vids:
        seq = extract_video_embedding_sequence(v, vit_backbone, processor, seq_length, device)
        if seq.sum() != 0:
            all_seqs.append(seq)
            all_labels.append(0)

    for v in manip_vids:
        seq = extract_video_embedding_sequence(v, vit_backbone, processor, seq_length, device)
        if seq.sum() != 0:
            all_seqs.append(seq)
            all_labels.append(1)

    print(f"[+] Total video sequences extracted: {len(all_seqs)}")
    if len(all_seqs) < 4:
        print("[!] Not enough video sequences extracted.")
        return

    # Train / Val Split (80% / 20%)
    split_idx = int(0.8 * len(all_seqs))
    train_seqs, val_seqs = all_seqs[:split_idx], all_seqs[split_idx:]
    train_labels, val_labels = all_labels[:split_idx], all_labels[split_idx:]

    train_loader = DataLoader(VideoSequenceDataset(train_seqs, train_labels), batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(VideoSequenceDataset(val_seqs, val_labels), batch_size=batch_size, shuffle=False)

    model = TemporalDeepfakeDetector().to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            feats = batch["features"].to(device)
            labels = batch["label"].to(device)
            logits = model(feats)
            loss = criterion(logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        print(f"Epoch {epoch+1:02d}/{epochs:02d} | Temporal Loss: {total_loss / max(1, len(train_loader)):.4f}")

    # Evaluate
    model.eval()
    preds, targets, probs = [], [], []
    with torch.no_grad():
        for batch in val_loader:
            feats = batch["features"].to(device)
            labels = batch["label"].to(device)
            logits = model(feats)
            p = torch.softmax(logits, dim=1)[:, 1]
            preds.extend(torch.argmax(logits, dim=1).cpu().numpy())
            targets.extend(labels.cpu().numpy())
            probs.extend(p.cpu().numpy())

    acc = accuracy_score(targets, preds)
    print(f"\n[+] Temporal Model Validation Accuracy: {acc*100:.2f}%")

    out_path = Path(output_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    torch.save(model.state_dict(), out_path / "temporal_gru.pt")
    print(f"[+] Saved temporal checkpoint to: {out_path.resolve() / 'temporal_gru.pt'}")

if __name__ == "__main__":
    train_temporal_model()
