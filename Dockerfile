# ==============================================================================
# TruthLens AI — Production Multi-Stage Dockerfile
# Optimized for Hugging Face Spaces (16GB RAM / 2 vCPU), Render, Railway & VPS
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build Frontend SPA
# ------------------------------------------------------------------------------
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install --frozen-lockfile || npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Runtime Environment (Python 3.10 Slim)
# ------------------------------------------------------------------------------
FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=7860 \
    HOME=/home/user

# Install essential system dependencies (OpenCV headless runtime, libsndfile for audio, ffmpeg for video)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsndfile1 \
    ffmpeg \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set up non-root user required by Hugging Face Spaces (UID 1000)
RUN useradd -m -u 1000 user
ENV PATH=/home/user/.local/bin:$PATH

WORKDIR /home/user/app

# Pre-install CPU-only PyTorch & Torchvision (saves ~2.5 GB download and 10+ min build time)
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu

# Copy requirements and install remaining backend dependencies
COPY --chown=user:user backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY --chown=user:user backend/ ./backend/

# Copy compiled frontend from Stage 1
COPY --chown=user:user --from=frontend-builder /app/frontend/dist ./frontend/dist

# Initialize directories with proper permissions for non-root user
RUN mkdir -p uploads reports static /home/user/.cache && \
    chown -R user:user /home/user

# Switch to non-root user
USER user

# Expose default Hugging Face Spaces port (7860)
EXPOSE 7860

# Launch FastAPI gateway (serving both API and compiled SPA on the assigned port)
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-7860} --app-dir backend"]
