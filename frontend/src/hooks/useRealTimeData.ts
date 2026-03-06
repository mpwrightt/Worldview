import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

// Hook to get real flight data from Convex
export function useRealTimeFlights(limit = 500) {
  const flights = useQuery(api.events.list, { 
    eventType: "flight",
    limit 
  });
  
  return flights || [];
}

// Hook to get real satellite data from Convex
export function useRealTimeSatellites(limit = 200) {
  const satellites = useQuery(api.events.list, { 
    eventType: "satellite",
    limit 
  });
  
  return satellites || [];
}

// Hook to get all real-time data
export function useAllRealTimeData() {
  const events = useQuery(api.events.list, { limit: 1000 });
  const stats = useQuery(api.events.stats);
  
  return {
    events: events || [],
    stats: stats || { total: 0, byType: {} },
    isLoading: events === undefined,
  };
}
