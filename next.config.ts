import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure CSS and JS are properly served
  experimental: {
    optimizeCss: false, // Disable CSS optimization for debugging
  },
  
  // Force static optimization for CSS
  staticPageGenerationTimeout: 60,
  
  // Disable image optimization for debugging
  images: {
    unoptimized: true,
  },
  
  // Enable verbose logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
};

export default nextConfig;