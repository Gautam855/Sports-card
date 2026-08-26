import Link from 'next/link'
import { Globe } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import { formatRelativeTime, getCoverImage } from '@/lib/home-utils'
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader'
import type { News } from '@/lib/types'

export function TopStoriesSection({ stories }: { stories: News[] }) {
    const items = stories.slice(0, 6)
    if (!items.length) return null

    return (
        <section className="home-section">
            <HomeSectionHeader
                title="Top Stories Today"
                subtitle="Real-time sports news from around the world"
                icon={Globe}
                href="/news"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                    const coverImage = getCoverImage(item)
                    return (
                        <Link
                            key={item.id}
                            {...getArticleLinkProps(item)}
                            className="group flex gap-4 p-4 rounded-xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-300"
                        >
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                                {coverImage ? (
                                    <img
                                        src={coverImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-600 font-bold">
                                        {item.title[0]}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col justify-center min-w-0">
                                <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 group-hover:text-brand-700 transition-colors mb-1.5">
                                    {item.title}
                                </h3>
                                <span className="text-[11px] text-slate-500">{formatRelativeTime(item)}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>
        </section>
    )
}
