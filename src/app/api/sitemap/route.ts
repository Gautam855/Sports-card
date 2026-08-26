import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.sportslnv.com'

function url(path: string, lastmod?: string, priority = 0.7, changefreq = 'weekly') {
    return `
  <url>
    <loc>${SITE_URL}${path}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

export async function GET() {
    const supabase = await createClient()

    const { data: news } = await supabase
        .from('news')
        .select('slug,updated_at')
        .eq('status', 'published')
        .order('updated_at', { ascending: false })
        .limit(1000)

    const staticPages = [
        url('/', undefined, 1.0, 'daily'),
        url('/news', undefined, 0.9, 'hourly'),
        url('/blog', undefined, 0.9, 'hourly'),
        url('/highlights', undefined, 0.8, 'daily'),
        url('/sport/football', undefined, 0.8, 'daily'),
        url('/sport/cricket', undefined, 0.8, 'daily'),
        url('/sport/basketball', undefined, 0.8, 'daily'),
        url('/sport/tennis', undefined, 0.8, 'daily'),
        url('/sport/rugby', undefined, 0.8, 'daily'),
        url('/sport/baseball', undefined, 0.8, 'daily'),
        url('/sport/f1', undefined, 0.8, 'daily'),
        url('/sport/nfl', undefined, 0.8, 'daily'),
        url('/sport/nba', undefined, 0.8, 'daily'),
        url('/sport/mlb', undefined, 0.8, 'daily'),
        url('/sport/olympics', undefined, 0.8, 'daily'),
        url('/sport/fifa', undefined, 0.8, 'daily'),
        url('/sports', undefined, 0.8, 'daily'),
    ]

    const newsUrls = (news ?? []).map(n => url(`/news/${n.slug}`, n.updated_at, 0.8, 'weekly'))
    const blogUrls = (news ?? []).map(n => url(`/blog/${n.slug}`, n.updated_at, 0.8, 'weekly'))

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${[...staticPages, ...newsUrls, ...blogUrls].join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}
