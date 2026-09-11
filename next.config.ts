import type { NextConfig } from 'next'
import { legacyRedirects } from './src/lib/legacy-redirects'

const nextConfig: NextConfig = {
    // experimental features disabled — require Next.js canary
    // experimental: { ppr: true, reactCompiler: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: '**.hscicdn.com' },
            { protocol: 'https', hostname: '**.skysports.com' },
            { protocol: 'https', hostname: '**.google.com' },
            { protocol: 'https', hostname: '**.gstatic.com' },
            { protocol: 'https', hostname: '**.googleusercontent.com' },
            { protocol: 'https', hostname: '**.bing.com' },
            { protocol: 'https', hostname: '**.yimg.com' },
            { protocol: 'https', hostname: '**.tosshub.com' },
            { protocol: 'https', hostname: '**.indiatoday.in' },
            { protocol: 'https', hostname: '**.ndtvimg.com' },
            { protocol: 'https', hostname: '**.hindustantimes.com' },
            { protocol: 'https', hostname: '**.news18.com' },
            { protocol: 'https', hostname: '**.jagranimages.com' },
            { protocol: 'https', hostname: '**.espncdn.com' },
            { protocol: 'https', hostname: '**.reuters.com' },
            { protocol: 'https', hostname: '**.bbc.co.uk' },
            { protocol: 'https', hostname: '**.bbci.co.uk' },
        ],


        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 2592000, // 30 days — prevents re-optimization of unchanged images
        deviceSizes: [640, 828, 1200, 1920], // Reduced from 6 to 4 (removed 750, 1080 as redundant)
        imageSizes: [16, 32, 48, 64, 96, 128, 256], // Small sizes for thumbnails & avatars
    },
    headers: async () => [
        {
            source: '/(.*)',
            headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
            ],
        },
        {
            // Optimized images — cache for 30 days on CDN + browser, stale for 7 days
            source: '/_next/image(.*)',
            headers: [
                { key: 'Cache-Control', value: 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800, immutable' },
            ],
        },
        {
            // Static assets (JS/CSS bundles) — immutable, cache forever
            source: '/_next/static/(.*)',
            headers: [
                { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
            ],
        },
        {
            // Search API — cache for 2 minutes on CDN, stale for 5 minutes
            source: '/api/search',
            headers: [
                { key: 'Cache-Control', value: 'public, max-age=60, s-maxage=120, stale-while-revalidate=300' },
            ],
        },
        {
            source: '/api/admin/(.*)',
            headers: [
                { key: 'Cache-Control', value: 'no-store, max-age=0' },
            ],
        },
        {
            source: '/api/auth/(.*)',
            headers: [
                { key: 'Cache-Control', value: 'no-store, max-age=0' },
            ],
        },
    ],
    async rewrites() {
        return [
            { source: '/sitemap.xml', destination: '/api/sitemap' },
            { source: '/robots.txt', destination: '/api/robots' },
            // Verification files served from Supabase Storage
            { source: '/:filename(google[a-z0-9]+\\.html)', destination: '/api/site-files/:filename' },
            { source: '/:filename(BingSiteAuth\\.xml)', destination: '/api/site-files/:filename' },
            { source: '/:filename(yandex_[a-z0-9]+\\.html)', destination: '/api/site-files/:filename' },
        ]
    },
    async redirects() {
        return legacyRedirects
    },
}

export default nextConfig