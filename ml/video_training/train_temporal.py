"""
TruthLens AI — Video Temporal Consistency Model
Architecture: Pre-extracted ViT Frame Embeddings + Bi-directional GRU / Temporal Transformer
"""

import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

class TemporalDeepfakeDetector(nn.Module):
    def __init__(self, feature_dim=768, hidden_dim=256, num_layers=2):
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

def train_temporal_model():
    print("[TruthLens] Initialized Temporal Deepfake Detector (BiGRU + ViT Feature Stream)")
    model = TemporalDeepfakeDetector()
    print(model)

if __name__ == "__main__":
    train_temporal_model()
