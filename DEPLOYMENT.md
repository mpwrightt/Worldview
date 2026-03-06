# Deployment Guide

## Quick Deploy

### 1. Deploy Convex (Backend)

Already done! Your production deployment is at:
- **URL**: https://industrious-platypus-314.convex.cloud

Environment variables are set for production:
- `OPENSKY_USERNAME=mawrigh602@gmail.com`
- `OPENSKY_PASSWORD=$Lindsey23`

### 2. Deploy to Vercel (Frontend)

#### Option A: Vercel Dashboard (Easiest)

1. Go to https://vercel.com/new
2. Import your GitHub repo: `mpwrightt/Worldview`
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_CONVEX_URL=https://industrious-platypus-314.convex.cloud
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBNkleM3OZogPe5s_kH3Dlse0azVmMnSL4
   VITE_CESIUM_ION_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

5. Click **Deploy**

#### Option B: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy frontend
cd frontend
vercel --prod

# Follow prompts, set environment variables when asked
```

### 3. Verify Deployment

1. **Test Flight Ingestion**:
   ```bash
   npx convex run ingest_flight:fetchOpenSky --prod
   ```

2. **Check Data**:
   ```bash
   npx convex run events:stats --prod
   ```

3. **Open your Vercel URL** and verify the globe loads with data

## Setting up Automatic Deployments

### GitHub Secrets

Add these secrets to your GitHub repo (Settings → Secrets → Actions):

| Secret | Value |
|--------|-------|
| `CONVEX_DEPLOY_KEY` | Get from `npx convex deploy --once` output |
| `VERCEL_TOKEN` | Get from https://vercel.com/account/tokens |
| `VITE_CONVEX_URL` | `https://industrious-platypus-314.convex.cloud` |
| `VITE_GOOGLE_MAPS_API_KEY` | Your Google Maps API key |
| `VITE_CESIUM_ION_TOKEN` | Your Cesium Ion token (optional) |

## Troubleshooting

### "Cannot connect to Convex"
- Verify `VITE_CONVEX_URL` matches your production deployment
- Check CORS settings in Convex dashboard

### "No flights showing"
- Run the ingestion command manually to test
- Check Convex logs: `npx convex logs --prod`

### "3D Tiles not loading"
- Verify Google Maps API key is set in Vercel
- Ensure "Map Tiles API" is enabled in Google Cloud Console

## Production URLs

After deployment, your app will be at:
- **Production**: https://your-vercel-domain.vercel.app
- **Convex API**: https://industrious-platypus-314.convex.cloud
