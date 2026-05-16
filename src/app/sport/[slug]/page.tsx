import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
    getLiveFootball, getTodayFootball, getUpcomingFootball,
    getLiveBasketball, getTodayBasketball, getRecentBasketball,
    getLiveBaseball, getTodayBaseball, getRecentBaseball, getRealBaseballStandings,
    getLiveRugby, getTodayRugby, getRecentRugby,
    getLiveTennis, getUpcomingTennis, getRecentTennis,
    getLiveCricket, getRecentCricket, getUpcomingCricket,
    getRealBasketballStandings
} from '@/lib/api/rapid'
import { MatchCard } from '@/components/sports/MatchCard'
import { Suspense } from 'react'
import { MatchCardSkeleton } from '@/components/sports/MatchCard'
import { SportMatchBoard } from '@/components/sports/SportMatchBoard'
import { MerchandiseShowcase } from '@/components/merchandise/MerchandiseShowcase'

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
        description: 'Live rugby scores, Six Nations, Rugby Championship, and Premiership fixtures and results.',
        color: 'text-orange-600',
        keywords: ['rugby live score', 'rugby match today', 'six nations results'],
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
            const [live, today, upcoming] = await Promise.allSettled([
                getLiveFootball(),
                getTodayFootball(),
                getUpcomingFootball(),
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            const upcomingMatches = upcoming.status === 'fulfilled' ? upcoming.value : []
            
            // Combine and deduplicate by ID
            const all = [...todayMatches, ...upcomingMatches]
            const uniqueMap = new Map(all.map(m => [m.id, m]))
            const allMatches = Array.from(uniqueMap.values())

            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: allMatches.filter(m => m.status === 'completed'),
                upcoming: allMatches.filter(m => m.status === 'scheduled'),
            }
        }
        case 'basketball': {
            const [live, today, recent, standings] = await Promise.allSettled([
                getLiveBasketball(),
                getTodayBasketball(),
                getRecentBasketball(),
                getRealBasketballStandings()
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            const recentMatches = recent.status === 'fulfilled' ? recent.value : []
            
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: [...recentMatches, ...todayMatches.filter(m => m.status === 'completed')],
                upcoming: todayMatches.filter(m => m.status === 'scheduled'),
                standings: standings.status === 'fulfilled' ? standings.value : null
            }
        }
        case 'rugby': {
            const [live, today, recent] = await Promise.allSettled([
                getLiveRugby(),
                getTodayRugby(),
                getRecentRugby(),
            ])
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: recent.status === 'fulfilled' ? recent.value : [],
                upcoming: today.status === 'fulfilled' ? (today.value as any[]).filter(m => m.status === 'scheduled') : [],
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
            const [live, today, recent, standings] = await Promise.allSettled([
                getLiveBaseball(),
                getTodayBaseball(),
                getRecentBaseball(),
                getRealBaseballStandings()
            ])
            const todayMatches = today.status === 'fulfilled' ? today.value : []
            const recentMatches = recent.status === 'fulfilled' ? recent.value : []
            
            return {
                live: live.status === 'fulfilled' ? live.value : [],
                recent: [...recentMatches, ...todayMatches.filter(m => m.status === 'completed')],
                upcoming: todayMatches.filter(m => m.status === 'scheduled'),
                standings: standings.status === 'fulfilled' ? standings.value : null
            }
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

    const { live, recent, upcoming, standings } = await getSportMatches(slug)

    // Dynamic gradient based on sport color
    const gradientMap: Record<string, string> = {
        cricket: 'from-sport-cricket/20 via-background to-background',
        football: 'from-sport-football/20 via-background to-background',
        basketball: 'from-sport-basketball/20 via-background to-background',
        baseball: 'from-blue-600/20 via-background to-background',
        tennis: 'from-lime-500/20 via-background to-background',
    }

    const headerGradient = gradientMap[slug] || 'from-brand-500/10 via-background to-background'

    return (
        <div className="min-h-screen pb-20">
            {/* Creative Header */}
            <div className={`relative h-[300px] flex items-center justify-center overflow-hidden bg-gradient-to-b ${headerGradient}`}>
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px]" />
                </div>
                
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <span className="inline-block text-5xl mb-4 animate-bounce-slow">{sport.emoji}</span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-foreground">
                        {sport.name}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
                        {sport.description}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 relative z-20 space-y-12">
                <SportMatchBoard 
                    live={live} 
                    recent={recent} 
                    upcoming={upcoming}
                    standings={standings}
                    sportName={sport.name}
                    sportEmoji={sport.emoji}
                />

                {/* Sport-specific Merchandise */}
                <MerchandiseShowcase 
                    placement="sport_page" 
                    layout="grid" 
                    limit={4} 
                    sport={slug}
                    title={`${sport.name} Essentials`}
                    subtitle={`Gear up with official ${sport.name} merchandise and fan favorites`}
                />
            </div>
        </div>
    )
}
