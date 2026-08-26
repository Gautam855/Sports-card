/**
 * API Key Manager with Multi-Slot Rotation & Supabase Persistence
 */

import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'

export interface KeySlot {
    slot: number
    key: string
    configured: boolean
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

const PROVIDERS = {
    serpapi: { label: 'SerpApi (Google News)', envPrefix: 'SERPAPI_KEY' },
} as const

export type ProviderName = keyof typeof PROVIDERS

const activeSlots: Record<string, number> = {}
let cacheInitialised = false

function getAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) throw new Error('[KeyManager] Missing Supabase environment variables')
    return createSupabaseAdmin(url, key)
}

async function ensureInitialised() {
    if (cacheInitialised) return
    try {
        const supabase = getAdminClient()
        const { data, error } = await supabase.from('api_key_config').select('id, active_slot')
        if (!error && data) {
            for (const row of data) {
                activeSlots[row.id] = row.active_slot
            }
        }
    } catch (err) {
        console.warn('[KeyManager] Could not load from DB, using defaults:', err)
    }
    for (const provider of Object.keys(PROVIDERS)) {
        if (!activeSlots[provider]) activeSlots[provider] = 1
    }
    cacheInitialised = true
}

function getSlots(provider: ProviderName): KeySlot[] {
    const prefix = PROVIDERS[provider].envPrefix
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(slot => {
        let rawKey = process.env[`${prefix}_${slot}`] ?? ''
        let key = rawKey.split(/[#\s]/)[0].trim()
        if (key.endsWith('.')) key = key.slice(0, -1)
        return { slot, key, configured: key.length > 0 }
    })
}

export async function getActiveKey(provider: ProviderName): Promise<string> {
    await ensureInitialised()
    const slots = getSlots(provider)
    const activeSlot = activeSlots[provider] ?? 1
    const activeKey = slots.find(s => s.slot === activeSlot)
    if (activeKey?.configured) return activeKey.key
    const fallback = slots.find(s => s.configured)
    if (fallback) {
        activeSlots[provider] = fallback.slot
        persistSlot(provider, fallback.slot).catch(() => {})
        notifyKeyChange()
        return fallback.key
    }
    return ''
}

export async function rotateToNextKey(provider: ProviderName): Promise<KeySwitchResult> {
    await ensureInitialised()
    const slots = getSlots(provider)
    const currentSlot = activeSlots[provider] ?? 1
    const configuredSlots = slots.filter(s => s.configured)
    if (configuredSlots.length <= 1) {
        return { success: false, provider, previousSlot: currentSlot, newSlot: currentSlot, message: 'No alternative keys configured.' }
    }
    const currentIndex = configuredSlots.findIndex(s => s.slot === currentSlot)
    const nextSlot = configuredSlots[(currentIndex + 1) % configuredSlots.length].slot
    activeSlots[provider] = nextSlot
    await persistSlot(provider, nextSlot)
    notifyKeyChange()
    return { success: true, provider, previousSlot: currentSlot, newSlot: nextSlot, message: `Switched from slot ${currentSlot} to slot ${nextSlot}.` }
}

export async function setActiveSlot(provider: ProviderName, slot: number): Promise<KeySwitchResult> {
    await ensureInitialised()
    const slots = getSlots(provider)
    const target = slots.find(s => s.slot === slot)
    if (!target?.configured) {
        return { success: false, provider, previousSlot: activeSlots[provider] ?? 1, newSlot: slot, message: `Slot ${slot} has no API key configured.` }
    }
    const previousSlot = activeSlots[provider] ?? 1
    activeSlots[provider] = slot
    await persistSlot(provider, slot)
    notifyKeyChange()
    return { success: true, provider, previousSlot, newSlot: slot, message: `Manually switched to slot ${slot}.` }
}

export async function getAllProviderStatuses(): Promise<ProviderStatus[]> {
    await ensureInitialised()
    const statuses: ProviderStatus[] = []
    let dbRows: Record<string, { updated_at: string | null; notes: string | null }> = {}
    try {
        const supabase = getAdminClient()
        const { data } = await supabase.from('api_key_config').select('id, updated_at, notes')
        if (data) {
            for (const row of data) dbRows[row.id] = { updated_at: row.updated_at, notes: row.notes }
        }
    } catch { /* ignore */ }

    for (const [provider, config] of Object.entries(PROVIDERS)) {
        const slots = getSlots(provider as ProviderName)
        statuses.push({
            provider,
            label: config.label,
            envPrefix: config.envPrefix,
            activeSlot: activeSlots[provider] ?? 1,
            slots: slots.map(s => ({ ...s, key: s.configured ? maskKey(s.key) : '' })),
            totalConfigured: slots.filter(s => s.configured).length,
            updatedAt: dbRows[provider]?.updated_at ?? null,
            notes: dbRows[provider]?.notes ?? null,
        })
    }
    return statuses
}

async function persistSlot(provider: string, slot: number) {
    try {
        const supabase = getAdminClient()
        await supabase.from('api_key_config').upsert(
            { id: provider, active_slot: slot, updated_at: new Date().toISOString() },
            { onConflict: 'id' }
        )
    } catch (err) {
        console.warn(`[KeyManager] DB persist failed for ${provider}:`, err)
    }
}

function maskKey(key: string): string {
    if (key.length <= 8) return '****'
    return key.slice(0, 4) + '****' + key.slice(-4)
}

export async function handleRateLimit(provider: ProviderName): Promise<boolean> {
    const result = await rotateToNextKey(provider)
    return result.success
}

type Listener = () => void
const keyChangeListeners: Listener[] = []

export function onKeyChange(listener: Listener) {
    keyChangeListeners.push(listener)
}

export function notifyKeyChange() {
    for (const listener of keyChangeListeners) {
        try { listener() } catch (e) { console.error('Error in key change listener:', e) }
    }
}
