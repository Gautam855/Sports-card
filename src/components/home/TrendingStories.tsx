import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import { formatArticleDate, getCoverImage } from '@/lib/home-utils'
import type { News } from '@/lib/types'

export function TrendingStories({ stories }: { stories: News[] }) {
    if (!stories.length) return null

    return (
        <section className="home-section py-6 border-b border-slate-100">
            <div className="section-header">
                <h2 className="home-section-title">Trending Stories</h2>
                <Link href="/news" className="home-view-all">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {stories.slice(0, 10).map((item, index) => {
                    const coverImage = getCoverImage(item)
                    return (
                        <Link
                            key={item.id}
                            {...getArticleLinkProps(item)}
                            className="group flex flex-col gap-2.5"
                        >
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                <div className="absolute top-2 left-2 z-10 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                                    {index + 1}
                                </div>
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-xl">
                                        {item.title[0]}
                                    </div>
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-xs leading-snug line-clamp-2 text-slate-900 group-hover:text-red-600 transition-colors mb-1">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-slate-500">{formatArticleDate(item)}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
