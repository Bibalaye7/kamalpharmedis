/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    // L'optimiseur d'images Next.js tourne dans le conteneur frontend, où "localhost:8000"
    // ne joint pas le backend (réseau Docker) : on sert les images produits telles quelles,
    // le navigateur les charge directement depuis leur URL publique.
    unoptimized: true,
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "8000" },
      { protocol: "http", hostname: "backend", port: "8000" },
      { protocol: "http", hostname: "localhost", port: "80" },
      { protocol: "http", hostname: "localhost" },
    ],
  },
};

export default nextConfig;
