import { NextResponse } from 'next/server'

export function GET() {
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://sportspulse.com'
    const content = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /profile/settings
Disallow: /login
Disallow: /register

# Sitemaps
Sitemap: ${SITE_URL}/sitemap.xml

# Crawl-delay for bots
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 2`

    return new NextResponse(content, {
        headers: { 'Content-Type': 'text/plain', 'Cache-Control': 'public, max-age=86400' },
    })
}
