# Multi-stage build for AI Agent Backend
FROM node:18-alpine AS base

# Install Python and system dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    build-base \
    python3-dev \
    libffi-dev \
    openssl-dev \
    libjpeg-turbo-dev \
    zlib-dev \
    freetype-dev \
    lcms2-dev \
    openjpeg-dev \
    tiff-dev \
    tk-dev \
    tcl-dev \
    harfbuzz-dev \
    fribidi-dev \
    libimagequant-dev \
    libxcb1-dev \
    libpng-dev \
    ffmpeg

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install Node.js dependencies
RUN npm install
RUN cd backend && npm install

# Copy Python requirements
COPY python-services/requirements.txt ./python-services/

# Install Python dependencies
RUN pip3 install --no-cache-dir -r python-services/requirements.txt

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p uploads public/avatars temp

# Build the application
RUN cd backend && npm run build || true

# Expose ports
EXPOSE 5000 8000 8001 8002 8003

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["sh", "-c", "cd backend && npm start & cd python-services && python -m uvicorn main:app --host 0.0.0.0 --port 8000 & wait"]
