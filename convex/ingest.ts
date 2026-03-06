import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Ingest flight data from external APIs
export const ingestFlights = action({
  args: {
    source: v.string(), // "opensky", "adsbexchange"
    bbox: v.optional(
      v.object({
        minLat: v.number(),
        maxLat: v.number(),
        minLon: v.number(),
        maxLon: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    // This would call the external API
    // For now, create sample data
    const sampleFlights = [
      {
        eventType: "flight",
        timestamp: now,
        latitude: 51.47,
        longitude: -0.46,
        altitude: 3000,
        title: "BAW123",
        description: "British Airways flight LHR-JFK",
        properties: {
          icao24: "a1b2c3",
          callsign: "BAW123",
          type: "commercial",
          aircraft: "Boeing 777",
        },
        sourceName: args.source === "adsbexchange" ? "ADS-B Exchange" : "OpenSky",
        license: args.source === "adsbexchange" ? "Research-Only" : "ODbL-1.0",
        attributionText: args.source === "adsbexchange" 
          ? "ADS-B Exchange" 
          : "OpenSky Network",
        retrievalTime: now,
        confidenceScore: 0.95,
        dataQuality: "high" as const,
      },
      {
        eventType: "flight",
        timestamp: now,
        latitude: 51.48,
        longitude: -0.20,
        altitude: 8000,
        title: "RCH452",
        description: "USAF C-17 Globemaster III",
        properties: {
          icao24: "ae1234",
          callsign: "RCH452",
          type: "military",
          operator: "USAF",
          aircraft: "C-17",
        },
        sourceName: "ADS-B Exchange",
        license: "Research-Only",
        attributionText: "ADS-B Exchange",
        retrievalTime: now,
        confidenceScore: 0.9,
        dataQuality: "high" as const,
      },
    ];
    
    // Insert into database
    const ids = await ctx.runMutation(api.events.createMany, {
      events: sampleFlights,
    });
    
    return { ingested: ids.length, ids };
  },
});

// Ingest satellite data from CelesTrak
export const ingestSatellites = action({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    
    const sampleSatellites = [
      {
        eventType: "satellite" as const,
        timestamp: now,
        latitude: 0,
        longitude: 0,
        altitude: 20200000,
        title: "USA-309 (GPS III)",
        description: "GPS Block III satellite",
        properties: {
          noradId: "46800",
          name: "USA-309",
          type: "GPS Block III",
          operator: "US Space Force",
        },
        sourceName: "CelesTrak",
        license: "CC0-1.0",
        attributionText: "Data provided by CelesTrak",
        retrievalTime: now,
        confidenceScore: 0.99,
        dataQuality: "high" as const,
      },
    ];
    
    const ids = await ctx.runMutation(api.events.createMany, {
      events: sampleSatellites,
    });
    
    return { ingested: ids.length, ids };
  },
});

// Ingest CCTV camera data
export const ingestCCTV = action({
  args: {
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const sampleCameras = [
      {
        eventType: "cctv" as const,
        timestamp: now,
        latitude: 51.5074,
        longitude: -0.1278,
        title: "CCTV: Trafalgar Square",
        description: "London traffic camera",
        properties: {
          cameraId: "tfl_001",
          location: "Trafalgar Square",
          city: "London",
          network: "TfL",
          imageUrl: "https://example.com/cctv1.jpg",
        },
        sourceName: "Transport for London",
        license: "CC-BY-4.0",
        attributionText: "Transport for London",
        retrievalTime: now,
        confidenceScore: 1.0,
        dataQuality: "high" as const,
      },
      {
        eventType: "cctv" as const,
        timestamp: now,
        latitude: 51.5009,
        longitude: -0.1221,
        title: "CCTV: Westminster Bridge",
        description: "London traffic camera",
        properties: {
          cameraId: "tfl_004",
          location: "Westminster Bridge",
          city: "London",
          network: "TfL",
          imageUrl: "https://example.com/cctv2.jpg",
        },
        sourceName: "Transport for London",
        license: "CC-BY-4.0",
        attributionText: "Transport for London",
        retrievalTime: now,
        confidenceScore: 1.0,
        dataQuality: "high" as const,
      },
    ];
    
    const ids = await ctx.runMutation(api.events.createMany, {
      events: sampleCameras,
    });
    
    return { ingested: ids.length, ids };
  },
});

// Scheduled ingestion (would be triggered by a cron job)
export const scheduledIngest = action({
  args: {},
  handler: async (ctx) => {
    const results = {
      flights: 0,
      satellites: 0,
      cctv: 0,
    };
    
    // Get enabled sources
    const sources = await ctx.runQuery(api.sources.list, { enabledOnly: true });
    
    for (const source of sources) {
      try {
        switch (source.category) {
          case "flight":
            const flightResult = await ctx.runAction(api.ingest.ingestFlights, {
              source: source.feedId,
            });
            results.flights += flightResult.ingested;
            break;
          case "satellite":
            const satResult = await ctx.runAction(api.ingest.ingestSatellites, {});
            results.satellites += satResult.ingested;
            break;
          case "geo_context":
            if (source.feedId.includes("cctv")) {
              const cctvResult = await ctx.runAction(api.ingest.ingestCCTV, {});
              results.cctv += cctvResult.ingested;
            }
            break;
        }
      } catch (e) {
        console.error(`Failed to ingest from ${source.feedId}:`, e);
      }
    }
    
    return results;
  },
});
