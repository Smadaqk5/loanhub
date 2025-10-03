/** @type {import('next').NextConfig} */
const nextConfig = {
  // Set output directory to avoid path issues
  distDir: '.next',
  
  // Enable image optimization
  images: {
    domains: ['localhost'],
  },
  
  // Disable ESLint during build to avoid path issues
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Disable TypeScript type checking during build
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Webpack configuration for better builds
  webpack: (config, { isServer }) => {
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
    
    // Fix for Windows paths with exclamation marks
    config.cache = {
      ...config.cache,
      cacheDirectory: config.cache?.cacheDirectory?.replace(/!/g, '') || 'node_modules/.cache/webpack',
    };
    
    // Ignore path-related warnings
    config.ignoreWarnings = [
      /Failed to parse source map/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Can't resolve/,
      /contains exclamation mark/,
    ];
    
    return config;
  },
}

module.exports = nextConfig
