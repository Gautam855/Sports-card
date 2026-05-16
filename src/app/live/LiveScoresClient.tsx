'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import { MatchCard, MatchCardSkeleton } from '@/components/sports/MatchCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Wifi, WifiOff } from 'lucide-react'
import type { Match } from '@/lib/types'
import { cn } from '@/lib/utils'

const SPORT_TABS = [
    { id: 'all', label: 'All Sports' },
    { id: 'football', label: 'Football' },
    { id: 'cricket', label: 'Cricket' },
    { id: 'basketball', label: 'Basketball' },
    { id: 'tennis', label: 'Tennis' },
]

interface LiveScoresClientProps {
    initialMatches: Match[]
}

export function LiveScoresClient({ initialMatches }: LiveScoresClientProps) {
    const [matches, setMatches] = useState<Match[]>(initialMatches)
    const [activeTab, setActiveTab] = useState('all')
    const [isConnected, setIsConnected] = useState(false)
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set())
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    const highlightUpdate = useCallback((id: string) => {
        setUpdatedIds(prev => new Set(prev).add(id))
        setTimeout(() => {
            setUpdatedIds(prev => { const s = new Set(prev); s.delete(id); return s })
        }, 2000)
    }, [])

    // Poll the /api/live route every 30s for fresh data
    useEffect(() => {
        let active = true
        setIsConnected(true)

        const poll = async () => {
            try {
                const res = await fetch('/api/live')
                if (!res.ok) return
                const { matches: freshMatches } = await res.json()

                if (!active) return

                // Detect updated matches for highlight effect
                setMatches(prev => {
                    const prevMap = new Map(prev.map(m => [m.id, m]))
                    for (const fm of freshMatches) {
                        const old = prevMap.get(fm.id)
                        if (old && JSON.stringify(old.score) !== JSON.stringify(fm.score)) {
                            highlightUpdate(fm.id)
                        }
                    }
                    return freshMatches
                })
                setLastUpdated(new Date())
            } catch {
                // Silently fail — will retry next interval
            }
        }

        const interval = setInterval(poll, 30_000)

        return () => { active = false; clearInterval(interval) }
    }, [highlightUpdate])

    const filtered = activeTab === 'all'
        ? matches
        : matches.filter(m => m.sport?.sport_type === activeTab)

    return (
        <div>
            {/* Connection status */}
            <div className="flex items-center justify-between mb-4">
                <div className={cn('flex items-center gap-2 text-sm', isConnected ? 'text-green-500' : 'text-muted-foreground')}>
                    {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                    {isConnected ? 'Live updates connected' : 'Connecting...'}
                </div>
                <span className="text-xs text-muted-foreground" suppressHydrationWarning>
                    Updated {mounted ? lastUpdated.toLocaleTimeString() : '--:--:--'}
                </span>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6 flex-wrap h-auto gap-1">
                    {SPORT_TABS.map((tab) => {
                        const count = tab.id === 'all'
                            ? matches.length
                            : matches.filter(m => m.sport?.sport_type === tab.id).length
                        return (
                            <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-1.5">
                                {tab.label}
                                {count > 0 && (
                                    <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">
                                        {count}
                                    </Badge>
                                )}
                            </TabsTrigger>
                        )
                    })}
                </TabsList>

                {SPORT_TABS.map((tab) => (
                    <TabsContent key={tab.id} value={tab.id}>
                        {filtered.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                <AnimatePresence>
                                    {filtered.map((match, i) => (
                                        <motion.div
                                            key={match.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={cn(
                                                'rounded-xl transition-all duration-500',
                                                updatedIds.has(match.id) && 'ring-2 ring-green-500/50 shadow-lg shadow-green-500/10'
                                            )}
                                        >
                                            <MatchCard match={match} />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    )
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-1">No live matches right now</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
                Check back soon! Matches update automatically when they kick off.
            </p>
        </div>
    )
}