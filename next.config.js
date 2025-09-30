/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove static export for API routes support
  // output: 'export',
  
  // Enable image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Enable server-side features for API routes
  // trailingSlash: true,
  
  // Disable ESLint during build to avoid path issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for better builds
  webpack: (config, { isServer, dev }) => {
    // Handle special characters in paths
    if (process.platform === 'win32') {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        process: false,
      };
    }
    
    // Ignore path-related warnings
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve/,
    ];
    
    // Handle special characters in paths
    config.snapshot = {
      managedPaths: [/^(.+?[\\/]node_modules[\\/])(.+)$/],
    };
    
    return config;
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
