/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['drive.google.com', 'youtube.com', 'img.youtube.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Development optimizations
  compress: process.env.NODE_ENV === 'production',
  poweredByHeader: false,
  // Fix for Vercel deployment
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  async headers() {
    const isDevelopment = process.env.NODE_ENV === 'development'

    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Generator',
            value: 'DIU Learning Platform',
          },
          {
            key: 'X-Creator',
            value: 'DIU CSE Department',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // Disable caching in development
          ...(isDevelopment ? [{
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          }] : []),
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=300, s-maxage=600',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: isDevelopment
              ? 'no-cache, no-store, must-revalidate'
              : 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
