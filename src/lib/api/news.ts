import { getPublicClient } from '@/lib/supabase/public'
import type { News, NewsFilters, PaginationParams, PaginatedResponse } from '@/lib/types'
import { getActiveKey, handleRateLimit } from './key-manager'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'

const ARTICLE_SELECT = `
  id, title, slug, excerpt, cover_image, cover_alt,
  views, likes, read_time_mins, published_at, is_featured, is_breaking, is_editor_pick,
  author:profiles(id,username,display_name,avatar_url),
  category:news_categories(id,name,slug,color)
`

/** Uncached internal fetch for getNews */
async function _fetchNews(
    filters: NewsFilters = {},
    pagination: PaginationParams = {}
): Promise<PaginatedResponse<News>> {
    const supabase = getPublicClient()
    const { page = 1, limit = 12, sort = 'published_at', order = 'desc' } = pagination
    const offset = (page - 1) * limit

    let query = supabase
        .from('news')
        .select(`
          id, title, slug, excerpt, cover_image, cover_alt,
          is_breaking, is_featured, is_editor_pick,
          views, likes, read_time_mins, published_at, created_at,
          author:profiles(id,username,display_name,avatar_url),
          category:news_categories(id,name,slug,color)
        `, { count: 'exact' })
        .eq('status', 'published')

    if (filters.category) query = query.eq('category_id', filters.category)
    if (filters.featured) query = query.eq('is_featured', true)
    if (filters.breaking) query = query.eq('is_breaking', true)
    if (filters.author) query = query.eq('author_id', filters.author)

    const { data, error, count } = await query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)

    if (error) {
        console.warn(`[getNews] ${error.message}`)
        return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    return {
        data: (data ?? []) as unknown as News[],
        count: count ?? 0,
        page,
        limit,
        total_pages: Math.ceil((count ?? 0) / limit),
    }
}

export const getNews = (filters: NewsFilters = {}, pagination: PaginationParams = {}) => {
    // Cache for 60 seconds across users
    const cacheKey = `news-${JSON.stringify(filters)}-${JSON.stringify(pagination)}`
    return unstable_cache(
        () => _fetchNews(filters, pagination),
        [cacheKey],
        { revalidate: 60, tags: ['news'] }
    )()
}

async function _fetchNewsBySlug(slug: string): Promise<News | null> {
    const supabase = getPublicClient()

    const { data, error } = await supabase
        .from('news')
        .select(`
          *,
          author:profiles(id,username,display_name,avatar_url,bio),
          category:news_categories(id,name,slug,color,emoji)
        `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (error || !data) return null

    return data as unknown as News
}

/** React cache deduplicates between generateMetadata and BlogDetailPage in the same request */
export const getNewsBySlug = cache(async (slug: string): Promise<News | null> => {
    return unstable_cache(
        () => _fetchNewsBySlug(slug),
        [`news-slug-${slug}`],
        { revalidate: 120, tags: ['news', `news-${slug}`] }
    )()
})

async function _fetchBreakingNews(limit: number): Promise<News[]> {
    const supabase = getPublicClient()

    const { data } = await supabase
        .from('news')
        .select(`
          id, title, slug, excerpt, cover_image, cover_alt,
          published_at,
          category:news_categories(name,slug,color)
        `)
        .eq('status', 'published')
        .eq('is_breaking', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export const getBreakingNews = (limit = 5): Promise<News[]> => {
    return unstable_cache(
        () => _fetchBreakingNews(limit),
        [`breaking-news-${limit}`],
        { revalidate: 60, tags: ['news'] }
    )()
}

async function _fetchFeaturedNews(limit: number): Promise<News[]> {
    const supabase = getPublicClient()

    const { data } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export const getFeaturedNews = (limit = 6): Promise<News[]> => {
    return unstable_cache(
        () => _fetchFeaturedNews(limit),
        [`featured-news-${limit}`],
        { revalidate: 120, tags: ['news'] }
    )()
}

async function _fetchTrendingNews(limit: number): Promise<News[]> {
    const supabase = getPublicClient()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)

    const { data } = await supabase
        .from('news')
        .select(`
          id, title, slug, cover_image, cover_alt, views, likes, published_at,
          category:news_categories(name,slug,color)
        `)
        .eq('status', 'published')
        .gte('published_at', cutoff.toISOString())
        .order('views', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export const getTrendingNews = (limit = 8): Promise<News[]> => {
    return unstable_cache(
        () => _fetchTrendingNews(limit),
        [`trending-news-${limit}`],
        { revalidate: 180, tags: ['news'] }
    )()
}

async function _fetchEditorPicks(limit: number): Promise<News[]> {
    const supabase = getPublicClient()

    const { data } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .eq('is_editor_pick', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export const getEditorPicks = (limit = 4): Promise<News[]> => {
    return unstable_cache(
        () => _fetchEditorPicks(limit),
        [`editor-picks-${limit}`],
        { revalidate: 180, tags: ['news'] }
    )()
}

/** Featured + editor picks + latest articles for home blog section */
export async function getHomeBlogs(
    limit = 6,
    prefetchedArticles?: { featured?: News[]; editorPicks?: News[]; latest?: News[] }
): Promise<News[]> {
    let featured = prefetchedArticles?.featured
    let editorPicks = prefetchedArticles?.editorPicks
    let latest = prefetchedArticles?.latest

    if (!featured || !editorPicks || !latest) {
        const [f, e, l] = await Promise.all([
            featured ? Promise.resolve(featured) : getFeaturedNews(limit),
            editorPicks ? Promise.resolve(editorPicks) : getEditorPicks(limit),
            latest ? Promise.resolve(latest) : getNews({}, { limit, sort: 'published_at', order: 'desc' }).then(r => r.data),
        ])
        featured = f
        editorPicks = e
        latest = l
    }

    const seen = new Set<string>()
    const combined: News[] = []

    for (const article of [...featured, ...editorPicks, ...latest]) {
        if (seen.has(article.id)) continue
        seen.add(article.id)
        combined.push(article)
        if (combined.length >= limit) break
    }

    return combined
}

async function _fetchRelatedNews(newsId: string, categoryId?: string, limit = 4): Promise<News[]> {
    const supabase = getPublicClient()

    let query = supabase
        .from('news')
        .select('id, title, slug, cover_image, cover_alt, published_at, category:news_categories(name,slug)')
        .eq('status', 'published')
        .neq('id', newsId)

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data } = await query
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export const getRelatedNews = (newsId: string, categoryId?: string, limit = 4): Promise<News[]> => {
    return unstable_cache(
        () => _fetchRelatedNews(newsId, categoryId, limit),
        [`related-news-${newsId}-${categoryId || 'none'}-${limit}`],
        { revalidate: 300, tags: ['news'] }
    )()
}

function buildIlikePattern(query: string): string {
    return `%${query.replace(/"/g, '""')}%`
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
            return words.every((word) => haystack.includes(word))
        })
        .slice(0, limit)
}

async function fetchRecentArticles(limit: number): Promise<News[]> {
    const supabase = getPublicClient()
    const { data } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(Math.max(limit, 40))

    return (data ?? []) as unknown as News[]
}

export async function searchNews(query: string, limit = 20): Promise<News[]> {
    const supabase = getPublicClient()
    const trimmed = query.trim()
    if (!trimmed) return []

    const pattern = buildIlikePattern(trimmed)

    const { data, error } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .or(`title.ilike."${pattern}",excerpt.ilike."${pattern}"`)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (!error && data && data.length > 0) {
        return data as unknown as News[]
    }

    const { data: titleOnly } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .ilike('title', pattern)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (titleOnly && titleOnly.length > 0) {
        return titleOnly as unknown as News[]
    }

    const recent = await fetchRecentArticles(limit)
    const inMemory = filterArticlesInMemory(recent, trimmed, limit)
    if (inMemory.length > 0) return inMemory

    return recent.slice(0, limit)
}

export async function searchFeaturedBlogs(query: string, limit = 4): Promise<News[]> {
    const supabase = getPublicClient()
    const trimmed = query.trim()
    if (!trimmed) return []

    const pattern = buildIlikePattern(trimmed)

    const { data } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .eq('is_featured', true)
        .or(`title.ilike."${pattern}",excerpt.ilike."${pattern}"`)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (data && data.length > 0) {
        return data as unknown as News[]
    }

    const { data: featuredRecent } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    if (!featuredRecent?.length) return []

    return filterArticlesInMemory(featuredRecent as unknown as News[], trimmed, limit)
}

export async function getRecentArticles(limit = 8): Promise<News[]> {
    return fetchRecentArticles(limit)
}

/** Fetch real-time news from SerpApi (Google News) with auto key rotation */
export async function getRealTimeNews(query: string = "international sports news", limit: number = 10): Promise<News[]> {
    return _fetchSerpApi(query, limit, false)
}

async function _fetchSerpApi(query: string, limit: number, _retried: boolean): Promise<News[]> {
    const apiKey = await getActiveKey('serpapi')
    if (!apiKey) {
        console.warn("[getRealTimeNews] No SERPAPI_KEY configured (SERPAPI_KEY_1, SERPAPI_KEY_2, ...)")
        return []
    }

    try {
        const searchTerms = `${query} US UK international`
        const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(searchTerms)}&api_key=${apiKey}&gl=us&hl=en`

        const res = await fetch(url, { next: { revalidate: 3600 } })

        if ((res.status === 429 || res.status === 403) && !_retried) {
            console.warn(`[SerpApi] Rate limited (${res.status}), rotating key...`)
            const rotated = await handleRateLimit('serpapi')
            if (rotated) {
                return _fetchSerpApi(query, limit, true)
            }
        }

        if (!res.ok) {
            return []
        }

        const json = await res.json()
        const results = json.news_results || []

        return results.slice(0, limit).map((n: any, i: number) => ({
            id: `serp-${i}-${Math.random().toString(36).substr(2, 9)}`,
            slug: `news-${i}-${Date.now()}`,
            url: n.link,
            title: n.title,
            excerpt: n.snippet || n.source?.name || '',
            cover_image: n.thumbnail || '/images/news-placeholder.jpg',
            cover_alt: n.title,
            published_at: n.date || new Date().toISOString(),
            is_breaking: false,
            is_featured: false,
            views: 0,
            likes: 0,
            read_time_mins: 3,
            author: { 
                id: `author-${i}`,
                username: n.source?.name?.toLowerCase().replace(/\s+/g, '-'),
                display_name: n.source?.name || 'News Source' 
            },
            category: { id: 'realtime', name: "Real-time", slug: 'real-time', color: '#3b82f6' },
        }))
    } catch (error) {
        console.error("[getRealTimeNews] Error:", error)
        return []
    }
}