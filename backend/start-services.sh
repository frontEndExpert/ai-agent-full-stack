#!/bin/bash

# Start Python services in background
echo "Starting Python services..."
cd /app/python-services
# Use virtual environment Python
/app/venv/bin/python main.py &
PYTHON_PID=$!

# Wait a moment for Python services to start
sleep 5

# Start Node.js backend
echo "Starting Node.js backend..."
cd /app/backend
npm start &
NODE_PID=$!

# Function to handle shutdown
cleanup() {
    echo "Shutting down services..."
    kill $PYTHON_PID $NODE_PID
    wait
    exit 0
}

# Set up signal handlers
trap cleanup SIGTERM SIGINT

# Wait for either process to exit
wait
