# WorldView OSINT

A real-time 3D OSINT (Open Source Intelligence) visualization platform built with React, CesiumJS, and Convex.

![WorldView OSINT](https://worldview-oss.vercel.app/preview.png)

## Features

- 🌍 **3D Globe Visualization** - Interactive CesiumJS-powered globe with real-time entity tracking
- ✈️ **Live Flight Tracking** - Real-time aircraft positions via OpenSky Network API
- 🛰️ **Satellite Tracking** - Orbital tracking of ISS, GPS satellites, and more via CelesTrak
- 🔍 **OSINT Data Integration** - Multiple open-source intelligence feeds
- ⚡ **Real-time Updates** - Convex-powered live data synchronization
- 🎨 **Visual Filters** - Night vision, thermal, and anime visualization modes

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **3D Engine**: CesiumJS
- **Backend**: Convex (serverless database + functions)
- **Data Sources**:
  - OpenSky Network (flight tracking)
  - CelesTrak (satellite TLE data)
  - Google Maps 3D Tiles (photorealistic terrain)

## Prerequisites

- Node.js 18+
- npm or yarn
- OpenSky Network account (free)
- Google Maps API key (for 3D Tiles)
- Convex account (free tier)

## Setup

### 1. Clone and Install

```bash
git clone https://github.com/mpwrightt/Worldview.git
cd Worldview
npm install
cd frontend && npm install && cd ..
```

### 2. Configure Environment Variables

Create `.env.local` in the project root:

```bash
# Convex
CONVEX_URL=https://your-deployment.convex.cloud
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment

# OpenSky Network (Basic Auth)
OPENSKY_USERNAME=your_opensky_email
OPENSKY_PASSWORD=your_opensky_password

# Google Maps (for 3D Tiles)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Optional: Cesium Ion (for better imagery)
VITE_CESIUM_ION_TOKEN=your_cesium_token
```

### 3. Initialize Convex

```bash
npx convex dev --once
```

### 4. Run Locally

```bash
# Terminal 1: Start Convex dev server
npx convex dev

# Terminal 2: Start frontend
cd frontend && npm run dev
```

Open http://localhost:3000

## Deployment

### Deploy to Vercel

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set framework preset to "Vite"
   - Set root directory to `frontend`

3. **Environment Variables in Vercel**:
   - Add `VITE_CONVEX_URL` = your Convex URL
   - Add `VITE_GOOGLE_MAPS_API_KEY` = your Google Maps key
   - Add `VITE_CESIUM_ION_TOKEN` (optional)

4. **Deploy**

### Deploy Convex to Production

```bash
npx convex deploy
```

Set environment variables in Convex dashboard:
- `OPENSKY_USERNAME`
- `OPENSKY_PASSWORD`

## Data Ingestion

### Manual Fetch

```bash
# Fetch flights
npx convex run ingest_flight:fetchOpenSky

# Fetch satellites
npx convex run ingest_satellite:fetchCelesTrak '{"group": "visual"}'
```

### Scheduled Updates

Set up a cron job or use Convex scheduler for periodic updates.

## API Reference

### Convex Functions

| Function | Type | Description |
|----------|------|-------------|
| `events:list` | Query | List events with optional filters |
| `events:createMany` | Mutation | Bulk insert events |
| `ingest_flight:fetchOpenSky` | Action | Fetch real-time flight data |
| `ingest_satellite:fetchCelesTrak` | Action | Fetch satellite positions |

## License

MIT License - See [LICENSE](LICENSE) for details.

## Data Attribution

- Flight data: [OpenSky Network](https://opensky-network.org/) (CC-BY-SA-4.0)
- Satellite data: [CelesTrak](https://celestrak.org/) (CC0-1.0)
- 3D Tiles: Google Maps Platform

## Contributing

Pull requests welcome! Please ensure:
- No mock data in production
- Real OSINT sources only
- Proper attribution for all data sources
