'use client'

import { useEffect, useState, useCallback } from 'react'
import {
    Key, RefreshCw, CheckCircle2, XCircle, AlertTriangle, HelpCircle,
    ChevronDown, Loader2, ArrowRightLeft, Shield, Clock, Zap,
    Activity, Timer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

interface KeySlot {
    slot: number
    key: string
    configured: boolean
}

interface ProviderStatus {
    provider: string
    label: string
    envPrefix: string
    activeSlot: number
    slots: KeySlot[]
    totalConfigured: number
    updatedAt: string | null
    notes: string | null
}

interface APILiveStatus {
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

interface SwitchResult {
    success: boolean
    provider: string
    previousSlot: number
    newSlot: number
    message: string
}

// Map provider IDs to API status names
const PROVIDER_TO_STATUS_NAME: Record<string, string> = {
    football536: 'Football536',
    basketball: 'SportScore',
    baseball: 'Baseball Data',
    cricket: 'Cricbuzz',
    tennis: 'Tennis Data',
    rugby: 'Rugby Data',
}

export default function APIKeysPage() {
    const [providers, setProviders] = useState<ProviderStatus[]>([])
    const [apiStatuses, setApiStatuses] = useState<APILiveStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [switching, setSwitching] = useState<string | null>(null)
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
    const { getToken } = useAuth()

    const fetchKeys = useCallback(async () => {
        try {
            setLoading(true)
            const token = getToken()
            const headers: Record<string, string> = {}
            if (token) headers['Authorization'] = `Bearer ${token}`

            const [keysRes, statusRes] = await Promise.all([
                fetch('/api/admin/api-keys', { headers }),
                fetch('/api/admin/api-status', { headers }),
            ])
            
            const keysData = await keysRes.json()
            const statusData = await statusRes.json()

            if (keysData.error) {
                setError(keysData.error)
            } else {
                setProviders(keysData.providers ?? [])
                setError(null)
            }

            setApiStatuses(statusData.statuses ?? [])
        } catch (err: any) {
            console.error('Failed to fetch API keys:', err)
            setError(err?.message ?? 'Failed to load API key data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchKeys()
    }, [fetchKeys])

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 4000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    async function handleSwitchSlot(provider: string, slot: number) {
        setSwitching(`${provider}-${slot}`)
        try {
            const token = getToken()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers,
                body: JSON.stringify({ provider, slot }),
            })
            const result: SwitchResult = await res.json()

            if (result.success) {
                setToast({ message: result.message, type: 'success' })
                await fetchKeys()
            } else {
                setToast({ message: result.message, type: 'error' })
            }
        } catch (err) {
            setToast({ message: 'Failed to switch key slot', type: 'error' })
        } finally {
            setSwitching(null)
        }
    }

    async function handleRotateNow(provider: string) {
        setSwitching(`rotate-${provider}`)
        try {
            const token = getToken()
            const headers: Record<string, string> = {
                'Content-Type': 'application/json'
            }
            if (token) headers['Authorization'] = `Bearer ${token}`

            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers,
                body: JSON.stringify({ provider, action: 'rotate' }),
            })
            const result: SwitchResult = await res.json()

            if (result.success) {
                setToast({ message: `Rotated: ${result.message}`, type: 'success' })
                await fetchKeys()
            } else {
                setToast({ message: result.message, type: 'error' })
            }
        } catch (err) {
            setToast({ message: 'Failed to rotate key', type: 'error' })
        } finally {
            setSwitching(null)
        }
    }

    // Build a lookup for API live status by provider
    function getStatusForProvider(providerId: string): APILiveStatus | null {
        const statusName = PROVIDER_TO_STATUS_NAME[providerId]
        if (!statusName) return null
        return apiStatuses.find(s => s.name === statusName) ?? null
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <Key className="w-6 h-6" />
                        </div>
                        API Key Manager
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage multi-slot API keys with auto-rotation fallback
                    </p>
                </div>
                <button
                    onClick={fetchKeys}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent/80 text-sm font-medium transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
                    Refresh
                </button>
            </div>

            {/* Info Banner */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
                <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                        <p className="font-semibold text-blue-500 mb-1">How Key Rotation Works</p>
                        <ul className="text-muted-foreground space-y-1">
                            <li>• Each provider supports up to <strong>10 key slots</strong>. Configure multiple API keys in your <code className="text-xs bg-muted px-1 py-0.5 rounded">.env</code> file.</li>
                            <li>• When a key gets <strong>rate limited (429)</strong>, returns <strong>401/403</strong>, or credits run out, the system auto-switches to the next configured key.</li>
                            <li>• The active slot is <strong>persisted in database</strong> — survives server restarts.</li>
                            <li>• You can also <strong>manually switch</strong> the active key slot below.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {toast && (
                <div className={cn(
                    'fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all animate-in slide-in-from-top-2',
                    toast.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                )}>
                    {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {toast.message}
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3 text-red-500">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                    <button onClick={fetchKeys} className="ml-auto text-xs underline hover:no-underline">Try again</button>
                </div>
            )}

            {/* Loading */}
            {loading && providers.length === 0 && !error ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : providers.length === 0 && !loading && !error ? (
                <div className="text-center py-20 border border-dashed rounded-2xl">
                    <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-20" />
                    <p className="text-muted-foreground">No API providers found.</p>
                </div>
            ) : (
                /* Provider Cards */
                <div className="space-y-6">
                    {providers.map((provider) => (
                        <ProviderCard
                            key={provider.provider}
                            provider={provider}
                            switching={switching}
                            onSwitch={handleSwitchSlot}
                            onRotate={handleRotateNow}
                            liveStatus={getStatusForProvider(provider.provider)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

// ─── Format time helpers ─────────────────────────────────────────────────────

function formatResetTime(seconds: number | null): string {
    if (!seconds || seconds <= 0) return 'Now'
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
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

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const config: Record<string, { label: string; cls: string }> = {
        ok: { label: 'Active', cls: 'bg-green-500/10 text-green-500 border-green-500/20' },
        rate_limited: { label: 'Rate Limited', cls: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
        error: { label: 'Error', cls: 'bg-red-500/10 text-red-500 border-red-500/20' },
        unknown: { label: 'Unknown', cls: 'bg-muted text-muted-foreground border-border' },
    }
    const c = config[status] ?? config.unknown
    return (
        <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border', c.cls)}>
            {c.label}
        </span>
    )
}

// ─── Provider Card Component ─────────────────────────────────────────────────

function ProviderCard({
    provider,
    switching,
    onSwitch,
    onRotate,
    liveStatus,
}: {
    provider: ProviderStatus
    switching: string | null
    onSwitch: (provider: string, slot: number) => void
    onRotate: (provider: string) => void
    liveStatus: APILiveStatus | null
}) {
    const [expanded, setExpanded] = useState(true)
    const configuredCount = provider.totalConfigured
    const hasMultipleKeys = configuredCount > 1
    const isRotating = switching === `rotate-${provider.provider}`

    const lastConfiguredSlot = provider.slots.reduce((max, s) => s.configured ? Math.max(max, s.slot) : max, 0)
    const maxSlotToShow = Math.max(5, lastConfiguredSlot, provider.activeSlot)
    const visibleSlots = provider.slots.filter(s => s.slot <= maxSlotToShow)

    return (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
            {/* Card Header */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(!expanded)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded) }}
                className="w-full flex items-center justify-between p-5 hover:bg-accent/30 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-4">
                    <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold',
                        configuredCount > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    )}>
                        <Key className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <h3 className="font-semibold text-base">{provider.label}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1">
                                {configuredCount > 0 ? (
                                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                               ) : (
                                    <XCircle className="w-3 h-3 text-red-500" />
                                )}
                                {configuredCount}/{maxSlotToShow} keys configured
                            </span>
                            <span>•</span>
                            <span className="font-mono">Active: Slot {provider.activeSlot}</span>
                            {provider.updatedAt && (
                                <>
                                    <span>•</span>
                                    <span>Updated: {new Date(provider.updatedAt).toLocaleString()}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {liveStatus && <StatusBadge status={liveStatus.status} />}
                    {hasMultipleKeys && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onRotate(provider.provider) }}
                            disabled={isRotating}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                            {isRotating ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                <ArrowRightLeft className="w-3 h-3" />
                            )}
                            Rotate Now
                        </button>
                    )}
                    <ChevronDown className={cn('w-4 h-4 text-muted-foreground transition-transform', expanded && 'rotate-180')} />
                </div>
            </div>

            {/* Expanded Content */}
            {expanded && (
                <div className="border-t border-border">
                    {/* Live Status Bar */}
                    {liveStatus && (
                        <div className="px-5 pt-4 pb-2">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {/* Status */}
                                <div className="rounded-xl bg-muted/40 p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                                        <Activity className="w-3 h-3" />
                                        Status
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            'w-2 h-2 rounded-full',
                                            liveStatus.status === 'ok' ? 'bg-green-500' :
                                            liveStatus.status === 'rate_limited' ? 'bg-amber-500 animate-pulse' :
                                            liveStatus.status === 'error' ? 'bg-red-500' : 'bg-muted-foreground'
                                        )} />
                                        <span className="text-sm font-medium">
                                            {liveStatus.statusCode ? `HTTP ${liveStatus.statusCode}` : 'N/A'}
                                        </span>
                                    </div>
                                </div>

                                {/* Remaining Requests */}
                                <div className="rounded-xl bg-muted/40 p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                                        <Zap className="w-3 h-3" />
                                        Remaining
                                    </div>
                                    <div className="text-sm font-medium">
                                        {liveStatus.remainingRequests !== null ? (
                                            <span className={cn(
                                                liveStatus.remainingRequests === 0 ? 'text-red-500' :
                                                liveStatus.remainingRequests < 20 ? 'text-amber-500' : 'text-green-500'
                                            )}>
                                                {liveStatus.remainingRequests}
                                                {liveStatus.dailyLimit ? ` / ${liveStatus.dailyLimit}` : ''}
                                            </span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>

                                {/* Reset Time */}
                                <div className="rounded-xl bg-muted/40 p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                                        <Timer className="w-3 h-3" />
                                        Resets In
                                    </div>
                                    <div className="text-sm font-medium">
                                        {liveStatus.resetsInSeconds !== null ? (
                                            <span className="text-foreground">{formatResetTime(liveStatus.resetsInSeconds)}</span>
                                        ) : (
                                            <span className="text-muted-foreground">—</span>
                                        )}
                                    </div>
                                </div>

                                {/* Last Checked */}
                                <div className="rounded-xl bg-muted/40 p-3">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1.5">
                                        <Clock className="w-3 h-3" />
                                        Checked
                                    </div>
                                    <div className="text-sm font-medium text-foreground">
                                        {liveStatus.lastChecked !== 'Never' ? formatTimeStr(liveStatus.lastChecked) : '—'}
                                    </div>
                                </div>
                            </div>

                            {/* Error message */}
                            {liveStatus.lastError && (
                                <div className="mt-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-3">
                                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-red-500 mb-1">
                                            {liveStatus.lastError.includes('Invalid API key') || liveStatus.lastError.includes('suspended') 
                                                ? 'Key Invalid or Suspended'
                                                : 'API Request Error'}
                                        </p>
                                        <p className="text-xs text-red-400 font-mono break-all line-clamp-3">
                                            {(() => {
                                                try {
                                                    const parsed = JSON.parse(liveStatus.lastError)
                                                    if (parsed.errors) {
                                                        if (typeof parsed.errors === 'object') {
                                                            return Object.entries(parsed.errors)
                                                                .map(([k, v]) => `${k}: ${v}`)
                                                                .join(' | ')
                                                        }
                                                        return String(parsed.errors)
                                                    }
                                                    if (parsed.message) return parsed.message
                                                } catch {}
                                                return liveStatus.lastError
                                            })()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-5 pt-3 space-y-3">
                        {/* Env hint */}
                        <div className="text-xs text-muted-foreground mb-4">
                            Configure keys in <code className="bg-muted px-1.5 py-0.5 rounded font-mono">.env</code> →{' '}
                            <code className="bg-muted px-1.5 py-0.5 rounded font-mono">
                                {provider.envPrefix}_1 ... _{maxSlotToShow}
                            </code>
                        </div>

                        {/* Slot Grid */}
                        <div className={cn(
                            "grid gap-3",
                            maxSlotToShow <= 5 ? "grid-cols-1 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-5"
                        )}>
                            {visibleSlots.map((slot) => {
                                const isActive = slot.slot === provider.activeSlot
                                const isSwitching = switching === `${provider.provider}-${slot.slot}`

                                return (
                                    <div
                                        key={slot.slot}
                                        className={cn(
                                            'relative rounded-xl border-2 p-4 transition-all',
                                            isActive
                                                ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10'
                                                : slot.configured
                                                    ? 'border-border hover:border-primary/40 bg-card'
                                                    : 'border-dashed border-border/60 bg-muted/30 opacity-60'
                                        )}
                                    >
                                        {/* Active Badge */}
                                        {isActive && (
                                            <div className="absolute -top-2 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                Active
                                            </div>
                                        )}

                                        <div className="text-center space-y-2">
                                            <p className="text-xs font-semibold text-muted-foreground">Slot {slot.slot}</p>

                                            {slot.configured ? (
                                                <p className="font-mono text-xs text-foreground truncate" title={slot.key}>
                                                    {slot.key}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground italic">Not configured</p>
                                            )}

                                            {/* Switch button */}
                                            {slot.configured && !isActive && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        onSwitch(provider.provider, slot.slot)
                                                    }}
                                                    disabled={isSwitching}
                                                    className="w-full mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors disabled:opacity-50"
                                                >
                                                    {isSwitching ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <ArrowRightLeft className="w-3 h-3" />
                                                    )}
                                                    Switch
                                                </button>
                                            )}

                                            {isActive && slot.configured && (
                                                <div className="flex items-center justify-center gap-1 text-[10px] text-green-500 font-medium mt-2">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    In Use
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Warning if only 1 key */}
                        {configuredCount === 1 && (
                            <div className="flex items-center gap-2 text-xs text-amber-500 mt-3">
                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                Only 1 key configured — add more keys for auto-rotation fallback
                            </div>
                        )}
                        {configuredCount === 0 && (
                            <div className="flex items-center gap-2 text-xs text-red-500 mt-3">
                                <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                No keys configured — this provider will not work
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
