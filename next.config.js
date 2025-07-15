/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,
  
  // Configure images
  images: {
    domains: [
      'images.unsplash.com',
      'source.unsplash.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'ui-avatars.com',
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400, // 24 hours
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance optimizations
  compress: true,
  generateEtags: true,
  poweredByHeader: false,
  generateBuildId: () => 'build',
  
  // Disable React DevTools in production for better performance
  reactProductionProfiling: false,
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configure webpack
  webpack: (config, { isServer, dev }) => {
    // Optimize CSS loading
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss)$/,
        chunks: 'all',
        enforce: true,
      };
    }

    // File loaders for different file types
    const fileLoader = (folder) => ({
      loader: 'file-loader',
      options: {
        publicPath: `/_next/static/${folder}/`,
        outputPath: `${isServer ? '../' : ''}static/${folder}/`,
        name: '[name]-[contenthash].[ext]',
        esModule: false,
      },
    });

    // Add file loaders
    [
      { test: /\.(mp3|wav|m4a|ogg)$/, folder: 'audio' },
      { test: /\.(mp4|webm|ogv|mov)$/, folder: 'videos' },
      { test: /\.(pdf|docx?|xlsx?|pptx?|zip|rar|7z)$/, folder: 'files' },
    ].forEach(({ test, folder }) => {
      config.module.rules.push({
        test,
        use: fileLoader(folder),
      });
    });

    // Support for .node files
    config.module.rules.push({
      test: /\.node$/,
      use: 'node-loader',
    });

    // WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    // Source maps in development only
    if (!isServer) {
      config.devtool = dev ? 'cheap-module-source-map' : false;
    }

    // Optimize moment.js and other large libraries
    config.plugins.push(
      new (require('webpack').ContextReplacementPlugin)(
        /moment[/\\]locale$/,
        /en|fr/,
      ),
    );

    return config;
  },
};

// Bundle analyzer for production builds
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,
  });
  module.exports = withBundleAnalyzer(nextConfig);
} else {
  module.exports = nextConfig;
}
