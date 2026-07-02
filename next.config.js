/** @type {import('next').NextConfig} */
const nextConfig = {
  // ==========================================
  // TYPESCRIPT & ESLINT
  // ==========================================
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: false,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },

  // ==========================================
  // COMPILER OPTIONS
  // ==========================================
  swcMinify: true, // Enable SWC minification
  compress: true, // Enable gzip compression

  // ==========================================
  // IMAGE OPTIMIZATION
  // ==========================================
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'books.googleusercontent.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'https', hostname: 'i.scdn.co' },
      { protocol: 'https', hostname: 'mosaic.scdn.co' },
      { protocol: 'https', hostname: 'www.gutenberg.org' },
      { protocol: 'https', hostname: 'ipfs.io' },
      { protocol: 'https', hostname: 'static01.nyt.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    disableStaticImages: false,
  },

  // ==========================================
  // HEADERS & SECURITY
  // ==========================================
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          // DNS Prefetch Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Strict Transport Security
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // CSP
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://books.google.com https://books.googleusercontent.com https://covers.openlibrary.org https://image.tmdb.org https://*.scdn.co https://*.spotifycdn.com https://www.gutenberg.org https://static01.nyt.com; font-src 'self'; connect-src 'self' https://api.themoviedb.org https://api.spotify.com https://openlibrary.org;",
          },
          // Frame Options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Content Type Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // XSS Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // API routes CORS
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // ==========================================
  // REDIRECTS
  // ==========================================
  async redirects() {
    return [
      // Redirect /home to /
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Redirect old reader route
      {
        source: '/book/:id',
        destination: '/reader/:id',
        permanent: true,
      },
    ];
  },

  // ==========================================
  // REWRITES (API Proxy if needed)
  // ==========================================
  async rewrites() {
    return [
      // Example: Proxy external API to avoid CORS
      // {
      //   source: '/api/external/:path*',
      //   destination: 'https://external-api.com/:path*',
      // },
    ];
  },

  // ==========================================
  // WEBPACK CONFIGURATION
  // ==========================================
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Handle canvas for PDF.js (server-side)
    if (isServer) {
      config.externals.push('canvas');
    }

    // Fallback for Node.js modules in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: false,
    };

    // Bundle analyzer (only in production builds)
    if (!dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },

  experimental: {
    // Parsers nativos/CommonJS que NO deben empaquetarse con webpack.
    // Si se bundlean, pdf-parse lanza "Object.defineProperty called on non-object".
    serverComponentsExternalPackages: ['pdf-parse', 'epub2'],

    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
    ],
    
    // Enable turbo mode (faster builds)
    // turbotrace: {
    //   logLevel: 'error',
    // },
  },

  // ==========================================
  // ENVIRONMENT VARIABLES
  // ==========================================
  env: {
    // Public env vars (accessible in browser)
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  },

  // ==========================================
  // OUTPUT
  // ==========================================
  // Output standalone for Docker
  // output: 'standalone',

  // ==========================================
  // LOGGING
  // ==========================================
  // Disable logging for specific routes
  // logging: {
  //   fetches: {
  //     fullUrl: true,
  //   },
  // },

  // ==========================================
  // MISC
  // ==========================================
  // Disable powered by header
  poweredByHeader: false,
  
  // Generate ETags for pages
  generateEtags: true,
  
  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Trailing slash
  trailingSlash: false,
  
  // Strict mode
  reactStrictMode: true,
};

module.exports = nextConfig;
