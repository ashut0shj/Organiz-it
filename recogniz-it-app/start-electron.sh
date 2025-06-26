#!/bin/bash

# Set environment variables to avoid GTK conflicts
export GTK_THEME=Adwaita:light
export XDG_SESSION_TYPE=x11
export NO_AT_BRIDGE=1
export GTK_USE_PORTAL=1

# Start the development server in the background
npm run dev &
DEV_PID=$!

# Wait for the server to be ready
echo "Waiting for development server..."
sleep 5

# Start Electron
echo "Starting Electron..."
electron electron/main.js

# Clean up
kill $DEV_PID 