#!/bin/bash

# Kill any running instances
echo "Cleaning up any running processes..."
pkill -f "node.*vite" || true
pkill -f "python -m uvicorn" || true

# Install dependencies if needed
if [ ! -d "node_modules/fuse.js" ]; then
  echo "Installing Fuse.js..."
  npm install fuse.js --legacy-peer-deps
fi

# Start the development server
echo "Starting development server..."
npm run dev 