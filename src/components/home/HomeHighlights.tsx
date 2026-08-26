import Link from 'next/link'
import { Play, Calendar } from 'lucide-react'
import { HomeSectionHeader } from '@/components/home/HomeSectionHeader'
import type { HighlightVideo } from '@/lib/api/rapid'

export function HomeHighlights({ highlights }: { highlights: HighlightVideo[] }) {
    const items = highlights.slice(0, 4)
    if (!items.length) return null

    return (
        <section className="home-section home-section-surface">
            <HomeSectionHeader
                title="Match Highlights"
                subtitle="Watch the best goals and moments from recent matches"
                icon={Play}
                href="/highlights"
                linkLabel="All Highlights"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {items.map((video, idx) => (
                    <div
                        key={`${video.url}-${idx}`}
                        className="group flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300"
                    >
                        <div className="relative aspect-video overflow-hidden bg-slate-900">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                                <div className="w-12 h-12 bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg opacity-90 group-hover:scale-110 transition-transform">
                                    <Play className="w-5 h-5 ml-0.5 fill-white" />
                                </div>
                            </div>
                            <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {video.competition?.name || 'Football'}
                            </div>
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-sm leading-snug line-clamp-2 text-slate-900 group-hover:text-brand-700 transition-colors mb-3 flex-1">
                                {video.title}
                            </h3>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(video.date).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </div>
                                <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                                >
                                    Watch <Play className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
