'use client'

import { useState, useEffect, useMemo } from 'react'
import { Zap, Calendar, Trophy, ChevronRight, Loader2, Filter, Search } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Match {
    id: string
    title: string
    status: string
    home_team: { name: string; logo?: string; score?: number }
    away_team: { name: string; logo?: string; score?: number }
    league_name: string
    sport: string | { name: string }
    scheduled_at: string
    slug: string
}

const SPORTS = ['All', 'Cricket', 'Football', 'Basketball', 'Tennis', 'Rugby']

export default function MatchesPage() {
    const [allMatches, setAllMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)
    const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'finished'>('all')
    const [sportFilter, setSportFilter] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetch('/api/matches')
            .then(res => res.json())
            .then(data => {
                setAllMatches(data.matches || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filteredMatches = useMemo(() => {
        return allMatches.filter(match => {
            // Status Filter
            if (statusFilter === 'live' && match.status !== 'live' && match.status !== 'live_now') return false
            if (statusFilter === 'finished' && match.status !== 'completed' && match.status !== 'finished') return false
            
            // Sport Filter
            const matchSport = typeof match.sport === 'object' ? match.sport?.name : (match.sport || (match as any).sport_type || (match as any).sport_id || '')
            if (sportFilter !== 'All' && (!matchSport || matchSport.toLowerCase() !== sportFilter.toLowerCase())) return false
            
            // Search Query
            if (searchQuery) {
                const q = searchQuery.toLowerCase()
                const matchesSearch = 
                    match.home_team.name.toLowerCase().includes(q) ||
                    match.away_team.name.toLowerCase().includes(q) ||
                    match.league_name?.toLowerCase().includes(q)
                if (!matchesSearch) return false
            }
            
            return true
        })
    }, [allMatches, statusFilter, sportFilter, searchQuery])

    return (
        <div className="container-wide py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <Trophy className="w-10 h-10 text-brand-500" />
                        Today's <span className="text-brand-500">Matches</span>
                    </h1>
                    <p className="text-muted-foreground">Follow match scores and upcoming fixtures across all sports</p>
                </div>
                
                {/* Search Bar */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input 
                        type="text" 
                        placeholder="Search teams or leagues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border border-border/50 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all text-sm"
                    />
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-wrap items-center gap-4 mb-10 pb-4 border-b border-border/50">
                {/* Status Filter */}
                <div className="flex bg-muted/50 p-1 rounded-xl border border-border/50">
                    <button 
                        onClick={() => setStatusFilter('all')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", statusFilter === 'all' ? "bg-background shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
                    >
                        All Matches
                    </button>
                    <button 
                        onClick={() => setStatusFilter('live')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2", statusFilter === 'live' ? "bg-background shadow-sm border border-border text-red-500" : "text-muted-foreground hover:text-foreground")}
                    >
                        {statusFilter === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                        Playing Now
                    </button>
                    <button 
                        onClick={() => setStatusFilter('finished')}
                        className={cn("px-4 py-2 rounded-lg text-sm font-bold transition-all", statusFilter === 'finished' ? "bg-background shadow-sm border border-border" : "text-muted-foreground hover:text-foreground")}
                    >
                        Finished
                    </button>
                </div>

                <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                {/* Sport Filter */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
                    {SPORTS.map(sport => (
                        <button
                            key={sport}
                            onClick={() => setSportFilter(sport)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border",
                                sportFilter === sport 
                                    ? "bg-brand-500 border-brand-500 text-white shadow-lg shadow-brand-500/20" 
                                    : "bg-background border-border hover:border-brand-500/50 text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {sport}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-500 mb-4" />
                    <p className="text-muted-foreground font-medium">Fetching latest scores...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredMatches.length > 0 ? filteredMatches.map((match) => (
                        <div key={match.id} className="score-card group">
                            <div className="p-4 border-b border-border/50 bg-muted/20 flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    {match.status === 'live' && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                    {match.league_name} • {typeof match.sport === 'object' ? match.sport.name : match.sport}
                                </span>
                                <span className={cn(
                                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                                    match.status === 'live' ? "bg-red-500/10 text-red-500" : "text-muted-foreground"
                                )}>
                                    {match.status}
                                </span>
                            </div>
                            
                            <div className="p-6 flex items-center justify-between">
                                <div className="flex flex-col items-center gap-3 w-1/3 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:border-brand-500/30 transition-colors">
                                        <Trophy className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <span className="font-bold text-sm leading-tight">{match.home_team.name}</span>
                                </div>

                                <div className="flex flex-col items-center gap-1">
                                    <div className="text-3xl font-black flex items-center gap-4 tracking-tighter">
                                        <span>{match.home_team.score ?? 0}</span>
                                        <span className="text-muted-foreground/30 text-xl font-normal">:</span>
                                        <span>{match.away_team.score ?? 0}</span>
                                    </div>
                                    <div className="text-[10px] font-black bg-brand-500/10 text-brand-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        VS
                                    </div>
                                </div>

                                <div className="flex flex-col items-center gap-3 w-1/3 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center border border-border/50 group-hover:border-brand-500/30 transition-colors">
                                        <Trophy className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <span className="font-bold text-sm leading-tight">{match.away_team.name}</span>
                                </div>
                            </div>

                            <div className="p-4 bg-muted/10 border-t border-border/50 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span className="text-xs font-medium" suppressHydrationWarning>
                                        {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <Link 
                                    href={`/score/${match.slug}`}
                                    className="flex items-center gap-1 text-xs font-black text-brand-500 hover:gap-2 transition-all uppercase tracking-wider"
                                >
                                    Match Center <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                            <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                            <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
