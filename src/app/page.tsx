import type { Metadata } from 'next'
import {
    getFeaturedNews,
    getTrendingNews,
    getRealTimeNews,
    getNews,
    getEditorPicks,
    getBreakingNews,
    getHomeBlogs,
} from '@/lib/api/news'
import { FeaturedHero } from '@/components/home/FeaturedHero'
import { BreakingNewsStrip } from '@/components/home/BreakingNewsStrip'
import { TrendingStories } from '@/components/home/TrendingStories'
import { LatestNewsTrendingSection } from '@/components/home/LatestNewsTrendingSection'
import { LatestFromBlogSection } from '@/components/home/LatestFromBlogSection'
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

function dedupeArticles(articles: News[]): News[] {
    const seen = new Set<string>()
    return articles.filter((article) => {
        const key = article.slug || article.id
        if (seen.has(key)) return false
        seen.add(key)
        return true
    })
}

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
        getHomeBlogs(10),
    ])

    const featured = (featuredResult.status === 'fulfilled' ? featuredResult.value : []) as News[]
    const trending = (trendingResult.status === 'fulfilled' ? trendingResult.value : []) as News[]
    const serpNews = (serpNewsResult.status === 'fulfilled' ? serpNewsResult.value : []) as News[]
    const latest = (latestResult.status === 'fulfilled' ? latestResult.value.data : []) as News[]
    const editorPicks = (editorPicksResult.status === 'fulfilled' ? editorPicksResult.value : []) as News[]
    const breaking = (breakingResult.status === 'fulfilled' ? breakingResult.value : []) as News[]
    const blogs = (blogsResult.status === 'fulfilled' ? blogsResult.value : []) as News[]

    const heroArticles = dedupeArticles([...featured, ...serpNews, ...latest]).slice(0, 5)
    const breakingNews = [...breaking, ...serpNews.slice(0, 5)].slice(0, 5)
    const latestNewsGrid = dedupeArticles([...serpNews, ...latest]).slice(0, 5)
    const trendingSidebar = trending.slice(0, 5)
    const popularArticles = trending.slice(0, 10)

    return (
        <div className="home-page flex flex-col">
            <FeaturedHero articles={heroArticles} />
            <BreakingNewsStrip news={breakingNews} />
            {trending.length > 0 && <TrendingStories stories={trending.slice(0, 10)} />}
            <LatestNewsTrendingSection news={latestNewsGrid} trending={trendingSidebar} />
            <LatestFromBlogSection blogs={blogs} />
            <ExploreSports />
            {editorPicks.length > 0 && (
                <PlayerSpotlight spotlight={editorPicks[0]} editorsPicks={editorPicks.slice(1, 4)} />
            )}
            {popularArticles.length > 0 && <MostPopular articles={popularArticles} />}
            <NewsletterSection />
        </div>
    )
}
