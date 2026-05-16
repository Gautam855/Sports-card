'use client'

import { useState, useMemo } from 'react'
import { MatchCard } from '@/components/sports/MatchCard'
import { Input } from '@/components/ui/input'
import { Search, Filter, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Generate an array of date objects for the next N days starting from today */
function getUpcomingDates(count: number) {
    const dates: Date[] = []
    const today = new Date()
    for (let i = 0; i < count; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        dates.push(d)
    }
    return dates
}

function formatDateLabel(date: Date, index: number): string {
    if (index === 0) return 'Today'
    if (index === 1) return 'Tomorrow'
    return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
}

export function SportMatchBoard({ 
    live, 
    recent, 
    upcoming,
    standings = null,
    sportName = "Matches",
    sportEmoji = "🎯"
}: { 
    live: any[]
    recent: any[]
    upcoming: any[]
    standings?: any[] | null
    sportName?: string
    sportEmoji?: string
}) {
    // Default to the first tab that has data
    const initialTab = live.length > 0 ? 'live' : (upcoming.length > 0 ? 'upcoming' : (recent.length > 0 ? 'recent' : 'live'))
    const [activeTab, setActiveTab] = useState<'live' | 'upcoming' | 'recent' | 'standings'>(initialTab)

    const [filterType, setFilterType] = useState<string>('All')
    const [filterCountry, setFilterCountry] = useState<string>('All')
    const [filterLeague, setFilterLeague] = useState<string>('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDate, setSelectedDate] = useState<string>('all') // 'all' or ISO date string
    const [dateScrollIndex, setDateScrollIndex] = useState(0)

    const upcomingDates = useMemo(() => getUpcomingDates(14), [])
    const visibleDateCount = 7 // How many date chips to show at once

    // Extract unique match types, countries, and leagues for filter dropdowns
    const { matchTypes, countries, leagues } = useMemo(() => {
        const allMatches = [...live, ...recent, ...upcoming]
        const types = new Set<string>()
        const ctrys = new Set<string>()
        const lgs = new Set<string>()

        allMatches.forEach(m => {
            if (m.match_type) types.add(m.match_type)
            if (m.venue_country) ctrys.add(m.venue_country)
            if (m.league?.name) lgs.add(m.league.name)
        })

        const sortedTypes = Array.from(types).sort()
        
        return {
            matchTypes: ['All', ...sortedTypes],
            countries: ['All', ...Array.from(ctrys).sort()],
            leagues: ['All', ...Array.from(lgs).sort()]
        }
    }, [live, recent, upcoming])

    // Count upcoming matches per date
    const upcomingDateCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        upcoming.forEach(m => {
            if (m.scheduled_at) {
                const d = new Date(m.scheduled_at)
                const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
                counts[key] = (counts[key] || 0) + 1
            }
        })
        return counts
    }, [upcoming])

    // Helper to filter a single match
    const isMatchVisible = (m: any) => {
        if (filterType !== 'All' && m.match_type !== filterType) return false
        if (filterCountry !== 'All' && m.venue_country !== filterCountry) return false
        if (filterLeague !== 'All' && m.league?.name !== filterLeague) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            const matchesSearch = 
                m.home_team?.name?.toLowerCase().includes(q) ||
                m.away_team?.name?.toLowerCase().includes(q) ||
                m.league?.name?.toLowerCase().includes(q)
            if (!matchesSearch) return false
        }
        return true
    }

    // Date filter for upcoming
    const isDateMatch = (m: any) => {
        if (selectedDate === 'all') return true
        if (!m.scheduled_at) return true
        const matchDate = new Date(m.scheduled_at)
        const filterDate = new Date(selectedDate)
        return isSameDay(matchDate, filterDate)
    }

    // Filtered lists
    const filteredLive = useMemo(() => live.filter(isMatchVisible), [live, filterType, filterCountry, filterLeague, searchQuery])
    const filteredUpcoming = useMemo(
        () => upcoming.filter(m => isMatchVisible(m) && isDateMatch(m)),
        [upcoming, filterType, filterCountry, filterLeague, searchQuery, selectedDate]
    )
    const filteredRecent = useMemo(() => recent.filter(isMatchVisible), [recent, filterType, filterCountry, filterLeague, searchQuery])

    // Current active matches
    const filteredMatches = useMemo(() => {
        if (activeTab === 'live') return filteredLive
        if (activeTab === 'upcoming') return filteredUpcoming
        return filteredRecent
    }, [activeTab, filteredLive, filteredUpcoming, filteredRecent])

    const canScrollLeft = dateScrollIndex > 0
    const canScrollRight = dateScrollIndex + visibleDateCount < upcomingDates.length

    return (
        <div className="space-y-6">
            {/* Status Tabs */}
            <div className="flex bg-card border border-border/60 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
                <button
                    onClick={() => setActiveTab('live')}
                    className={cn(
                        "px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2",
                        activeTab === 'live' ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                >
                    {activeTab === 'live' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                    Live Now ({filteredLive.length})
                </button>
                <button
                    onClick={() => setActiveTab('upcoming')}
                    className={cn(
                        "px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                        activeTab === 'upcoming' ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                >
                    Upcoming ({filteredUpcoming.length})
                </button>
                <button
                    onClick={() => setActiveTab('recent')}
                    className={cn(
                        "px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                        activeTab === 'recent' ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                >
                    Completed ({filteredRecent.length})
                </button>
                {standings && (
                    <button
                        onClick={() => setActiveTab('standings')}
                        className={cn(
                            "px-6 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                            activeTab === 'standings' ? "bg-brand-500 text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                    >
                        Standings
                    </button>
                )}
            </div>

            {/* Date Picker – only visible on Upcoming tab */}
            {activeTab === 'upcoming' && (
                <div className="flex items-center gap-2 bg-card border border-border/60 p-2 rounded-xl overflow-hidden">
                    {/* All dates button */}
                    <button
                        onClick={() => setSelectedDate('all')}
                        className={cn(
                            "px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0",
                            selectedDate === 'all'
                                ? "bg-brand-500 text-white shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent"
                        )}
                    >
                        All Dates
                    </button>

                    <div className="w-px h-6 bg-border/60 flex-shrink-0" />

                    {/* Scroll left */}
                    <button
                        onClick={() => setDateScrollIndex(Math.max(0, dateScrollIndex - 3))}
                        disabled={!canScrollLeft}
                        className={cn(
                            "p-1.5 rounded-md flex-shrink-0 transition-colors",
                            canScrollLeft ? "text-muted-foreground hover:text-foreground hover:bg-accent" : "text-border cursor-not-allowed"
                        )}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Date chips */}
                    <div className="flex gap-1.5 overflow-hidden">
                        {upcomingDates.slice(dateScrollIndex, dateScrollIndex + visibleDateCount).map((date, i) => {
                            const actualIndex = dateScrollIndex + i
                            const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                            const isoString = date.toISOString()
                            const isSelected = selectedDate !== 'all' && isSameDay(new Date(selectedDate), date)
                            const count = upcomingDateCounts[dateKey] || 0

                            return (
                                <button
                                    key={dateKey}
                                    onClick={() => setSelectedDate(isoString)}
                                    className={cn(
                                        "flex flex-col items-center px-3 py-1.5 rounded-lg text-xs transition-all whitespace-nowrap min-w-[60px] flex-shrink-0",
                                        isSelected
                                            ? "bg-brand-500 text-white shadow-sm"
                                            : count > 0
                                                ? "text-foreground hover:bg-accent border border-transparent hover:border-border/60"
                                                : "text-muted-foreground/50 hover:bg-accent/50"
                                    )}
                                >
                                    <span className="font-semibold text-[11px] leading-tight">
                                        {formatDateLabel(date, actualIndex)}
                                    </span>
                                    <span className={cn(
                                        "text-[10px] mt-0.5",
                                        isSelected ? "text-white/80" : "text-muted-foreground"
                                    )}>
                                        {actualIndex > 1 ? '' : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                    </span>
                                    {count > 0 && (
                                        <span className={cn(
                                            "mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none",
                                            isSelected
                                                ? "bg-white/20 text-white"
                                                : "bg-brand-500/10 text-brand-500"
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Scroll right */}
                    <button
                        onClick={() => setDateScrollIndex(Math.min(upcomingDates.length - visibleDateCount, dateScrollIndex + 3))}
                        disabled={!canScrollRight}
                        className={cn(
                            "p-1.5 rounded-md flex-shrink-0 transition-colors",
                            canScrollRight ? "text-muted-foreground hover:text-foreground hover:bg-accent" : "text-border cursor-not-allowed"
                        )}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 border border-border/60 rounded-xl">
                <div className="relative w-full md:w-auto md:min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search teams or series..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 bg-background"
                    />
                </div>
                
                <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
                        <select 
                            className="bg-background border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            {matchTypes.map(type => (
                                <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <select 
                            className="bg-background border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
                            value={filterCountry}
                            onChange={(e) => setFilterCountry(e.target.value)}
                        >
                            {countries.map(c => (
                                <option key={c} value={c}>{c === 'All' ? 'All Countries' : c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <select 
                            className="bg-background border border-border text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500 max-w-[200px] truncate"
                            value={filterLeague}
                            onChange={(e) => setFilterLeague(e.target.value)}
                        >
                            {leagues.map(l => (
                                <option key={l} value={l}>{l === 'All' ? 'All Leagues' : l}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Match List or Standings */}
            {activeTab === 'standings' && standings ? (
                <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
                    <div className="p-4 bg-muted/30 border-b border-border flex items-center justify-between">
                        <h3 className="font-bold text-lg">{sportName} Standings</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            <div className="p-3 bg-muted/10 border-b border-border grid grid-cols-12 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                <div className="col-span-5 pl-2">Team</div>
                                <div className="text-center">P</div>
                                <div className="text-center">W</div>
                                <div className="text-center">L</div>
                                <div className="text-center">GD</div>
                                <div className="text-center pr-2 col-span-3">Form</div>
                                <div className="text-center pr-2">Pts</div>
                            </div>
                            <div className="divide-y divide-border">
                                {standings.map((team: any, idx: number) => (
                                    <div key={team.id} className="p-3 grid grid-cols-12 items-center text-sm hover:bg-muted/30 transition-colors">
                                        <div className="col-span-5 flex items-center gap-3">
                                            <span className="text-[11px] text-muted-foreground w-4 text-center font-mono font-bold">{idx + 1}</span>
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                                                <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <div className="font-bold truncate text-foreground">{team.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">{team.short_name}</div>
                                                    {team.league_name && (
                                                        <span className="text-[9px] px-1 rounded bg-muted text-muted-foreground border border-border/50">
                                                            {team.league_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center text-muted-foreground font-mono text-xs">{team.played}</div>
                                        <div className="text-center text-muted-foreground font-mono text-xs">{team.won}</div>
                                        <div className="text-center text-muted-foreground font-mono text-xs">{team.lost}</div>
                                        <div className="text-center text-muted-foreground font-mono text-xs">
                                            {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                                        </div>
                                        <div className="col-span-3 flex justify-center gap-1">
                                            {(team.form || []).map((f: string, i: number) => (
                                                <span key={i} className={cn(
                                                    "w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black",
                                                    f === 'W' ? "bg-green-500/20 text-green-500" : 
                                                    f === 'L' ? "bg-red-500/20 text-red-500" : 
                                                    "bg-yellow-500/20 text-yellow-500"
                                                )}>
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="text-center font-black text-foreground font-mono text-base pr-2">{team.points}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : filteredMatches.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-6">
                    {filteredMatches.map(match => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-border/60 rounded-xl border-dashed mt-6">
                    <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 text-3xl">
                        {sportEmoji}
                    </div>
                    <h3 className="text-lg font-bold">
                        No {activeTab === 'live' ? 'Live' : activeTab === 'upcoming' ? 'Upcoming' : 'Completed'} {sportName} Matches Found
                    </h3>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        {(filterType !== 'All' || filterCountry !== 'All' || filterLeague !== 'All' || searchQuery || selectedDate !== 'all') 
                            ? "Try adjusting your filters, date, or search query to find what you're looking for." 
                            : `There are currently no ${activeTab} matches available for ${sportName}. Check back later!`}
                    </p>
                    {(filterType !== 'All' || filterCountry !== 'All' || filterLeague !== 'All' || searchQuery || selectedDate !== 'all') && (
                        <button 
                            onClick={() => {
                                setFilterType('All')
                                setFilterCountry('All')
                                setFilterLeague('All')
                                setSearchQuery('')
                                setSelectedDate('all')
                            }}
                            className="mt-4 text-brand-500 text-sm font-medium hover:underline px-4 py-2 bg-brand-500/10 rounded-lg"
                        >
                            Clear all filters
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
