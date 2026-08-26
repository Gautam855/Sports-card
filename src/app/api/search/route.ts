import { NextResponse } from 'next/server'
import { searchNews, getRecentArticles, getRealTimeNews } from '@/lib/api/news'
import { getFootballHighlights } from '@/lib/api/rapid'
import type { News } from '@/lib/types'

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
    ])
}

function mapArticle(a: News, hrefPrefix: 'news' | 'blog') {
    return {
        id: a.id,
        title: a.title,
        slug: a.slug,
        excerpt: a.excerpt,
        cover_image: a.cover_image,
        published_at: a.published_at,
        category: a.category,
        href: `/${hrefPrefix}/${a.slug}`,
    }
}

const BLOG_HINTS = new Set(['blog', 'blogs', 'article', 'articles', 'editorial', 'editorials'])
const NEWS_HINTS = new Set(['news', 'latest', 'breaking', 'sport', 'sports'])
const HIGHLIGHT_HINTS = new Set(['highlight', 'highlights', 'video', 'videos', 'goal', 'goals'])

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim() ?? ''

    if (q.length < 2) {
        return NextResponse.json({ news: [], blogs: [], highlights: [], liveNews: [] })
    }

    const qLower = q.toLowerCase()

    // Fast DB search first
    let articles = await searchNews(q, 10)

    // Keyword shortcuts — "blog", "news", etc. should still return content
    if (articles.length === 0) {
        const recent = await getRecentArticles(12)
        if (BLOG_HINTS.has(qLower)) {
            articles = recent
        } else if (NEWS_HINTS.has(qLower)) {
            articles = recent
        } else {
            articles = filterArticlesInMemory(recent, q, 10)
        }
    }

    const news = articles.slice(0, 6).map((a) => mapArticle(a, 'news'))
    const blogs = articles.slice(0, 6).map((a) => mapArticle(a, 'blog'))

    // External sources with timeout so search doesn't hang
    const [serpNews, allHighlights] = await Promise.all([
        withTimeout(getRealTimeNews(q, 6), 5000, []),
        HIGHLIGHT_HINTS.has(qLower) || q.length >= 3
            ? withTimeout(getFootballHighlights(), 5000, [])
            : Promise.resolve([]),
    ])

    const liveNews = serpNews.slice(0, 4).map((a) => ({
        id: a.id,
        title: a.title,
        excerpt: a.excerpt,
        cover_image: a.cover_image,
        published_at: a.published_at,
        href: (a as News & { url?: string }).url ?? '#',
        external: true,
    }))

    const qWords = qLower.split(/\s+/).filter(Boolean)
    const highlights = allHighlights
        .filter((v) => {
            if (HIGHLIGHT_HINTS.has(qLower)) return true
            const title = v.title.toLowerCase()
            return qWords.some((word) => title.includes(word))
        })
        .slice(0, 4)
        .map((v, i) => ({
            id: `highlight-${i}-${v.url}`,
            title: v.title,
            cover_image: v.thumbnail,
            published_at: v.date,
            competition: v.competition?.name,
            href: v.url,
            external: true,
        }))

    // If still nothing at all, return recent as both news & blogs
    if (!news.length && !blogs.length && !liveNews.length && !highlights.length) {
        const recent = await getRecentArticles(6)
        const fallbackNews = recent.map((a) => mapArticle(a, 'news'))
        const fallbackBlogs = recent.map((a) => mapArticle(a, 'blog'))
        return NextResponse.json({
            news: fallbackNews,
            blogs: fallbackBlogs,
            highlights: [],
            liveNews: [],
        })
    }

    return NextResponse.json({ news, blogs, highlights, liveNews })
}

function filterArticlesInMemory(articles: News[], query: string, limit: number): News[] {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean)
    if (!words.length) return articles.slice(0, limit)

    return articles
        .filter((a) => {
            const categoryName =
                typeof a.category === 'object' && a.category !== null && 'name' in a.category
                    ? (a.category as { name: string }).name
                    : ''
            const haystack = `${a.title} ${a.excerpt ?? ''} ${categoryName}`.toLowerCase()
            return words.some((word) => haystack.includes(word))
        })
        .slice(0, limit)
}
