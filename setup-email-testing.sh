#!/bin/bash

# 📧 LOCAL EMAIL TESTING - QUICK SETUP SCRIPT
# Run this script to set up local email testing

set -e  # Exit on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  📧 Local Email Testing Setup for Candidate 360° NPS     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found${NC}"
    echo -e "Please run this script from the project root directory."
    exit 1
fi

# Step 1: Check .env file
echo -e "${YELLOW}Step 1: Checking .env configuration...${NC}"

if [ ! -f "backend/.env" ]; then
    echo -e "${RED}❌ backend/.env file not found${NC}"
    echo -e "Creating from template..."
    
    # Create .env file with required variables
    cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/candidate_360_nps

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

REDIS_HOST=localhost
REDIS_PORT=6379

# Email Configuration (LOCAL DEVELOPMENT)
EMAIL_MODE=local
TEST_EMAIL_ADDRESS=CHANGE_THIS_TO_YOUR_EMAIL@example.com
MAILHOG_HOST=localhost
MAILHOG_PORT=1025

# SMS Configuration (LOCAL DEVELOPMENT)
SMS_MODE=mock

# SmartRecruiters Integration
SR_MOCK_MODE=true
EOF
    
    echo -e "${GREEN}✅ Created backend/.env${NC}"
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit backend/.env and set TEST_EMAIL_ADDRESS to your email!${NC}"
    echo ""
    read -p "Press Enter to open .env file for editing..."
    ${EDITOR:-nano} backend/.env
else
    echo -e "${GREEN}✅ backend/.env exists${NC}"
    
    # Check if TEST_EMAIL_ADDRESS is set
    if grep -q "TEST_EMAIL_ADDRESS=.*@.*" backend/.env; then
        TEST_EMAIL=$(grep "TEST_EMAIL_ADDRESS=" backend/.env | cut -d'=' -f2)
        if [[ "$TEST_EMAIL" == *"example.com"* ]] || [[ "$TEST_EMAIL" == "CHANGE_THIS"* ]]; then
            echo -e "${YELLOW}⚠️  TEST_EMAIL_ADDRESS needs to be updated${NC}"
            echo -e "Current value: $TEST_EMAIL"
            read -p "Would you like to edit it now? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                ${EDITOR:-nano} backend/.env
            fi
        else
            echo -e "${GREEN}✅ TEST_EMAIL_ADDRESS is set to: $TEST_EMAIL${NC}"
        fi
    else
        echo -e "${RED}❌ TEST_EMAIL_ADDRESS not found in .env${NC}"
        echo -e "Adding required email testing variables..."
        
        cat >> backend/.env << 'EOF'

# Email Configuration (LOCAL DEVELOPMENT)
EMAIL_MODE=local
TEST_EMAIL_ADDRESS=CHANGE_THIS_TO_YOUR_EMAIL@example.com
MAILHOG_HOST=localhost
MAILHOG_PORT=1025

# SMS Configuration (LOCAL DEVELOPMENT)
SMS_MODE=mock
EOF
        
        echo -e "${YELLOW}⚠️  Please edit backend/.env and set TEST_EMAIL_ADDRESS${NC}"
        read -p "Press Enter to open .env file for editing..."
        ${EDITOR:-nano} backend/.env
    fi
fi

echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}Step 2: Installing dependencies...${NC}"

if [ ! -d "backend/node_modules" ]; then
    echo "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${GREEN}✅ Dependencies already installed${NC}"
    
    # Check if nodemailer is installed
    if ! grep -q '"nodemailer"' backend/package.json; then
        echo "Installing nodemailer..."
        cd backend
        npm install nodemailer @types/nodemailer
        cd ..
        echo -e "${GREEN}✅ nodemailer installed${NC}"
    fi
fi

echo ""

# Step 3: Start Docker services
echo -e "${YELLOW}Step 3: Starting Docker services (PostgreSQL, Redis, MailHog)...${NC}"

docker-compose up -d

echo "Waiting for services to be healthy..."
sleep 5

# Check if services are running
if docker-compose ps | grep -q "mailhog"; then
    echo -e "${GREEN}✅ MailHog started${NC}"
else
    echo -e "${RED}❌ MailHog failed to start${NC}"
    docker-compose logs mailhog
    exit 1
fi

if docker-compose ps | grep -q "postgres"; then
    echo -e "${GREEN}✅ PostgreSQL started${NC}"
else
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    exit 1
fi

if docker-compose ps | grep -q "redis"; then
    echo -e "${GREEN}✅ Redis started${NC}"
else
    echo -e "${RED}❌ Redis failed to start${NC}"
    exit 1
fi

echo ""

# Step 4: Run database migrations (if not done)
echo -e "${YELLOW}Step 4: Setting up database...${NC}"

cd backend

if [ ! -d "node_modules/.prisma" ]; then
    echo "Running database migrations..."
    npm run migrate
    echo -e "${GREEN}✅ Database migrated${NC}"
    
    echo "Seeding database..."
    npm run seed
    echo -e "${GREEN}✅ Database seeded${NC}"
else
    echo -e "${GREEN}✅ Database already set up${NC}"
fi

cd ..

echo ""

# Step 5: Test MailHog
echo -e "${YELLOW}Step 5: Testing MailHog connection...${NC}"

if curl -s http://localhost:8025 > /dev/null; then
    echo -e "${GREEN}✅ MailHog UI is accessible at http://localhost:8025${NC}"
else
    echo -e "${RED}❌ MailHog UI not accessible${NC}"
    echo "Trying to restart MailHog..."
    docker-compose restart mailhog
    sleep 3
    
    if curl -s http://localhost:8025 > /dev/null; then
        echo -e "${GREEN}✅ MailHog is now accessible${NC}"
    else
        echo -e "${RED}❌ MailHog still not accessible. Check logs: docker-compose logs mailhog${NC}"
    fi
fi

echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                  🎉 Setup Complete!                       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}✅ MailHog is running${NC}"
echo -e "${GREEN}✅ PostgreSQL is running${NC}"
echo -e "${GREEN}✅ Redis is running${NC}"
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo -e "${GREEN}✅ Database ready${NC}"

echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo -e "1. ${YELLOW}Start the backend:${NC}"
echo -e "   cd backend && npm run dev"
echo ""
echo -e "2. ${YELLOW}Start the workers (in a new terminal):${NC}"
echo -e "   cd backend && npm run dev:workers"
echo ""
echo -e "3. ${YELLOW}Open MailHog UI:${NC}"
echo -e "   http://localhost:8025"
echo ""
echo -e "4. ${YELLOW}Test email sending:${NC}"
echo -e "   See ${GREEN}LOCAL_TESTING.md${NC} for complete instructions"
echo ""

echo -e "${BLUE}Quick Test Commands:${NC}"
echo ""
echo -e "# Login and get token"
echo -e 'TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \'
echo -e '  -H "Content-Type: application/json" \'
echo -e '  -d '"'"'{"email":"admin@example.com","password":"password"}'"'"' \'
echo -e '  | jq -r '"'"'.token'"'"')'
echo ""
echo -e "# Create test survey"
echo -e 'SURVEY=$(curl -s -X POST http://localhost:4000/api/test/create-test-survey \'
echo -e '  -H "Authorization: Bearer $TOKEN")'
echo ""
echo -e 'SURVEY_ID=$(echo $SURVEY | jq -r '"'"'.survey.id'"'"')'
echo ""
echo -e "# Send test email"
echo -e 'curl -X POST http://localhost:4000/api/test/send-survey \'
echo -e '  -H "Authorization: Bearer $TOKEN" \'
echo -e '  -H "Content-Type: application/json" \'
echo -e '  -d '"'"'{"surveyId":"'"'"'"$SURVEY_ID"'"'"'","channel":"email"}'"'"
echo ""
echo -e "# Check MailHog"
echo -e "open http://localhost:8025"
echo ""

echo -e "${BLUE}Documentation:${NC}"
echo -e "  📚 ${GREEN}LOCAL_TESTING.md${NC} - Complete testing guide"
echo -e "  📋 ${GREEN}LOCAL_EMAIL_TESTING_SETUP.md${NC} - Setup summary"
echo -e "  🔧 ${GREEN}IMPLEMENTATION_SUMMARY.md${NC} - Technical details"
echo ""

echo -e "${YELLOW}⚠️  Remember:${NC}"
echo -e "  • All emails go to TEST_EMAIL_ADDRESS in local mode"
echo -e "  • SMS is mocked (logs only, no real sends)"
echo -e "  • MailHog stores emails in memory (cleared on restart)"
echo ""

echo -e "${GREEN}Happy Testing! 🚀${NC}"

