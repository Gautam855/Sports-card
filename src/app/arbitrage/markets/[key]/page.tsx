import { Metadata } from 'next'
import Link from 'next/link'
import { getMarketDetails, getMarketOutcomes, getMarketStatistics } from '@/lib/api/rapid'
import { BarChart3, TrendingUp, Info, Activity, Clock, Percent } from 'lucide-react'
import { cn } from '@/lib/utils'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    return {
        title: `Odds Analysis — Betting Arbitrage`,
        description: `Compare real-time odds and historical data for this betting market.`,
    }
}

export default async function MarketDetailPage({ params }: any) {
    const { key } = params
    const [marketData, outcomesData, statsData] = await Promise.all([
        getMarketDetails(key),
        getMarketOutcomes(key, 'latest'),
        getMarketStatistics(key)
    ])

    const market = marketData?.market || { type: 'Market' }
    const outcomes = outcomesData?.outcomes || []
    const statistics = statsData?.statistics || {}

    return (
        <div className="container-wide py-12">
            <div className="mb-12">
                <Link 
                    href={`/arbitrage/events/${market.eventKey}`} 
                    className="text-xs font-bold uppercase text-muted-foreground hover:text-brand-500 transition-colors mb-4 inline-block"
                >
                    ← Back to Match
                </Link>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-600 tracking-wider mb-2">
                            <BarChart3 className="w-4 h-4" />
                            Odds Analysis
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 uppercase tracking-tight">
                            {market.type.replace(/_/g, ' ')}
                        </h1>
                        <p className="text-muted-foreground text-lg">
                            Segment: <span className="text-foreground font-bold">{market.segment || 'FULL MATCH'}</span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Outcomes List */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <Activity className="w-6 h-6 text-brand-500" />
                        Live Outcomes & Odds
                    </h2>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {outcomes.map((outcome: any, idx: number) => (
                            <div key={idx} className="bg-card border border-border p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand-500/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-muted-foreground border border-border/50">
                                        {idx + 1}
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl">{outcome.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            {outcome.bookmakers?.map((bm: any) => (
                                                <span key={bm.key} className="text-[10px] font-bold uppercase text-brand-600 bg-brand-500/10 px-2 py-0.5 rounded">
                                                    {bm.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Decimal</div>
                                        <div className="text-3xl font-black text-brand-500 tabular-nums">
                                            {outcome.odds?.decimal?.toFixed(2)}
                                        </div>
                                    </div>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Fractional</div>
                                        <div className="text-xl font-bold text-foreground tabular-nums">
                                            {outcome.odds?.fractional}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Statistics Sidebar */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-brand-500 rounded-3xl p-8 text-white shadow-xl shadow-brand-500/20">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Percent className="w-5 h-5" />
                            Market Stats
                        </h3>
                        
                        <div className="space-y-6">
                            <div>
                                <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1">Margin</div>
                                <div className="text-3xl font-black italic">
                                    {statistics.margin ? `${(statistics.margin * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold uppercase opacity-60 tracking-widest mb-1">Payout</div>
                                <div className="text-3xl font-black italic">
                                    {statistics.payout ? `${(statistics.payout * 100).toFixed(2)}%` : 'N/A'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-8 border-t border-white/20">
                            <p className="text-xs opacity-70 leading-relaxed italic">
                                Margin represents the bookmaker's edge. A margin below 2-3% is considered high-value for bettors.
                            </p>
                        </div>
                    </div>

                    <div className="bg-muted/40 border border-border rounded-3xl p-6">
                        <h3 className="font-bold flex items-center gap-2 mb-4">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            Last Update
                        </h3>
                        <p className="text-sm text-muted-foreground tabular-nums">
                            {new Date().toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
