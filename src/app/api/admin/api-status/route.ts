import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllAPIStatuses, recordAPISuccess, recordAPIError } from '@/lib/api/api-status'
import { getActiveKey } from '@/lib/api/key-manager'
import { verifyAdmin } from '@/lib/api/admin-auth'

export const dynamic = 'force-dynamic'

// ─── Read hosts from .env ────────────────────────────────────────────────────
const FOOTBALL536_HOST  = process.env.FOOTBALL536_HOST ?? 'football536.p.rapidapi.com'
const CRICKET_HOST      = process.env.CRICKET_CRICBUZZ_HOST ?? ''
const BASKETBALL_HOST   = process.env.SPORTSCORE_HOST ?? 'sportscore6.p.rapidapi.com'

const BASEBALL_HOST     = process.env.BASEBALL_HOST ?? 'baseball-data.p.rapidapi.com'
const TENNIS_HOST       = process.env.TENNIS_APISPORTS_HOST ?? 'v3.tennis.api-sports.io'
const RUGBY_HOST        = process.env.RUGBY_HOST ?? 'rugbyapi2.p.rapidapi.com'

interface HealthCheckTarget {
    name: string
    host: string
    sport: string
    url: string
    headers: Record<string, string>
}

async function getTargets(): Promise<HealthCheckTarget[]> {
    // Fetch active keys from key-manager (uses DB-persisted active slot)
    const [football536Key, cricketKey, basketballKey, baseballKey, tennisKey, rugbyKey, serpApiKey] = await Promise.all([
        getActiveKey('football536'),
        getActiveKey('cricket'),
        getActiveKey('basketball'),
        getActiveKey('baseball'),
        getActiveKey('tennis'),
        getActiveKey('rugby'),
        getActiveKey('serpapi'),
    ])

    return [
        {
            name: 'Football536',
            host: FOOTBALL536_HOST,
            sport: 'Football',
            url: `https://${FOOTBALL536_HOST}/leagues`,
            headers: { 'X-RapidAPI-Key': football536Key, 'X-RapidAPI-Host': FOOTBALL536_HOST },
        },
        {
            name: 'Cricbuzz',
            host: CRICKET_HOST,
            sport: 'Cricket',
            url: `https://${CRICKET_HOST}/matches/v1/live`,
            headers: { 'X-RapidAPI-Key': cricketKey, 'X-RapidAPI-Host': CRICKET_HOST },
        },
        {
            name: 'SportScore',
            host: BASKETBALL_HOST,
            sport: 'Basketball',
            url: `https://${BASKETBALL_HOST}/api/widget/matches/?sport=basketball&limit=1`,
            headers: { 'X-RapidAPI-Key': basketballKey, 'X-RapidAPI-Host': BASKETBALL_HOST },
        },
        {
            name: 'Baseball Data',
            host: BASEBALL_HOST,
            sport: 'Baseball',
            url: `https://${BASEBALL_HOST}/match/list/live?date=${(() => {
                const now = new Date();
                const d = String(now.getDate()).padStart(2, '0');
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const y = now.getFullYear();
                return `${d}/${m}/${y}`;
            })()}`,
            headers: { 'X-RapidAPI-Key': baseballKey, 'X-RapidAPI-Host': BASEBALL_HOST },
        },
        {
            name: 'Rugby Data',
            host: RUGBY_HOST,
            sport: 'Rugby',
            url: `https://${RUGBY_HOST}/matches?date=${(() => {
                const now = new Date();
                const d = String(now.getDate()).padStart(2, '0');
                const m = String(now.getMonth() + 1).padStart(2, '0');
                const y = now.getFullYear();
                return `${y}-${m}-${d}`;
            })()}`,
            headers: { 'X-RapidAPI-Key': rugbyKey, 'X-RapidAPI-Host': RUGBY_HOST },
        },
        {
            name: 'Tennis Data',
            host: TENNIS_HOST,
            sport: 'Tennis',
            url: `https://${TENNIS_HOST}/status`,
            headers: { 'x-apisports-key': tennisKey },
        },
        {
            name: 'SerpApi',
            host: 'serpapi.com',
            sport: 'Real-time News',
            url: `https://serpapi.com/account?api_key=${serpApiKey}`,
            headers: {},
        },
    ]
}

async function runHealthChecks() {
    const targets = await getTargets()

    await Promise.allSettled(
        targets.map(async (t) => {
            if (!t.host) {
                recordAPIError(t.name, t.host || 'not-configured', t.sport, 0, 'Host not configured in .env')
                return
            }
            try {
                const res = await fetch(t.url, {
                    headers: t.headers,
                    signal: AbortSignal.timeout(8000), // 8s timeout
                })

                if (res.ok) {
                    // API-Sports returns quota info in JSON body for Baseball
                    if (t.name === 'Baseball Data') {
                        recordAPISuccess(t.name, t.host, t.sport, res.headers)
                    } else if (t.name === 'Tennis Data') {
                        try {
                            const json = await res.json()
                            const reqInfo = json?.response?.requests
                            if (reqInfo) {
                                const used = reqInfo.current ?? 0
                                const limit = reqInfo.limit_day ?? 100
                                const remaining = Math.max(0, limit - used)
                                const resetDate = new Date()
                                resetDate.setUTCHours(24, 0, 0, 0)
                                recordAPISuccess(t.name, t.host, t.sport, res.headers, {
                                    remaining,
                                    limit,
                                    resetsAt: resetDate.toISOString(),
                                })
                            } else {
                                recordAPISuccess(t.name, t.host, t.sport, res.headers)
                            }
                        } catch {
                            recordAPISuccess(t.name, t.host, t.sport, res.headers)
                        }
                    } else if (t.name === 'SerpApi') {
                        try {
                            const account = await res.json()
                            if (account && !account.error) {
                                recordAPISuccess(t.name, t.host, t.sport, res.headers, {
                                    remaining: account.total_searches_left,
                                    limit: account.searches_per_month,
                                    resetsAt: account.next_reset_date || account.next_reset_date_at || account.plan_info?.next_reset_date
                                })
                            } else {
                                recordAPISuccess(t.name, t.host, t.sport, res.headers)
                            }
                        } catch {
                            recordAPISuccess(t.name, t.host, t.sport, res.headers)
                        }
                    } else {
                        recordAPISuccess(t.name, t.host, t.sport, res.headers)
                    }
                } else {
                    let errText = await res.text().catch(() => res.statusText)
                    // Clean up HTML error responses
                    if (errText.includes('<') && errText.includes('>')) {
                        const titleMatch = errText.match(/<title>(.*?)<\/title>/i)
                        errText = titleMatch ? titleMatch[1] : `HTTP ${res.status} – ${res.statusText}`
                    }
                    recordAPIError(t.name, t.host, t.sport, res.status, errText.slice(0, 200), res.headers)
                }
            } catch (err: any) {
                recordAPIError(t.name, t.host, t.sport, 0, err?.message ?? 'Network/timeout error')
            }
        })
    )
}

export async function GET(req: NextRequest) {
    try {
        const auth = await verifyAdmin(req)
        if ('error' in auth) {
            return NextResponse.json({ error: auth.error }, { status: auth.status })
        }

        await runHealthChecks()
        const statuses = getAllAPIStatuses()
        return NextResponse.json({ statuses })
    } catch (err: any) {
        return NextResponse.json(
            { error: err?.message ?? 'Failed to fetch API status' },
            { status: 500 }
        )
    }
}
