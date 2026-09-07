import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getNews, getRealTimeNews } from '@/lib/api/news'
import { NewsCard } from '@/components/news/NewsCard'
import { BlogCard } from '@/components/blog/BlogCard'
import { getPublicClient } from '@/lib/supabase/public'
import { unstable_cache } from 'next/cache'
import { cache } from 'react'
import type { News } from '@/lib/types'
import { Pagination } from '@/components/ui/Pagination'
import { InFeedAd, DisplayAd } from '@/components/ads/AdSenseSlot'
import {
    Trophy, Flame, Target, Tv, Activity, Shield, Globe, Circle, Star, Zap,
    Newspaper, TrendingUp, ArrowLeft,
} from 'lucide-react'
import { TeamPlayersSection } from '@/components/blog/TeamPlayersSection'
import { CategoryFaqSection } from '@/components/sports/CategoryFaqSection'

// Sport metadata for SEO and visuals
const SPORTS: Record<string, {
    name: string
    emoji: string
    description: string
    keywords: string[]
    searchQuery: string
    gradient: string
}> = {
    cricket: {
        name: 'Cricket',
        emoji: '🏏',
        description: 'Latest cricket news, player stories, match reports and expert analysis from international, domestic and T20 leagues.',
        keywords: ['cricket news', 'ipl news', 'cricket updates', 'test match news'],
        searchQuery: 'cricket sports news',
        gradient: 'from-emerald-600 via-emerald-500 to-teal-500',
    },
    football: {
        name: 'Football',
        emoji: '⚽',
        description: 'Football news from Premier League, La Liga, Champions League and major international tournaments.',
        keywords: ['football news', 'premier league news', 'champions league news'],
        searchQuery: 'football sports news',
        gradient: 'from-blue-600 via-blue-500 to-indigo-500',
    },
    basketball: {
        name: 'Basketball',
        emoji: '🏀',
        description: 'NBA, EuroLeague and international basketball news, player updates and game analysis.',
        keywords: ['nba news', 'basketball news', 'euroleague updates'],
        searchQuery: 'basketball sports news',
        gradient: 'from-orange-600 via-orange-500 to-red-500',
    },
    baseball: {
        name: 'Baseball',
        emoji: '⚾',
        description: 'MLB and international baseball news, standings updates and game stories.',
        keywords: ['mlb news', 'baseball news', 'mlb updates'],
        searchQuery: 'baseball sports news',
        gradient: 'from-sky-600 via-sky-500 to-blue-500',
    },
    rugby: {
        name: 'Rugby',
        emoji: '🏉',
        description: 'Rugby news from Six Nations, Rugby Championship, Premiership and international fixtures.',
        keywords: ['rugby news', 'six nations news', 'rugby updates'],
        searchQuery: 'rugby sports news',
        gradient: 'from-green-600 via-green-500 to-emerald-500',
    },
    tennis: {
        name: 'Tennis',
        emoji: '🎾',
        description: 'ATP, WTA and Grand Slam news, tournament updates and player stories.',
        keywords: ['tennis news', 'atp news', 'wimbledon news'],
        searchQuery: 'tennis sports news',
        gradient: 'from-lime-600 via-lime-500 to-green-500',
    },
    f1: {
        name: 'Formula 1',
        emoji: '🏎️',
        description: 'Formula 1 news, race weekend updates, driver stories and championship analysis.',
        keywords: ['f1 news', 'formula 1 news', 'grand prix updates'],
        searchQuery: 'formula 1 sports news',
        gradient: 'from-red-600 via-red-500 to-rose-500',
    },
    nfl: {
        name: 'NFL',
        emoji: '🏈',
        description: 'NFL news, game recaps, player updates and season analysis.',
        keywords: ['nfl news', 'american football news'],
        searchQuery: 'nfl sports news',
        gradient: 'from-violet-600 via-violet-500 to-purple-500',
    },
    'american-football': {
        name: 'American Football',
        emoji: '🏈',
        description: 'American football news, NFL updates, college football and player stories.',
        keywords: ['american football news', 'nfl news', 'college football'],
        searchQuery: 'american football news',
        gradient: 'from-violet-600 via-violet-500 to-purple-500',
    },
    mlb: {
        name: 'MLB',
        emoji: '⚾',
        description: 'Major League Baseball news, trade updates and game stories.',
        keywords: ['mlb news', 'baseball news'],
        searchQuery: 'mlb sports news',
        gradient: 'from-cyan-600 via-cyan-500 to-blue-500',
    },
    nba: {
        name: 'NBA',
        emoji: '🏀',
        description: 'NBA news, trade rumors, game recaps and player spotlight stories.',
        keywords: ['nba news', 'basketball news'],
        searchQuery: 'nba sports news',
        gradient: 'from-amber-600 via-amber-500 to-orange-500',
    },
    olympics: {
        name: 'Olympics',
        emoji: '🥇',
        description: 'Olympic sports news, athlete stories and major multi-sport event coverage.',
        keywords: ['olympics news', 'olympic sports updates'],
        searchQuery: 'olympics sports news',
        gradient: 'from-yellow-600 via-yellow-500 to-amber-500',
    },
    fifa: {
        name: 'FIFA World Cup',
        emoji: '🌍',
        description: 'FIFA World Cup news, national team updates and tournament coverage.',
        keywords: ['fifa world cup news', 'world cup news'],
        searchQuery: 'fifa world cup sports news',
        gradient: 'from-pink-600 via-pink-500 to-rose-500',
    },
    hockey: {
        name: 'Hockey',
        emoji: '🏑',
        description: 'Hockey news, international matches, player stories and tournament coverage.',
        keywords: ['hockey news', 'field hockey', 'hockey updates'],
        searchQuery: 'hockey sports news',
        gradient: 'from-blue-700 via-blue-600 to-indigo-600',
    },
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sportslnv.com'

interface PageProps {
    params: Promise<{ slug: string }>
}

async function _fetchCategoryBySlug(slug: string) {
    const supabase = getPublicClient()
    const { data } = await supabase
        .from('news_categories')
        .select('id, name, slug, color, description, emoji, faqs, meta_title, meta_description')
        .eq('slug', slug)
        .maybeSingle()
    return data
}

const getCategoryBySlug = cache(async (slug: string) => {
    return unstable_cache(
        () => _fetchCategoryBySlug(slug),
        [`category-slug-${slug}`],
        { revalidate: 300, tags: ['categories', `category-${slug}`] }
    )()
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const sport = SPORTS[slug]
    const category = await getCategoryBySlug(slug)
    const name = sport?.name || category?.name || slug
    const description = sport?.description || category?.description || `Latest ${name} news and updates on SportsLNV`

    return {
        title: `${name} News & Updates`,
        description,
        keywords: sport?.keywords,
        alternates: {
            canonical: `${SITE_URL}/sports/${slug}`,
        },
        openGraph: {
            title: `${name} News & Updates`,
            description,
            url: `${SITE_URL}/sports/${slug}`,
            siteName: 'SportsLNV',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${name} News & Updates`,
            description,
        },
    }
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

export default async function SportCategoryPage({ params }: PageProps) {
    const { slug } = await params
    const sport = SPORTS[slug]
    const category = await getCategoryBySlug(slug)

    // Must match either hardcoded sport data or a DB category
    if (!sport && !category) notFound()

    const name = sport?.name || category?.name || slug
    const emoji = sport?.emoji || '🏅'
    const description = sport?.description || category?.description || `Latest ${name} news`
    const gradient = sport?.gradient || 'from-slate-600 via-slate-500 to-slate-400'
    const searchQuery = sport?.searchQuery || `${name} sports news`

    const [{ data: localArticles }, realTimeArticles] = await Promise.all([
        getNews(category ? { category: category.id } : {}, { limit: 24 }),
        getRealTimeNews(searchQuery, 12),
    ])

    const articles = dedupeArticles([...localArticles, ...realTimeArticles])

    // JSON-LD
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: `${name} News & Updates`,
        description,
        url: `${SITE_URL}/sports/${slug}`,
        publisher: {
            '@type': 'Organization',
            name: 'SportsLNV',
        },
    }

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <div className="min-h-screen pb-12">
                {/* Hero Section */}
                <section className={`relative overflow-hidden bg-gradient-to-br ${gradient}`}>
                    {/* Background effects */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-50px] left-[20%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-50px] right-[10%] w-[300px] h-[300px] bg-black/10 rounded-full blur-[100px]" />
                    </div>

                    <div className="container-wide relative z-10 py-16 md:py-24">
                        {/* Breadcrumb */}
                        <nav className="flex items-center gap-2 text-xs text-white/60 mb-6">
                            <Link href="/" className="hover:text-white transition-colors">Home</Link>
                            <span>/</span>
                            <Link href="/sports" className="hover:text-white transition-colors">Sports</Link>
                            <span>/</span>
                            <span className="text-white font-semibold">{name}</span>
                        </nav>

                        <div className="flex items-center gap-4 mb-5">
                            <span className="text-5xl md:text-6xl">{emoji}</span>
                            <div>
                                <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                                    {name}
                                </h1>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                                        {articles.length} Stories
                                    </span>
                                </div>
                            </div>
                        </div>

                        <p className="text-base md:text-lg text-white/80 max-w-2xl leading-relaxed">
                            {description}
                        </p>
                    </div>
                </section>

                {/* Articles Grid */}
                <section className="container-wide py-10">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary" />
                            Latest {name} News
                        </h2>
                        <Link
                            href="/sports"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-3 h-3" />
                            All Sports
                        </Link>
                    </div>

                    {articles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {articles.map((article, index) => (
                                <>
                                    <NewsCard key={article.id} article={article} />
                                    {/* In-Feed Ad after every 6 cards */}
                                    {(index + 1) % 6 === 0 && index < articles.length - 1 && (
                                        <div key={`ad-${index}`} className="col-span-1 md:col-span-2 lg:col-span-3">
                                            <InFeedAd />
                                        </div>
                                    )}
                                </>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center rounded-2xl border border-dashed border-border bg-muted/20">
                            <p className="text-muted-foreground mb-4">
                                No {name.toLowerCase()} articles yet. Check back soon!
                            </p>
                            <Link
                                href="/sports"
                                className="inline-flex items-center justify-center bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors uppercase tracking-widest"
                            >
                                Browse All Sports
                            </Link>
                        </div>
                    )}

                    {/* Display Ad at bottom */}
                    <DisplayAd className="mt-10" />
                </section>

                {/* Team Players Section for this Category — placed above FAQ */}
                <div className="container-wide pb-10">
                    <TeamPlayersSection
                        categoryId={category?.id}
                        categorySlug={slug}
                        categoryName={name}
                        className="mt-0 mb-0"
                    />
                </div>

                {/* Category FAQ Section */}
                {category?.faqs && Array.isArray(category.faqs) && category.faqs.length > 0 && (
                    <div className="container-wide pb-10">
                        <CategoryFaqSection
                            faqs={category.faqs as { question: string; answer: string }[]}
                            categoryName={name}
                            className="mt-0 mb-0"
                        />
                    </div>
                )}
            </div>
        </>
    )
}
