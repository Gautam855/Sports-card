import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
    getLiveFootball, getTodayFootball, 
    getLiveBasketball, getTodayBasketball,
    getLiveBaseball, getTodayBaseball,
    getLiveMMA, getUpcomingMMA,
    getLiveRugby, getTodayRugby,
    getUpcomingBadminton, getRecentBadminton,
    getUpcomingBoxing, getRecentBoxing,
    getLiveTennis, getUpcomingTennis, getRecentTennis,
    getLiveCricket, getRecentCricket, getUpcomingCricket,



    getF1Races
} from '@/lib/api/rapid'
import { MatchCard } from '@/components/sports/MatchCard'
import { Suspense } from 'react'
import { MatchCardSkeleton } from '@/components/sports/MatchCard'
import { SportMatchBoard } from '@/components/sports/SportMatchBoard'

// ── Sport definitions ────────────────────────────────────────────

const SPORTS: Record<string, {
    name: string
    emoji: string
    description: string
    color: string
    keywords: string[]
}> = {
    cricket: {
        name: 'Cricket',
        emoji: '🏏',
        description: 'Live cricket scores, ball-by-ball updates, match schedules and results from international, domestic and T20 leagues.',
        color: 'text-sport-cricket',
        keywords: ['cricket live score', 'cricket match today', 'ipl live score', 'test match score'],
    },
    football: {
        name: 'Football',
        emoji: '⚽',
        description: 'Live football scores, Premier League, La Liga, Champions League fixtures and results updated in real-time.',
        color: 'text-sport-football',
        keywords: ['football live score', 'premier league scores', 'champions league', 'la liga results'],
    },
    basketball: {
        name: 'Basketball',
        emoji: '🏀',
        description: 'NBA, EuroLeague and international basketball live scores, standings and schedules.',
        color: 'text-sport-basketball',
        keywords: ['nba live score', 'basketball score today', 'euroleague'],
    },
    'formula-1': {
        name: 'Formula 1',
        emoji: '🏎️',
        description: 'F1 race results, qualifying times, driver standings and live race updates.',
        color: 'text-sport-f1',
        keywords: ['f1 results', 'formula 1 standings', 'f1 live'],
    },
    mma: {
        name: 'MMA',
        emoji: '🥊',
        description: 'UFC and MMA fight results, upcoming fight cards, and live bout updates.',
        color: 'text-red-600',
        keywords: ['ufc results', 'mma fight today', 'ufc live', 'ufc schedule'],
    },
    baseball: {
        name: 'Baseball',
        emoji: '⚾',
        description: 'MLB, NPB and international baseball live scores, standings and game results.',
        color: 'text-blue-600',
        keywords: ['mlb live score', 'baseball score today', 'mlb standings', 'npb results'],
    },
    rugby: {
        name: 'Rugby',
        emoji: '🏉',
        description: 'Live rugby scores, fixtures and results from major leagues and international tournaments.',
        color: 'text-sport-rugby',
        keywords: ['rugby live score', 'rugby match today', 'rugby results'],
    },
    badminton: {
        name: 'Badminton',
        emoji: '🏸',
        description: 'BWF World Tour and international badminton live scores, rankings and tournament schedules.',
        color: 'text-sport-ufc', // Reusing a vibrant purple
        keywords: ['badminton live score', 'bwf world tour', 'badminton results'],
    },
    boxing: {
        name: 'Boxing',
        emoji: '🥊',
        description: 'World boxing rankings, fight schedules and live results from WBC, WBA, IBF and WBO.',
        color: 'text-red-500',
        keywords: ['boxing live score', 'boxing schedule', 'wbc results', 'boxing fight night'],
    },
    tennis: {
        name: 'Tennis',
        emoji: '🎾',
        description: 'ATP, WTA and Grand Slam live scores, tournament draws and match statistics.',
        color: 'text-lime-500',
        keywords: ['tennis live score', 'atp rankings', 'wta results', 'wimbledon scores'],
    },

}

// ── Metadata ─────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const sport = SPORTS[slug]
    if (!sport) return { title: 'Sport Not Found' }

    return {
        title: `${sport.name} Live Scores & Fixtures`,
        description: sport.description,
        keywords: sport.keywords,
    }
}

export function generateStaticParams() {
    return Object.keys(SPORTS).map(slug => ({ slug }))
}

// ── Data fetchers ────────────────────────────────────────────────

async function getSportMatches(slug: string) {
    switch (slug) {
        case 'cricket': {
            const [live, recent, upcoming] = await Promise.allSettled([
                getLiveCricket(),
                getRecentCricket(),
                getUpcomingCricket(),
            ])
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: recent.status === 'fulfilled' ? recent.value : [],
                upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
            }
        }
        case 'football': {
            const [live, today] = await Promise.allSettled([
                getLiveFootball(),
                getTodayFootball(),
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: todayMatches.filter(m => m.status === 'completed'),
                upcoming: todayMatches.filter(m => m.status === 'scheduled'),
            }
        }
        case 'basketball': {
            const [live, today] = await Promise.allSettled([
                getLiveBasketball(),
                getTodayBasketball(),
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: todayMatches.filter(m => m.status === 'completed'),
                upcoming: todayMatches.filter(m => m.status === 'scheduled'),
            }
        }
        case 'mma': {
            const [live, upcoming] = await Promise.allSettled([
                getLiveMMA(),
                getUpcomingMMA()
            ])
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: [],
                upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
            }
        }
        case 'rugby': {
            const [live, today] = await Promise.allSettled([
                getLiveRugby(),
                getTodayRugby(),
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: todayMatches.filter(m => m.status === 'completed'),
                upcoming: todayMatches.filter(m => m.status === 'scheduled'),
            }
        }
        case 'badminton': {
            const [recent, upcoming] = await Promise.allSettled([
                getRecentBadminton(),
                getUpcomingBadminton(),
            ])
            return {
                live: [], // TSDB free doesn't have good live feed for badminton
                recent: recent.status === 'fulfilled' ? recent.value : [],
                upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
            }
        }
        case 'boxing': {
            const [recent, upcoming] = await Promise.allSettled([
                getRecentBoxing(),
                getUpcomingBoxing(),
            ])
            return {
                live: [],
                recent: recent.status === 'fulfilled' ? recent.value : [],
                upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
            }
        }
        case 'tennis': {
            const [live, recent, upcoming] = await Promise.allSettled([
                getLiveTennis(),
                getRecentTennis(),
                getUpcomingTennis(),
            ])
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: recent.status === 'fulfilled' ? recent.value : [],
                upcoming: upcoming.status === 'fulfilled' ? upcoming.value : [],
            }
        }


        case 'baseball': {
            const [live, today] = await Promise.allSettled([
                getLiveBaseball(),
                getTodayBaseball(),
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: todayMatches.filter(m => m.status === 'completed'),
                upcoming: todayMatches.filter(m => m.status === 'scheduled'),
            }
        }
        case 'formula-1': {
            const [live, recent, upcoming] = await Promise.all([
                getF1Races('live'),
                getF1Races('recent'),
                getF1Races('upcoming')
            ])
            return { live, recent, upcoming }
        }
        default:
            return { live: [], recent: [], upcoming: [] }
    }
}

// ── Page ─────────────────────────────────────────────────────────

export const revalidate = 60

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const sport = SPORTS[slug]
    if (!sport) notFound()

    const { live, recent, upcoming } = await getSportMatches(slug)

    return (
        <div className="container-wide py-6 md:py-10">
            {/* Header */}
            <div className="mb-8">
                <div className={`inline-flex items-center gap-2 ${sport.color} bg-current/10 border border-current/20 rounded-full px-3 py-1 text-xs font-semibold mb-3`}>
                    <span>{sport.emoji}</span> {sport.name}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                    {sport.name} Live Scores & Fixtures
                </h1>
                <p className="text-muted-foreground max-w-2xl">{sport.description}</p>
            </div>

            <SportMatchBoard live={live} recent={recent} upcoming={upcoming} sportName={sport.name} sportEmoji={sport.emoji} />
        </div>
    )
}
