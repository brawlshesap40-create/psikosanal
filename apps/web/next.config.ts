import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["iyzipay"],
  transpilePackages: ["@psikosanal/db", "@psikosanal/core"],
};

export default nextConfig;
