'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Activity, AlertTriangle, CheckCircle2, Clock, Key, Loader2, Newspaper,
    RefreshCw, Timer, XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

interface APILiveStatus {
    name: string
    host: string
    category: string
    status: 'ok' | 'rate_limited' | 'error' | 'unknown'
    statusCode: number | null
    lastChecked: string
    lastError: string | null
    remainingRequests: number | null
    dailyLimit: number | null
    resetsAt: string | null
    resetsInSeconds: number | null
}

function formatResetTime(seconds: number | null): string {
    if (!seconds || seconds <= 0) return 'Soon'
    const d = Math.floor(seconds / 86400)
    const h = Math.floor((seconds % 86400) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (d > 0) return `${d}d ${h}h`
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

function formatTimeStr(isoStr: string): string {
    try {
        return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    } catch {
        return isoStr
    }
}

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; cls: string }> = {
        ok: { label: 'Healthy', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
        rate_limited: { label: 'Quota Low', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
        error: { label: 'Error', cls: 'bg-red-500/10 text-red-600 border-red-500/20' },
        unknown: { label: 'Unknown', cls: 'bg-muted text-muted-foreground border-border' },
    }
    const c = config[status] ?? config.unknown
    return (
        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', c.cls)}>
            {c.label}
        </span>
    )
}

function StatusCard({ status }: { status: APILiveStatus }) {
    const usagePercent =
        status.remainingRequests !== null && status.dailyLimit
            ? Math.round(((status.dailyLimit - status.remainingRequests) / status.dailyLimit) * 100)
            : null

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-5 border-b border-border bg-gradient-to-r from-[#0f172a]/5 to-[#dc2626]/5">
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        status.status === 'ok' ? 'bg-emerald-500/10 text-emerald-600' :
                        status.status === 'rate_limited' ? 'bg-amber-500/10 text-amber-600' :
                        status.status === 'error' ? 'bg-red-500/10 text-red-600' :
                        'bg-muted text-muted-foreground'
                    )}>
                        <Newspaper className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base">{status.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            {status.category} · {status.host}
                        </p>
                    </div>
                </div>
                <StatusBadge status={status.status} />
            </div>

            <div className="p-5 space-y-4">
                {usagePercent !== null && (
                    <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                            <span>Monthly usage</span>
                            <span>{usagePercent}% used</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all',
                                    usagePercent >= 90 ? 'bg-red-500' :
                                    usagePercent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                )}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Metric label="Response" icon={Activity} value={
                        status.statusCode ? `HTTP ${status.statusCode}` : 'N/A'
                    } dot={status.status} />

                    <Metric label="Remaining" icon={Timer} value={
                        status.remainingRequests !== null ? (
                            <span className={cn(
                                status.remainingRequests === 0 ? 'text-red-600' :
                                status.remainingRequests < 50 ? 'text-amber-600' : 'text-emerald-600'
                            )}>
                                {status.remainingRequests.toLocaleString()}
                                {status.dailyLimit ? ` / ${status.dailyLimit.toLocaleString()}` : ''}
                            </span>
                        ) : '—'
                    } />

                    <Metric label="Renews in" icon={Clock} value={
                        status.resetsInSeconds !== null ? formatResetTime(status.resetsInSeconds) : '—'
                    } />

                    <Metric label="Last check" icon={RefreshCw} value={
                        status.lastChecked !== 'Never' ? formatTimeStr(status.lastChecked) : '—'
                    } />
                </div>

                {status.lastError && (
                    <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-3">
                        <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-600 font-mono break-all">{status.lastError}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function Metric({
    label, icon: Icon, value, dot,
}: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    value: React.ReactNode
    dot?: string
}) {
    return (
        <div className="rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                <Icon className="w-3 h-3" />
                {label}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium">
                {dot && (
                    <div className={cn(
                        'w-2 h-2 rounded-full flex-shrink-0',
                        dot === 'ok' ? 'bg-emerald-500' :
                        dot === 'rate_limited' ? 'bg-amber-500 animate-pulse' :
                        dot === 'error' ? 'bg-red-500' : 'bg-muted-foreground'
                    )} />
                )}
                {value}
            </div>
        </div>
    )
}

export function APIStatusPanel() {
    const [statuses, setStatuses] = useState<APILiveStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const { getToken } = useAuth()

    const fetchStatus = useCallback(async () => {
        try {
            setLoading(true)
            const token = getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/admin/api-status', { headers })
            const data = await res.json()

            if (data.error) {
                setError(data.error)
            } else {
                setStatuses(data.statuses ?? [])
                setError(null)
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to load API status'
            setError(message)
        } finally {
            setLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        fetchStatus()
        const interval = setInterval(fetchStatus, 60_000)
        return () => clearInterval(interval)
    }, [fetchStatus])

    const allHealthy = statuses.length > 0 && statuses.every((s) => s.status === 'ok')

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-[#0f172a]/10 text-[#0f172a]">
                            <Activity className="w-6 h-6" />
                        </div>
                        News API Monitor
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        SerpApi health &amp; quota for real-time Google News
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/admin/api-keys"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-accent text-sm font-medium transition-colors"
                    >
                        <Key className="w-4 h-4" />
                        Manage Keys
                    </Link>
                    <button
                        onClick={fetchStatus}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#dc2626] hover:bg-[#b91c1c] text-white text-sm font-medium transition-colors disabled:opacity-50"
                    >
                        <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                        Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 text-red-600">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={fetchStatus} className="ml-auto text-xs underline hover:no-underline">Try again</button>
                </div>
            )}

            {loading && statuses.length === 0 && !error ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#dc2626]" />
                </div>
            ) : statuses.length === 0 && !loading && !error ? (
                <div className="text-center py-20 border border-dashed rounded-2xl">
                    <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground">No news APIs configured.</p>
                    <Link href="/admin/api-keys" className="inline-flex items-center gap-1 mt-3 text-sm text-[#dc2626] hover:underline">
                        <Key className="w-3.5 h-3.5" />
                        Add SerpApi keys
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {statuses.map((status) => (
                        <StatusCard key={status.name} status={status} />
                    ))}
                </div>
            )}

            {!loading && allHealthy && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-3 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">SerpApi is responding normally. News feeds should work as expected.</p>
                </div>
            )}
        </div>
    )
}
