import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getArticleLinkProps } from '@/lib/article-links'
import {
    getCategoryName,
    formatArticleDate,
    getReadTime,
    getCoverImage,
} from '@/lib/home-utils'
import type { News } from '@/lib/types'

export function PlayerSpotlight({
    spotlight,
    editorsPicks,
}: {
    spotlight?: News
    editorsPicks?: News[]
}) {
    const picks = editorsPicks?.slice(0, 3) ?? []
    if (!spotlight && !picks.length) return null

    const spotlightImage = spotlight ? getCoverImage(spotlight) : undefined

    return (
        <section className="home-section py-8 border-b border-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                {/* Player / Featured Spotlight */}
                {spotlight && (
                    <div>
                        <div className="section-header">
                            <h2 className="home-section-title">Player Spotlight</h2>
                            <Link href="/news" className="home-view-all">
                                View All <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 items-start">
                            <Link
                                {...getArticleLinkProps(spotlight)}
                                className="relative w-full sm:w-1/2 aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 flex-shrink-0 group"
                            >
                                {spotlightImage ? (
                                    <img
                                        src={spotlightImage}
                                        alt={spotlight.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                        <span className="text-5xl font-black text-slate-600">{spotlight.title[0]}</span>
                                    </div>
                                )}
                            </Link>

                            <div className="flex flex-col flex-1 pt-1">
                                <span className="home-category mb-2">{getCategoryName(spotlight.category)}</span>
                                <h3 className="text-xl md:text-2xl font-display font-black leading-tight text-slate-900 mb-3">
                                    {spotlight.title}
                                </h3>
                                {spotlight.excerpt && (
                                    <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-4">
                                        {spotlight.excerpt}
                                    </p>
                                )}
                                <Link {...getArticleLinkProps(spotlight)} className="home-btn-dark w-fit mb-4">
                                    View Profile
                                </Link>
                                <div className="flex gap-1.5 mt-auto">
                                    <span className="w-5 h-1 rounded-full bg-red-600" />
                                    <span className="w-1.5 h-1 rounded-full bg-slate-300" />
                                    <span className="w-1.5 h-1 rounded-full bg-slate-300" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Editor's Picks */}
                {picks.length > 0 && (
                    <div>
                        <div className="section-header">
                            <h2 className="home-section-title">Editor&apos;s Picks</h2>
                            <Link href="/news" className="home-view-all">
                                View All <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="flex flex-col gap-4">
                            {picks.map((item) => {
                                const coverImage = getCoverImage(item)
                                return (
                                    <Link
                                        key={item.id}
                                        {...getArticleLinkProps(item)}
                                        className="group flex items-center gap-4"
                                    >
                                        <div className="w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                                            {coverImage ? (
                                                <img
                                                    src={coverImage}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400 font-bold">
                                                    {item.title[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 group-hover:text-red-600 transition-colors mb-1.5">
                                                {item.title}
                                            </h3>
                                            <p className="text-[11px] text-slate-400">
                                                {formatArticleDate(item)} · {getReadTime(item)}
                                            </p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </section>
    )
}
