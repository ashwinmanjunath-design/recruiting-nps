#!/bin/bash

# Candidate 360° NPS Dashboard - Startup Script

echo "🚀 Starting Candidate 360° NPS Dashboard..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    cd client && npm install && cd ..
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "⚙️  Please edit .env file with your database credentials!"
    exit 1
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma" ]; then
    echo "🔧 Generating Prisma client..."
    npm run db:generate
fi

# Check if database is seeded
echo "🌱 Do you want to seed the database with sample data? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    npm run db:seed
fi

echo ""
echo "✅ Starting development servers..."
echo "   Backend: http://localhost:4000"
echo "   Frontend: http://localhost:5173"
echo ""
echo "   Default credentials:"
echo "   Email: admin@example.com"
echo "   Password: admin123"
echo ""

# Start both servers
npm run dev

