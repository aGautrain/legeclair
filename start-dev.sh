#!/bin/bash

echo "🚀 Starting Legeclair Development Environment"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running (optional check)
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Make sure MongoDB is installed and running."
    echo "   You can use MongoDB Atlas (cloud) or install MongoDB locally."
fi

echo "📦 Installing frontend dependencies..."
cd legeclair
npm install

echo "📦 Installing backend dependencies..."
cd ../legeclair-api
npm install

echo "🔧 Setting up environment files..."
# Copy environment examples if they don't exist
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file for backend"
fi

cd ../legeclair
if [ ! -f .env ]; then
    cp env.example .env
    echo "✅ Created .env file for frontend"
fi

echo "🌐 Starting backend server..."
cd ../legeclair-api
npm run dev &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 5

echo "🎨 Starting frontend server..."
cd ../legeclair
npm run dev &
FRONTEND_PID=$!

echo "✅ Development servers started!"
echo "   Backend: http://localhost:3000"
echo "   Frontend: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait

# Cleanup on exit
echo "🛑 Stopping servers..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
echo "✅ Servers stopped" 