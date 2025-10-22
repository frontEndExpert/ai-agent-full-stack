# Root Dockerfile for Railway.app deployment
# This file points to the backend Dockerfile for the integrated Node.js + Python services

FROM node:18-slim as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
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

# Install Node.js dependencies
RUN npm install
RUN cd frontend && npm install

# Copy Python requirements
COPY python-services/requirements.txt ./python-services/

# Create Python virtual environment
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"

# Install Python dependencies in virtual environment
RUN /app/venv/bin/pip install --no-cache-dir -r python-services/requirements.txt

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
