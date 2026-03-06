import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

interface TLEData {
  OBJECT_NAME: string;
  OBJECT_ID: string;
  NORAD_CAT_ID: number;
  EPOCH: string;
  MEAN_MOTION: number;
  INCLINATION: number;
}

// Simplified position calculation
function getSatellitePosition(tle: TLEData): { lat: number; lon: number; alt: number } | null {
  try {
    const epoch = new Date(tle.EPOCH).getTime();
    const now = Date.now();
    const minutesSinceEpoch = (now - epoch) / 60000;
    
    // Simplified orbit calculation
    const meanAnomaly = (minutesSinceEpoch * tle.MEAN_MOTION / 1440 * 360) % 360;
    const inclinationRad = (tle.INCLINATION * Math.PI) / 180;
    const meanAnomalyRad = (meanAnomaly * Math.PI) / 180;
    
    const lat = Math.asin(Math.sin(inclinationRad) * Math.sin(meanAnomalyRad)) * 180 / Math.PI;
    const lon = ((meanAnomaly * 0.25) % 360) - 180;
    
    // Approximate altitude from orbital period
    const periodMinutes = 1440 / tle.MEAN_MOTION;
    const altitude = Math.pow(398600.4418 * Math.pow(periodMinutes * 60, 2) / (4 * Math.PI * Math.PI), 1/3) - 6371;
    
    return { lat, lon, alt: Math.max(altitude * 1000, 200000) };
  } catch (e) {
    return null;
  }
}

export const fetchCelesTrak = action({
  args: { group: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await fetch(
        `https://celestrak.org/NORAD/elements/gp.php?GROUP=${args.group}&FORMAT=JSON`
      );
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const satellites: TLEData[] = await response.json();
      console.log(`Fetched ${satellites.length} satellites from CelesTrak (${args.group})`);

      const events = satellites
        .map((sat) => {
          const pos = getSatellitePosition(sat);
          if (!pos) return null;

          const name = sat.OBJECT_NAME.toUpperCase();
          let satType = 'Satellite';
          if (name.includes('ISS') || name.includes('TIANGONG')) satType = 'Space Station';
          else if (name.includes('GPS') || name.includes('NAVSTAR')) satType = 'GPS';
          else if (name.includes('STARLINK')) satType = 'Starlink';
          else if (name.includes('HUBBLE')) satType = 'Telescope';

          return {
            eventType: "satellite",
            timestamp: Date.now(),
            latitude: pos.lat,
            longitude: pos.lon,
            altitude: pos.alt,
            title: sat.OBJECT_NAME.trim(),
            description: `${satType} - NORAD ${sat.NORAD_CAT_ID}`,
            sourceName: "CelesTrak",
            license: "CC0-1.0",
            attributionText: "CelesTrak",
            retrievalTime: Date.now(),
            confidenceScore: 0.95,
            dataQuality: "high",
            propertiesJson: JSON.stringify({
              noradId: sat.NORAD_CAT_ID,
              type: satType,
            }),
          };
        })
        .filter((e): e is NonNullable<typeof e> => e !== null);

      await ctx.runMutation(api.events.createMany, { events });
      return { success: true, count: events.length, group: args.group };
    } catch (error) {
      console.error("CelesTrak fetch failed:", error);
      return { success: false, error: String(error), count: 0, group: args.group };
    }
  },
});

export const fetchAllSatellites = action({
  args: {},
  handler: async (ctx) => {
    const groups = ['visual', 'stations', 'gps-ops'];
    const results: Record<string, number> = {};
    
    for (const group of groups) {
      try {
        const result = await ctx.runAction(api.ingest_satellite.fetchCelesTrak, { group });
        if (result.success) {
          results[group] = result.count;
        }
        await new Promise(r => setTimeout(r, 500));
      } catch (e) {
        console.error(`Failed to fetch ${group}:`, e);
      }
    }

    return { total: Object.values(results).reduce((a, b) => a + b, 0), byGroup: results };
  },
});
