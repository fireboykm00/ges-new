#!/bin/bash

# Script to stop both backend and frontend

echo "Stopping GES Restaurant Stock Management System..."

# Find and kill backend process
BACKEND_PIDS=$(pgrep -f "mvn spring-boot:run")
if [ ! -z "$BACKEND_PIDS" ]; then
    echo "Stopping backend (PIDs: $BACKEND_PIDS)..."
    kill $BACKEND_PIDS
else
    echo "No backend process found."
fi

# Find and kill frontend process
FRONTEND_PIDS=$(pgrep -f "pnpm dev")
if [ ! -z "$FRONTEND_PIDS" ]; then
    echo "Stopping frontend (PIDs: $FRONTEND_PIDS)..."
    kill $FRONTEND_PIDS
else
    echo "No frontend process found."
fi

echo "Stop commands sent. Processes may take a moment to terminate."