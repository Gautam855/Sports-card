import Link from 'next/link'
import { Newspaper } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    formatArticleDate,
    getReadTime,
    getCoverImage,
} from '@/lib/home-utils'
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader'
import type { News } from '@/lib/types'

export function LatestNewsSection({ news }: { news: News[] }) {
    const items = news.slice(0, 5)
    if (!items.length) return null

    const [lead, ...rest] = items
    const leadImage = getCoverImage(lead)

    return (
        <section className="home-section home-section-surface">
            <HomeSectionHeader
                title="Latest Sports News"
                subtitle="Fresh updates from the world of sports"
                icon={Newspaper}
                href="/news"
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Lead story */}
                <Link
                    {...getArticleLinkProps(lead)}
                    className="lg:col-span-7 group relative rounded-2xl overflow-hidden bg-slate-900 min-h-[320px] lg:min-h-[420px] shadow-lg"
                >
                    {leadImage ? (
                        <img
                            src={leadImage}
                            alt={lead.title}
                            className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
                        />
                    ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-brand-700 to-slate-900" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                    <div className="absolute top-4 left-4">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                            Latest
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                        <span className="text-brand-300 text-[10px] font-bold tracking-widest uppercase mb-2 block">
                            {getCategoryName(lead.category)}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-display font-black text-white leading-tight mb-3 group-hover:text-brand-200 transition-colors">
                            {lead.title}
                        </h3>
                        {lead.excerpt && (
                            <p className="text-slate-300 text-sm line-clamp-2 mb-4 max-w-xl">{lead.excerpt}</p>
                        )}
                        <div className="flex items-center text-xs text-slate-400 gap-2">
                            <span>{formatArticleDate(lead)}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-500" />
                            <span>{getReadTime(lead)}</span>
                        </div>
                    </div>
                </Link>

                {/* Side stories */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                    {rest.map((item, index) => {
                        const coverImage = getCoverImage(item)
                        return (
                            <Link
                                key={item.id}
                                {...getArticleLinkProps(item)}
                                className="group flex gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-white hover:border-brand-200 hover:shadow-md transition-all duration-300 flex-1"
                            >
                                <div className="w-24 sm:w-28 aspect-[4/3] rounded-lg overflow-hidden flex-shrink-0 bg-slate-200">
                                    {coverImage ? (
                                        <img
                                            src={coverImage}
                                            alt={item.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-brand-100 text-brand-500 font-black text-xl">
                                            {item.title[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col justify-center min-w-0 py-0.5">
                                    <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1">
                                        {getCategoryName(item.category)}
                                    </span>
                                    <h4 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 group-hover:text-brand-700 transition-colors mb-1.5">
                                        {item.title}
                                    </h4>
                                    <div className="flex items-center text-[11px] text-slate-500 gap-2">
                                        <span>{formatArticleDate(item)}</span>
                                        {index === 0 && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span>{getReadTime(item)}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
