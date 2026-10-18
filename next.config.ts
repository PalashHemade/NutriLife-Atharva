import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a self-contained .next/standalone server bundle with only the
  // node_modules it actually needs - this is what keeps the Docker image
  // small instead of shipping the entire node_modules tree.
  output: "standalone",
};

export default nextConfig;
