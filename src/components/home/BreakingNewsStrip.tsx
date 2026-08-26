import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import { formatRelativeTime, getCoverImage } from '@/lib/home-utils'
import type { News } from '@/lib/types'

export function BreakingNewsStrip({ news }: { news?: News[] }) {
    if (!news?.length) return null

    return (
        <section className="home-section py-6 border-b border-slate-100">
            <div className="section-header">
                <h2 className="home-section-title">Breaking News</h2>
                <Link href="/news" className="home-view-all">
                    View All <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                {news.slice(0, 5).map((item) => {
                    const coverImage = getCoverImage(item)
                    return (
                        <Link
                            key={item.id}
                            {...getArticleLinkProps(item)}
                            className="flex-shrink-0 w-[220px] group"
                        >
                            <div className="home-card p-2 hover:border-red-200">
                                <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-2.5">
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold text-2xl">
                                            {item.title[0]}
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-bold text-xs leading-snug line-clamp-2 text-slate-900 group-hover:text-red-600 transition-colors mb-1 px-0.5">
                                    {item.title}
                                </h3>
                                <p className="text-[10px] text-slate-500 px-0.5">{formatRelativeTime(item)}</p>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
