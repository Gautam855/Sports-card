import { Metadata } from 'next'
import { getArbitrageAdvantages } from '@/lib/api/rapid'
import { TrendingUp, Clock, Zap, Percent, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
    title: 'Betting Arbitrage — SportsLNV',
    description: 'Find real-time sports betting arbitrage opportunities across multiple bookmakers.',
}

export const revalidate = 60 // Revalidate every 60 seconds

export default async function ArbitragePage() {
    const advantages = await getArbitrageAdvantages()

    return (
        <div className="container-wide py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                            <span className="bg-brand-500/10 text-brand-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider flex items-center gap-1.5">
                                <TrendingUp className="w-4 h-4" />
                                Live Arbitrage
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 flex items-center gap-3">
                            Betting <span className="text-brand-500">Arbitrage</span>
                        </h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Discover real-time arbitrage opportunities across major sports and bookmakers to guarantee profit.
                        </p>
                    </div>
                    <Link
                        href="/arbitrage/competitions"
                        className="bg-brand-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-brand-600 transition-colors flex items-center gap-2 text-center justify-center shadow-lg shadow-brand-500/20"
                    >
                        Browse Competitions Directory
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            {advantages.length === 0 ? (
                <div className="py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-border flex flex-col items-center">
                    <Zap className="w-12 h-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Arbitrage Found</h3>
                    <p className="text-muted-foreground">Currently no profitable arbitrage opportunities are available. Check back soon.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {advantages.map((adv: any) => (
                        <div key={adv.key} className="bg-card border border-border rounded-2xl p-6 hover:border-brand-500/50 transition-colors">
                            {/* Header: Profit % & Event Details */}
                            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-border/60 pb-5 mb-5">
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">
                                        <span className="bg-muted px-2 py-0.5 rounded text-foreground">
                                            {adv.market.event.competitionInstance?.competition?.sport?.replace('_', ' ') || 'SPORT'}
                                        </span>
                                        <span>•</span>
                                        <span>{adv.market.event.competitionInstance?.competition?.name || 'Competition'}</span>
                                    </div>
                                    <h3 className="text-lg font-bold leading-tight">
                                        {adv.market.event.name}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2 font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(adv.market.event.startTime).toLocaleString(undefined, {
                                            weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 flex flex-col items-end">
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        Guaranteed Profit
                                    </div>
                                    <div className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-black text-xl tabular-nums">
                                        {adv.profitPercentage.toFixed(2)}%
                                    </div>
                                </div>
                            </div>

                            {/* Market & Outcomes */}
                            <div>
                                <div className="text-sm font-semibold text-muted-foreground mb-3 flex items-center justify-between">
                                    <span>Market: <span className="text-foreground">{adv.market.type.replace('_', ' ')}</span></span>
                                    <span className="text-xs font-normal">Found: {new Date(adv.lastFoundAt).toLocaleTimeString()}</span>
                                </div>

                                <div className="space-y-3">
                                    {adv.outcomes.map((outcome: any, idx: number) => (
                                        <div key={idx} className="flex items-center justify-between bg-muted/30 p-3 rounded-xl border border-border/50">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center font-bold text-xs text-muted-foreground border border-border">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{outcome.name}</div>
                                                    <div className="text-xs text-brand-500 font-semibold">{outcome.bookmaker}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-muted-foreground font-bold uppercase mb-0.5">Odds</div>
                                                <div className="font-black tabular-nums text-lg">{outcome.odds.toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
