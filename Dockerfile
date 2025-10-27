# Minimal Dockerfile for Railway.app deployment
# Focuses on Node.js backend with minimal Python services to stay under 4GB limit

FROM node:18-slim

# Install minimal system dependencies with python3-venv
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
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

# Copy application code
COPY . .

# Build frontend
RUN cd frontend && npm run build

# Create minimal Python requirements (no heavy ML packages)
RUN echo "fastapi==0.104.1" > python-services/requirements-minimal.txt
RUN echo "uvicorn==0.24.0" >> python-services/requirements-minimal.txt
RUN echo "python-multipart==0.0.6" >> python-services/requirements-minimal.txt
RUN echo "python-dotenv==1.0.0" >> python-services/requirements-minimal.txt
RUN echo "requests==2.31.0" >> python-services/requirements-minimal.txt
RUN echo "aiofiles==23.2.1" >> python-services/requirements-minimal.txt

# Create Python virtual environment and install dependencies
RUN python3 -m venv /app/venv
ENV PATH="/app/venv/bin:$PATH"
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install -r python-services/requirements-minimal.txt

# Create necessary directories
RUN mkdir -p uploads/avatars uploads/audio uploads/lipsync public/avatars

# Expose ports (Node.js backend and Python services)
EXPOSE 5000 8000

# Create startup script to run both services
# Railway's PORT will be used by Node.js backend
# Python service will use PYTHON_PORT or default to 8000
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'set -e' >> /app/start.sh && \
    echo 'echo "=========================================="' >> /app/start.sh && \
    echo 'echo "Starting AI Agent Services..."' >> /app/start.sh && \
    echo 'echo "=========================================="' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Starting Python services in background..."' >> /app/start.sh && \
    echo 'cd /app/python-services' >> /app/start.sh && \
    echo 'PYTHON_PORT=${PYTHON_PORT:-8000}' >> /app/start.sh && \
    echo '/app/venv/bin/python main-minimal.py &' >> /app/start.sh && \
    echo 'PYTHON_PID=$!' >> /app/start.sh && \
    echo 'echo "Python service started with PID: $PYTHON_PID"' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Waiting for Python service to be ready..."' >> /app/start.sh && \
    echo 'sleep 3' >> /app/start.sh && \
    echo '' >> /app/start.sh && \
    echo 'echo "Starting Node.js backend (main service)..."' >> /app/start.sh && \
    echo 'cd /app/backend' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

# Set working directory and start both services
WORKDIR /app
CMD ["/bin/bash", "/app/start.sh"]