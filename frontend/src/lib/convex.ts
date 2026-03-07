import { ConvexReactClient } from "convex/react";

// Get the Convex URL from environment
const convexUrl = import.meta.env.VITE_CONVEX_URL;

if (!convexUrl) {
  throw new Error("Missing VITE_CONVEX_URL. Configure it in the root .env.local file or your deployment environment.");
}

export const convex = new ConvexReactClient(convexUrl);
