import { Metadata } from 'next'
import Link from 'next/link'
import { getCompetitions } from '@/lib/api/rapid'
import { Trophy, ChevronRight, Globe, Search } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Competitions — Betting Arbitrage',
    description: 'Explore all available sports competitions for arbitrage betting.',
}

export default async function CompetitionsPage() {
    const data = await getCompetitions()
    const competitions = data?.competitions || []

    return (
        <div className="container-wide py-12">
            <div className="mb-12">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-brand-600 tracking-wider mb-2">
                    <Trophy className="w-4 h-4" />
                    Directory
                </div>
                <h1 className="text-4xl md:text-5xl font-black mb-4">
                    Sports <span className="text-brand-500">Competitions</span>
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Browse through {competitions.length} worldwide leagues and tournaments.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {competitions.map((comp: any) => (
                    <Link
                        key={comp.key}
                        href={`/arbitrage/competitions/${comp.key}`}
                        className="group bg-card border border-border p-5 rounded-2xl hover:border-brand-500/50 hover:shadow-lg transition-all"
                    >
                        <div className="flex items-start justify-between">
                            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-500 group-hover:text-white transition-colors">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                                {comp.sport?.replace('_', ' ')}
                            </div>
                        </div>
                        
                        <h3 className="font-bold text-lg mb-1 group-hover:text-brand-500 transition-colors">
                            {comp.name}
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4 font-medium flex items-center gap-1.5">
                            <Globe className="w-3 h-3" />
                            {comp.shortName || comp.name}
                        </p>

                        <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            View Events
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>
                ))}
            </div>

            {competitions.length === 0 && (
                <div className="py-24 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                    <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No Competitions Found</h3>
                    <p className="text-muted-foreground">Try refreshing the page or check back later.</p>
                </div>
            )}
        </div>
    )
}
