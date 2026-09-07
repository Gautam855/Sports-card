import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getNews } from '@/lib/api/news'
import {
    Trophy, Flame, Target, Tv, Activity, Shield, Globe, Circle, Star, Zap,
    ArrowRight, TrendingUp, Newspaper,
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Explore Sports',
    description: 'Browse the latest sports news, expert analysis and in-depth stories by category — football, cricket, basketball, tennis, F1, NFL and more.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportslnv.com'}/sports`,
    },
    openGraph: {
        title: 'Explore Sports',
        description: 'Browse the latest sports news by category — football, cricket, basketball, tennis, F1, NFL and more.',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportslnv.com'}/sports`,
        siteName: 'SportsLNV',
    },
}

// Sport icon + gradient mapping
const SPORT_META: Record<string, {
    icon: any
    gradient: string
    accent: string
    emoji: string
}> = {
    cricket: { icon: Target, gradient: 'from-emerald-500 to-teal-600', accent: 'text-emerald-500', emoji: '🏏' },
    football: { icon: Trophy, gradient: 'from-blue-500 to-indigo-600', accent: 'text-blue-500', emoji: '⚽' },
    basketball: { icon: Tv, gradient: 'from-orange-500 to-red-600', accent: 'text-orange-500', emoji: '🏀' },
    tennis: { icon: Flame, gradient: 'from-lime-500 to-green-600', accent: 'text-lime-500', emoji: '🎾' },
    f1: { icon: Activity, gradient: 'from-red-500 to-rose-600', accent: 'text-red-500', emoji: '🏎️' },
    nfl: { icon: Shield, gradient: 'from-violet-500 to-purple-600', accent: 'text-violet-500', emoji: '🏈' },
    nba: { icon: Zap, gradient: 'from-amber-500 to-orange-600', accent: 'text-amber-500', emoji: '🏀' },
    mlb: { icon: Circle, gradient: 'from-sky-500 to-blue-600', accent: 'text-sky-500', emoji: '⚾' },
    olympics: { icon: Globe, gradient: 'from-yellow-500 to-amber-600', accent: 'text-yellow-500', emoji: '🥇' },
    baseball: { icon: Circle, gradient: 'from-cyan-500 to-blue-600', accent: 'text-cyan-500', emoji: '⚾' },
    rugby: { icon: Shield, gradient: 'from-green-600 to-emerald-700', accent: 'text-green-600', emoji: '🏉' },
    fifa: { icon: Star, gradient: 'from-pink-500 to-rose-600', accent: 'text-pink-500', emoji: '🌍' },
    hockey: { icon: Target, gradient: 'from-blue-600 to-indigo-700', accent: 'text-blue-600', emoji: '🏑' },
    'american-football': { icon: Shield, gradient: 'from-violet-500 to-purple-600', accent: 'text-violet-500', emoji: '🏈' },
}

const DEFAULT_META = { icon: Newspaper, gradient: 'from-slate-500 to-slate-700', accent: 'text-slate-500', emoji: '🏅' }

export const revalidate = 300

export default async function SportsHubPage() {
    const supabase = await createClient()

    // Fetch all categories with article counts
    const { data: categories } = await supabase
        .from('news_categories')
        .select('id, name, slug, color, description')
        .order('sort_order', { ascending: true })

    const allCategories = categories || []

    // Get article counts per category
    const categoryCounts: Record<string, number> = {}
    for (const cat of allCategories) {
        const { count } = await supabase
            .from('news')
            .select('id', { count: 'exact', head: true })
            .eq('category_id', cat.id)
            .eq('status', 'published')
        categoryCounts[cat.id] = count || 0
    }

    // Get latest 3 articles for top categories (first 6)
    const topCategories = allCategories.slice(0, 6)
    const topCategoryArticles: Record<string, any[]> = {}
    for (const cat of topCategories) {
        const res = await getNews({ category: cat.id }, { limit: 3 })
        topCategoryArticles[cat.id] = res.data
    }

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-white/10">
                {/* Background effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-100px] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-[-100px] right-[15%] w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]" />
                    <div className="absolute top-[50%] left-[50%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px]" />
                </div>

                <div className="container-wide relative z-10 py-20 md:py-28">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.25em] mb-4">
                            <TrendingUp className="w-4 h-4" />
                            <span>All Sports Categories</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5 leading-[1.1]">
                            Explore <span className="text-primary">Sports</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            Discover the latest news, expert analysis, match updates and in-depth stories from every sport that matters.
                        </p>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container-wide py-12 md:py-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {allCategories.map((cat) => {
                        const meta = SPORT_META[cat.slug] || DEFAULT_META
                        const IconComp = meta.icon
                        const count = categoryCounts[cat.id] || 0

                        return (
                            <Link
                                key={cat.id}
                                href={`/sports/${cat.slug}`}
                                className="group relative flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 bg-white hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                            >
                                {/* Icon */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <IconComp className="w-6 h-6 text-white" />
                                </div>

                                {/* Name */}
                                <span className="text-sm font-bold text-center text-slate-800 group-hover:text-primary transition-colors leading-tight">
                                    {cat.name}
                                </span>

                                {/* Count */}
                                <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                                    {count} articles
                                </span>

                                {/* Hover arrow */}
                                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </section>

            {/* Featured Categories with Latest Articles */}
            <section className="bg-slate-50 border-t border-slate-200 py-12 md:py-16">
                <div className="container-wide">
                    <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-10">
                        Latest From Each Sport
                    </h2>

                    <div className="space-y-10">
                        {topCategories.map((cat) => {
                            const meta = SPORT_META[cat.slug] || DEFAULT_META
                            const articles = topCategoryArticles[cat.id] || []
                            if (articles.length === 0) return null

                            return (
                                <div key={cat.id} className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
                                    {/* Category Header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{meta.emoji}</span>
                                            <div>
                                                <h3 className="font-bold text-lg text-slate-900">{cat.name}</h3>
                                                {cat.description && (
                                                    <p className="text-xs text-slate-500 line-clamp-1">{cat.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <Link
                                            href={`/sports/${cat.slug}`}
                                            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                                        >
                                            View all <ArrowRight className="w-3 h-3" />
                                        </Link>
                                    </div>

                                    {/* Articles */}
                                    <div className="divide-y divide-slate-100">
                                        {articles.map((article: any) => (
                                            <Link
                                                key={article.id}
                                                href={`/blog/${article.slug}`}
                                                className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                                            >
                                                {article.cover_image && (
                                                    <img
                                                        src={article.cover_image}
                                                        alt={article.title}
                                                        className="w-20 h-14 object-cover rounded-lg flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-800 group-hover:text-primary transition-colors line-clamp-2">
                                                        {article.title}
                                                    </h4>
                                                    {article.excerpt && (
                                                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">{article.excerpt}</p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>
        </div>
    )
}
