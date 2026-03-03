import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000, // Verifica se algo mudou a cada 1 segundo
        aggregateTimeout: 300, // Aguarda 300ms antes de recriar a tela
      };
    }
    return config;
  },
};

export default nextConfig;