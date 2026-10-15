import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  cacheLife: {
    // Shared lifetime for all Notion-backed content (blog + projects).
    // Pages refresh in the background every 5 minutes; /api/revalidate
    // can expire the "posts" or "projects" tags immediately.
    content: {
      stale: 60, // client router reuses a page for up to 1 minute
      revalidate: 300, // server refreshes in the background after 5 minutes
      expire: 86400, // after 1 day without traffic, the next request waits for fresh data
    },
  },
};

export default nextConfig;
