import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all sources
export const list = query({
  args: {
    enabledOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let sources;
    
    if (args.enabledOnly) {
      sources = await ctx.db
        .query("sources")
        .withIndex("by_enabled", (q) => q.eq("enabled", true))
        .collect();
    } else {
      sources = await ctx.db.query("sources").collect();
    }
    
    return sources;
  },
});

// Get source by feed ID
export const getByFeedId = query({
  args: { feedId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("sources")
      .withIndex("by_feed_id", (q) => q.eq("feedId", args.feedId))
      .first();
  },
});

// Create or update source
export const upsert = mutation({
  args: {
    feedId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(),
    providerName: v.string(),
    providerUrl: v.optional(v.string()),
    documentationUrl: v.optional(v.string()),
    license: v.string(),
    licenseUrl: v.optional(v.string()),
    redistribution: v.string(),
    attributionText: v.string(),
    apiEndpoint: v.optional(v.string()),
    updateIntervalSeconds: v.number(),
    historicalDepthDays: v.number(),
    enabled: v.boolean(),
    requiresApiKey: v.boolean(),
    researchOnly: v.boolean(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("sources")
      .withIndex("by_feed_id", (q) => q.eq("feedId", args.feedId))
      .first();
    
    if (existing) {
      await ctx.db.patch(existing._id, args);
      return existing._id;
    } else {
      return await ctx.db.insert("sources", args);
    }
  },
});

// Enable/disable source
export const setEnabled = mutation({
  args: {
    feedId: v.string(),
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db
      .query("sources")
      .withIndex("by_feed_id", (q) => q.eq("feedId", args.feedId))
      .first();
    
    if (source) {
      await ctx.db.patch(source._id, { enabled: args.enabled });
    }
    
    return { success: !!source };
  },
});

// Accept terms for a source
export const acceptTerms = mutation({
  args: {
    feedId: v.string(),
    acceptedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db
      .query("sources")
      .withIndex("by_feed_id", (q) => q.eq("feedId", args.feedId))
      .first();
    
    if (source) {
      await ctx.db.patch(source._id, {
        termsAcceptedAt: Date.now(),
        termsAcceptedBy: args.acceptedBy,
      });
    }
    
    return { success: !!source };
  },
});

// Initialize default sources
export const initDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const defaults = [
      {
        feedId: "celestrak_gp",
        name: "CelesTrak GP Data",
        description: "General perturbations orbital elements (TLE)",
        category: "satellite",
        providerName: "CelesTrak",
        providerUrl: "https://celestrak.org",
        documentationUrl: "https://celestrak.org/columns/v04n03/",
        apiEndpoint: "https://celestrak.org/NORAD/elements/",
        license: "CC0-1.0",
        redistribution: "unlimited",
        attributionText: "Data provided by CelesTrak",
        updateIntervalSeconds: 3600,
        historicalDepthDays: 30,
        enabled: true,
        requiresApiKey: false,
        researchOnly: false,
      },
      {
        feedId: "opensky",
        name: "OpenSky Network",
        description: "Flight tracking data",
        category: "flight",
        providerName: "OpenSky Network",
        providerUrl: "https://opensky-network.org",
        documentationUrl: "https://opensky-network.org/apidoc/",
        apiEndpoint: "https://opensky-network.org/api/",
        license: "ODbL-1.0",
        redistribution: "research_only",
        attributionText: "Data from OpenSky Network",
        updateIntervalSeconds: 5,
        historicalDepthDays: 30,
        enabled: false,
        requiresApiKey: true,
        researchOnly: true,
      },
      {
        feedId: "adsbexchange",
        name: "ADS-B Exchange",
        description: "Military and civilian aircraft tracking",
        category: "flight",
        providerName: "ADS-B Exchange",
        providerUrl: "https://adsbexchange.com",
        documentationUrl: "https://www.adsbexchange.com/price/",
        apiEndpoint: "https://api.adsbexchange.com/v2/",
        license: "Research-Only",
        redistribution: "attribution",
        attributionText: "Data from ADS-B Exchange",
        updateIntervalSeconds: 1,
        historicalDepthDays: 7,
        enabled: false,
        requiresApiKey: true,
        researchOnly: false,
      },
    ];
    
    for (const source of defaults) {
      const existing = await ctx.db
        .query("sources")
        .withIndex("by_feed_id", (q) => q.eq("feedId", source.feedId))
        .first();
      
      if (!existing) {
        await ctx.db.insert("sources", source);
      }
    }
    
    return { success: true };
  },
});

// Get compliance checklist
export const getComplianceChecklist = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("sources").collect();
    
    return {
      generatedAt: Date.now(),
      feeds: sources.map((s) => ({
        feedId: s.feedId,
        name: s.name,
        license: s.license,
        redistribution: s.redistribution,
        enabled: s.enabled,
        complianceItems: [
          {
            item: "Terms accepted",
            status: s.termsAcceptedAt ? "pass" : s.requiresApiKey ? "fail" : "info",
            details: s.termsAcceptedAt
              ? `Accepted by ${s.termsAcceptedBy} at ${s.termsAcceptedAt}`
              : "Terms acceptance required but not recorded",
          },
          {
            item: "Attribution",
            status: "info",
            details: `Must display: ${s.attributionText}`,
          },
          ...(s.researchOnly
            ? [
                {
                  item: "Use restriction",
                  status: "warning",
                  details: "Feed restricted to non-commercial research use only",
                },
              ]
            : []),
        ],
      })),
    };
  },
});
