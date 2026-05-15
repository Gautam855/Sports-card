import { createClient } from '@/lib/supabase/server'
import type { Match, MatchFilters, PaginationParams, PaginatedResponse } from '@/lib/types'

const DEFAULT_LIMIT = 12

// =========================================================
// MATCH QUERIES
// =========================================================

export async function getMatches(
    filters: MatchFilters = {},
    pagination: PaginationParams = {}
): Promise<PaginatedResponse<Match>> {
    const supabase = await createClient()
    const { page = 1, limit = DEFAULT_LIMIT, sort = 'scheduled_at', order = 'desc' } = pagination
    const offset = (page - 1) * limit

    let query = supabase
        .from('matches')
        .select(`
      *,
      sport:sports(*),
      league:leagues(*),
      home_team:teams!home_team_id(id,name,short_name,slug,logo_url),
      away_team:teams!away_team_id(id,name,short_name,slug,logo_url),
      score:scores(*)
    `, { count: 'exact' })

    if (filters.sport) query = query.eq('sport.sport_type', filters.sport)
    if (filters.league) query = query.eq('league_id', filters.league)
    if (filters.date) {
        const start = new Date(filters.date)
        start.setHours(0, 0, 0, 0)
        const end = new Date(filters.date)
        end.setHours(23, 59, 59, 999)
        query = query.gte('scheduled_at', start.toISOString()).lte('scheduled_at', end.toISOString())
    }
    if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
        query = query.in('status', statuses)
    }
    if (filters.featured) query = query.eq('is_featured', true)

    const { data, error, count } = await query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1)

    if (error) {
        console.warn(`[getMatches] ${error.message}`)
        return { data: [], count: 0, page, limit, total_pages: 0 }
    }

    return {
        data: (data ?? []) as Match[],
        count: count ?? 0,
        page,
        limit,
        total_pages: Math.ceil((count ?? 0) / limit),
    }
}

export async function getLiveMatches(): Promise<Match[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      sport:sports(*),
      league:leagues(*),
      home_team:teams!home_team_id(id,name,short_name,slug,logo_url),
      away_team:teams!away_team_id(id,name,short_name,slug,logo_url),
      score:scores(*)
    `)
        .in('status', ['live', 'half_time'])
        .order('started_at', { ascending: false })
        .limit(20)

    if (error) {
        console.warn(`[getLiveMatches] ${error.message}`)
        return []
    }
    return (data ?? []) as Match[]
}

export async function getFeaturedMatches(): Promise<Match[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      sport:sports(*),
      league:leagues(*),
      home_team:teams!home_team_id(id,name,short_name,slug,logo_url),
      away_team:teams!away_team_id(id,name,short_name,slug,logo_url),
      score:scores(*)
    `)
        .eq('is_featured', true)
        .in('status', ['scheduled', 'live', 'half_time'])
        .order('scheduled_at', { ascending: true })
        .limit(6)

    if (error) {
        console.warn(`[getFeaturedMatches] ${error.message}`)
        return []
    }
    return (data ?? []) as Match[]
}

export async function getMatchBySlug(slug: string): Promise<Match | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      sport:sports(*),
      league:leagues(*),
      home_team:teams!home_team_id(*),
      away_team:teams!away_team_id(*),
      score:scores(*)
    `)
        .eq('slug', slug)
        .single()

    if (error) return null
    return data as Match
}

export async function getTodayMatches(): Promise<Match[]> {
    const today = new Date().toISOString().split('T')[0]
    const { data } = await getMatches({ date: today }, { limit: 50, sort: 'scheduled_at', order: 'asc' })
    return data
}

export async function getUpcomingMatches(days = 7): Promise<Match[]> {
    const supabase = await createClient()
    const now = new Date()
    const future = new Date()
    future.setDate(future.getDate() + days)

    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      sport:sports(*),
      league:leagues(*),
      home_team:teams!home_team_id(id,name,short_name,slug,logo_url),
      away_team:teams!away_team_id(id,name,short_name,slug,logo_url)
    `)
        .eq('status', 'scheduled')
        .gte('scheduled_at', now.toISOString())
        .lte('scheduled_at', future.toISOString())
        .order('scheduled_at', { ascending: true })
        .limit(30)

    if (error) {
        console.warn(`[getUpcomingMatches] ${error.message}`)
        return []
    }
    return (data ?? []) as Match[]
}