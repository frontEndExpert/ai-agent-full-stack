# Root Dockerfile for Railway.app deployment
# This file points to the backend Dockerfile for the integrated Node.js + Python services

FROM node:18-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3.11-venv \
    python3-dev \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install Node.js dependencies
RUN npm install
RUN cd frontend && npm install
RUN cd backend && npm install

# Copy Python requirements
COPY python-services/requirements-ultra-minimal.txt ./python-services/requirements.txt

# Create Python virtual environment with fallback
RUN python3 -m venv /app/venv || python3 -m venv /app/venv --without-pip
ENV PATH="/app/venv/bin:$PATH"

# Install pip in virtual environment if needed
RUN /app/venv/bin/python -m ensurepip --upgrade || /app/venv/bin/python -m pip install --upgrade pip

# Install Python dependencies in virtual environment (step by step)
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install --no-cache-dir numpy opencv-python Pillow
RUN /app/venv/bin/pip install --no-cache-dir trimesh scikit-image
RUN /app/venv/bin/pip install --no-cache-dir torch torchaudio --index-url https://download.pytorch.org/whl/cpu
RUN /app/venv/bin/pip install --no-cache-dir librosa soundfile
RUN /app/venv/bin/pip install --no-cache-dir chromadb sentence-transformers faiss-cpu
RUN /app/venv/bin/pip install --no-cache-dir fastapi uvicorn python-multipart
RUN /app/venv/bin/pip install --no-cache-dir python-dotenv requests aiofiles

# Copy application code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Create necessary directories
RUN mkdir -p uploads/avatars uploads/audio uploads/lipsync public/avatars

# Expose port
EXPOSE 5000

# Make startup script executable
RUN chmod +x backend/start-services.sh

# Start command
CMD ["./backend/start-services.sh"]
