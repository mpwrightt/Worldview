import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function parseProperties(propertiesJson?: string) {
  if (!propertiesJson) {
    return {};
  }

  try {
    const parsed = JSON.parse(propertiesJson);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function normalizeEvents<T extends Array<Record<string, any>> | undefined>(events: T) {
  if (!events) {
    return [];
  }

  return events.map((event) => ({
    ...event,
    properties: event.properties ?? parseProperties(event.propertiesJson),
  }));
}

// Hook to get real flight data from Convex
export function useRealTimeFlights(limit = 500) {
  const flights = useQuery(api.events.list, { 
    eventType: "flight",
    limit 
  });
  
  return normalizeEvents(flights);
}

// Hook to get real satellite data from Convex
export function useRealTimeSatellites(limit = 200) {
  const satellites = useQuery(api.events.list, { 
    eventType: "satellite",
    limit 
  });
  
  return normalizeEvents(satellites);
}

// Hook to get all real-time data
export function useAllRealTimeData() {
  const events = useQuery(api.events.list, { limit: 1000 });
  const stats = useQuery(api.events.stats);
  
  return {
    events: normalizeEvents(events),
    stats: stats || { total: 0, byType: {} },
    isLoading: events === undefined,
  };
}
