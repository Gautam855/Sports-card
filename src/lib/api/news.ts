import { createClient } from '@/lib/supabase/server'
import type { News, NewsFilters, PaginationParams, PaginatedResponse } from '@/lib/types'
import { getActiveKey, handleRateLimit } from './key-manager'


export async function getNews(
    filters: NewsFilters = {},
    pagination: PaginationParams = {}
): Promise<PaginatedResponse<News>> {
    const supabase = await createClient()
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

export async function getNewsBySlug(slug: string): Promise<News | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('news')
        .select(`
      *,
      author:profiles(id,username,display_name,avatar_url,bio),
      category:news_categories(*)
    `)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()

    if (error) return null

    // Increment views (fire-and-forget)
    supabase.rpc('increment_views', { p_table: 'news', p_id: data.id }).then(() => { })

    return data as unknown as News
}

export async function getBreakingNews(limit = 5): Promise<News[]> {
    const supabase = await createClient()

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

export async function getFeaturedNews(limit = 6): Promise<News[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('news')
        .select(`
      id, title, slug, excerpt, cover_image, cover_alt,
      views, likes, read_time_mins, published_at,
      author:profiles(username,display_name,avatar_url),
      category:news_categories(name,slug,color)
    `)
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export async function getTrendingNews(limit = 8): Promise<News[]> {
    const supabase = await createClient()
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)

    const { data } = await supabase
        .from('news')
        .select(`
      id, title, slug, cover_image, views, likes, published_at,
      category:news_categories(name,slug,color)
    `)
        .eq('status', 'published')
        .gte('published_at', cutoff.toISOString())
        .order('views', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

export async function getEditorPicks(limit = 4): Promise<News[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('news')
        .select(`
      id, title, slug, excerpt, cover_image, cover_alt,
      views, read_time_mins, published_at,
      author:profiles(username,display_name,avatar_url),
      category:news_categories(name,slug,color)
    `)
        .eq('status', 'published')
        .eq('is_editor_pick', true)
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

/** Featured + editor picks + latest articles for home blog section */
export async function getHomeBlogs(limit = 6): Promise<News[]> {
    const [featured, editorPicks, latest] = await Promise.all([
        getFeaturedNews(limit),
        getEditorPicks(limit),
        getNews({}, { limit, sort: 'published_at', order: 'desc' }),
    ])

    const seen = new Set<string>()
    const combined: News[] = []

    for (const article of [...featured, ...editorPicks, ...latest.data]) {
        if (seen.has(article.id)) continue
        seen.add(article.id)
        combined.push(article)
        if (combined.length >= limit) break
    }

    return combined
}

export async function getRelatedNews(newsId: string, categoryId?: string, limit = 4): Promise<News[]> {
    const supabase = await createClient()

    let query = supabase
        .from('news')
        .select('id, title, slug, cover_image, published_at, category:news_categories(name,slug)')
        .eq('status', 'published')
        .neq('id', newsId)

    if (categoryId) query = query.eq('category_id', categoryId)

    const { data } = await query
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

const ARTICLE_SELECT = `
      id, title, slug, excerpt, cover_image, published_at, is_featured,
      category:news_categories(name,slug,color)
    `

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

async function fetchRecentArticles(supabase: Awaited<ReturnType<typeof createClient>>, limit: number): Promise<News[]> {
    const { data } = await supabase
        .from('news')
        .select(ARTICLE_SELECT)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(Math.max(limit, 40))

    return (data ?? []) as unknown as News[]
}

export async function searchNews(query: string, limit = 20): Promise<News[]> {
    const supabase = await createClient()
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

    const recent = await fetchRecentArticles(supabase, limit)
    const inMemory = filterArticlesInMemory(recent, trimmed, limit)
    if (inMemory.length > 0) return inMemory

    return recent.slice(0, limit)
}

export async function searchFeaturedBlogs(query: string, limit = 4): Promise<News[]> {
    const supabase = await createClient()
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
    const supabase = await createClient()
    return fetchRecentArticles(supabase, limit)
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
        // Force the query to be about international sports (US/UK focus)
        const searchTerms = `${query} US UK international`
        const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(searchTerms)}&api_key=${apiKey}&gl=us&hl=en`

        const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour

        // ── Auto-rotate on rate limit or quota exhaustion ──
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
            url: n.link, // Store original link
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