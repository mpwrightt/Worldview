import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    eventType: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.eventType) {
      return await ctx.db
        .query("events")
        .withIndex("by_type", (q) => q.eq("eventType", args.eventType))
        .order("desc")
        .take(args.limit || 500);
    }
    return await ctx.db
      .query("events")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit || 500);
  },
});

export const get = query({
  args: { id: v.id("events") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createMany = mutation({
  args: {
    events: v.array(v.object({
      eventType: v.string(),
      timestamp: v.number(),
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      altitude: v.optional(v.number()),
      title: v.string(),
      description: v.optional(v.string()),
      sourceName: v.string(),
      sourceUrl: v.optional(v.string()),
      license: v.string(),
      licenseUrl: v.optional(v.string()),
      attributionText: v.string(),
      retrievalTime: v.number(),
      confidenceScore: v.number(),
      dataQuality: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
      propertiesJson: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const ids = [];
    for (const event of args.events) {
      const id = await ctx.db.insert("events", {
        ...event,
        ingestTime: Date.now(),
        schemaVersion: "1.0.0",
      });
      ids.push(id);
    }
    return ids;
  },
});

export const stats = query({
  args: {},
  handler: async (ctx) => {
    const events = await ctx.db.query("events").collect();
    const byType: Record<string, number> = {};
    for (const e of events) {
      byType[e.eventType] = (byType[e.eventType] || 0) + 1;
    }
    return { total: events.length, byType };
  },
});

export const cleanup = mutation({
  args: { olderThan: v.number() },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_timestamp", (q) => q.lt("timestamp", args.olderThan))
      .collect();
    for (const event of events) {
      await ctx.db.delete(event._id);
    }
    return { deleted: events.length };
  },
});
