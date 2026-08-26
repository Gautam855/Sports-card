import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNews, getRealTimeNews } from '@/lib/api/news'
import { NewsCard } from '@/components/news/NewsCard'
import { createClient } from '@/lib/supabase/server'
import type { News } from '@/lib/types'

const SPORTS: Record<string, {
    name: string
    emoji: string
    description: string
    keywords: string[]
    searchQuery: string
}> = {
    cricket: {
        name: 'Cricket',
        emoji: '🏏',
        description: 'Latest cricket news, player stories, match reports and expert analysis from international, domestic and T20 leagues.',
        keywords: ['cricket news', 'ipl news', 'cricket updates', 'test match news'],
        searchQuery: 'cricket sports news',
    },
    football: {
        name: 'Football',
        emoji: '⚽',
        description: 'Football news from Premier League, La Liga, Champions League and major international tournaments.',
        keywords: ['football news', 'premier league news', 'champions league news'],
        searchQuery: 'football sports news',
    },
    basketball: {
        name: 'Basketball',
        emoji: '🏀',
        description: 'NBA, EuroLeague and international basketball news, player updates and game analysis.',
        keywords: ['nba news', 'basketball news', 'euroleague updates'],
        searchQuery: 'basketball sports news',
    },
    baseball: {
        name: 'Baseball',
        emoji: '⚾',
        description: 'MLB and international baseball news, standings updates and game stories.',
        keywords: ['mlb news', 'baseball news', 'mlb updates'],
        searchQuery: 'baseball sports news',
    },
    rugby: {
        name: 'Rugby',
        emoji: '🏉',
        description: 'Rugby news from Six Nations, Rugby Championship, Premiership and international fixtures.',
        keywords: ['rugby news', 'six nations news', 'rugby updates'],
        searchQuery: 'rugby sports news',
    },
    tennis: {
        name: 'Tennis',
        emoji: '🎾',
        description: 'ATP, WTA and Grand Slam news, tournament updates and player stories.',
        keywords: ['tennis news', 'atp news', 'wimbledon news'],
        searchQuery: 'tennis sports news',
    },
    f1: {
        name: 'Formula 1',
        emoji: '🏎️',
        description: 'Formula 1 news, race weekend updates, driver stories and championship analysis.',
        keywords: ['f1 news', 'formula 1 news', 'grand prix updates'],
        searchQuery: 'formula 1 sports news',
    },
    nfl: {
        name: 'NFL',
        emoji: '🏈',
        description: 'NFL news, game recaps, player updates and season analysis.',
        keywords: ['nfl news', 'american football news'],
        searchQuery: 'nfl sports news',
    },
    mlb: {
        name: 'MLB',
        emoji: '⚾',
        description: 'Major League Baseball news, trade updates and game stories.',
        keywords: ['mlb news', 'baseball news'],
        searchQuery: 'mlb sports news',
    },
    nba: {
        name: 'NBA',
        emoji: '🏀',
        description: 'NBA news, trade rumors, game recaps and player spotlight stories.',
        keywords: ['nba news', 'basketball news'],
        searchQuery: 'nba sports news',
    },
    olympics: {
        name: 'Olympics',
        emoji: '🥇',
        description: 'Olympic sports news, athlete stories and major multi-sport event coverage.',
        keywords: ['olympics news', 'olympic sports updates'],
        searchQuery: 'olympics sports news',
    },
    fifa: {
        name: 'FIFA World Cup',
        emoji: '🌍',
        description: 'FIFA World Cup news, national team updates and tournament coverage.',
        keywords: ['fifa world cup news', 'world cup news'],
        searchQuery: 'fifa world cup sports news',
    },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const sport = SPORTS[slug]
    if (!sport) return { title: 'Sport Not Found' }

    return {
        title: `${sport.name} News & Updates`,
        description: sport.description,
        keywords: sport.keywords,
    }
}

export function generateStaticParams() {
    return Object.keys(SPORTS).map(slug => ({ slug }))
}

async function getCategoryIdBySlug(slug: string): Promise<string | undefined> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('news_categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()
    return data?.id
}

function dedupeArticles(articles: News[]): News[] {
    const seen = new Set<string>()
    return articles.filter((article) => {
        const key = article.slug || article.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

export const revalidate = 60

export default async function SportPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const sport = SPORTS[slug]
    if (!sport) notFound()

    const categoryId = await getCategoryIdBySlug(slug)
    const [{ data: localArticles }, realTimeArticles] = await Promise.all([
        getNews(categoryId ? { category: categoryId } : {}, { limit: 24 }),
        getRealTimeNews(sport.searchQuery, 12),
    ])

    const articles = dedupeArticles([...localArticles, ...realTimeArticles])

    const gradientMap: Record<string, string> = {
        cricket: 'from-sport-cricket/20 via-background to-background',
        football: 'from-sport-football/20 via-background to-background',
        basketball: 'from-sport-basketball/20 via-background to-background',
        baseball: 'from-blue-600/20 via-background to-background',
        tennis: 'from-lime-500/20 via-background to-background',
    }
    const headerGradient = gradientMap[slug] || 'from-brand-500/10 via-background to-background'

    return (
        <div className="pb-12">
            <div className={`relative py-16 md:py-20 overflow-hidden bg-gradient-to-b ${headerGradient}`}>
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-500/20 rounded-full blur-[100px]" />
                </div>

                <div className="container-wide relative z-10 text-center">
                    <span className="inline-block text-5xl mb-4">{sport.emoji}</span>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 text-foreground">
                        {sport.name}
                    </h1>
                    <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto font-medium">
                        {sport.description}
                    </p>
                </div>
            </div>

            <div className="container-wide py-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h2 className="text-2xl font-bold">Latest {sport.name} News</h2>
                    <Link href="/news" className="home-view-all">
                        View all news →
                    </Link>
                </div>

                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articles.map((article) => (
                            <NewsCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                        <p className="text-muted-foreground mb-4">
                            No {sport.name.toLowerCase()} articles yet. Check back soon!
                        </p>
                        <Link
                            href="/news"
                            className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-lg font-bold text-xs hover:bg-slate-800 transition-colors uppercase tracking-widest"
                        >
                            Browse All News
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
