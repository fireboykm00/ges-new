#!/bin/bash

# Script to start both backend and frontend

echo "Starting GES Restaurant Stock Management System..."

# Start backend in background
echo "Starting backend..."
cd backend
mvn spring-boot:run > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Start frontend in background
echo "Starting frontend..."
cd frontend
pnpm dev > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Applications started!"
echo "Backend: http://localhost:8080"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both applications"

# Wait for both processes
wait $BACKEND_PID
wait $FRONTEND_PID

echo "Applications stopped."