import { ConvexReactClient } from "convex/react";

// Get the Convex URL from environment
const convexUrl = import.meta.env.VITE_CONVEX_URL || "https://moonlit-oriole-185.convex.cloud";

export const convex = new ConvexReactClient(convexUrl);
