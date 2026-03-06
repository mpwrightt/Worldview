#!/bin/bash

echo "==================================="
echo "Fetching REAL Flight & Satellite Data"
echo "==================================="
echo ""

# Check if convex is configured
if [ ! -f "convex.json" ]; then
    echo "❌ Convex not configured. Run: npx convex dev"
    exit 1
fi

echo "Step 1: Fetching flights from OpenSky (worldwide)..."
npx convex run ingest_flight:fetchOpenSky

echo ""
echo "Step 2: Fetching satellites from CelesTrak..."
npx convex run ingest_satellite:fetchCelesTrak '{"group": "visual"}'
npx convex run ingest_satellite:fetchCelesTrak '{"group": "stations"}'
npx convex run ingest_satellite:fetchCelesTrak '{"group": "gps-ops"}'

echo ""
echo "Step 3: Checking data stats..."
npx convex run events:stats

echo ""
echo "==================================="
echo "✅ Real data fetched!"
echo "==================================="
echo ""
echo "Refresh your browser to see:"
echo "  - Hundreds of real flights worldwide"
echo "  - Hundreds of real satellites"
echo "  - ISS, GPS satellites, Space stations"
echo ""
