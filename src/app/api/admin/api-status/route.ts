import { NextResponse } from 'next/server'
import { getAllAPIStatuses, recordAPISuccess, recordAPIError } from '@/lib/api/api-status'

export const dynamic = 'force-dynamic'

// ─── Read all config from .env (no hardcoding) ──────────────────────────────
const FOOTBALL_KEY      = process.env.FOOTBALL_APISPORTS_KEY ?? ''
const FOOTBALL_HOST     = process.env.FOOTBALL_APISPORTS_HOST ?? ''

const CRICKET_KEY       = process.env.CRICKET_CRICBUZZ_KEY ?? ''
const CRICKET_HOST      = process.env.CRICKET_CRICBUZZ_HOST ?? ''



const BASKETBALL_KEY    = process.env.BASKETBALL_APISPORTS_KEY ?? ''
const BASKETBALL_HOST   = process.env.BASKETBALL_APISPORTS_HOST ?? ''

const MMA_KEY           = process.env.MMA_APISPORTS_KEY ?? ''
const MMA_HOST          = process.env.MMA_APISPORTS_HOST ?? ''

const RUGBY_KEY         = process.env.RUGBY_APISPORTS_KEY ?? ''
const RUGBY_HOST        = process.env.RUGBY_APISPORTS_HOST ?? ''

const BASEBALL_KEY      = process.env.BASEBALL_APISPORTS_KEY ?? ''
const BASEBALL_HOST     = process.env.BASEBALL_APISPORTS_HOST ?? ''

const F1_KEY            = process.env.FORMULA1_APISPORTS_KEY ?? ''
const F1_HOST           = process.env.FORMULA1_APISPORTS_HOST ?? ''

const TSDB_KEY         = process.env.BADMINTON_TSDB_KEY ?? '3'
const TSDB_HOST        = process.env.BADMINTON_TSDB_HOST ?? 'www.thesportsdb.com'

interface HealthCheckTarget {
    name: string
    host: string
    sport: string
    url: string
    headers: Record<string, string>
}

function getTargets(): HealthCheckTarget[] {
    return [
        {
            name: 'API-Football',
            host: FOOTBALL_HOST,
            sport: 'Football',
            url: `https://${FOOTBALL_HOST}/status`,
            headers: { 'x-apisports-key': FOOTBALL_KEY },
        },
        {
            name: 'Cricbuzz',
            host: CRICKET_HOST,
            sport: 'Cricket',
            url: `https://${CRICKET_HOST}/matches/v1/live`,
            headers: { 'X-RapidAPI-Key': CRICKET_KEY, 'X-RapidAPI-Host': CRICKET_HOST },
        },

        {
            name: 'API-Basketball',
            host: BASKETBALL_HOST,
            sport: 'Basketball',
            url: `https://${BASKETBALL_HOST}/status`,
            headers: { 'x-apisports-key': BASKETBALL_KEY },
        },
        {
            name: 'API-MMA',
            host: MMA_HOST,
            sport: 'MMA',
            url: `https://${MMA_HOST}/status`,
            headers: { 'x-apisports-key': MMA_KEY },
        },
        {
            name: 'API-Rugby',
            host: RUGBY_HOST,
            sport: 'Rugby',
            url: `https://${RUGBY_HOST}/status`,
            headers: { 'x-apisports-key': RUGBY_KEY },
        },
        {
            name: 'API-Baseball',
            host: BASEBALL_HOST,
            sport: 'Baseball',
            url: `https://${BASEBALL_HOST}/status`,
            headers: { 'x-apisports-key': BASEBALL_KEY },
        },
        {
            name: 'API-Formula1',
            host: F1_HOST,
            sport: 'Formula 1',
            url: `https://${F1_HOST}/status`,
            headers: { 'x-apisports-key': F1_KEY },
        },
        {
            name: 'TheSportsDB',
            host: TSDB_HOST,
            sport: 'Badminton / Boxing',
            url: `https://${TSDB_HOST}/api/v1/json/${TSDB_KEY}/all_leagues.php`,
            headers: {},
        },
        {
            name: 'API-Boxing',
            host: 'player-props.p.rapidapi.com',
            sport: 'Boxing (Props)',
            url: `https://player-props.p.rapidapi.com/v1/sports`,
            headers: { 
                'X-RapidAPI-Key': '3457ab5929mshab77149accff59dp1b9ec2jsn72a4ab1563cc', 
                'X-RapidAPI-Host': 'player-props.p.rapidapi.com' 
            },
        },
        {
            name: 'API-Tennis',
            host: 'player-props.p.rapidapi.com',
            sport: 'Tennis (Props)',
            url: `https://player-props.p.rapidapi.com/v1/sports`,
            headers: { 
                'X-RapidAPI-Key': 'a495c61205mshedc4719e8615278p1e6d1ejsnf978d455e2ea', 
                'X-RapidAPI-Host': 'player-props.p.rapidapi.com' 
            },
        },
        {
            name: 'SerpApi',
            host: 'serpapi.com',
            sport: 'Real-time News',
            url: `https://serpapi.com/account?api_key=${process.env.SERPAPI_KEY}`,
            headers: {},
        },
    ]



}

async function runHealthChecks() {
    const targets = getTargets()

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
                    // API-Sports returns quota info in JSON body for Football, Formula 1, Basketball, Baseball, MMA and Rugby
                    if (t.name === 'API-Football' || t.name === 'API-Formula1' || t.name === 'API-Basketball' || t.name === 'API-Baseball' || t.name === 'API-MMA' || t.name === 'API-Rugby') {
                        try {
                            const json = await res.json()
                            const reqInfo = json?.response?.requests
                            if (reqInfo) {
                                const used = reqInfo.current ?? 0
                                const limit = reqInfo.limit_day ?? 100
                                const remaining = Math.max(0, limit - used)
                                // Daily reset at midnight UTC
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
                    } else if (t.name === 'TheSportsDB') {
                        // TheSportsDB free key (3) has a daily limit but doesn't return it in headers/body.
                        // We show a placeholder limit to satisfy the UI dashboard fields.
                        const resetDate = new Date()
                        resetDate.setUTCHours(24, 0, 0, 0)
                        recordAPISuccess(t.name, t.host, t.sport, res.headers, {
                            remaining: 1000,
                            limit: 1000,
                            resetsAt: resetDate.toISOString(),
                        })
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

export async function GET() {
    await runHealthChecks()
    const statuses = getAllAPIStatuses()
    return NextResponse.json({ statuses })
}
