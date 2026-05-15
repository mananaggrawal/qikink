import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "*.digitaloceanspaces.com" },
      { protocol: "https", hostname: "*.qikink.com" },
    ],
  },
  serverExternalPackages: ["fabric", "@imgly/background-removal-node", "onnxruntime-node"],
};

export default nextConfig;
