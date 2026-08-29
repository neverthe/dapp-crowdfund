import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '192.168.43.134',
    'localhost',
  ],
  env: {
    NEXT_PUBLIC_SUBGRAPH_URL: 'https://api.studio.thegraph.com/query/1757085/crowdfund-staking-base/v0.2',
  },
};

export default nextConfig;
