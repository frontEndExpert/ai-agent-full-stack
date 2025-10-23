#!/bin/bash

echo "Starting minimal services..."

# Start Node.js backend
echo "Starting Node.js backend..."
cd /app/backend
npm start &
NODE_PID=$!

# Wait a moment for Node.js to start
sleep 3

# Start Python services
echo "Starting Python services..."
cd /app/python-services
/app/venv/bin/python main-minimal.py &
PYTHON_PID=$!

# Function to handle shutdown
cleanup() {
    echo "Shutting down services..."
    kill $NODE_PID 2>/dev/null
    kill $PYTHON_PID 2>/dev/null
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for all background processes
wait
