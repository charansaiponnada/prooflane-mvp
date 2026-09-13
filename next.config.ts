import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  rewrites() {
    return [{ source: "/pitch.html", destination: "/pitch" }];
  },
};

export default nextConfig;
