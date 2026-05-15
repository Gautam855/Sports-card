import { createClient } from '@/lib/supabase/server'
import type { News, NewsFilters, PaginationParams, PaginatedResponse } from '@/lib/types'
import { recordAPISuccess, recordAPIError } from './api-status'


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
        .select('id,title,slug,published_at')
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

export async function searchNews(query: string, limit = 20): Promise<News[]> {
    const supabase = await createClient()

    const { data } = await supabase
        .from('news')
        .select('id, title, slug, excerpt, cover_image, published_at, category:news_categories(name,slug)')
        .eq('status', 'published')
        .textSearch('title', query, { type: 'websearch' })
        .order('published_at', { ascending: false })
        .limit(limit)

    return (data ?? []) as unknown as News[]
}

/** Fetch real-time news from SerpApi (Google News) */
export async function getRealTimeNews(query: string = "international sports news", limit: number = 10): Promise<News[]> {
    const apiKey = process.env.SERPAPI_KEY
    if (!apiKey) {
        console.warn("[getRealTimeNews] SERPAPI_KEY is not configured")
        return []
    }

    try {
        // Force the query to be about international sports (US/UK focus)
        const searchTerms = `${query} US UK international`
        const url = `https://serpapi.com/search.json?engine=google_news&q=${encodeURIComponent(searchTerms)}&api_key=${apiKey}&gl=us&hl=en`


        const res = await fetch(url, { next: { revalidate: 3600 } }) // Cache for 1 hour
        if (!res.ok) {
            recordAPIError('SerpApi', 'serpapi.com', 'Real-time News', res.status, `SerpApi responded with ${res.status}`)
            return []
        }

        const json = await res.json()
        const results = json.news_results || []

        // Record API Success and fetch account info for limits in background
        fetch(`https://serpapi.com/account?api_key=${apiKey}`)
            .then(r => r.json())
            .then(account => {
                if (account && !account.error) {
                    recordAPISuccess('SerpApi', 'serpapi.com', 'Real-time News', undefined, {
                        remaining: account.total_searches_left,
                        limit: account.searches_per_month,
                        resetsAt: account.next_reset_date || account.next_reset_date_at || account.plan_info?.next_reset_date
                    })
                }

            })
            .catch(() => recordAPISuccess('SerpApi', 'serpapi.com', 'Real-time News'))


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