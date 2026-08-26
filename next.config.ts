import type { NextConfig } from 'next'
import { legacyRedirects } from './src/lib/legacy-redirects'

const nextConfig: NextConfig = {
    // experimental features disabled — require Next.js canary
    // experimental: { ppr: true, reactCompiler: true },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: '**.supabase.co' },
            { protocol: 'https', hostname: 'images.unsplash.com' },
            { protocol: 'https', hostname: 'media.api-sports.io' },
            { protocol: 'https', hostname: 'cricapi.com' },
            { protocol: 'https', hostname: 'www.thesportsdb.com' },
            { protocol: 'https', hostname: '**.hscicdn.com' },
            { protocol: 'https', hostname: '**.cricbuzz.com' },
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
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
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
            source: '/api/(.*)',
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