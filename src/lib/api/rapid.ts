/**
 * RapidAPI Integration Layer
 * 
 * Provides live sports data from:
 * - API-Football (v3) for football/soccer
 * - Cricbuzz Cricket API for cricket
 * - API-Sports for basketball, baseball, and F1
 * - SportsData.io for MMA/UFC
 * 
 * All keys & hosts are centralised in .env.local
 * Naming convention: {SPORT}_{WEBSITE}_{KEY|HOST}
 * 
 * All responses are normalised into the platform's Match type.
 */

// ─── Centralised API Configuration (from .env) ──────────────────────────────
const FOOTBALL_HOST     = process.env.FOOTBALL_APISPORTS_HOST ?? ''
const FOOTBALL_KEY      = process.env.FOOTBALL_APISPORTS_KEY ?? ''

const CRICKET_HOST      = process.env.CRICKET_CRICBUZZ_HOST ?? ''
const CRICKET_KEY       = process.env.CRICKET_CRICBUZZ_KEY ?? ''


const BASKETBALL_HOST   = process.env.BASKETBALL_APISPORTS_HOST ?? ''
const BASKETBALL_KEY    = process.env.BASKETBALL_APISPORTS_KEY ?? ''

const MMA_HOST          = process.env.MMA_APISPORTS_HOST ?? ''
const MMA_KEY           = process.env.MMA_APISPORTS_KEY ?? ''

const BASEBALL_HOST     = process.env.BASEBALL_APISPORTS_HOST ?? ''
const BASEBALL_KEY      = process.env.BASEBALL_APISPORTS_KEY ?? ''

const RUGBY_HOST        = process.env.RUGBY_APISPORTS_HOST ?? ''
const RUGBY_KEY         = process.env.RUGBY_APISPORTS_KEY ?? ''

const F1_HOST           = process.env.FORMULA1_APISPORTS_HOST ?? ''
const F1_KEY            = process.env.FORMULA1_APISPORTS_KEY ?? ''

import { recordAPISuccess, recordAPIError } from './api-status'

// Map hosts to readable names for status tracking
const HOST_NAMES: Record<string, { name: string; sport: string }> = {
    [FOOTBALL_HOST]: { name: 'API-Football', sport: 'Football' },
    [CRICKET_HOST]: { name: 'Cricbuzz', sport: 'Cricket' },

    [BASKETBALL_HOST]: { name: 'API-Basketball', sport: 'Basketball' },
    [BASEBALL_HOST]: { name: 'API-Baseball', sport: 'Baseball' },
    [MMA_HOST]: { name: 'API-MMA', sport: 'MMA' },
    [RUGBY_HOST]: { name: 'API-Rugby', sport: 'Rugby' },
    [F1_HOST]: { name: 'API-Formula1', sport: 'Formula 1' },
}

// ─── Generic Fetcher ─────────────────────────────────────────────────────────

// Resolve the correct API key for a given host
function getKeyForHost(host: string): string {
    if (host === FOOTBALL_HOST) return FOOTBALL_KEY
    if (host === CRICKET_HOST) return CRICKET_KEY
    if (host === BASKETBALL_HOST) return BASKETBALL_KEY
    if (host === BASEBALL_HOST) return BASEBALL_KEY
    if (host === MMA_HOST) return MMA_KEY
    if (host === RUGBY_HOST) return RUGBY_KEY
    if (host === F1_HOST) return F1_KEY
    return ''
}



async function rapidFetch<T>(url: string, host: string): Promise<T | null> {
    const isApiSports = host === FOOTBALL_HOST || host === F1_HOST || host === BASKETBALL_HOST || host === BASEBALL_HOST || host === MMA_HOST || host === RUGBY_HOST
    const key = getKeyForHost(host)
    const info = HOST_NAMES[host] ?? { name: host, sport: 'Unknown' }

    if (!key) {
        console.warn(`[API] No API key configured for ${host} – skipping fetch`)
        recordAPIError(info.name, host, info.sport, 0, 'No API key configured')
        return null
    }

    try {
        const headers: Record<string, string> = isApiSports 
            ? { 'x-apisports-key': key }
            : { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': host }

        const res = await fetch(url, {
            headers,
            next: { revalidate: 60 }, // Cache for 60s via Next.js
        })

        if (!res.ok) {
            const errText = await res.text().catch(() => res.statusText)
            console.warn(`[RapidAPI] ${res.status} from ${host}: ${res.statusText}`)
            recordAPIError(info.name, host, info.sport, res.status, errText.slice(0, 200))
            return null
        }

        recordAPISuccess(info.name, host, info.sport, res.headers)
        return res.json()
    } catch (err: any) {
        console.error(`[RapidAPI] Fetch error:`, err)
        recordAPIError(info.name, host, info.sport, 0, err?.message ?? 'Network error')
        return null
    }
}

// ─── Player-Props API Normalizer ───────────────────────────────────────────────
function normalisePlayerPropsEvent(e: any, sportName: string = 'Boxing') {
    const isLive = e.live === true
    const commenceDate = new Date(e.commence_time)
    const isUpcoming = commenceDate > new Date()
    const status = isLive ? 'live' : (isUpcoming ? 'scheduled' : 'completed')
    const sportSlug = sportName.toLowerCase()

    return {
        id: `pp-${e.id}`,
        slug: `${sportSlug}-${e.id}`,
        sport_type: sportSlug,
        status,
        scheduled_at: e.commence_time,
        date: e.commence_time,
        match_format: sportName,
        sport: { id: sportSlug, name: sportName, slug: sportSlug, sport_type: sportSlug },
        league: { id: sportSlug, name: sportName, slug: sportSlug },
        home_team: { 
            id: `pp-h-${e.id}`, 
            name: e.home_team || 'TBD', 
            short_name: (e.home_team || 'TBD').slice(0, 3).toUpperCase() 
        },
        away_team: { 
            id: `pp-a-${e.id}`, 
            name: e.away_team || 'TBD', 
            short_name: (e.away_team || 'TBD').slice(0, 3).toUpperCase() 
        },
        score: {
            home_score: 0,
            away_score: 0,
            status_text: status === 'live' ? 'Live' : (status === 'scheduled' ? 'Scheduled' : 'Final')
        },
        status_text: status === 'live' ? 'Live' : (status === 'scheduled' ? 'Scheduled' : 'Final'),
        scorecard: [],
        umpires: [],
        match_desc: sportName,
        state: status === 'live' ? 'Live' : (status === 'scheduled' ? 'Scheduled' : 'Final'),
        venue: null,
        venue_country: null,
        toss: null,
        referee: null,
    }
}





async function playerPropsFetch<T>(endpoint: string): Promise<T | null> {
    const url = `https://${PLAYER_PROPS_HOST}/v1/${endpoint}`
    try {
        const res = await fetch(url, {
            headers: {
                'X-RapidAPI-Key': PLAYER_PROPS_KEY,
                'X-RapidAPI-Host': PLAYER_PROPS_HOST
            },
            next: { revalidate: 300 }
        })
        if (!res.ok) return null
        return res.json()
    } catch (err) {
        return null
    }
}

// ─── TheSportsDB Fetcher (for Badminton) ─────────────────────────────────────
const TSDB_HOST = process.env.BADMINTON_TSDB_HOST ?? 'www.thesportsdb.com'
const TSDB_KEY = process.env.BADMINTON_TSDB_KEY ?? '3'

const PLAYER_PROPS_HOST = 'player-props.p.rapidapi.com'
const PLAYER_PROPS_KEY = '3457ab5929mshab77149accff59dp1b9ec2jsn72a4ab1563cc'

async function tsdbFetch<T>(endpoint: string): Promise<T | null> {

    const url = `https://${TSDB_HOST}/api/v1/json/${TSDB_KEY}/${endpoint}`
    try {
        const res = await fetch(url, { next: { revalidate: 300 } })
        if (!res.ok) return null
        return res.json()
    } catch (err) {
        console.error(`[TSDB] Fetch error:`, err)
        return null
    }
}


export interface NormalizedMatch {
    id: string | number
    slug: string
    sport_type: 'football' | 'cricket' | 'basketball' | 'baseball' | 'f1' | 'mma' | 'rugby' | 'badminton'
    match_type?: string
    status: 'scheduled' | 'live' | 'half_time' | 'completed' | 'postponed' | 'cancelled'
    scheduled_at: string
    started_at?: string | null
    venue?: string | null
    venue_country?: string | null
    is_featured: boolean
    sport: { id: string; name: string; slug: string; sport_type: string }
    league: { id: string; name: string; slug?: string; logo_url?: string; country?: string }
    home_team: { id: string; name: string; short_name: string; slug?: string; logo_url?: string }
    away_team: { id: string; name: string; short_name: string; slug?: string; logo_url?: string }
    score: any
    match_desc?: string
    match_format?: string
    status_text?: string
    state?: string
    toss?: any
    umpires?: any[]
    referee?: any
    scorecard?: any[]
    incidents?: any[]
    statistics?: any[]
    innings?: any[]
    rhe?: any
}

// ═══════════════════════════════════════════════════════════════════════════════

// BASKETBALL (API-Sports)
// ═══════════════════════════════════════════════════════════════════════════════

interface BasketballGame {
    id: number;
    date: string;
    time: string;
    timestamp: number;
    timezone: string;
    status: { long: string; short: string; timer: string | null };
    league: { id: number; name: string; type: string; season: number; logo: string };
    country: { id: number; name: string; code: string; flag: string };
    teams: {
        home: { id: number; name: string; logo: string };
        away: { id: number; name: string; logo: string };
    };
    scores: {
        home: { quarter_1: number | null; quarter_2: number | null; quarter_3: number | null; quarter_4: number | null; over_time: number | null; total: number | null };
        away: { quarter_1: number | null; quarter_2: number | null; quarter_3: number | null; quarter_4: number | null; over_time: number | null; total: number | null };
    };
}

interface BasketballResponse { response: BasketballGame[] }

function normaliseBasketballGame(g: BasketballGame): NormalizedMatch {
    const isLive = ['Q1', 'Q2', 'Q3', 'Q4', 'HT', 'OT', 'BT'].includes(g.status.short)
    const isComplete = ['FT', 'AOT'].includes(g.status.short)
    const status = isLive ? 'live' : isComplete ? 'completed' : 'scheduled'

    return {
        id: g.id,
        slug: `basketball-${g.id}`,
        sport_type: 'basketball',
        match_type: 'League',
        status,
        scheduled_at: g.date,
        started_at: isLive ? g.date : null,
        venue: null,
        venue_country: g.country.name,
        is_featured: false,
        sport: { id: 'basketball', name: 'Basketball', slug: 'basketball', sport_type: 'basketball' },
        league: { 
            id: `lg-${g.league.id}`, 
            name: g.league.name, 
            slug: g.league.name.toLowerCase().replace(/\s+/g, '-'), 
            logo_url: g.league.logo, 
            country: g.country.name 
        },
        match_desc: `${g.teams.home.name} vs ${g.teams.away.name}`,
        status_text: g.status.long + (g.status.timer ? ` - ${g.status.timer}` : ''),
        state: g.status.short,
        home_team: { 
            id: `t-${g.teams.home.id}`, 
            name: g.teams.home.name, 
            short_name: g.teams.home.name.slice(0, 3).toUpperCase(), 
            slug: g.teams.home.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.home.logo 
        },
        away_team: { 
            id: `t-${g.teams.away.id}`, 
            name: g.teams.away.name, 
            short_name: g.teams.away.name.slice(0, 3).toUpperCase(), 
            slug: g.teams.away.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.away.logo 
        },
        score: { 
            home_score: g.scores?.home?.total ?? 0, 
            away_score: g.scores?.away?.total ?? 0,
            status_text: g.status.long
        },
        match_format: 'BASKETBALL',
        toss: null,
        umpires: [],
        referee: null,
        scorecard: [],
        incidents: [],
        statistics: [],
        innings: [
            { inning: 'Q1', home: g.scores?.home?.quarter_1 ?? 0, away: g.scores?.away?.quarter_1 ?? 0 },
            { inning: 'Q2', home: g.scores?.home?.quarter_2 ?? 0, away: g.scores?.away?.quarter_2 ?? 0 },
            { inning: 'Q3', home: g.scores?.home?.quarter_3 ?? 0, away: g.scores?.away?.quarter_3 ?? 0 },
            { inning: 'Q4', home: g.scores?.home?.quarter_4 ?? 0, away: g.scores?.away?.quarter_4 ?? 0 },
        ].filter(i => i.home > 0 || i.away > 0)
    }
}

export async function getLiveBasketball() {
    const data = await rapidFetch<BasketballResponse>(`https://${BASKETBALL_HOST}/games?live=all`, BASKETBALL_HOST)
    return data?.response ? data.response.map(normaliseBasketballGame) : []
}

export async function getTodayBasketball() {
    const today = new Date().toISOString().split('T')[0]
    const data = await rapidFetch<BasketballResponse>(`https://${BASKETBALL_HOST}/games?date=${today}`, BASKETBALL_HOST)
    return data?.response ? data.response.map(normaliseBasketballGame) : []
}

export async function getBasketballMatchDetail(eventId: number) {
    const data = await rapidFetch<BasketballResponse>(`https://${BASKETBALL_HOST}/games?id=${eventId}`, BASKETBALL_HOST)
    if (!data?.response?.[0]) return null
    return normaliseBasketballGame(data.response[0])
}


// ═══════════════════════════════════════════════════════════════════════════════
// FOOTBALL (API-Football v3)
// ═══════════════════════════════════════════════════════════════════════════════

interface FootballFixture {
    fixture: {
        id: number
        date: string
        timestamp: number
        status: { long: string; short: string; elapsed: number | null }
        venue: { name: string; city: string } | null
    }
    league: {
        id: number; name: string; country: string; logo: string; round: string
    }
    teams: {
        home: { id: number; name: string; logo: string; winner: boolean | null }
        away: { id: number; name: string; logo: string; winner: boolean | null }
    }
    goals: { home: number | null; away: number | null }
    score: {
        halftime: { home: number | null; away: number | null }
        fulltime: { home: number | null; away: number | null }
    }
}

interface FootballResponse {
    response: FootballFixture[]
}

/** Map API-Football status codes to our internal status */
function mapFootballStatus(short: string): string {
    const map: Record<string, string> = {
        'TBD': 'scheduled', 'NS': 'scheduled',
        '1H': 'live', '2H': 'live', 'ET': 'live', 'P': 'live', 'BT': 'live', 'HT': 'half_time',
        'FT': 'completed', 'AET': 'completed', 'PEN': 'completed',
        'SUSP': 'postponed', 'INT': 'postponed',
        'PST': 'postponed', 'CANC': 'cancelled', 'ABD': 'cancelled',
        'AWD': 'completed', 'WO': 'completed',
    }
    return map[short] ?? 'scheduled'
}

/** Normalise a football fixture into our Match shape */
function normaliseFootballFixture(f: FootballFixture) {
    const status = mapFootballStatus(f.fixture.status.short)

    let match_type = 'League'
    const lgName = f.league.name.toLowerCase()
    if (f.league.country === 'World') match_type = 'International'
    else if (lgName.includes('cup') || lgName.includes('copa')) match_type = 'Cup'
    else if (lgName.includes('women')) match_type = 'Women'

    return {
        id: `fb-${f.fixture.id}`,
        slug: `football-${f.fixture.id}`,
        sport_type: 'football' as const,
        match_type,
        status,
        scheduled_at: f.fixture.date,
        started_at: ['live', 'half_time'].includes(status) ? f.fixture.date : null,
        venue: f.fixture.venue?.name ?? null,
        venue_country: f.league.country,
        is_featured: false,
        sport: { id: 'football', name: 'Football', slug: 'football', sport_type: 'football' },
        league: {
            id: `lg-${f.league.id}`, name: f.league.name, slug: f.league.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: f.league.logo, country: f.league.country,
        },
        home_team: {
            id: `ft-${f.teams.home.id}`, name: f.teams.home.name,
            short_name: f.teams.home.name.length > 12 ? f.teams.home.name.slice(0, 3).toUpperCase() : f.teams.home.name,
            slug: f.teams.home.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: f.teams.home.logo,
        },
        away_team: {
            id: `ft-${f.teams.away.id}`, name: f.teams.away.name,
            short_name: f.teams.away.name.length > 12 ? f.teams.away.name.slice(0, 3).toUpperCase() : f.teams.away.name,
            slug: f.teams.away.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: f.teams.away.logo,
        },
        score: {
            home_score: f.goals.home ?? 0,
            away_score: f.goals.away ?? 0,
            home_score_ht: f.score.halftime.home,
            away_score_ht: f.score.halftime.away,
            elapsed: f.fixture.status.elapsed,
            status_text: f.fixture.status.long,
        },
    }
}

export async function getLiveFootball() {
    const data = await rapidFetch<FootballResponse>(
        `https://${FOOTBALL_HOST}/fixtures?live=all`,
        FOOTBALL_HOST
    )
    if (!data?.response) return []
    return data.response.map(normaliseFootballFixture)
}

export async function getTodayFootball() {
    const today = new Date().toISOString().split('T')[0]
    const data = await rapidFetch<FootballResponse>(
        `https://${FOOTBALL_HOST}/fixtures?date=${today}`,
        FOOTBALL_HOST
    )
    if (!data?.response) return []
    return data.response.map(normaliseFootballFixture)
}

export async function getFootballMatchDetail(eventId: number) {
    const [detailRes, eventsRes, statsRes] = await Promise.allSettled([
        rapidFetch<FootballResponse>(`https://${FOOTBALL_HOST}/fixtures?id=${eventId}`, FOOTBALL_HOST),
        rapidFetch<{response: any[]}>(`https://${FOOTBALL_HOST}/fixtures/events?fixture=${eventId}`, FOOTBALL_HOST),
        rapidFetch<{response: any[]}>(`https://${FOOTBALL_HOST}/fixtures/statistics?fixture=${eventId}`, FOOTBALL_HOST)
    ])

    const data = detailRes.status === 'fulfilled' ? detailRes.value : null
    if (!data?.response?.[0]) return null
    const f = data.response[0]
    
    const events = eventsRes.status === 'fulfilled' ? (eventsRes.value?.response || []) : []
    let stats = statsRes.status === 'fulfilled' ? (statsRes.value?.response || []) : []
    
    // Normalise incidents to match the UI shape
    const incidents = events.map(ev => ({
        time: ev.time.elapsed,
        incidentType: ev.type.toLowerCase(), // 'goal', 'card', 'subst'
        player: { name: ev.player.name },
        text: ev.detail
    }))

    // Normalise stats to match the UI shape
    const statisticsGroups = []
    if (stats.length === 2) {
        // Assume stats[0] is home and stats[1] is away
        const homeStats = stats[0].statistics
        const awayStats = stats[1].statistics
        
        const items = homeStats.map((hs: any, i: number) => {
            const awayVal = awayStats[i]?.value ?? 0
            const homeVal = hs.value ?? 0
            
            let hNum = typeof homeVal === 'string' && homeVal.includes('%') ? parseInt(homeVal) : (parseInt(homeVal as any) || 0)
            let aNum = typeof awayVal === 'string' && awayVal.includes('%') ? parseInt(awayVal) : (parseInt(awayVal as any) || 0)
            
            return {
                name: hs.type,
                home: homeVal,
                away: awayVal,
                homeValue: hNum,
                awayValue: aNum
            }
        })
        
        statisticsGroups.push({
            groupName: 'Match overview',
            statisticsItems: items
        })
    }

    const status = mapFootballStatus(f.fixture.status.short)

    return {
        id: `football-${f.fixture.id}`,
        slug: `football-${f.fixture.id}`,
        sport_type: 'football' as const,
        status,
        scheduled_at: f.fixture.date,
        venue: f.fixture.venue?.name ?? null,
        venue_country: f.league.country,
        is_featured: false,
        sport: { id: 'football', name: 'Football', slug: 'football', sport_type: 'football' },
        league: { id: `lg-${f.league.id}`, name: f.league.name },
        match_desc: f.league.name,
        match_format: 'FOOTBALL',
        status_text: f.fixture.status.long,
        state: f.fixture.status.short,
        home_team: { 
            id: `ft-${f.teams.home.id}`, 
            name: f.teams.home.name, 
            short_name: f.teams.home.name.length > 12 ? f.teams.home.name.slice(0, 3).toUpperCase() : f.teams.home.name 
        },
        away_team: { 
            id: `ft-${f.teams.away.id}`, 
            name: f.teams.away.name, 
            short_name: f.teams.away.name.length > 12 ? f.teams.away.name.slice(0, 3).toUpperCase() : f.teams.away.name 
        },
        toss: null,
        umpires: [],
        referee: null,
        score: { home: f.goals.home ?? 0, away: f.goals.away ?? 0 },
        scorecard: [],
        incidents: incidents.reverse(), // reverse so latest is first
        statistics: [{ groups: statisticsGroups }]
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// CRICKET (Cricbuzz)
// ═══════════════════════════════════════════════════════════════════════════════

interface CricbuzzMatch {
    matchInfo: {
        matchId: number
        matchDescription: string
        matchFormat: string
        status: string
        state: string
        team1: { teamId: number; teamName: string; teamSName: string; imageId?: number }
        team2: { teamId: number; teamName: string; teamSName: string; imageId?: number }
        venueInfo?: { ground: string; city: string }
        seriesName: string
        seriesId: number
        startDate: string
        endDate: string
    }
    matchScore?: {
        team1Score?: { inngs1?: { runs: number; wickets: number; overs: number } }
        team2Score?: { inngs1?: { runs: number; wickets: number; overs: number } }
    }
}

interface CricbuzzTypeMatch {
    matchType?: string
    seriesMatches?: Array<{
        seriesAdWrapper?: {
            seriesId: number
            seriesName: string
            matches?: CricbuzzMatch[]
        }
    }>
}

interface CricbuzzResponse {
    typeMatches?: CricbuzzTypeMatch[]
}

/** Normalise Cricbuzz match into our Match shape */
function normaliseCricketMatch(cm: CricbuzzMatch, matchType: string = 'Other') {
    const info = cm.matchInfo
    const isLive = info.state === 'In Progress' || info.state === 'Innings Break'
    const isComplete = info.state === 'Complete'

    const t1Score = cm.matchScore?.team1Score?.inngs1
    const t2Score = cm.matchScore?.team2Score?.inngs1

    let scheduled_at = new Date().toISOString()
    try {
        if (info.startDate) scheduled_at = new Date(parseInt(info.startDate)).toISOString()
    } catch (e) {}

    return {
        id: `cr-${info.matchId}`,
        slug: `cricket-${info.matchId}`,
        sport_type: 'cricket' as const,
        match_type: matchType,
        status: isLive ? 'live' : isComplete ? 'completed' : 'scheduled',
        scheduled_at,
        started_at: isLive ? scheduled_at : null,
        venue: info.venueInfo ? `${info.venueInfo.ground}, ${info.venueInfo.city}` : null,
        venue_country: info.venueInfo?.city ?? null, // Approximate country/city
        is_featured: false,
        sport: { id: 'cricket', name: 'Cricket', slug: 'cricket', sport_type: 'cricket' },
        league: {
            id: `cs-${info.seriesId}`, name: info.seriesName,
            slug: info.seriesName.toLowerCase().replace(/\s+/g, '-'),
        },
        home_team: {
            id: `ct-${info.team1.teamId}`, name: info.team1.teamName,
            short_name: info.team1.teamSName,
            slug: info.team1.teamName.toLowerCase().replace(/\s+/g, '-'),
            logo_url: undefined,
        },
        away_team: {
            id: `ct-${info.team2.teamId}`, name: info.team2.teamName,
            short_name: info.team2.teamSName,
            slug: info.team2.teamName.toLowerCase().replace(/\s+/g, '-'),
            logo_url: undefined,
        },
        score: {
            home_score: t1Score?.runs ?? 0,
            away_score: t2Score?.runs ?? 0,
            home_wickets: t1Score?.wickets ?? 0,
            away_wickets: t2Score?.wickets ?? 0,
            home_overs: t1Score?.overs ?? 0,
            away_overs: t2Score?.overs ?? 0,
            status_text: info.status,
            match_format: info.matchFormat,
        },
    }
}

/** Parse Cricbuzz API response → flat match array */
function parseCricbuzzResponse(data: CricbuzzResponse) {
    const matches: ReturnType<typeof normaliseCricketMatch>[] = []
    for (const typeMatch of data.typeMatches ?? []) {
        const mType = typeMatch.matchType ?? 'Other'
        for (const sm of typeMatch.seriesMatches ?? []) {
            let seriesMatches: CricbuzzMatch[] = []
            
            // Matches can be nested differently depending on ads
            if (sm.seriesAdWrapper?.matches) {
                seriesMatches = sm.seriesAdWrapper.matches
            } else if ((sm as any).series?.matches) {
                seriesMatches = (sm as any).series.matches
            } else if ((sm as any).matches) {
                seriesMatches = (sm as any).matches
            }

            if (seriesMatches.length > 0) {
                matches.push(...seriesMatches.map(m => normaliseCricketMatch(m, mType)))
            }
        }
    }
    return matches
}

/** Fetch live cricket matches */
export async function getLiveCricket() {
    const data = await rapidFetch<CricbuzzResponse>(
        `https://${CRICKET_HOST}/matches/v1/live`,
        CRICKET_HOST
    )
    if (!data) return []
    return parseCricbuzzResponse(data)
}

/** Fetch recent cricket matches */
export async function getRecentCricket() {
    const data = await rapidFetch<CricbuzzResponse>(
        `https://${CRICKET_HOST}/matches/v1/recent`,
        CRICKET_HOST
    )
    if (!data) return []
    return parseCricbuzzResponse(data)
}

/** Fetch upcoming cricket matches */
export async function getUpcomingCricket() {
    const data = await rapidFetch<CricbuzzResponse>(
        `https://${CRICKET_HOST}/matches/v1/upcoming`,
        CRICKET_HOST
    )
    if (!data) return []
    return parseCricbuzzResponse(data)
}


// ═══════════════════════════════════════════════════════════════════════════════
// COMBINED MULTI-SPORT
// ═══════════════════════════════════════════════════════════════════════════════

/** Get all live matches across sports */
export async function getAllLiveMatches() {
    const [football, basketball, baseball, cricket, mma, rugby, tennis] = await Promise.allSettled([
        getLiveFootball(),
        getLiveBasketball(),
        getLiveBaseball(),
        getLiveCricket(),
        getLiveMMA(),
        getLiveRugby(),
        getLiveTennis(),
    ])
    return [
        ...(football.status === 'fulfilled' ? football.value : []),
        ...(basketball.status === 'fulfilled' ? basketball.value : []),
        ...(baseball.status === 'fulfilled' ? baseball.value : []),
        ...(cricket.status === 'fulfilled' ? cricket.value : []),
        ...(mma.status === 'fulfilled' ? mma.value : []),
        ...(rugby.status === 'fulfilled' ? rugby.value : []),
        ...(tennis.status === 'fulfilled' ? tennis.value : []),
    ]
}


/** Get today's matches across sports */
export async function getAllTodayMatches() {
    const [football, basketball, baseball, cricket, mma, rugby, badminton, boxing, tennis] = await Promise.allSettled([
        getTodayFootball(),
        getTodayBasketball(),
        getTodayBaseball(),
        getLiveCricket(),
        getUpcomingMMA(),
        getTodayRugby(),
        getUpcomingBadminton(),
        getUpcomingBoxing(),
        getUpcomingTennis(),
    ])
    return [
        ...(football.status === 'fulfilled' ? football.value : []),
        ...(basketball.status === 'fulfilled' ? basketball.value : []),
        ...(baseball.status === 'fulfilled' ? baseball.value : []),
        ...(cricket.status === 'fulfilled' ? cricket.value : []),
        ...(mma.status === 'fulfilled' ? mma.value : []),
        ...(rugby.status === 'fulfilled' ? rugby.value : []),
        ...(badminton.status === 'fulfilled' ? badminton.value : []),
        ...(boxing.status === 'fulfilled' ? boxing.value : []),
        ...(tennis.status === 'fulfilled' ? tennis.value : []),
    ]


}




// ═══════════════════════════════════════════════════════════════════════════════
// MATCH DETAIL (Cricbuzz mcenter — all keys are lowercase)
// ═══════════════════════════════════════════════════════════════════════════════

/** Fetch detailed cricket match info including scorecard */
export async function getCricketMatchDetail(matchId: number) {
    const [infoRes, scorecardRes] = await Promise.allSettled([
        rapidFetch<any>(
            `https://${CRICKET_HOST}/mcenter/v1/${matchId}`,
            CRICKET_HOST
        ),
        rapidFetch<any>(
            `https://${CRICKET_HOST}/mcenter/v1/${matchId}/scard`,
            CRICKET_HOST
        ),
    ])

    const mi = infoRes.status === 'fulfilled' ? infoRes.value : null
    const scData = scorecardRes.status === 'fulfilled' ? scorecardRes.value : null

    if (!mi || !mi.matchid) return null

    const isLive = mi.state === 'In Progress' || mi.state === 'Innings Break' || mi.state === 'Stumps'
    const isComplete = mi.state === 'Complete'
    const venue = mi.venueinfo

    // Parse scorecard innings (all keys lowercase)
    const innings = (scData?.scorecard ?? []).map((inn: any) => ({
        inningsId: inn.inningsid,
        bat_team: inn.batteamsname ?? inn.batteamname ?? '',
        runs: inn.score ?? 0,
        wickets: inn.wickets ?? 0,
        overs: inn.overs ?? 0,
        run_rate: inn.runrate ?? 0,
        is_declared: inn.isdeclared ?? false,
        extras: inn.extras?.total ?? 0,
        batsmen: (inn.batsman ?? []).map((b: any) => ({
            name: b.name ?? b.nickname ?? '',
            runs: b.runs ?? 0,
            balls: b.balls ?? 0,
            fours: b.fours ?? 0,
            sixes: b.sixes ?? 0,
            sr: parseFloat(b.strkrate ?? '0'),
            out_desc: b.outdec ?? '',
        })),
        bowlers: (inn.bowler ?? []).map((b: any) => ({
            name: b.name ?? b.nickname ?? '',
            overs: parseFloat(b.overs ?? '0'),
            maidens: b.maidens ?? 0,
            runs: b.runs ?? 0,
            wickets: b.wickets ?? 0,
            economy: parseFloat(b.economy ?? '0'),
        })),
    }))

    return {
        id: `cr-${mi.matchid}`,
        slug: `cricket-${mi.matchid}`,
        sport_type: 'cricket' as const,
        status: isLive ? 'live' : isComplete ? 'completed' : 'scheduled',
        scheduled_at: new Date(parseInt(mi.startdate ?? '0')).toISOString(),
        venue: venue ? `${venue.ground}, ${venue.city}` : null,
        venue_country: venue?.country ?? null,
        is_featured: false,
        sport: { id: 'cricket', name: 'Cricket', slug: 'cricket', sport_type: 'cricket' },
        league: { id: `cs-${mi.seriesid}`, name: mi.seriesname ?? '' },
        match_desc: mi.matchdesc ?? '',
        match_format: mi.matchformat ?? '',
        status_text: mi.status ?? '',
        state: mi.state ?? '',
        home_team: { id: `ct-${mi.team1?.teamid}`, name: mi.team1?.teamname ?? '', short_name: mi.team1?.teamsname ?? '' },
        away_team: { id: `ct-${mi.team2?.teamid}`, name: mi.team2?.teamname ?? '', short_name: mi.team2?.teamsname ?? '' },
        toss: mi.tossstatus ?? null,
        umpires: [mi.umpire1?.name, mi.umpire2?.name].filter(Boolean),
        referee: mi.referee?.name ?? null,
        scorecard: innings,
    }
}

// MMA (API-Sports)
// ═══════════════════════════════════════════════════════════════════════════════

interface MMAGame {
    id: number;
    date: string;
    timestamp: number;
    timezone: string;
    status: { long: string; short: string; };
    league: { id: number; name: string; logo: string; season: number; };
    teams: {
        home: { id: number; name: string; logo: string; };
        away: { id: number; name: string; logo: string; };
    };
    category: string;
}

interface MMAResponse { response: MMAGame[] }

function normaliseMMAGame(g: MMAGame): NormalizedMatch {
    const isLive = g.status.short === 'IN' || g.status.short === 'LIVE'
    const isComplete = ['FT', 'AET', 'AW'].includes(g.status.short)
    const status = isLive ? 'live' : isComplete ? 'completed' : 'scheduled'

    return {
        id: g.id,
        slug: `mma-${g.id}`,
        sport_type: 'mma',
        match_type: 'Fight',
        status,
        scheduled_at: g.date,
        started_at: isLive ? g.date : null,
        venue: null,
        venue_country: null,
        is_featured: false,
        sport: { id: 'mma', name: 'MMA', slug: 'mma', sport_type: 'mma' },
        league: { 
            id: `lg-${g.league.id}`, 
            name: g.league.name, 
            slug: g.league.name.toLowerCase().replace(/\s+/g, '-'), 
            logo_url: g.league.logo 
        },
        match_desc: g.category || 'MMA Bout',
        status_text: g.status.long,
        state: g.status.short,
        home_team: { 
            id: `f-${g.teams.home.id}`, 
            name: g.teams.home.name, 
            short_name: g.teams.home.name.split(' ').pop() || '', 
            slug: g.teams.home.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.home.logo 
        },
        away_team: { 
            id: `f-${g.teams.away.id}`, 
            name: g.teams.away.name, 
            short_name: g.teams.away.name.split(' ').pop() || '', 
            slug: g.teams.away.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.away.logo 
        },
        score: {
            home_score: 0,
            away_score: 0,
            status_text: g.status.long
        },
        match_format: 'MMA',
        toss: null,
        umpires: [],
        referee: null,
        scorecard: [],
        incidents: [],
        statistics: [],
    }
}

export async function getLiveMMA() {
    const data = await rapidFetch<MMAResponse>(`https://${MMA_HOST}/fights?live=all`, MMA_HOST)
    return data?.response ? data.response.map(normaliseMMAGame) : []
}

export async function getUpcomingMMA() {
    const year = new Date().getFullYear()
    const data = await rapidFetch<MMAResponse>(`https://${MMA_HOST}/fights?season=${year}`, MMA_HOST)
    if (!data?.response) return []
    const now = new Date().getTime()
    return data.response
        .filter(f => new Date(f.date).getTime() > now)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(normaliseMMAGame)
}

export async function getMMAMatchDetail(fightId: number) {
    const data = await rapidFetch<MMAResponse>(`https://${MMA_HOST}/fights?id=${fightId}`, MMA_HOST)
    if (!data?.response?.[0]) return null
    return normaliseMMAGame(data.response[0])
}


// ═══════════════════════════════════════════════════════════════════════════════
// RUGBY (API-Sports)
// ═══════════════════════════════════════════════════════════════════════════════

interface RugbyGame {
    id: number;
    date: string;
    timestamp: number;
    timezone: string;
    status: { long: string; short: string; timer: string | null };
    league: { id: number; name: string; logo: string; season: number; };
    country: { id: number; name: string; code: string; flag: string };
    teams: {
        home: { id: number; name: string; logo: string; };
        away: { id: number; name: string; logo: string; };
    };
    scores: {
        home: number | null;
        away: number | null;
    };
}

interface RugbyResponse { response: RugbyGame[] }

function normaliseRugbyGame(g: RugbyGame): NormalizedMatch {
    const isLive = ['1H', '2H', 'ET', 'P', 'BT', 'LIVE'].includes(g.status.short)
    const isComplete = ['FT', 'AET', 'PEN'].includes(g.status.short)
    const status = isLive ? 'live' : isComplete ? 'completed' : 'scheduled'

    return {
        id: g.id,
        slug: `rugby-${g.id}`,
        sport_type: 'rugby',
        match_type: 'League',
        status,
        scheduled_at: g.date,
        started_at: isLive ? g.date : null,
        venue: null,
        venue_country: g.country?.name || null,
        is_featured: false,
        sport: { id: 'rugby', name: 'Rugby', slug: 'rugby', sport_type: 'rugby' },
        league: { 
            id: `lg-${g.league.id}`, 
            name: g.league.name, 
            slug: g.league.name.toLowerCase().replace(/\s+/g, '-'), 
            logo_url: g.league.logo,
            country: g.country?.name || ''
        },
        match_desc: g.league.name,
        status_text: g.status.long + (g.status.timer ? ` - ${g.status.timer}` : ''),
        state: g.status.short,
        home_team: { 
            id: `t-${g.teams.home.id}`, 
            name: g.teams.home.name, 
            short_name: g.teams.home.name.slice(0, 3).toUpperCase(), 
            slug: g.teams.home.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.home.logo 
        },
        away_team: { 
            id: `t-${g.teams.away.id}`, 
            name: g.teams.away.name, 
            short_name: g.teams.away.name.slice(0, 3).toUpperCase(), 
            slug: g.teams.away.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.away.logo 
        },
        score: {
            home_score: g.scores?.home ?? 0,
            away_score: g.scores?.away ?? 0,
            status_text: g.status.long
        },
        match_format: 'RUGBY',
        toss: null,
        umpires: [],
        referee: null,
        scorecard: [],
        incidents: [],
        statistics: [],
    }
}

export async function getLiveRugby() {
    const data = await rapidFetch<RugbyResponse>(`https://${RUGBY_HOST}/games?live=all`, RUGBY_HOST)
    return data?.response ? data.response.map(normaliseRugbyGame) : []
}

export async function getTodayRugby() {
    const today = new Date().toISOString().split('T')[0]
    const data = await rapidFetch<RugbyResponse>(`https://${RUGBY_HOST}/games?date=${today}`, RUGBY_HOST)
    return data?.response ? data.response.map(normaliseRugbyGame) : []
}

export async function getRugbyMatchDetail(gameId: string | number) {
    const data = await rapidFetch<RugbyResponse>(`https://${RUGBY_HOST}/games?id=${gameId}`, RUGBY_HOST)
    if (!data?.response?.[0]) return null
    return normaliseRugbyGame(data.response[0])
}


// ═══════════════════════════════════════════════════════════════════════════════
// BASEBALL (API-Sports)
// ═══════════════════════════════════════════════════════════════════════════════



interface BaseballGame {
    id: number;
    date: string;
    time: string;
    timestamp: number;
    timezone: string;
    week: string | null;
    status: { long: string; short: string; };
    country: { id: number; name: string; code: string; flag: string; };
    league: { id: number; name: string; type: string; logo: string; season: number; };
    teams: {
        home: { id: number; name: string; logo: string; };
        away: { id: number; name: string; logo: string; };
    };
    scores: {
        home: { hits: number | null; errors: number | null; innings: Record<string, number | null>; total: number | null; };
        away: { hits: number | null; errors: number | null; innings: Record<string, number | null>; total: number | null; };
    };
}

interface BaseballResponse { response: BaseballGame[] }

function normaliseBaseballGame(g: BaseballGame): NormalizedMatch {
    const isLive = g.status.short === 'IN' || g.status.short === 'EXTRA'
    const isComplete = g.status.short === 'FT' || g.status.short === 'AET' || g.status.short === 'AW' || g.status.short === 'POST'
    const leagueName = g.league.name
    const country = g.country.name

    const inningsData: { inning: string; home: number; away: number }[] = []
    const hInnings = g.scores?.home?.innings
    const aInnings = g.scores?.away?.innings

    if (hInnings && aInnings) {
        for (let i = 1; i <= 9; i++) {
            const hInn = hInnings[String(i)]
            const aInn = aInnings[String(i)]
            if ((hInn !== null && hInn !== undefined) || (aInn !== null && aInn !== undefined)) {
                inningsData.push({
                    inning: String(i),
                    home: hInn ?? 0,
                    away: aInn ?? 0,
                })
            }
        }
        if (hInnings.extra !== null && hInnings.extra !== undefined) {
            inningsData.push({ inning: 'EX', home: hInnings.extra ?? 0, away: aInnings.extra ?? 0 })
        }
    }

    return {
        id: g.id,
        slug: `baseball-${g.id}`,
        sport_type: 'baseball',
        match_type: 'League',
        status: isLive ? 'live' : isComplete ? 'completed' : 'scheduled',
        scheduled_at: g.date,
        started_at: isLive ? g.date : null,
        venue: null,
        venue_country: country,
        is_featured: false,
        sport: { id: 'baseball', name: 'Baseball', slug: 'baseball', sport_type: 'baseball' },
        league: {
            id: `lg-${g.league.id}`,
            name: leagueName,
            slug: leagueName.toLowerCase().replace(/\s+/g, '-'),
            country,
        },
        home_team: {
            id: `t-${g.teams.home.id}`,
            name: g.teams.home.name,
            short_name: g.teams.home.name.slice(0, 3).toUpperCase(),
            slug: g.teams.home.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.home.logo,
        },
        away_team: {
            id: `t-${g.teams.away.id}`,
            name: g.teams.away.name,
            short_name: g.teams.away.name.slice(0, 3).toUpperCase(),
            slug: g.teams.away.name.toLowerCase().replace(/\s+/g, '-'),
            logo_url: g.teams.away.logo,
        },
        score: {
            home_score: g.scores?.home?.total ?? 0,
            away_score: g.scores?.away?.total ?? 0,
            status_text: g.status.long,
        },
        match_desc: leagueName,
        match_format: 'BASEBALL',
        status_text: g.status.long,
        state: g.status.short,
        toss: null,
        umpires: [],
        referee: null,
        scorecard: [],
        incidents: [],
        statistics: [],
        innings: inningsData,
        rhe: {
            home: { runs: g.scores?.home?.total ?? 0, hits: g.scores?.home?.hits ?? 0, errors: g.scores?.home?.errors ?? 0 },
            away: { runs: g.scores?.away?.total ?? 0, hits: g.scores?.away?.hits ?? 0, errors: g.scores?.away?.errors ?? 0 },
        },
    }
}

export async function getLiveBaseball() {
    const data = await rapidFetch<BaseballResponse>(`https://${BASEBALL_HOST}/games?live=all`, BASEBALL_HOST)
    return data?.response ? data.response.map(normaliseBaseballGame) : []
}

export async function getTodayBaseball() {
    const today = new Date().toISOString().split('T')[0]
    const data = await rapidFetch<BaseballResponse>(`https://${BASEBALL_HOST}/games?date=${today}`, BASEBALL_HOST)
    return data?.response ? data.response.map(normaliseBaseballGame) : []
}

export async function getBaseballMatchDetail(eventId: number) {
    const data = await rapidFetch<BaseballResponse>(`https://${BASEBALL_HOST}/games?id=${eventId}`, BASEBALL_HOST)
    if (!data?.response?.[0]) return null
    return normaliseBaseballGame(data.response[0])
}
// ─── Formula 1 Data Fetching ───────────────────────────────────────────────────

interface F1Race {
    id: number
    competition: { name: string; location: { country: string; city: string } }
    circuit: { name: string }
    season: number
    type: string
    date: string
    status: string
}

function normaliseF1Race(r: F1Race) {
    const isLive = r.status.toLowerCase() === 'live' || r.status.toLowerCase() === 'in progress'
    const isComplete = r.status.toLowerCase() === 'completed'
    
    return {
        id: `f1-${r.id}`,
        slug: `f1-${r.id}`,
        sport_type: 'formula-1' as const,
        status: isLive ? 'live' : isComplete ? 'completed' : 'scheduled',
        scheduled_at: r.date,
        venue: r.circuit.name,
        venue_country: r.competition.location.country,
        is_featured: false,
        sport: { id: 'formula-1', name: 'Formula 1', slug: 'formula-1', sport_type: 'formula-1' },
        league: { id: `lg-f1-${r.season}`, name: `Formula 1 ${r.season}` },
        match_desc: `${r.competition.name} — ${r.type}`,
        match_format: 'RACE',
        status_text: r.status,
        state: r.status,
        home_team: {
            id: 't-f1-dummy-1',
            name: r.competition.location.city || 'Location',
            short_name: (r.competition.location.city || 'LOC').slice(0, 3).toUpperCase(),
        },
        away_team: {
            id: 't-f1-dummy-2',
            name: r.competition.location.country || 'Country',
            short_name: (r.competition.location.country || 'COU').slice(0, 3).toUpperCase(),
        },
        score: null,
        scorecard: [],
        umpires: [],
        toss: null,
        referee: null,
    }
}

export async function getF1Races(type: 'live' | 'upcoming' | 'recent') {
    // Note: API-Sports Free tier only supports up to 2024 for Formula 1
    const year = 2024 
    const data = await rapidFetch<{ response: F1Race[] }>(`https://${F1_HOST}/races?season=${year}&type=Race`, F1_HOST)
    if (!data?.response) return []
    
    const now = new Date().getTime()
    const races = data.response
    
    if (type === 'live') {
        return races
            .filter(r => r.status.toLowerCase() === 'live' || r.status.toLowerCase() === 'in progress')
            .map(normaliseF1Race)
    } else if (type === 'upcoming') {
        return races
            .filter(r => r.status.toLowerCase() === 'scheduled' || new Date(r.date).getTime() > now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(normaliseF1Race)
    } else {
        return races
            .filter(r => r.status.toLowerCase() === 'completed')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 15) // Limit recent races
            .map(normaliseF1Race)
    }
}

export async function getF1MatchDetail(raceId: number) {
    const data = await rapidFetch<{ response: F1Race[] }>(`https://${F1_HOST}/races?id=${raceId}`, F1_HOST)
    if (!data?.response || data.response.length === 0) return null
    
    return normaliseF1Race(data.response[0])
}


// ═══════════════════════════════════════════════════════════════════════════════
// BADMINTON (TheSportsDB)
// ═══════════════════════════════════════════════════════════════════════════════

interface TSDBEvent {
    idEvent: string;
    strEvent: string;
    strSport: string;
    idLeague: string;
    strLeague: string;
    strHomeTeam: string;
    strAwayTeam: string;
    intHomeScore: string | null;
    intAwayScore: string | null;
    dateEvent: string;
    strTime: string;
    idHomeTeam: string;
    idAwayTeam: string;
    strVenue: string;
    strCountry: string;
    strStatus: string;
}

interface TSDBResponse { events: TSDBEvent[] | null }

function normaliseTSDBEvent(e: TSDBEvent): NormalizedMatch {
    const isComplete = e.strStatus === 'Final' || !!e.intHomeScore
    const status = isComplete ? 'completed' : 'scheduled'

    const homeName = e.strHomeTeam || e.strEvent || 'Badminton'
    const awayName = e.strAwayTeam || 'TBD'

    return {
        id: e.idEvent,
        slug: `badminton-${e.idEvent}`,
        sport_type: 'badminton',
        status,
        scheduled_at: `${e.dateEvent}T${e.strTime || '00:00:00'}Z`,
        venue: e.strVenue,
        venue_country: e.strCountry,
        is_featured: false,
        sport: { id: 'badminton', name: 'Badminton', slug: 'badminton', sport_type: 'badminton' },
        league: { id: e.idLeague, name: e.strLeague },
        home_team: { 
            id: e.idHomeTeam || `h-${e.idEvent}`, 
            name: homeName, 
            short_name: homeName.slice(0,3).toUpperCase() 
        },
        away_team: { 
            id: e.idAwayTeam || `a-${e.idEvent}`, 
            name: awayName, 
            short_name: awayName.slice(0,3).toUpperCase() 
        },
        score: {
            home_score: parseInt(e.intHomeScore ?? '0'),
            away_score: parseInt(e.intAwayScore ?? '0'),
            status_text: e.strStatus || (isComplete ? 'Final' : 'Scheduled')
        },
        status_text: e.strStatus || (isComplete ? 'Final' : 'Scheduled'),
        match_format: 'Badminton',
        toss: null,
        umpires: [],
        referee: null,
        scorecard: [],
    }
}


export async function getUpcomingBadminton() {
    const leagueId = '5646' // BWF World Tour
    const data = await tsdbFetch<TSDBResponse>(`eventsnextleague.php?id=${leagueId}`)
    return data?.events ? data.events.map(normaliseTSDBEvent) : []
}

export async function getRecentBadminton() {
    const leagueId = '5646' // BWF World Tour
    const data = await tsdbFetch<TSDBResponse>(`eventspastleague.php?id=${leagueId}`)
    return data?.events ? data.events.map(normaliseTSDBEvent) : []
}

export async function getBadmintonMatchDetail(eventId: string | number) {
    const data = await tsdbFetch<TSDBResponse>(`lookupevent.php?id=${eventId}`)
    if (!data?.events?.[0]) return null
    return normaliseTSDBEvent(data.events[0])
}

export async function getUpcomingBoxing() {
    // Primary: Player-Props API
    const data = await playerPropsFetch<any[]>('sports/boxing/events')
    if (data && data.length > 0) {
        return data.map(e => normalisePlayerPropsEvent(e, 'Boxing'))
    }
    
    // Fallback: TheSportsDB
    const leagueId = '4445' 
    const tsdbData = await tsdbFetch<TSDBResponse>(`eventsnextleague.php?id=${leagueId}`)
    return tsdbData?.events ? tsdbData.events.map(normaliseTSDBEvent) : []
}

export async function getRecentBoxing() {
    // Player-Props is for upcoming. For results, use TSDB.
    const leagueId = '4445'
    const data = await tsdbFetch<TSDBResponse>(`eventspastleague.php?id=${leagueId}`)
    return data?.events ? data.events.map(normaliseTSDBEvent) : []
}

export async function getBoxingMatchDetail(eventId: string | number) {
    if (String(eventId).startsWith('pp-')) {
        // Player-props detail logic if needed, else return null for now
        return null 
    }
    const data = await tsdbFetch<TSDBResponse>(`lookupevent.php?id=${eventId}`)
    if (!data?.events?.[0]) return null
    return normaliseTSDBEvent(data.events[0])
}





export async function getUpcomingTennis() {
    const data = await playerPropsFetch<any[]>('sports/tennis/events')
    if (!data) return []
    return data.map(e => normalisePlayerPropsEvent(e, 'Tennis')).filter(m => m.status === 'scheduled')
}

export async function getLiveTennis() {
    const data = await playerPropsFetch<any[]>('sports/tennis/events')
    if (!data) return []
    return data.map(e => normalisePlayerPropsEvent(e, 'Tennis')).filter(m => m.status === 'live')
}

export async function getRecentTennis() {
    const data = await playerPropsFetch<any[]>('sports/tennis/events')
    if (!data) return []
    return data.map(e => normalisePlayerPropsEvent(e, 'Tennis')).filter(m => m.status === 'completed')
}

export async function getTennisMatchDetail(eventId: string | number) {
    const data = await playerPropsFetch<any[]>('sports/tennis/events')
    if (!data) return null
    const event = data.find(e => String(e.id) === String(eventId).replace('pp-', ''))
    if (!event) return null
    return normalisePlayerPropsEvent(event, 'Tennis')
}


