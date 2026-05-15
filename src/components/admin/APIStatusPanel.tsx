'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
    AlertTriangle, CheckCircle2, XCircle, HelpCircle, 
    RefreshCw, Wifi, Zap, Clock, Timer
} from 'lucide-react'

interface APIStatus {
    name: string
    host: string
    sport: string
    status: 'ok' | 'rate_limited' | 'error' | 'unknown'
    statusCode: number | null
    lastChecked: string
    lastError: string | null
    remainingRequests: number | null
    dailyLimit: number | null
    resetsAt: string | null
    resetsInSeconds: number | null
}

const STATUS_CONFIG = {
    ok: {
        label: 'Active',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        icon: CheckCircle2,
        dotColor: 'bg-emerald-500',
    },
    rate_limited: {
        label: 'Limit Exceeded',
        color: 'text-amber-500',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        icon: AlertTriangle,
        dotColor: 'bg-amber-500',
    },
    error: {
        label: 'Error',
        color: 'text-red-500',
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        icon: XCircle,
        dotColor: 'bg-red-500',
    },
    unknown: {
        label: 'Not Checked',
        color: 'text-zinc-400',
        bg: 'bg-zinc-500/10',
        border: 'border-zinc-500/30',
        icon: HelpCircle,
        dotColor: 'bg-zinc-400',
    },
}

/** Format seconds into human-readable countdown */
function formatCountdown(totalSeconds: number | null): string | null {
    if (totalSeconds === null || totalSeconds <= 0) return null
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
}

export function APIStatusPanel() {
    const [statuses, setStatuses] = useState<APIStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [tick, setTick] = useState(0) // For live countdown

    const fetchStatuses = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/api-status')
            const data = await res.json()
            setStatuses(data.statuses ?? [])
        } catch {
            // Silently fail
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }, [])

    useEffect(() => {
        fetchStatuses()
        const dataInterval = setInterval(fetchStatuses, 30000) // Refresh data every 30s
        const tickInterval = setInterval(() => setTick(t => t + 1), 1000) // Countdown tick every 1s
        return () => {
            clearInterval(dataInterval)
            clearInterval(tickInterval)
        }
    }, [fetchStatuses])

    const handleRefresh = () => {
        setRefreshing(true)
        fetchStatuses()
    }

    const rateLimitedCount = statuses.filter(s => s.status === 'rate_limited').length
    const errorCount = statuses.filter(s => s.status === 'error').length
    const activeCount = statuses.filter(s => s.status === 'ok').length

    function formatTime(iso: string) {
        if (iso === 'Never') return 'Never'
        try {
            const d = new Date(iso)
            return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        } catch { return iso }
    }

    /** Compute live countdown from resetsAt */
    function getLiveCountdown(api: APIStatus): string | null {
        if (!api.resetsAt) return null
        const remaining = Math.max(0, Math.round((new Date(api.resetsAt).getTime() - Date.now()) / 1000))
        return formatCountdown(remaining)
    }

    function getResetTimeFormatted(api: APIStatus): string | null {
        if (!api.resetsAt) return null
        try {
            return new Date(api.resetsAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        } catch { return null }
    }

    if (loading) {
        return (
            <div className="bg-card border border-border/60 rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-accent rounded w-48"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-32 bg-accent rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-brand-500" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">API Status Monitor</h3>
                        <p className="text-xs text-muted-foreground">Real-time status of external sports APIs</p>
                    </div>
                </div>
                <button 
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-accent"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Summary badges */}
            <div className="px-6 py-3 border-b border-border/60 flex items-center gap-3 flex-wrap bg-accent/30">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-emerald-600 dark:text-emerald-400">{activeCount} Active</span>
                </span>
                {rateLimitedCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        <span className="text-amber-600 dark:text-amber-400">{rateLimitedCount} Rate Limited</span>
                    </span>
                )}
                {errorCount > 0 && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        <span className="text-red-600 dark:text-red-400">{errorCount} Error</span>
                    </span>
                )}
            </div>

            {/* API Cards */}
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {statuses.map((api) => {
                    const cfg = STATUS_CONFIG[api.status]
                    const Icon = cfg.icon
                    const countdown = getLiveCountdown(api)
                    const resetTime = getResetTimeFormatted(api)

                    return (
                        <div 
                            key={api.name} 
                            className={`relative rounded-xl border ${cfg.border} ${cfg.bg} p-4 transition-all hover:shadow-md`}
                        >
                            {/* Top row */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <div className={`w-8 h-8 rounded-lg ${cfg.bg} flex items-center justify-center`}>
                                        <Icon className={`w-4.5 h-4.5 ${cfg.color}`} />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{api.name}</h4>
                                        <p className="text-[11px] text-muted-foreground">{api.sport}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotColor} ${api.status === 'rate_limited' ? 'animate-pulse' : ''}`}></span>
                                    {cfg.label}
                                </span>
                            </div>

                            {/* Details */}
                            <div className="space-y-1.5 text-xs">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Wifi className="w-3 h-3" /> Host
                                    </span>
                                    <span className="font-mono text-[10px] truncate max-w-[180px]">{api.host}</span>
                                </div>

                                {api.statusCode !== null && api.statusCode > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>HTTP Code</span>
                                        <span className={`font-mono font-bold ${api.statusCode >= 400 ? 'text-red-500' : 'text-emerald-500'}`}>
                                            {api.statusCode}
                                        </span>
                                    </div>
                                )}

                                {api.remainingRequests !== null && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Remaining</span>
                                        <span className={`font-bold ${api.remainingRequests === 0 ? 'text-red-500' : api.remainingRequests < 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                                            {api.remainingRequests}{api.dailyLimit ? ` / ${api.dailyLimit}` : ''}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Checked
                                    </span>
                                    <span>{formatTime(api.lastChecked)}</span>
                                </div>
                            </div>

                            {/* Reset info - shows whenever reset data is available */}
                            {api.resetsAt && (
                                <div className={`mt-3 p-2.5 rounded-lg border ${api.status === 'rate_limited' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-500/5 border-slate-500/10'}`}>
                                    <div className="flex items-center justify-between">
                                        <span className={`flex items-center gap-1.5 text-[11px] font-medium ${api.status === 'rate_limited' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                                            <Timer className="w-3.5 h-3.5" />
                                            {countdown ? 'Resets in' : 'Resets at'}
                                        </span>
                                        <span className={`text-sm font-bold font-mono tabular-nums ${api.status === 'rate_limited' ? 'text-amber-600 dark:text-amber-400' : 'text-foreground/80'}`}>
                                            {countdown || resetTime}
                                        </span>
                                    </div>
                                    {countdown && resetTime && (
                                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                                            Full reset scheduled at {resetTime}
                                        </p>
                                    )}
                                </div>
                            )}


                            {/* Error message */}
                            {api.lastError && (
                                <div className="mt-3 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
                                    <p className="text-[11px] text-red-500 dark:text-red-400 line-clamp-2 font-mono">
                                        {api.lastError}
                                    </p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
