"""
TruthLens AI — Vision Transformer (ViT) Fine-Tuning Pipeline
Datasets: FaceForensics++ (c23/c40), Celeb-DF v2, DiffusionDB
"""

import os
import argparse
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, roc_auc_score, brier_score_loss
from transformers import ViTForImageClassification, ViTImageProcessor

class DeepfakeImageDataset(Dataset):
    """
    Multimodal dataset loader supporting identity-level split to prevent data leakage.
    Labels: 0 = Authentic, 1 = Manipulated
    """
    def __init__(self, file_paths, labels, processor):
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
        # Flatten batch dimension from processor
        pixel_values = inputs["pixel_values"].squeeze(0)
        return {
            "pixel_values": pixel_values,
            "label": torch.tensor(label, dtype=torch.long)
        }

def calculate_calibration_ece(probs, labels, n_bins=10):
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

def train_vit_detector(
    train_paths, train_labels,
    val_paths, val_labels,
    model_name="google/vit-base-patch16-224",
    output_dir="./weights/vit_deepfake",
    epochs=5,
    batch_size=16,
    lr=2e-5
):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[Training] Using compute device: {device}")

    processor = ViTImageProcessor.from_pretrained(model_name)
    model = ViTForImageClassification.from_pretrained(
        model_name,
        num_labels=2,
        id2label={0: "authentic", 1: "manipulated"},
        label2id={"authentic": 0, "manipulated": 1},
        ignore_mismatched_sizes=True
    )
    model.to(device)

    train_dataset = DeepfakeImageDataset(train_paths, train_labels, processor)
    val_dataset = DeepfakeImageDataset(val_paths, val_labels, processor)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=0.01)
    criterion = nn.CrossEntropyLoss()

    for epoch in range(epochs):
        model.train()
        total_loss = 0.0
        for batch in train_loader:
            optimizer.zero_grad()
            pixel_values = batch["pixel_values"].to(device)
            labels = batch["label"].to(device)

            outputs = model(pixel_values=pixel_values)
            loss = criterion(outputs.logits, labels)
            loss.backward()
            optimizer.step()
            total_loss += loss.item()

        avg_loss = total_loss / len(train_loader)
        print(f"Epoch {epoch+1}/{epochs} - Training Loss: {avg_loss:.4f}")

    # Evaluation
    model.eval()
    all_preds, all_labels, all_probs = [], [], []
    with torch.no_grad():
        for batch in val_loader:
            pixel_values = batch["pixel_values"].to(device)
            labels = batch["label"].to(device)
            outputs = model(pixel_values=pixel_values)
            probs = torch.softmax(outputs.logits, dim=1)[:, 1]
            preds = torch.argmax(outputs.logits, dim=1)

            all_probs.extend(probs.cpu().numpy())
            all_preds.extend(preds.cpu().numpy())
            all_labels.extend(labels.cpu().numpy())

    all_preds = np.array(all_preds)
    all_labels = np.array(all_labels)
    all_probs = np.array(all_probs)

    acc = accuracy_score(all_labels, all_preds)
    prec, rec, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average="binary")
    roc_auc = roc_auc_score(all_labels, all_probs)
    brier = brier_score_loss(all_labels, all_probs)
    ece = calculate_calibration_ece(all_probs, all_labels)

    print("\n--- VALIDATION FORENSIC METRICS ---")
    print(f"Accuracy:         {acc:.4f}")
    print(f"Precision:        {prec:.4f}")
    print(f"Recall:           {rec:.4f}")
    print(f"F1-Score:         {f1:.4f}")
    print(f"ROC-AUC:          {roc_auc:.4f}")
    print(f"Brier Score:      {brier:.4f}")
    print(f"Expected Cal Err: {ece:.4f}")

    os.makedirs(output_dir, exist_ok=True)
    model.save_pretrained(output_dir)
    processor.save_pretrained(output_dir)
    print(f"[Done] Checkpoint saved to {output_dir}")

if __name__ == "__main__":
    print("TruthLens AI Vision Transformer Fine-Tuning CLI")
