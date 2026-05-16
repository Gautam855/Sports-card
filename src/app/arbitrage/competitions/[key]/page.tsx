import { Metadata } from 'next'
import Link from 'next/link'
import { getCompetitionEvents, getCompetitionInstances } from '@/lib/api/rapid'
import { Calendar, ChevronRight, Trophy, Zap, Clock } from 'lucide-react'

export async function generateMetadata({ params }: any): Promise<Metadata> {
    return {
        title: `Events — Betting Arbitrage`,
        description: `View upcoming events and match instances for this competition.`,
    }
}

export default async function CompetitionDetailPage({ params }: any) {
    const { key } = params
    const [eventsData, instancesData] = await Promise.all([
        getCompetitionEvents(key),
        getCompetitionInstances(key)
    ])

    const events = eventsData?.events || []
    const instances = instancesData?.instances || []
    const competition = instances[0]?.competition || events[0]?.competition || { name: 'Competition' }

    return (
        <div className="container-wide py-12">
            <div className="mb-12">
                <Link 
                    href="/arbitrage/competitions" 
                    className="text-xs font-bold uppercase text-muted-foreground hover:text-brand-500 transition-colors mb-4 inline-block"
                >
                    ← Back to Competitions
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <Trophy className="w-6 h-6 text-brand-500" />
                    <h1 className="text-4xl md:text-5xl font-black">{competition.name}</h1>
                </div>
                <p className="text-muted-foreground text-lg">
                    Manage upcoming events and live match instances.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: Instances (Active/Current Seasons) */}
                <div className="lg:col-span-1 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-amber-500" />
                        Active Instances
                    </h2>
                    <div className="space-y-3">
                        {instances.map((instance: any) => (
                            <div key={instance.key} className="bg-card border border-border p-4 rounded-xl">
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                                    {instance.key}
                                </div>
                                <h3 className="font-bold text-base mb-2">{instance.name}</h3>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Starts: {new Date(instance.startAt).toLocaleDateString()}</span>
                                    <span>Ends: {new Date(instance.endAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                        {instances.length === 0 && (
                            <p className="text-muted-foreground text-sm py-4 italic">No active instances found.</p>
                        )}
                    </div>
                </div>

                {/* Right: Events */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-brand-500" />
                        Upcoming Events
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {events.map((event: any) => (
                            <Link
                                key={event.key}
                                href={`/arbitrage/events/${event.key}`}
                                className="group bg-card border border-border p-5 rounded-2xl hover:border-brand-500/50 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                        <Clock className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded">
                                        {event.status || 'SCHEDULED'}
                                    </div>
                                </div>

                                <h3 className="font-bold text-base mb-3 leading-tight group-hover:text-brand-500 transition-colors">
                                    {event.name}
                                </h3>

                                <div className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(event.startTime).toLocaleString()}
                                </div>

                                <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Analyze Odds
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </Link>
                        ))}
                        {events.length === 0 && (
                            <div className="col-span-2 py-12 text-center bg-muted/10 rounded-2xl border border-dashed border-border">
                                <p className="text-muted-foreground italic">No upcoming events listed for this competition.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
