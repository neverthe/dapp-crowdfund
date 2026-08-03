import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUBGRAPH_URL: 'https://api.studio.thegraph.com/query/1757085/crowdfund-staking-sepolia/v0.0.3',
  },
};

export default nextConfig;
