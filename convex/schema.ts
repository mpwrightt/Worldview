import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  events: defineTable({
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
    dataQuality: v.string(),
    // Store properties as JSON string to avoid validation issues
    propertiesJson: v.optional(v.string()),
    ingestTime: v.number(),
    schemaVersion: v.string(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["eventType"]),
});
