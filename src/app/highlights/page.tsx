import { Metadata } from 'next'
import { Play, Calendar, Trophy, Zap } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Football Highlights & Videos — SportsLNV',
    description: 'Watch the latest football highlights, goals, and match summaries from top leagues around the world.',
}

export const revalidate = 3600 // Cache for 1 hour

export default async function HighlightsPage() {
    const highlights: any[] = []

    return (
        <div className="container-wide py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-brand-500/10 text-brand-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Play className="w-4 h-4" />
                            Match Videos
                        </span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center gap-3">
                        Football <span className="text-brand-500">Highlights</span>
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Watch the latest goals and match summaries from the top leagues across the globe.
                    </p>
                </div>
            </div>

            {highlights.length === 0 ? (
                <div className="py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-border flex flex-col items-center">
                    <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Highlights Available</h3>
                    <p className="text-muted-foreground">Check back later for new match videos.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {highlights.map((video, idx) => (
                        <div key={idx} className="group flex flex-col bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300">
                            {/* Thumbnail */}
                            <div className="relative aspect-video overflow-hidden bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <Play className="w-6 h-6 ml-1" />
                                    </div>
                                </div>
                                <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                                    {video.competition?.name || 'Football'}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover:text-brand-500 transition-colors">
                                    {video.title}
                                </h3>

                                <div className="mt-auto pt-4 flex flex-col gap-3">
                                    {/* Embed Player Wrapper (Hidden by default, used when clicked) */}
                                    {/* We will just wrap the whole card in a custom client component if we wanted in-line play, 
                                        but for simplicity, we can link out to the URL or render the embed in a modal.
                                        For this version, we will link to the original video URL. */}
                                        
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                        <Calendar className="w-3.5 h-3.5" />
                                        {new Date(video.date).toLocaleDateString(undefined, { 
                                            weekday: 'short', 
                                            month: 'short', 
                                            day: 'numeric' 
                                        })}
                                    </div>

                                    <a
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 bg-muted text-foreground text-sm font-bold text-center rounded-xl hover:bg-brand-500 hover:text-white transition-colors flex items-center justify-center gap-2"
                                    >
                                        Watch Video <Play className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
