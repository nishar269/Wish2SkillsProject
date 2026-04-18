import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    // Used by the client-side PWA cleanup gate. Pick a build-time identifier that changes per deploy.
    NEXT_PUBLIC_DEPLOY_ID:
      process.env.NEXT_PUBLIC_DEPLOY_ID ??
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.GITHUB_SHA ??
      process.env.RENDER_GIT_COMMIT ??
      process.env.COMMIT_SHA ??
      process.env.BUILD_ID ??
      "dev",
  },
  async headers() {
    return [
      {
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
      {
        source: "/login",
        headers: [{ key: "Cache-Control", value: "no-store, max-age=0" }],
      },
    ];
  },
  //  output: 'standalone',
  serverExternalPackages: ["@prisma/client", ".prisma", "encoding"],
};

export default nextConfig;
