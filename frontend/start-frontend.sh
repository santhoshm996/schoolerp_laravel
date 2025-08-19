#!/bin/bash

echo "🚀 Starting School ERP Frontend Server..."
echo "📍 Server will be available at: http://localhost:3000"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies first..."
    npm install
fi

# Start the development server
echo "🔥 Starting Vite development server..."
npm run dev
