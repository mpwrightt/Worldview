import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Query tracks
export const list = query({
  args: {
    entityType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tracks;
    
    if (args.entityType) {
      tracks = await ctx.db
        .query("tracks")
        .withIndex("by_type", (q) => q.eq("entityType", args.entityType))
        .take(args.limit || 100);
    } else {
      tracks = await ctx.db
        .query("tracks")
        .order("desc")
        .take(args.limit || 100);
    }
    
    return tracks;
  },
});

// Get track by ID
export const get = query({
  args: { id: v.id("tracks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get track by entity ID
export const getByEntity = query({
  args: { entityId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tracks")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .first();
  },
});

// Create or update track
export const upsert = mutation({
  args: {
    entityId: v.string(),
    entityType: v.string(),
    point: v.object({
      timestamp: v.number(),
      latitude: v.number(),
      longitude: v.number(),
      altitude: v.optional(v.number()),
      velocity: v.optional(v.number()),
      heading: v.optional(v.number()),
    }),
    properties: v.optional(v.record(v.string(), v.any())),
    sourceName: v.string(),
  },
  handler: async (ctx, args) => {
    // Find existing track
    const existing = await ctx.db
      .query("tracks")
      .withIndex("by_entity", (q) => q.eq("entityId", args.entityId))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      // Update existing track
      const points = [...existing.points, args.point];
      
      // Keep only last 1000 points
      const trimmedPoints = points.slice(-1000);
      
      await ctx.db.patch(existing._id, {
        points: trimmedPoints,
        currentLatitude: args.point.latitude,
        currentLongitude: args.point.longitude,
        currentAltitude: args.point.altitude,
        endTime: args.point.timestamp,
        lastUpdate: now,
        properties: args.properties || existing.properties,
      });
      
      return existing._id;
    } else {
      // Create new track
      return await ctx.db.insert("tracks", {
        entityId: args.entityId,
        entityType: args.entityType,
        startTime: args.point.timestamp,
        endTime: args.point.timestamp,
        points: [args.point],
        currentLatitude: args.point.latitude,
        currentLongitude: args.point.longitude,
        currentAltitude: args.point.altitude,
        sourceName: args.sourceName,
        properties: args.properties || {},
        lastUpdate: now,
      });
    }
  },
});

// Get active tracks (updated recently)
export const getActive = query({
  args: {
    since: v.number(), // timestamp
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_time")
      .collect();
    
    return tracks
      .filter((t) => t.lastUpdate >= args.since)
      .slice(0, args.limit || 100);
  },
});
