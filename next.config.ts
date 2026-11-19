import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App interna 100% dinámica: sin Cache Components para simplificar el acceso a BD en páginas.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: { serverActions: { bodySizeLimit: "3mb" } },
};

export default nextConfig;
