#!/bin/bash
set -e

echo "==================================="
echo "WorldView OSINT - Complete Setup"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing dependencies...${NC}"
npm install
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 2: Deploy Convex schema
echo -e "${YELLOW}Step 2: Deploying Convex schema...${NC}"
echo "This will open a browser to authenticate with Convex."
echo "Press Enter when ready..."
read

npx convex dev --once
echo -e "${GREEN}✓ Convex schema deployed${NC}"
echo ""

# Step 3: Fetch real data
echo -e "${YELLOW}Step 3: Fetching real flight data...${NC}"
npx convex run ingest_flight:fetchOpenSky
echo -e "${GREEN}✓ Flights fetched${NC}"
echo ""

echo -e "${YELLOW}Step 4: Fetching real satellite data...${NC}"
npx convex run ingest_satellite:fetchCelesTrak '{"group": "visual"}'
npx convex run ingest_satellite:fetchCelesTrak '{"group": "stations"}'
npx convex run ingest_satellite:fetchCelesTrak '{"group": "gps-ops"}'
echo -e "${GREEN}✓ Satellites fetched${NC}"
echo ""

# Step 4: Check stats
echo -e "${YELLOW}Step 5: Checking data...${NC}"
npx convex run events:stats
echo ""

echo -e "${GREEN}===================================${NC}"
echo -e "${GREEN}✅ Setup complete!${NC}"
echo -e "${GREEN}===================================${NC}"
echo ""
echo "To start the app:"
echo "  Terminal 1: npx convex dev"
echo "  Terminal 2: cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
