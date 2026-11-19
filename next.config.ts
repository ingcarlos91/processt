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
  // El botón de Next.js en desarrollo tapaba el avatar del menú (abajo a la izquierda).
  devIndicators: { position: "bottom-right" },
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: { serverActions: { bodySizeLimit: "12mb" } },
};

export default nextConfig;
