import Link from 'next/link'
import { ArrowRight, Clock, Eye, TrendingUp } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    formatArticleDate,
    formatRelativeTime,
    getAuthorName,
    getReadTime,
    getCoverImage,
    isRealTimeNews,
} from '@/lib/home-utils'
import type { News } from '@/lib/types'

function LiveBadge() {
    return (
        <span className="live-badge text-[9px] px-2 py-0.5">
            Live
        </span>
    )
}

function NewsMeta({ item, light }: { item: News; light?: boolean }) {
    const source = getAuthorName(item.author)
    const readTime = getReadTime(item).replace(' read', '')
    const views = item.views ?? 0

    return (
        <div className={`flex items-center justify-between gap-2 text-[11px] ${light ? 'text-slate-300' : 'text-slate-500'}`}>
            <span className={`truncate font-medium ${light ? 'text-slate-200' : 'text-slate-600'}`}>{source}</span>
            <div className="flex items-center gap-3 flex-shrink-0">
                <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {readTime}
                </span>
                {views > 0 && (
                    <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {views.toLocaleString()}
                    </span>
                )}
            </div>
        </div>
    )
}

export function LatestNewsTrendingSection({
    news,
    trending,
}: {
    news?: News[]
    trending?: News[]
}) {
    const items = news?.slice(0, 5) ?? []
    const trendingItems = trending?.slice(0, 10) ?? []

    if (!items.length && !trendingItems.length) return null

    const [featured, ...gridItems] = items
    const featuredImage = featured ? getCoverImage(featured) : undefined

    return (
        <section className="home-section py-10 md:py-12 bg-white border-y border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
                {items.length > 0 && (
                    <div className="lg:col-span-8 min-w-0">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <span className="w-1 h-7 bg-red-600 rounded-full flex-shrink-0" />
                                <h2 className="home-section-title !text-xl md:!text-2xl normal-case tracking-tight">
                                    Latest News
                                </h2>
                            </div>
                            <Link href="/news" className="home-view-all text-sm">
                                All News <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        {featured && (
                            <Link
                                {...getArticleLinkProps(featured)}
                                className="group block relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 mb-4 min-h-[220px] md:min-h-[260px] shadow-sm hover:shadow-lg transition-shadow"
                            >
                                {featuredImage ? (
                                    <img
                                        src={featuredImage}
                                        alt={featured.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent" />
                                <div className="absolute top-4 left-4 flex items-center gap-2">
                                    <span className="home-category !text-white bg-red-600 px-2 py-0.5 rounded">
                                        {getCategoryName(featured.category)}
                                    </span>
                                    {isRealTimeNews(featured) && <LiveBadge />}
                                </div>
                                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                                    <h3 className="text-lg md:text-2xl font-black text-white leading-snug mb-3 group-hover:text-red-200 transition-colors line-clamp-2">
                                        {featured.title}
                                    </h3>
                                    <NewsMeta item={featured} light />
                                </div>
                            </Link>
                        )}

                        {gridItems.length > 0 && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {gridItems.map((item) => {
                                    const coverImage = getCoverImage(item)
                                    return (
                                        <Link
                                            key={item.id}
                                            {...getArticleLinkProps(item)}
                                            className="group home-card !rounded-xl overflow-hidden hover:!border-red-200 hover:!shadow-md"
                                        >
                                            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                                                {coverImage ? (
                                                    <img
                                                        src={coverImage}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300 font-black text-3xl">
                                                        {item.title[0]}
                                                    </div>
                                                )}
                                                {isRealTimeNews(item) && (
                                                    <div className="absolute top-3 right-3">
                                                        <LiveBadge />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <span className="home-category mb-2 block">
                                                    {getCategoryName(item.category)}
                                                </span>
                                                <h3 className="font-bold text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
                                                    {item.title}
                                                </h3>
                                                <NewsMeta item={item} />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                )}

                {trendingItems.length > 0 && (
                    <div className={`min-w-0 ${items.length > 0 ? 'lg:col-span-4' : 'lg:col-span-12 max-w-md mx-auto w-full'}`}>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 md:p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 pb-3.5 border-b border-slate-200">
                                <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                </div>
                                <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">
                                    Trending Now
                                </h3>
                            </div>
                            <div className="flex flex-col divide-y divide-slate-200/80">
                                {trendingItems.map((item, index) => {
                                    const coverImage = getCoverImage(item)
                                    return (
                                        <Link
                                            key={item.id}
                                            {...getArticleLinkProps(item)}
                                            className="group flex gap-3 py-3 first:pt-0 last:pb-0"
                                        >
                                            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-slate-200 border border-slate-200">
                                                {coverImage ? (
                                                    <img
                                                        src={coverImage}
                                                        alt={item.title}
                                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-base">
                                                        {item.title[0]}
                                                    </div>
                                                )}
                                                <span className="absolute top-1 left-1 w-4.5 h-4.5 rounded bg-red-600 text-white text-[8px] font-bold flex items-center justify-center shadow-sm">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1 justify-center">
                                                <span className="home-category !text-[9px] mb-0.5">
                                                    {getCategoryName(item.category)}
                                                </span>
                                                <h4 className="font-bold text-xs md:text-sm text-slate-900 leading-snug line-clamp-2 group-hover:text-red-600 transition-colors">
                                                    {item.title}
                                                </h4>
                                                <span className="text-[10px] text-slate-400 mt-1">
                                                    {formatRelativeTime(item) || formatArticleDate(item)}
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
