import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    formatArticleDate,
    getAuthorName,
    getAuthorInitial,
    getReadTime,
    getCoverImage,
} from '@/lib/home-utils'
import type { News } from '@/lib/types'

// Interactive carousel loaded after LCP paint — not in the initial JS bundle
const HeroCarousel = dynamic(
    () => import('./HeroCarousel').then((m) => m.HeroCarousel),
    { ssr: false }
)

export function FeaturedHero({ articles }: { articles: News[] }) {
    if (!articles || articles.length === 0) return null

    const article = articles[0]
    if (!article) return null

    const coverImage = getCoverImage(article)

    return (
        <section
            className="home-section pt-6 pb-2"
            data-google-auto-ad="false"
        >
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                {/* Image — LCP element, server-rendered with priority */}
                <div className="w-full lg:w-[58%]">
                    <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <div className="relative aspect-[16/10] w-full">
                            {/* First slide — server-rendered, LCP candidate */}
                            <Link
                                {...getArticleLinkProps(article)}
                                className="hero-first-slide absolute inset-0 opacity-100 z-10 transition-opacity duration-700 ease-in-out"
                            >
                                {coverImage ? (
                                    <Image
                                        src={coverImage}
                                        alt={article.title}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 750px"
                                        priority
                                        fetchPriority="high"
                                        className="object-cover hover:scale-[1.02] transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                        <span className="text-5xl font-black text-slate-300">
                                            {article.title[0]}
                                        </span>
                                    </div>
                                )}
                            </Link>

                            {/* Client-side carousel overlay — loads after paint */}
                            <HeroCarousel articles={articles} />
                        </div>
                    </div>

                    {/* Static dots placeholder for single-article case */}
                    {articles.length > 1 && (
                        <div className="flex justify-center items-center gap-1 mt-2 hero-carousel-dots-placeholder">
                            {articles.map((_, index) => (
                                <div
                                    key={index}
                                    className="p-2.5 flex items-center justify-center min-w-[36px] min-h-[36px]"
                                >
                                    <span
                                        className={`h-2 rounded-full ${
                                            index === 0
                                                ? 'w-6 bg-red-600'
                                                : 'w-2.5 bg-slate-300'
                                        }`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Content — server-rendered for first article */}
                <div className="hero-server-content w-full lg:w-[42%] flex flex-col pt-1 lg:pt-2 min-h-[280px]">
                    <div className="flex flex-col flex-1">
                        <span className="home-category mb-3">
                            {getCategoryName(article.category)}
                        </span>
                        <Link {...getArticleLinkProps(article)} className="group">
                            <h1 className="text-2xl md:text-3xl lg:text-[2rem] font-display font-black leading-tight mb-3 group-hover:text-red-600 transition-colors text-slate-900">
                                {article.title}
                            </h1>
                        </Link>
                        {article.excerpt && (
                            <p className="text-slate-600 text-sm md:text-base mb-5 leading-relaxed line-clamp-3">
                                {article.excerpt}
                            </p>
                        )}

                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <span className="font-bold text-xs text-slate-700">
                                    {getAuthorInitial(article.author)}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-slate-900">
                                    {getAuthorName(article.author)}
                                </p>
                                <p className="text-xs text-slate-500" suppressHydrationWarning>
                                    {formatArticleDate(article)} · {getReadTime(article)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                        <Link {...getArticleLinkProps(article)} className="home-btn-dark">
                            Read Full Story
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
