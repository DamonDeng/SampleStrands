/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable static export for Electron
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Add trailing slash to work with Electron's file:// protocol
  trailingSlash: true,
  
  // Disable server-side features that don't work in Electron
  experimental: {
    esmExternals: false,
  },
  
  // Configure asset prefix for production builds
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : '',
  
  // Webpack configuration for Electron compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Resolve fallbacks for Node.js modules in the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }

    // Exclude code_reference folder from build
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /code_reference/,
    });

    return config;
  },
  
  // Disable strict mode to avoid double rendering in development
  reactStrictMode: false,
  
  // Configure base path for static export
  basePath: '',
  

};

module.exports = nextConfig;
