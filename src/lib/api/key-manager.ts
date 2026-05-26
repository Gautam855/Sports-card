/**
 * API Key Manager with Multi-Slot Rotation & Supabase Persistence
 *
 * Features:
 * - 5 key slots per API provider/sport (football, basketball, etc.)
 * - Auto-fallback when a key hits rate limit / credits exhausted
 * - Supabase persistence: remembers active slot + usage across restarts
 * - Admin API to view status & manually switch keys
 *
 * DB Table: `api_key_config` (created via Supabase dashboard)
 *   - id         : text PRIMARY KEY (provider name, e.g. 'football')
 *   - active_slot: integer (1-5)
 *   - notes      : text (admin notes)
 *   - updated_at : timestamptz
 */

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface KeySlot {
    slot: number        // 1-5
    key: string         // actual API key (masked in API responses)
    configured: boolean // has a non-empty key
}

export interface ProviderStatus {
    provider: string
    label: string
    envPrefix: string
    activeSlot: number
    slots: KeySlot[]
    totalConfigured: number
    updatedAt: string | null
    notes: string | null
}

export interface KeySwitchResult {
    success: boolean
    provider: string
    previousSlot: number
    newSlot: number
    message: string
}

// ─── Providers ───────────────────────────────────────────────────────────────

const PROVIDERS = {
    football536: { label: 'Football536 (Leagues & Fixtures)', envPrefix: 'FOOTBALL536_KEY' },
    basketball: { label: 'Basketball (SportScore)', envPrefix: 'BASKETBALL_KEY' },
    baseball: { label: 'Baseball (Baseball Data)', envPrefix: 'BASEBALL_KEY' },
    tennis: { label: 'Tennis (API-Sports)', envPrefix: 'TENNIS_KEY' },
    cricket: { label: 'Cricket (Cricbuzz)', envPrefix: 'CRICKET_KEY' },
    rugby: { label: 'Rugby (RugbyAPI2)', envPrefix: 'RUGBY_KEY' },
    serpapi: { label: 'SerpApi (Google News)', envPrefix: 'SERPAPI_KEY' },
} as const

export type ProviderName = keyof typeof PROVIDERS

// ─── In-memory cache ─────────────────────────────────────────────────────────

// Cache active slots in memory (populated from DB on first use, or defaults to 1)
const activeSlots: Record<string, number> = {}
let cacheInitialised = false

// ─── Supabase admin client (bypasses RLS) ────────────────────────────────────

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        throw new Error('[KeyManager] Missing Supabase environment variables')
    }

    return createSupabaseAdmin(url, key)
}

// ─── Initialise from DB ──────────────────────────────────────────────────────

async function ensureInitialised() {
    if (cacheInitialised) return

    try {
        const supabase = getAdminClient()
        const { data, error } = await supabase
            .from('api_key_config')
            .select('id, active_slot')

        if (!error && data) {
            for (const row of data) {
                activeSlots[row.id] = row.active_slot
            }
        }
    } catch (err) {
        console.warn('[KeyManager] Could not load from DB, using defaults:', err)
    }

    // Default all providers to slot 1 if not in DB
    for (const provider of Object.keys(PROVIDERS)) {
        if (!activeSlots[provider]) {
            activeSlots[provider] = 1
        }
    }

    cacheInitialised = true
}

// ─── Core: Get all keys for a provider ───────────────────────────────────────

function getSlots(provider: ProviderName): KeySlot[] {
    const prefix = PROVIDERS[provider].envPrefix
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(slot => {
        let rawKey = process.env[`${prefix}_${slot}`] ?? ''

        // Sanitize: remove inline comments, spaces, and trailing dots
        let key = rawKey.split(/[#\s]/)[0].trim()
        if (key.endsWith('.')) {
            key = key.slice(0, -1)
        }

        return { slot, key, configured: key.length > 0 }
    })
}

// ─── Core: Get the active key ────────────────────────────────────────────────

export async function getActiveKey(provider: ProviderName): Promise<string> {
    await ensureInitialised()

    const slots = getSlots(provider)
    const activeSlot = activeSlots[provider] ?? 1
    const activeKey = slots.find(s => s.slot === activeSlot)

    if (activeKey?.configured) {
        return activeKey.key
    }

    // Active slot has no key — find first configured one
    const fallback = slots.find(s => s.configured)
    if (fallback) {
        activeSlots[provider] = fallback.slot
        // Fire-and-forget DB update
        persistSlot(provider, fallback.slot).catch(() => { })
        notifyKeyChange()
        return fallback.key
    }

    return '' // No keys configured at all
}

// ─── Core: Rotate to next key (called on rate limit) ─────────────────────────

export async function rotateToNextKey(provider: ProviderName): Promise<KeySwitchResult> {
    await ensureInitialised()

    const slots = getSlots(provider)
    const currentSlot = activeSlots[provider] ?? 1
    const configuredSlots = slots.filter(s => s.configured)

    if (configuredSlots.length <= 1) {
        return {
            success: false,
            provider,
            previousSlot: currentSlot,
            newSlot: currentSlot,
            message: 'No alternative keys configured for fallback.',
        }
    }

    // Find the next configured slot after current
    const currentIndex = configuredSlots.findIndex(s => s.slot === currentSlot)
    const nextIndex = (currentIndex + 1) % configuredSlots.length
    const nextSlot = configuredSlots[nextIndex].slot

    activeSlots[provider] = nextSlot
    await persistSlot(provider, nextSlot)
    notifyKeyChange()

    console.log(`[KeyManager] ${provider}: rotated from slot ${currentSlot} → ${nextSlot}`)

    return {
        success: true,
        provider,
        previousSlot: currentSlot,
        newSlot: nextSlot,
        message: `Switched from slot ${currentSlot} to slot ${nextSlot}.`,
    }
}

// ─── Core: Manually set active slot (admin) ──────────────────────────────────

export async function setActiveSlot(provider: ProviderName, slot: number): Promise<KeySwitchResult> {
    await ensureInitialised()

    const slots = getSlots(provider)
    const target = slots.find(s => s.slot === slot)

    if (!target?.configured) {
        return {
            success: false,
            provider,
            previousSlot: activeSlots[provider] ?? 1,
            newSlot: slot,
            message: `Slot ${slot} has no API key configured.`,
        }
    }

    const previousSlot = activeSlots[provider] ?? 1
    activeSlots[provider] = slot
    await persistSlot(provider, slot)
    notifyKeyChange()

    return {
        success: true,
        provider,
        previousSlot,
        newSlot: slot,
        message: `Manually switched to slot ${slot}.`,
    }
}

// ─── Core: Get status for all providers ──────────────────────────────────────

export async function getAllProviderStatuses(): Promise<ProviderStatus[]> {
    await ensureInitialised()

    const statuses: ProviderStatus[] = []

    // Load DB notes + updated_at
    let dbRows: Record<string, { updated_at: string | null; notes: string | null }> = {}
    try {
        const supabase = getAdminClient()
        const { data } = await supabase.from('api_key_config').select('id, updated_at, notes')
        if (data) {
            for (const row of data) {
                dbRows[row.id] = { updated_at: row.updated_at, notes: row.notes }
            }
        }
    } catch { /* ignore */ }

    for (const [provider, config] of Object.entries(PROVIDERS)) {
        const slots = getSlots(provider as ProviderName)
        const maskedSlots = slots.map(s => ({
            ...s,
            key: s.configured ? maskKey(s.key) : '',
        }))

        statuses.push({
            provider,
            label: config.label,
            envPrefix: config.envPrefix,
            activeSlot: activeSlots[provider] ?? 1,
            slots: maskedSlots,
            totalConfigured: slots.filter(s => s.configured).length,
            updatedAt: dbRows[provider]?.updated_at ?? null,
            notes: dbRows[provider]?.notes ?? null,
        })
    }

    return statuses
}

// ─── Helper: Persist to Supabase ─────────────────────────────────────────────

async function persistSlot(provider: string, slot: number) {
    try {
        const supabase = getAdminClient()
        const { error } = await supabase
            .from('api_key_config')
            .upsert(
                { id: provider, active_slot: slot, updated_at: new Date().toISOString() },
                { onConflict: 'id' }
            )
        if (error) {
            console.warn(`[KeyManager] DB persist error for ${provider}:`, error.message)
        }
    } catch (err) {
        console.warn(`[KeyManager] DB persist failed for ${provider}:`, err)
    }
}

// ─── Helper: Mask key for display ────────────────────────────────────────────

function maskKey(key: string): string {
    if (key.length <= 8) return '****'
    return key.slice(0, 4) + '****' + key.slice(-4)
}

// ─── Auto-rotate on rate limit (call this from rapidFetch) ───────────────────

export async function handleRateLimit(provider: ProviderName): Promise<boolean> {
    const result = await rotateToNextKey(provider)
    return result.success
}

// ─── Key Change Listener System ──────────────────────────────────────────────

type Listener = () => void
const keyChangeListeners: Listener[] = []

export function onKeyChange(listener: Listener) {
    keyChangeListeners.push(listener)
}

export function notifyKeyChange() {
    for (const listener of keyChangeListeners) {
        try {
            listener()
        } catch (e) {
            console.error('Error in key change listener:', e)
        }
    }
}

