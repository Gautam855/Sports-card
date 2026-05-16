/**
 * API Status Tracker
 * 
 * Tracks rate-limit and error status for all external sports APIs.
 * Stores status in a global in-memory cache (per-process, resets on deploy).
 */

export interface APIStatus {
    name: string
    host: string
    sport: string
    status: 'ok' | 'rate_limited' | 'error' | 'unknown'
    statusCode: number | null
    lastChecked: string
    lastError: string | null
    remainingRequests: number | null
    dailyLimit: number | null
    resetsAt: string | null        // ISO timestamp when rate limit resets
    resetsInSeconds: number | null // seconds until reset (computed at read time)
}

// In-memory store – survives across requests in the same process
const apiStatusMap = new Map<string, APIStatus>()

/** Extract rate-limit reset time from response headers */
function extractResetTime(headers?: Headers): string | null {
    if (!headers) return null

    // Common reset headers (unix timestamp or seconds)
    const resetEpoch = headers.get('x-ratelimit-requests-reset')
        ?? headers.get('x-ratelimit-reset')
        ?? headers.get('x-ratelimit-rapid-free-plans-hard-limit-reset')
    
    if (resetEpoch) {
        const num = parseInt(resetEpoch)
        if (num > 1_000_000_000) {
            // Unix timestamp (seconds since epoch)
            return new Date(num * 1000).toISOString()
        } else {
            // Seconds from now
            return new Date(Date.now() + num * 1000).toISOString()
        }
    }

    // API-Sports uses daily reset (resets at midnight UTC)
    const remaining = headers.get('x-ratelimit-requests-remaining')
    if (remaining && parseInt(remaining) === 0) {
        const tomorrow = new Date()
        tomorrow.setUTCHours(24, 0, 0, 0) // midnight UTC
        return tomorrow.toISOString()
    }

    return null
}

/** Record a successful API call */
export function recordAPISuccess(
    name: string, host: string, sport: string, headers?: Headers,
    opts?: { remaining?: number; limit?: number; resetsAt?: string }
) {
    const remainingHeader = headers?.get('x-ratelimit-requests-remaining') 
        ?? headers?.get('x-ratelimit-remaining') 
        ?? headers?.get('x-ratelimit-rapid-free-plans-hard-limit-remaining')
    const remaining = opts?.remaining ?? (remainingHeader ? parseInt(remainingHeader) : null)

    const limitHeader = headers?.get('x-ratelimit-requests-limit') 
        ?? headers?.get('x-ratelimit-limit') 
        ?? headers?.get('x-ratelimit-rapid-free-plans-hard-limit-limit')
    const limit = opts?.limit ?? (limitHeader ? parseInt(limitHeader) : null)

    const resetsAt = opts?.resetsAt ?? extractResetTime(headers)

    apiStatusMap.set(name, {
        name,
        host,
        sport,
        status: 'ok',
        statusCode: 200,
        lastChecked: new Date().toISOString(),
        lastError: null,
        remainingRequests: remaining,
        dailyLimit: limit,
        resetsAt,
        resetsInSeconds: null,
    })
}

/** Record a failed API call */
export function recordAPIError(name: string, host: string, sport: string, statusCode: number, errorMessage: string, headers?: Headers) {
    const isRateLimited = statusCode === 429
        || errorMessage.toLowerCase().includes('limit')
        || errorMessage.toLowerCase().includes('quota')
        || errorMessage.toLowerCase().includes('exceeded')
        || errorMessage.toLowerCase().includes('too many')
        || errorMessage.toLowerCase().includes('not subscribed')

    const resetsAt = extractResetTime(headers)

    // If rate limited and no reset header, estimate daily reset (midnight UTC)
    let estimatedReset = resetsAt
    if (isRateLimited && !estimatedReset) {
        const tomorrow = new Date()
        tomorrow.setUTCHours(24, 0, 0, 0)
        estimatedReset = tomorrow.toISOString()
    }

    apiStatusMap.set(name, {
        name,
        host,
        sport,
        status: isRateLimited ? 'rate_limited' : 'error',
        statusCode,
        lastChecked: new Date().toISOString(),
        lastError: errorMessage,
        remainingRequests: isRateLimited ? 0 : null,
        dailyLimit: null,
        resetsAt: estimatedReset,
        resetsInSeconds: null,
    })
}

/** Get all API statuses with computed resetsInSeconds */
export function getAllAPIStatuses(): APIStatus[] {
    const now = Date.now()

    // Provide defaults for APIs we haven't tried yet
    const defaultAPIs: Omit<APIStatus, 'status' | 'statusCode' | 'lastChecked' | 'lastError' | 'remainingRequests' | 'dailyLimit' | 'resetsAt' | 'resetsInSeconds'>[] = [
        { name: 'Football536', host: process.env.FOOTBALL536_HOST ?? 'football536.p.rapidapi.com', sport: 'Football' },
        { name: 'Cricbuzz', host: process.env.CRICKET_CRICBUZZ_HOST ?? 'not-configured', sport: 'Cricket' },
        { name: 'SportScore', host: process.env.SPORTSCORE_HOST ?? 'sportscore6.p.rapidapi.com', sport: 'Basketball' },
        { name: 'Baseball Data', host: process.env.BASEBALL_HOST ?? 'baseball-data.p.rapidapi.com', sport: 'Baseball' },
        { name: 'Rugby Data', host: process.env.RUGBY_HOST ?? 'rugbyapi2.p.rapidapi.com', sport: 'Rugby' },
        { name: 'Tennis Data', host: process.env.TENNIS_APISPORTS_HOST ?? 'not-configured', sport: 'Tennis' },
        { name: 'SerpApi', host: 'serpapi.com', sport: 'Real-time News' },
    ]





    return defaultAPIs.map(api => {
        const tracked = apiStatusMap.get(api.name)
        if (tracked) {
            // Compute resetsInSeconds dynamically
            let resetsInSeconds: number | null = null
            if (tracked.resetsAt) {
                const diff = Math.max(0, Math.round((new Date(tracked.resetsAt).getTime() - now) / 1000))
                resetsInSeconds = diff
            }
            return { ...tracked, resetsInSeconds }
        }
        return {
            ...api,
            status: 'unknown' as const,
            statusCode: null,
            lastChecked: 'Never',
            lastError: null,
            remainingRequests: null,
            dailyLimit: null,
            resetsAt: null,
            resetsInSeconds: null,
        }
    })
}
