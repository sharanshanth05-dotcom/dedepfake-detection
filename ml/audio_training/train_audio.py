"""
TruthLens AI — Audio Deepfake Detector
Architecture: Pre-trained Wav2Vec 2.0 / Spectrogram CNN
Datasets: ASVspoof 2021 (LA/DF), In-the-Wild Audio
"""

import torch
import torch.nn as nn
from transformers import Wav2Vec2Model, Wav2Vec2FeatureExtractor

class AudioDeepfakeClassifier(nn.Module):
    def __init__(self, pretrained_model="facebook/wav2vec2-base"):
        super().__init__()
        self.wav2vec = Wav2Vec2Model.from_pretrained(pretrained_model)
        # Freeze lower convolutional feature encoder
        for param in self.wav2vec.feature_extractor.parameters():
            param.requires_grad = False
            
        self.classifier = nn.Sequential(
            nn.Linear(768, 128),
            nn.ReLU(),
            nn.Dropout(0.25),
            nn.Linear(128, 2)
        )

    def forward(self, input_values):
        outputs = self.wav2vec(input_values)
        hidden_states = outputs.last_hidden_state
        # Mean pooling over temporal frame dimension
        pooled = torch.mean(hidden_states, dim=1)
        logits = self.classifier(pooled)
        return logits

def train_audio_model():
    print("[TruthLens] Initialized Wav2Vec 2.0 Audio Deepfake Classification Backbone")
    model = AudioDeepfakeClassifier()
    print("Trainable parameters:", sum(p.numel() for p in model.parameters() if p.requires_grad))

if __name__ == "__main__":
    train_audio_model()
