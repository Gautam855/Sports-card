import { Metadata } from 'next'
import Link from 'next/link'
import { getEventDetails, getEventMarkets } from '@/lib/api/rapid'
import { TrendingUp, ChevronRight, BarChart3, Clock, Zap, Target } from 'lucide-react'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    return {
        title: `Match Analysis — Betting Arbitrage`,
        description: `View all betting markets and live odds for this match.`,
    }
}

export default async function EventDetailPage({ params }: any) {
    const { key } = params
    const [eventData, marketsData] = await Promise.all([
        getEventDetails(key),
        getEventMarkets(key)
    ])

    const event = eventData?.event || { name: 'Match Details' }
    const markets = marketsData?.markets || []

    return (
        <div className="container-wide py-12">
            <div className="mb-12">
                <Link 
                    href="/arbitrage/competitions" 
                    className="text-xs font-bold uppercase text-muted-foreground hover:text-brand-500 transition-colors mb-4 inline-block"
                >
                    ← Back to Competitions
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-600 tracking-wider mb-2">
                            <Target className="w-4 h-4" />
                            {event.competitionInstance?.competition?.name || 'Event Detail'}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4">{event.name}</h1>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Clock className="w-4 h-4" />
                                {new Date(event.startTime).toLocaleString()}
                            </div>
                            <div className="bg-brand-500/10 text-brand-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                                {event.status || 'PRE-MATCH'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h2 className="text-2xl font-bold flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-brand-500" />
                    Available Betting Markets
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {markets.map((market: any) => (
                        <Link
                            key={market.key}
                            href={`/arbitrage/markets/${market.key}`}
                            className="group bg-card border border-border p-6 rounded-2xl hover:border-brand-500/50 hover:shadow-xl transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl bg-brand-500/10 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                    <TrendingUp className="w-5 h-5" />
                                </div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                                    {market.segment || 'FULL TIME'}
                                </div>
                            </div>

                            <h3 className="text-lg font-black mb-2 group-hover:text-brand-500 transition-colors uppercase">
                                {market.type.replace(/_/g, ' ')}
                            </h3>
                            
                            <p className="text-xs text-muted-foreground font-medium mb-6">
                                Detailed odds analysis and historical outcome movements.
                            </p>

                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-600 border-t border-border/50 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Odds Data
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </Link>
                    ))}

                    {markets.length === 0 && (
                        <div className="col-span-full py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                            <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Markets Available</h3>
                            <p className="text-muted-foreground">Betting markets haven't opened yet for this event.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
