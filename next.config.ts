import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The default merge puts every Arc component's CSS module into one sheet that
    // blocks rendering on every page; graph mode keeps each route to what it uses.
    cssChunking: "graph",
  },
  images: {
    // AVIF first: roughly a fifth smaller than WebP, which matters most on slow connections.
    formats: ["image/avif", "image/webp"],
    qualities: [75],
  },
  cacheLife: {
    // Shared lifetime for all Notion-backed content (blog + projects).
    // Pages refresh in the background every 5 minutes; /api/revalidate
    // can expire the "posts" or "projects" tags immediately.
    content: {
      stale: 300, // client router reuses a page for up to 5 minutes; App Shells only carry content with stale >= 5 minutes
      revalidate: 300, // server refreshes in the background after 5 minutes
      expire: 86400, // after 1 day without traffic, the next request waits for fresh data
    },
  },
};

export default nextConfig;
