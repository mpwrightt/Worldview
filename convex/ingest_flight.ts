import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

// Simple base64 encoder for Basic Auth (Buffer not available in Convex actions)
function btoa(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  let i = 0;
  while (i < str.length) {
    const a = str.charCodeAt(i++);
    const b = i < str.length ? str.charCodeAt(i++) : 0;
    const c = i < str.length ? str.charCodeAt(i++) : 0;
    const bitmap = (a << 16) | (b << 8) | c;
    result += chars.charAt((bitmap >> 18) & 63);
    result += chars.charAt((bitmap >> 12) & 63);
    result += i - 2 < str.length ? chars.charAt((bitmap >> 6) & 63) : '=';
    result += i - 1 < str.length ? chars.charAt(bitmap & 63) : '=';
  }
  return result;
}

export const fetchOpenSky = action({
  args: {},
  handler: async (ctx) => {
    const username = process.env.OPENSKY_USERNAME;
    const password = process.env.OPENSKY_PASSWORD;

    if (!username || !password) {
      console.error("Missing OPENSKY_USERNAME or OPENSKY_PASSWORD");
      return { success: false, error: "Missing credentials", count: 0 };
    }

    try {
      const auth = btoa(`${username}:${password}`);
      
      const response = await fetch("https://opensky-network.org/api/states/all", {
        headers: {
          "Authorization": `Basic ${auth}`,
          "User-Agent": "WorldViewOSINT/1.0 (research project)",
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      const flights = data.states?.filter((state: any[]) => 
        state[5] !== null && state[6] !== null // has lat/lon
      ).slice(0, 500) || [];
      
      console.log(`Fetched ${flights.length} flights from OpenSky`);

      const events = flights.map((flight: any[]) => ({
        eventType: "flight",
        timestamp: Date.now(),
        latitude: flight[6],
        longitude: flight[5],
        altitude: (flight[7] || 0) * 0.3048, // feet to meters
        title: `Flight ${flight[1]?.trim() || "UNKNOWN"}`,
        description: `Velocity: ${Math.round((flight[9] || 0) * 1.852)} km/h`,
        sourceName: "OpenSky Network",
        sourceUrl: "https://opensky-network.org",
        license: "CC-BY-SA-4.0",
        licenseUrl: "https://opensky-network.org/community/faq/",
        attributionText: "OpenSky Network",
        retrievalTime: Date.now(),
        confidenceScore: 0.9,
        dataQuality: "high" as const,
        propertiesJson: JSON.stringify({
          callsign: flight[1]?.trim() || "UNKNOWN",
          velocity: flight[9] || 0,
          track: flight[10] || 0,
          icao24: flight[0],
          originCountry: flight[2],
          onGround: flight[8],
          verticalRate: flight[11],
          squawk: flight[14],
        }),
      }));

      await ctx.runMutation(api.events.createMany, { events });

      return { success: true, count: events.length };
    } catch (error) {
      console.error("OpenSky fetch failed:", error);
      return { success: false, error: String(error), count: 0 };
    }
  },
});

// Scheduled version for periodic updates
export const scheduledFetch = action({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.runAction(api.ingest_flight.fetchOpenSky, {});
    console.log("Scheduled OpenSky fetch:", result);
    return result;
  },
});
