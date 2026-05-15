import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getAllLiveMatches, getAllTodayMatches } from '@/lib/api/rapid'
import { getFeaturedNews, getTrendingNews, getRealTimeNews, getNews } from '@/lib/api/news'

import { HeroSection } from '@/components/sports/HeroSection'
import { LiveMatchesSection } from '@/components/sports/LiveMatchesSection'
import { LatestNewsSection } from '@/components/news/LatestNewsSection'
import { BlogSection } from '@/components/blog/BlogSection'
import { LeagueStandingsSection } from '@/components/sports/LeagueStandingsSection'
import { NewsletterSection } from '@/components/layout/NewsletterSection'
import { SportsCategoriesBar } from '@/components/sports/SportsCategoriesBar'
import { TrendingSection } from '@/components/news/TrendingSection'
import { MatchCardSkeleton } from '@/components/sports/MatchCard'
import { NewsCardSkeleton } from '@/components/news/NewsCard'
import { AdBanner } from '@/components/AdBanner'

export const metadata: Metadata = {
    title: 'SportsPulse — Live Scores, News & Expert Blogs',
    description:
        'Follow live cricket, football, basketball scores. Get expert analysis, in-depth blogs, and breaking sports news.',
    openGraph: {
        title: 'SportsPulse — Your #1 Live Sports Destination',
        description: 'Live scores, expert blogs, and breaking sports news all in one place.',
    },
}

export const revalidate = 60 // ISR - revalidate every 60 seconds

export default async function HomePage() {
    // Fetch live data from RapidAPI + news from Supabase (all graceful)
    const [liveResult, todayResult, newsResult, trendingResult, serpNewsResult, blogsResult] = await Promise.allSettled([
        getAllLiveMatches(),
        getAllTodayMatches(),
        getFeaturedNews(3),
        getTrendingNews(8),
        getRealTimeNews("top sports news today", 6),
        getNews({}, { limit: 3 }) // Fetch latest blogs for homepage section

    ])


    const live = (liveResult.status === 'fulfilled' ? liveResult.value : []) as any[]
    const featured = (todayResult.status === 'fulfilled' ? todayResult.value.slice(0, 6) : []) as any[]
    const trending = (trendingResult.status === 'fulfilled' ? trendingResult.value : []) as any[]
    
    // Combine local featured news with real-time news from SerpApi
    const news = [
        ...(serpNewsResult.status === 'fulfilled' ? serpNewsResult.value : []),
        ...(newsResult.status === 'fulfilled' ? newsResult.value : [])
    ]

    const blogs = (blogsResult.status === 'fulfilled' ? blogsResult.value.data : []) as any[]


    return (
        <>
            {/* 1. Hero Section */}
            <HeroSection liveMatches={live} featuredMatches={featured} />

            {/* Sports categories quick nav */}
            <SportsCategoriesBar />

            {/* 2. Live Matches */}
            {live.length > 0 && (
                <Suspense fallback={<SectionSkeleton />}>
                    <LiveMatchesSection matches={live} />
                </Suspense>
            )}

            {/* Ad Banner */}
            <div className="container-wide py-4">
                <AdBanner placement="homepage_hero" />
            </div>

            {/* 3. Latest News + Trending */}
            <section className="container-wide py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <LatestNewsSection articles={news} />
                    </div>
                    <div>
                        <TrendingSection articles={trending} />
                    </div>
                </div>
            </section>

            {/* 4. Blog Section */}
            <Suspense fallback={<SectionSkeleton />}>
                <BlogSection blogs={blogs} />
            </Suspense>

            {/* Ad Sidebar Banner */}
            <div className="container-wide py-10">
                <AdBanner placement="article_top" />
            </div>

            {/* 5. League Standings */}
            <Suspense fallback={<SectionSkeleton />}>
                <LeagueStandingsSection />
            </Suspense>

            {/* 6. Newsletter */}
            <NewsletterSection />
        </>
    )
}


function SectionSkeleton() {
    return (
        <section className="container-wide py-10">
            <div className="skeleton h-7 w-48 rounded mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <MatchCardSkeleton key={i} />
                ))}
            </div>
        </section>
    )
}