import type { Metadata } from 'next'
import {
    getFeaturedNews,
    getTrendingNews,
    getRealTimeNews,
    getNews,
    getEditorPicks,
    getBreakingNews,
} from '@/lib/api/news'
import { FeaturedHero } from '@/components/home/FeaturedHero'
import { BreakingNewsStrip } from '@/components/home/BreakingNewsStrip'
import { TrendingStories } from '@/components/home/TrendingStories'
import { LatestNewsAndBlog } from '@/components/home/LatestNewsAndBlog'
import { ExploreSports } from '@/components/home/ExploreSports'
import { PlayerSpotlight } from '@/components/home/PlayerSpotlight'
import { MostPopular } from '@/components/home/MostPopular'
import { NewsletterSection } from '@/components/layout/NewsletterSection'
import type { News } from '@/lib/types'

export const metadata: Metadata = {
    title: 'Sports News and Popular Sports Blogs',
    description:
        'Stay connected with sportslnv.com for most popular sports blogs on cricket, tennis, football and more. Get expert analysis, in-depth about breaking sports news.',
    openGraph: {
        title: 'Sports News and Popular Sports Blogs',
        description:
            'Stay connected with sportslnv.com for most popular sports blogs on cricket, tennis, football and more. Get expert analysis, in-depth about breaking sports news.',
    },
}

export const revalidate = 60

export default async function HomePage() {
    const [
        featuredResult,
        trendingResult,
        serpNewsResult,
        latestResult,
        editorPicksResult,
        breakingResult,
        blogsResult,
    ] = await Promise.allSettled([
        getFeaturedNews(6),
        getTrendingNews(10),
        getRealTimeNews('top sports news today', 8),
        getNews({}, { limit: 12, sort: 'published_at', order: 'desc' }),
        getEditorPicks(4),
        getBreakingNews(6),
        getNews({ featured: true }, { limit: 4, sort: 'published_at', order: 'desc' }),
    ])

    const featured = (featuredResult.status === 'fulfilled' ? featuredResult.value : []) as News[]
    const trending = (trendingResult.status === 'fulfilled' ? trendingResult.value : []) as News[]
    const serpNews = (serpNewsResult.status === 'fulfilled' ? serpNewsResult.value : []) as News[]
    const latest = (latestResult.status === 'fulfilled' ? latestResult.value.data : []) as News[]
    const editorPicks = (editorPicksResult.status === 'fulfilled' ? editorPicksResult.value : []) as News[]
    const breaking = (breakingResult.status === 'fulfilled' ? breakingResult.value : []) as News[]
    const featuredBlogs = (blogsResult.status === 'fulfilled' ? blogsResult.value.data : []) as News[]

    // Combine featured articles for the hero slider (up to 5)
    const heroArticles = [...featured, ...serpNews, ...latest]
        .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i) // deduplicate
        .slice(0, 5)
    const breakingNews = [...breaking, ...serpNews.slice(0, 5)].slice(0, 5)
    const latestNews = latest.slice(0, 3)
    const featuredBlog = featuredBlogs[0] ?? latest[0]
    const popularArticles = trending.slice(0, 5)

    return (
        <div className="home-page flex flex-col">
            <FeaturedHero articles={heroArticles} />
            <BreakingNewsStrip news={breakingNews} />
            {trending.length > 0 && <TrendingStories stories={trending.slice(0, 5)} />}
            {(latestNews.length > 0 || featuredBlog) && (
                <LatestNewsAndBlog news={latestNews} blog={featuredBlog} />
            )}
            <ExploreSports />
            {editorPicks.length > 0 && (
                <PlayerSpotlight spotlight={editorPicks[0]} editorsPicks={editorPicks.slice(1, 4)} />
            )}
            {popularArticles.length > 0 && <MostPopular articles={popularArticles} />}
            <NewsletterSection />
        </div>
    )
}
