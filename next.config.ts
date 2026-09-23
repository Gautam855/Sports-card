import type { NextConfig } from 'next'
import { legacyRedirects } from './src/lib/legacy-redirects'

const nextConfig: NextConfig = {
    // experimental features disabled — require Next.js canary
    // experimental: { ppr: true, reactCompiler: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**' },
            { protocol: 'http', hostname: '**' },
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
        ],


        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 2592000, // 30 days — prevents re-optimization of unchanged images
        deviceSizes: [384, 640, 828, 1200, 1920], // 384px tailored for mobile devices (375px-414px)
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384], // Small sizes for thumbnails & avatars
    },
    headers: async () => [
        {
            source: '/(.*)',
            headers: [
                { key: 'X-Content-Type-Options', value: 'nosniff' },
                { key: 'X-Frame-Options', value: 'DENY' },
                { key: 'X-XSS-Protection', value: '1; mode=block' },
                { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
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