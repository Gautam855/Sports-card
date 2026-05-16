import { Play, Calendar } from 'lucide-react'
import Link from 'next/link'

interface HighlightVideo {
    title: string;
    competition?: { name: string; url: string };
    match: string;
    date: string;
    thumbnail: string;
    url: string;
}

export function HighlightsSection({ highlights }: { highlights: HighlightVideo[] }) {
    if (!highlights || highlights.length === 0) return null;

    return (
        <section className="container-wide py-10">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-black mb-1">
                        Latest <span className="text-brand-500">Highlights</span>
                    </h2>
                    <p className="text-muted-foreground text-sm">Watch the best moments from recent matches</p>
                </div>
                <Link
                    href="/highlights"
                    className="hidden sm:flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-brand-500 transition-colors bg-muted/50 px-4 py-2 rounded-full"
                >
                    View All <span aria-hidden="true">&rarr;</span>
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {highlights.map((video, idx) => (
                    <div key={idx} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                        <div className="relative aspect-video overflow-hidden bg-muted">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="w-12 h-12 bg-brand-500 text-white rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                    <Play className="w-5 h-5 ml-1" />
                                </div>
                            </div>
                            <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                {video.competition?.name || 'Football'}
                            </div>
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-brand-500 transition-colors">
                                {video.title}
                            </h3>
                            <div className="mt-auto pt-2 flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(video.date).toLocaleDateString(undefined, { 
                                        month: 'short', 
                                        day: 'numeric' 
                                    })}
                                </div>
                                <a
                                    href={video.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full py-2 bg-muted text-foreground text-xs font-bold text-center rounded-lg hover:bg-brand-500 hover:text-white transition-colors flex items-center justify-center gap-1.5 mt-2"
                                >
                                    Watch <Play className="w-3 h-3" />
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 sm:hidden flex justify-center">
                <Link
                    href="/highlights"
                    className="flex items-center gap-2 text-sm font-bold text-brand-500 hover:text-brand-600 transition-colors bg-brand-500/10 px-6 py-2.5 rounded-full w-full justify-center"
                >
                    View All Highlights
                </Link>
            </div>
        </section>
    )
}
