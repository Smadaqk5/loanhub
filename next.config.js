/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Netlify deployment
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Disable server-side features for static export
  trailingSlash: true,
  
  // Environment variables that should be available in the browser
  env: {
    NEXT_PUBLIC_PESAPAL_BASE_URL: process.env.NEXT_PUBLIC_PESAPAL_BASE_URL,
    NEXT_PUBLIC_PESAPAL_CONSUMER_KEY: process.env.NEXT_PUBLIC_PESAPAL_CONSUMER_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
  
  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  
  // Experimental features
  experimental: {
    // Enable modern bundling
    esmExternals: true,
  },
}

module.exports = nextConfig
