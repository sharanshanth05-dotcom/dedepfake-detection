"""
TruthLens AI — Vision Transformer (ViT) Fine-Tuning Pipeline
Trained on FaceForensics++ (C23) Benchmark
Authentic (0) vs. Manipulated (1) Deepfake Detection
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from typing import List, Tuple, Dict, Any

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from PIL import Image
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score, brier_score_loss
from transformers import ViTForImageClassification, ViTImageProcessor

# Add parent directory to path for cross-imports
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))
from ml.datasets.prepare_faceforensics import prepare_dataset, DEFAULT_RAW_DIR, DEFAULT_OUTPUT_DIR

class DeepfakeImageDataset(Dataset):
    """
    Forensic image dataset loader with image preprocessing.
    Labels: 0 = Authentic, 1 = Manipulated
    """
    def __init__(self, file_paths: List[str], labels: List[int], processor: ViTImageProcessor):
        self.file_paths = file_paths
        self.labels = labels
        self.processor = processor

    def __len__(self):
        return len(self.file_paths)

    def __getitem__(self, idx):
        path = self.file_paths[idx]
        label = self.labels[idx]
        image = Image.open(path).convert("RGB")
        inputs = self.processor(images=image, return_tensors="pt")
        pixel_values = inputs["pixel_values"].squeeze(0)
        return {
            "pixel_values": pixel_values,
            "label": torch.tensor(label, dtype=torch.long)
        }

def calculate_calibration_ece(probs: np.ndarray, labels: np.ndarray, n_bins: int = 10) -> float:
    """Computes Expected Calibration Error (ECE) across prediction bins."""
    bin_boundaries = np.linspace(0, 1, n_bins + 1)
    ece = 0.0
    for i in range(n_bins):
        bin_lower, bin_upper = bin_boundaries[i], bin_boundaries[i + 1]
        in_bin = (probs > bin_lower) & (probs <= bin_upper)
        prop_in_bin = np.mean(in_bin)
        if prop_in_bin > 0:
            accuracy_in_bin = np.mean(labels[in_bin] == (probs[in_bin] >= 0.5))
            avg_confidence_in_bin = np.mean(probs[in_bin])
            ece += np.abs(avg_confidence_in_bin - accuracy_in_bin) * prop_in_bin
    return float(ece)

def load_data_from_directory(data_dir: Path) -> Tuple[List[str], List[int], List[str], List[int]]:
    """Loads image paths and binary labels from manifest or directory structure."""
    manifest_file = data_dir / "dataset_manifest.json"
    if manifest_file.exists():
        print(f"[*] Loading dataset from manifest: {manifest_file.resolve()}")
        with open(manifest_file, "r", encoding="utf-8") as f:
            manifest = json.load(f)
        train_paths = [item["filepath"] for item in manifest.get("train", []) if os.path.exists(item["filepath"])]
        train_labels = [item["label"] for item in manifest.get("train", []) if os.path.exists(item["filepath"])]
        val_paths = [item["filepath"] for item in manifest.get("val", []) if os.path.exists(item["filepath"])]
        val_labels = [item["label"] for item in manifest.get("val", []) if os.path.exists(item["filepath"])]
        return train_paths, train_labels, val_paths, val_labels

    train_paths, train_labels, val_paths, val_labels = [], [], [], []
    for split, paths, labels in [("train", train_paths, train_labels), ("val", val_paths, val_labels)]:
        auth_dir = data_dir / split / "authentic"
        manip_dir = data_dir / split / "manipulated"

        if auth_dir.exists():
            for p in auth_dir.glob("*.jpg"):
                paths.append(str(p.resolve()))
                labels.append(0)
            for p in auth_dir.glob("*.png"):
                paths.append(str(p.resolve()))
                labels.append(0)

        if manip_dir.exists():
            for p in manip_dir.glob("*.jpg"):
                paths.append(str(p.resolve()))
                labels.append(1)
            for p in manip_dir.glob("*.png"):
                paths.append(str(p.resolve()))
                labels.append(1)

    return train_paths, train_labels, val_paths, val_labels

def train_vit_detector(
    train_paths: List[str],
    train_labels: List[int],
    val_paths: List[str],
    val_labels: List[int],
    model_name: str = "google/vit-base-patch16-224",
    output_dir: str = "weights/vit_deepfake",
    epochs: int = 3,
    batch_size: int = 16,
    lr: float = 1e-4,
    mode: str = "head_only",
    report_path: str = "reports/vit_training_report.json"
) -> Dict[str, Any]:
    """
    Executes training/fine-tuning of Vision Transformer for deepfake forensics.
    Modes:
      - 'head_only': Freezes ViT backbone, trains classifier linear projection.
      - 'top_layers': Fine-tunes last 2 transformer blocks + classifier.
      - 'full': End-to-end backpropagation across all 12 transformer layers.
    """
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print("=" * 70)
    print("TruthLens AI — Vision Transformer (ViT) Forensic Training Engine")
    print("=" * 70)
    print(f"Device:             {device}")
    print(f"Base Model:         {model_name}")
    print(f"Training Mode:      {mode}")
    print(f"Epochs:             {epochs}")
    print(f"Batch Size:         {batch_size}")
    print(f"Learning Rate:      {lr}")
    print(f"Train Samples:      {len(train_paths)} (Auth: {train_labels.count(0)}, Manip: {train_labels.count(1)})")
    print(f"Val Samples:        {len(val_paths)} (Auth: {val_labels.count(0)}, Manip: {val_labels.count(1)})")
    print(f"Output Checkpoint:  {Path(output_dir).resolve()}")
    print("-" * 70)

    local_weights = Path(output_dir) if Path(output_dir).exists() else (Path("weights/vit_deepfake") if Path("weights/vit_deepfake").exists() else None)
    load_source = str(local_weights) if local_weights else model_name
    print(f"[*] Initializing model backbone from: {load_source}")
    processor = ViTImageProcessor.from_pretrained(load_source)
    model = ViTForImageClassification.from_pretrained(
        load_source,
        num_labels=2,
        id2label={0: "authentic", 1: "manipulated"},
        label2id={"authentic": 0, "manipulated": 1},
        ignore_mismatched_sizes=True
    )

    # Apply layer freezing policy based on mode
    if mode == "head_only":
        print("[*] Freezing ViT transformer encoder; optimizing classification head.")
        for param in model.vit.parameters():
            param.requires_grad = False
    elif mode == "top_layers":
        print("[*] Freezing lower layers; optimizing top 2 encoder blocks + head.")
        for param in model.vit.parameters():
            param.requires_grad = False
        for block in model.vit.encoder.layer[-2:]:
            for param in block.parameters():
                param.requires_grad = True
    elif mode == "full":
        print("[*] Full end-to-end backpropagation enabled across all ViT layers.")
    else:
        raise ValueError(f"Unknown mode: {mode}")

    trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    total_params = sum(p.numel() for p in model.parameters())
    print(f"[+] Trainable parameters: {trainable_params:,} / {total_params:,} ({100 * trainable_params / total_params:.2f}%)")

    model.to(device)

    # Use memory-safe micro-batching for feature extraction on CPU
    extract_batch_size = min(4, batch_size)
    train_dataset = DeepfakeImageDataset(train_paths, train_labels, processor)
    val_dataset = DeepfakeImageDataset(val_paths, val_labels, processor)

    train_raw_loader = DataLoader(train_dataset, batch_size=extract_batch_size, shuffle=False)
    val_raw_loader = DataLoader(val_dataset, batch_size=extract_batch_size, shuffle=False)

    start_time = time.time()
    epoch_history = []

    if mode == "head_only":
        print(f"[*] Extracting ViT-768 CLS feature vectors (micro-batch={extract_batch_size})...")
        model.eval()
        
        import gc
        train_feats, train_targets = [], []
        with torch.inference_mode():
            for b_idx, batch in enumerate(train_raw_loader):
                pv = batch["pixel_values"].to(device)
                lbl = batch["label"].clone()
                cls_tokens = model.vit(pv).last_hidden_state[:, 0].detach().cpu()
                train_feats.append(cls_tokens)
                train_targets.append(lbl)
                del pv, cls_tokens
                if (b_idx + 1) % 15 == 0:
                    gc.collect()
                if (b_idx + 1) % 25 == 0 or (b_idx + 1) == len(train_raw_loader):
                    print(f"    - Extracted train features: {min(len(train_paths), (b_idx + 1) * extract_batch_size)} / {len(train_paths)}")

        gc.collect()
        val_feats, val_targets = [], []
        with torch.inference_mode():
            for batch in val_raw_loader:
                pv = batch["pixel_values"].to(device)
                lbl = batch["label"].clone()
                cls_tokens = model.vit(pv).last_hidden_state[:, 0].detach().cpu()
                val_feats.append(cls_tokens)
                val_targets.append(lbl)
                del pv, cls_tokens

        X_train = torch.cat(train_feats, dim=0).to(device)
        y_train = torch.cat(train_targets, dim=0).to(device)
        X_val = torch.cat(val_feats, dim=0).to(device)
        y_val = torch.cat(val_targets, dim=0).to(device)

        print(f"[+] Feature tensors cached: X_train {list(X_train.shape)}, X_val {list(X_val.shape)}")
        print(f"[*] Optimizing classification head for {epochs} epochs...")

        head_dataset = torch.utils.data.TensorDataset(X_train, y_train)
        head_loader = DataLoader(head_dataset, batch_size=min(32, len(X_train)), shuffle=True)

        optimizer = torch.optim.AdamW(model.classifier.parameters(), lr=max(lr, 5e-4), weight_decay=0.01)
        criterion = nn.CrossEntropyLoss()

        model.classifier.train()
        for epoch in range(epochs):
            epoch_start = time.time()
            total_loss = 0.0
            correct = 0

            for bx, by in head_loader:
                optimizer.zero_grad()
                logits = model.classifier(bx)
                loss = criterion(logits, by)
                loss.backward()
                optimizer.step()

                total_loss += loss.item()
                preds = torch.argmax(logits, dim=1)
                correct += (preds == by).sum().item()

            avg_loss = total_loss / max(1, len(head_loader))
            train_acc = correct / len(X_train)
            epoch_dur = time.time() - epoch_start
            print(f"Epoch {epoch+1:02d}/{epochs:02d} | Loss: {avg_loss:.4f} | Train Acc: {train_acc*100:.2f}% | Time: {epoch_dur:.2f}s")
            epoch_history.append({"epoch": epoch + 1, "loss": round(avg_loss, 4), "train_accuracy": round(train_acc, 4), "time_seconds": round(epoch_dur, 2)})

        # Evaluation directly on X_val
        model.classifier.eval()
        with torch.no_grad():
            val_logits = model.classifier(X_val)
            val_probs = torch.softmax(val_logits, dim=1)[:, 1].cpu().numpy()
            val_preds = torch.argmax(val_logits, dim=1).cpu().numpy()
            val_labels = y_val.cpu().numpy()

        all_preds = val_preds
        all_labels = val_labels
        all_probs = val_probs

    else:
        # Full or top_layers backpropagation
        train_loader = DataLoader(train_dataset, batch_size=extract_batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=extract_batch_size, shuffle=False)
        optimizer = torch.optim.AdamW([p for p in model.parameters() if p.requires_grad], lr=lr, weight_decay=0.01)
        criterion = nn.CrossEntropyLoss()

        for epoch in range(epochs):
            epoch_start = time.time()
            model.train()
            total_loss = 0.0
            correct_train = 0
            total_train_items = 0

            for batch in train_loader:
                optimizer.zero_grad()
                pixel_values = batch["pixel_values"].to(device)
                labels = batch["label"].to(device)

                outputs = model(pixel_values=pixel_values)
                loss = criterion(outputs.logits, labels)
                loss.backward()
                optimizer.step()

                total_loss += loss.item()
                preds = torch.argmax(outputs.logits, dim=1)
                correct_train += (preds == labels).sum().item()
                total_train_items += len(labels)

            avg_loss = total_loss / max(1, len(train_loader))
            train_acc = correct_train / max(1, total_train_items)
            epoch_duration = time.time() - epoch_start
            print(f"Epoch {epoch+1:02d}/{epochs:02d} | Loss: {avg_loss:.4f} | Train Acc: {train_acc*100:.2f}% | Time: {epoch_duration:.1f}s")
            epoch_history.append({"epoch": epoch + 1, "loss": round(avg_loss, 4), "train_accuracy": round(train_acc, 4), "time_seconds": round(epoch_duration, 1)})

        model.eval()
        all_preds_list, all_labels_list, all_probs_list = [], [], []
        with torch.no_grad():
            for batch in val_loader:
                pixel_values = batch["pixel_values"].to(device)
                labels = batch["label"].to(device)
                outputs = model(pixel_values=pixel_values)
                probs = torch.softmax(outputs.logits, dim=1)[:, 1]
                preds = torch.argmax(outputs.logits, dim=1)
                all_probs_list.extend(probs.cpu().numpy())
                all_preds_list.extend(preds.cpu().numpy())
                all_labels_list.extend(labels.cpu().numpy())

        all_preds = np.array(all_preds_list)
        all_labels = np.array(all_labels_list)
        all_probs = np.array(all_probs_list)

    # Forensic Benchmark Metrics
    acc = float(accuracy_score(all_labels, all_preds))
    prec, rec, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average="binary", zero_division=0)
    
    try:
        roc_auc = float(roc_auc_score(all_labels, all_probs))
    except Exception:
        roc_auc = 0.50

    brier = float(brier_score_loss(all_labels, all_probs))
    ece = float(calculate_calibration_ece(all_probs, all_labels))

    print("\n" + "=" * 70)
    print("TRUTHLENS FORENSIC VALIDATION REPORT (FaceForensics++ C23)")
    print("=" * 70)
    print(f"Validation Accuracy:       {acc * 100:.2f}%")
    print(f"Precision (Manipulated):   {prec * 100:.2f}%")
    print(f"Recall (Manipulated):      {rec * 100:.2f}%")
    print(f"F1-Score:                  {f1 * 100:.2f}%")
    print(f"ROC-AUC:                   {roc_auc:.4f}")
    print(f"Brier Calibration Loss:    {brier:.4f}")
    print(f"Expected Calibration Err:  {ece:.4f} (ECE)")
    print("=" * 70)

    # Save Model Weights and Processor
    out_dir_path = Path(output_dir)
    out_dir_path.mkdir(parents=True, exist_ok=True)
    model.save_pretrained(str(out_dir_path))
    processor.save_pretrained(str(out_dir_path))
    print(f"[+] Model checkpoint and preprocessor saved to: {out_dir_path.resolve()}")

    metrics_summary = {
        "model_name": "TruthLens-ViT-FineTuned-FF++",
        "base_model": model_name,
        "dataset": "FaceForensics++ C23 (xdxd003/ff-c23)",
        "training_mode": mode,
        "device": str(device),
        "epochs": epochs,
        "batch_size": batch_size,
        "learning_rate": lr,
        "training_time_seconds": round(training_time_total, 2),
        "train_samples": len(train_paths),
        "val_samples": len(val_paths),
        "metrics": {
            "accuracy": round(acc, 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "f1_score": round(float(f1), 4),
            "roc_auc": round(roc_auc, 4),
            "brier_score": round(brier, 4),
            "expected_calibration_error": round(ece, 4)
        },
        "epoch_history": epoch_history,
        "saved_weights_dir": str(out_dir_path.resolve())
    }

    # Save metrics JSON inside output_dir
    with open(out_dir_path / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)

    # Save formal report
    rep_path = Path(report_path)
    rep_path.parent.mkdir(parents=True, exist_ok=True)
    with open(rep_path, "w", encoding="utf-8") as f:
        json.dump(metrics_summary, f, indent=2)
    print(f"[+] Forensic evaluation report saved to: {rep_path.resolve()}")

    return metrics_summary

def main():
    parser = argparse.ArgumentParser(description="TruthLens AI ViT Deepfake Training Engine")
    parser.add_argument("--data_dir", type=str, default=DEFAULT_OUTPUT_DIR, help="Path to preprocessed face dataset")
    parser.add_argument("--raw_dir", type=str, default=DEFAULT_RAW_DIR, help="Path to raw FaceForensics++ C23 dataset")
    parser.add_argument("--auto_prepare", action="store_true", default=True, help="Automatically prepare dataset if not already processed")
    parser.add_argument("--max_videos", type=int, default=50, help="Max videos per class to extract when auto-preparing")
    parser.add_argument("--frames_per_video", type=int, default=4, help="Frames per video when auto-preparing")
    parser.add_argument("--epochs", type=int, default=3, help="Training epochs")
    parser.add_argument("--batch_size", type=int, default=16, help="Training batch size")
    parser.add_argument("--lr", type=float, default=1e-4, help="Learning rate")
    parser.add_argument("--mode", type=str, default="head_only", choices=["head_only", "top_layers", "full"], help="Fine-tuning mode")
    parser.add_argument("--output_dir", type=str, default="weights/vit_deepfake", help="Output directory for saved weights")
    args = parser.parse_args()

    data_path = Path(args.data_dir)

    # Check if preprocessed dataset exists
    needs_prep = False
    if not data_path.exists():
        needs_prep = True
    else:
        train_paths, train_labels, val_paths, val_labels = load_data_from_directory(data_path)
        if len(train_paths) == 0 or len(val_paths) == 0:
            needs_prep = True

    if needs_prep:
        print(f"[*] Preprocessed dataset not found at '{data_path}'. Auto-preparing from raw FaceForensics++...")
        prep_res = prepare_dataset(
            raw_dir=args.raw_dir,
            output_dir=args.data_dir,
            max_videos_per_class=args.max_videos,
            frames_per_video=args.frames_per_video
        )
        train_paths, train_labels, val_paths, val_labels = load_data_from_directory(data_path)
    else:
        print(f"[+] Found existing preprocessed dataset at: {data_path.resolve()}")

    if len(train_paths) == 0 or len(val_paths) == 0:
        print("[!] Error: No training or validation samples could be loaded.")
        sys.exit(1)

    train_vit_detector(
        train_paths=train_paths,
        train_labels=train_labels,
        val_paths=val_paths,
        val_labels=val_labels,
        output_dir=args.output_dir,
        epochs=args.epochs,
        batch_size=args.batch_size,
        lr=args.lr,
        mode=args.mode
    )

if __name__ == "__main__":
    main()
