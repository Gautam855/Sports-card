/**
 * Health checks for external news APIs (SerpApi only).
 * Live score providers have been removed from this project.
 */

import { getActiveKey } from './key-manager'

export interface APIStatus {
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

async function checkSerpApi(): Promise<APIStatus> {
    const base: Omit<APIStatus, 'status' | 'statusCode' | 'lastChecked' | 'lastError' | 'remainingRequests' | 'dailyLimit' | 'resetsAt' | 'resetsInSeconds'> = {
        name: 'SerpApi',
        host: 'serpapi.com',
        category: 'Google News',
    }

    const apiKey = await getActiveKey('serpapi')
    if (!apiKey) {
        return {
            ...base,
            status: 'error',
            statusCode: null,
            lastChecked: new Date().toISOString(),
            lastError: 'No API key configured (set SERPAPI_KEY_1 in .env)',
            remainingRequests: null,
            dailyLimit: null,
            resetsAt: null,
            resetsInSeconds: null,
        }
    }

    try {
        const res = await fetch(`https://serpapi.com/account.json?api_key=${apiKey}`, {
            cache: 'no-store',
        })
        const now = new Date().toISOString()

        if (res.status === 429) {
            return {
                ...base,
                status: 'rate_limited',
                statusCode: 429,
                lastChecked: now,
                lastError: 'Rate limited — try rotating to another key slot',
                remainingRequests: 0,
                dailyLimit: null,
                resetsAt: null,
                resetsInSeconds: null,
            }
        }

        const json = await res.json()

        if (!res.ok || json.error) {
            return {
                ...base,
                status: 'error',
                statusCode: res.status,
                lastChecked: now,
                lastError: json.error ?? `HTTP ${res.status}`,
                remainingRequests: null,
                dailyLimit: null,
                resetsAt: null,
                resetsInSeconds: null,
            }
        }

        const remaining = json.plan_searches_left ?? json.total_searches_left ?? null
        const limit = json.searches_per_month ?? null
        const renewal = json.plan_renewal_date as string | null

        let resetsInSeconds: number | null = null
        if (renewal) {
            const diff = new Date(renewal).getTime() - Date.now()
            resetsInSeconds = diff > 0 ? Math.floor(diff / 1000) : 0
        }

        const isLow = remaining !== null && remaining <= 0

        return {
            ...base,
            status: isLow ? 'rate_limited' : 'ok',
            statusCode: res.status,
            lastChecked: now,
            lastError: isLow ? 'Monthly search quota exhausted' : null,
            remainingRequests: remaining,
            dailyLimit: limit,
            resetsAt: renewal,
            resetsInSeconds,
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : 'Request failed'
        return {
            ...base,
            status: 'error',
            statusCode: null,
            lastChecked: new Date().toISOString(),
            lastError: message,
            remainingRequests: null,
            dailyLimit: null,
            resetsAt: null,
            resetsInSeconds: null,
        }
    }
}

export async function getAllAPIStatuses(): Promise<APIStatus[]> {
    return [await checkSerpApi()]
}
