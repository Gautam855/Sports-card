import { Metadata } from 'next'
import { Play, Calendar, Zap, ExternalLink } from 'lucide-react'
import { unstable_cache } from 'next/cache'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Sports Highlights & Videos — SportsLNV',
    description: 'Watch the latest sports highlights, goals, and match summaries from top leagues around the world.',
    alternates: {
        canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://sportslnv.com'}/highlights`,
    },
}

export const revalidate = 3600 // Cache for 1 hour

interface YouTubeVideo {
    id: string
    title: string
    description: string
    thumbnail: string
    publishedAt: string
    videoId: string
}

async function _fetchYouTubeVideos(): Promise<YouTubeVideo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
        console.warn('[Highlights] YOUTUBE_API_KEY not set — skipping video fetch')
        return []
    }

    try {
        // Step 1: Get the channel's uploads playlist ID
        const channelRes = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&forHandle=sportslnvhub&key=${apiKey}`,
            { next: { revalidate: 86400 } } // Cache channel info for 24h
        )

        if (!channelRes.ok) {
            console.error('[Highlights] Failed to fetch channel info:', channelRes.status)
            return []
        }

        const channelData = await channelRes.json()
        const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads

        if (!uploadsPlaylistId) {
            console.error('[Highlights] No uploads playlist found')
            return []
        }

        // Step 2: Get latest videos from the uploads playlist
        const playlistRes = await fetch(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=20&key=${apiKey}`,
            { next: { revalidate: 3600 } }
        )

        if (!playlistRes.ok) {
            console.error('[Highlights] Failed to fetch playlist:', playlistRes.status)
            return []
        }

        const playlistData = await playlistRes.json()

        return (playlistData.items || []).map((item: any) => ({
            id: item.id,
            title: item.snippet.title,
            description: item.snippet.description || '',
            thumbnail: item.snippet.thumbnails?.maxres?.url ||
                item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url || '',
            publishedAt: item.snippet.publishedAt,
            videoId: item.snippet.resourceId?.videoId || '',
        })).filter((v: YouTubeVideo) => v.videoId && v.title !== 'Private video' && v.title !== 'Deleted video')
    } catch (err) {
        console.error('[Highlights] Error fetching YouTube videos:', err)
        return []
    }
}

const getYouTubeVideos = unstable_cache(
    _fetchYouTubeVideos,
    ['youtube-highlights'],
    { revalidate: 3600, tags: ['highlights'] }
)

export default async function HighlightsPage() {
    const highlights = await getYouTubeVideos()

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-white/10">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-[-80px] left-[10%] w-[400px] h-[400px] bg-red-500/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-60px] right-[15%] w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[100px]" />
                </div>
                <div className="container-wide relative z-10 py-16 md:py-24">
                    <div className="max-w-3xl">
                        <div className="flex items-center gap-2 text-red-500 font-black text-xs uppercase tracking-[0.25em] mb-4">
                            <Play className="w-4 h-4" />
                            <span>Sports Videos</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-5 leading-[1.1]">
                            Sports <span className="text-red-500">Highlights</span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                            Watch the latest sports highlights, goals, match summaries and more from our YouTube channel.
                        </p>
                    </div>
                </div>
            </section>

            <section className="container-wide py-12 md:py-16">
                {highlights.length === 0 ? (
                    <div className="py-24 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 flex flex-col items-center">
                        <Zap className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Highlights Available</h3>
                        <p className="text-slate-500 mb-6">Check back later for new match videos.</p>
                        <a
                            href="https://www.youtube.com/@sportslnvhub"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors"
                        >
                            Visit Our YouTube Channel <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {highlights.map((video) => (
                                <a
                                    key={video.id}
                                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={video.thumbnail}
                                            alt={video.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-14 h-14 bg-red-600 text-white rounded-full flex items-center justify-center translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg">
                                                <Play className="w-6 h-6 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="font-bold text-sm leading-tight mb-3 line-clamp-2 group-hover:text-red-600 transition-colors text-slate-800">
                                            {video.title}
                                        </h3>

                                        <div className="mt-auto pt-3 border-t border-slate-100">
                                            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                                                <span className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(video.publishedAt).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        month: 'short',
                                                        day: 'numeric',
                                                    })}
                                                </span>
                                                <span className="flex items-center gap-1 text-red-600 font-bold">
                                                    Watch <Play className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>

                        {/* YouTube CTA */}
                        <div className="mt-12 text-center">
                            <a
                                href="https://www.youtube.com/@sportslnvhub"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                            >
                                View All Videos on YouTube <ExternalLink className="w-4 h-4" />
                            </a>
                        </div>
                    </>
                )}
            </section>
        </div>
    )
}

