'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
    Search, 
    X, 
    TrendingUp, 
    Trophy, 
    Newspaper, 
    Command,
    Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SearchResult {
    id: string
    title: string
    subtitle: string
    type: 'match' | 'news' | 'league'
    href: string
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)

    const handleSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([])
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/matches')
            const data = await res.json()
            
            const allMatches = data.matches || []
            
            // Client-side filter for now since the API is today-only
            const filtered = allMatches.filter((m: any) => {
                const homeName = (m.home_team?.name || m.homeTeam?.name || '').toLowerCase()
                const awayName = (m.away_team?.name || m.awayTeam?.name || '').toLowerCase()
                const leagueName = (m.league?.name || '').toLowerCase()
                const searchLower = q.toLowerCase()
                
                return homeName.includes(searchLower) || 
                       awayName.includes(searchLower) || 
                       leagueName.includes(searchLower)
            })

            const matchResults = filtered.slice(0, 10).map((m: any) => ({
                id: m.id,
                title: `${m.home_team?.name || m.homeTeam?.name || 'TBD'} vs ${m.away_team?.name || m.awayTeam?.name || 'TBD'}`,
                subtitle: m.league?.name || 'Unknown League',
                type: 'match',
                href: `/score/${m.id}`
            }))

            setResults(matchResults)
        } catch (err) {
            console.error('Search failed', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => handleSearch(query), 300)
        return () => clearTimeout(timeoutId)
    }, [query, handleSearch])

    // Shortcut to close on Escape
    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                // Toggle functionality could be added if we had the state here
            }
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden"
                    >
                        {/* Search Bar */}
                        <div className="p-4 flex items-center gap-3 border-b border-border bg-muted/30">
                            <Search className="w-5 h-5 text-muted-foreground" />
                            <Input 
                                autoFocus
                                placeholder="Search matches, leagues, teams..."
                                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg p-0 h-auto"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <div className="flex items-center gap-2">
                                <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-bold text-muted-foreground">
                                    <Command className="w-2.5 h-2.5" /> ESC
                                </kbd>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Results Area */}
                        <div className="max-h-[60vh] overflow-y-auto p-4">
                            {loading ? (
                                <div className="py-20 text-center flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                    <p className="text-sm text-muted-foreground">Searching sports universe...</p>
                                </div>
                            ) : query === '' ? (
                                <div className="space-y-6 py-4">
                                    <div>
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-2 mb-3">Trending Searches</h3>
                                        <div className="flex flex-wrap gap-2 px-2">
                                            {['Premier League', 'IPL 2026', 'Six Nations', 'Champions League'].map(tag => (
                                                <button 
                                                    key={tag}
                                                    onClick={() => setQuery(tag)}
                                                    className="px-3 py-1.5 rounded-full bg-muted hover:bg-primary/10 hover:text-primary border border-border transition-all text-sm font-medium flex items-center gap-2 group"
                                                >
                                                    <TrendingUp className="w-3 h-3 text-muted-foreground group-hover:text-primary" />
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Quick Navigation</h3>
                                        <div className="grid grid-cols-1 gap-2">
                                            <Link href="/news" onClick={onClose} className="p-3 rounded-xl hover:bg-muted border border-transparent hover:border-border transition-all flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Newspaper className="w-4 h-4" /></div>
                                                <span className="text-sm font-bold">Top News</span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : results.length > 0 ? (
                                <div className="space-y-1">
                                    {results.map((res) => (
                                        <Link 
                                            key={res.id} 
                                            href={res.href}
                                            onClick={onClose}
                                            className="flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/5 border border-transparent hover:border-primary/20 transition-all group"
                                        >
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform",
                                                res.type === 'match' ? "bg-orange-500/10 text-orange-500" : "bg-blue-500/10 text-blue-500"
                                            )}>
                                                {res.type === 'match' ? <Trophy className="w-5 h-5" /> : <Newspaper className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors">{res.title}</h4>
                                                <p className="text-xs text-muted-foreground truncate">{res.subtitle}</p>
                                            </div>
                                            <div className="text-[10px] font-black uppercase text-muted-foreground bg-muted px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                {res.type}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-20 text-center text-muted-foreground">
                                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                    <p>No results found for "<span className="text-foreground font-bold">{query}</span>"</p>
                                    <p className="text-xs mt-1">Try searching for teams, leagues or matches.</p>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-border bg-muted/30 text-center text-[10px] text-muted-foreground">
                            Press <kbd className="px-1 rounded bg-background border border-border">ESC</kbd> to close • Start typing to search
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
