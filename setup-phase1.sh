#!/bin/bash

echo "🚀 Candidate 360° NPS Dashboard - Phase 1 Setup"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0.32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "${RED}❌ Docker is not running. Please start Docker first.${NC}"
    exit 1
fi

echo "${GREEN}✅ Docker is running${NC}"
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to install root dependencies${NC}"
    exit 1
fi

cd backend && npm install && cd ..
if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

cd frontend && npm install && cd ..
if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to install frontend dependencies${NC}"
    exit 1
fi

echo "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 2: Setup environment files
echo "⚙️  Step 2: Setting up environment files..."
if [ ! -f backend/.env ]; then
    cp backend/.env.example backend/.env
    echo "${YELLOW}⚠️  Created backend/.env from example. Please update with your configuration.${NC}"
fi

if [ ! -f frontend/.env ]; then
    cp frontend/.env.example frontend/.env
    echo "${YELLOW}⚠️  Created frontend/.env from example.${NC}"
fi

echo "${GREEN}✅ Environment files ready${NC}"
echo ""

# Step 3: Start Docker containers
echo "🐳 Step 3: Starting Docker containers (PostgreSQL + Redis)..."
docker-compose up -d
if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to start Docker containers${NC}"
    exit 1
fi

echo "${GREEN}✅ Docker containers started${NC}"
echo ""

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Step 4: Generate Prisma Client
echo "🔧 Step 4: Generating Prisma client..."
cd backend && npx prisma generate
if [ $? -ne 0 ]; then
    echo "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi
cd ..

echo "${GREEN}✅ Prisma client generated${NC}"
echo ""

# Step 5: Run database migrations
echo "🗄️  Step 5: Running database migrations..."
cd backend && npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
    echo "${YELLOW}⚠️  Migration may have failed. This is normal if migrations already exist.${NC}"
fi
cd ..

echo "${GREEN}✅ Database migrations complete${NC}"
echo ""

# Step 6: Seed database
echo "🌱 Step 6: Seeding database..."
read -p "Do you want to seed the database with sample data? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd backend && npm run seed
    if [ $? -ne 0 ]; then
        echo "${YELLOW}⚠️  Seeding failed. You can run 'npm run db:seed' later.${NC}"
    else
        echo "${GREEN}✅ Database seeded${NC}"
    fi
    cd ..
else
    echo "${YELLOW}⏭️  Skipped database seeding${NC}"
fi

echo ""
echo "================================================"
echo "${GREEN}🎉 Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📊 Services:"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "🚀 To start development:"
echo "  npm run dev"
echo ""
echo "📖 Documentation:"
echo "  - Phase 1 Summary: PHASE1_COMPLETE.md"
echo "  - Architecture: README.md"
echo ""
echo "🔑 Default credentials (if seeded):"
echo "  Email: admin@example.com"
echo "  Password: admin123"
echo ""
echo "${GREEN}Happy coding! 🎨${NC}"

