import type { Metadata } from 'next'
import { LiveScoresClient } from './LiveScoresClient'
import { getAllLiveMatches } from '@/lib/api/rapid'
import { MerchandiseShowcase } from '@/components/merchandise/MerchandiseShowcase'

export const metadata: Metadata = {
    title: 'Live Scores — Football, Cricket, Basketball & More',
    description:
        'Follow live cricket scores, football live scores, basketball, tennis and more. Real-time score updates, ball-by-ball commentary and match statistics.',
    keywords: ['live score', 'cricket live score', 'football live score', 'live match score today'],
}

export const revalidate = 0 // Always fresh for live page

export default async function LivePage() {
    const initialMatches = await getAllLiveMatches().catch(() => []) as any[]

    return (
        <div className="container-wide py-6 md:py-10">
            {/* Page Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="live-badge text-sm px-3 py-1">
                        <span className="live-dot" />
                        LIVE NOW
                    </span>
                    <span className="text-muted-foreground text-sm">{initialMatches.length} matches in progress</span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold">Live Scores</h1>
                <p className="text-muted-foreground mt-2">
                    Real-time scores across Football, Cricket, Basketball, Tennis and more
                </p>
            </div>

            <LiveScoresClient initialMatches={initialMatches} />

            <div className="mt-16 pt-12 border-t border-border/50">
                <MerchandiseShowcase 
                    placement="live_page" 
                    layout="grid" 
                    limit={4} 
                    title="Trending Gear"
                    subtitle="Get the official gear for your favorite teams while you watch them live"
                />
            </div>
        </div>
    )
}