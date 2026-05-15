import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { 
    getCricketMatchDetail, getBasketballMatchDetail, getFootballMatchDetail, 
    getMMAMatchDetail, getBaseballMatchDetail, getF1MatchDetail,
    getRugbyMatchDetail, getBadmintonMatchDetail, getBoxingMatchDetail,
    getTennisMatchDetail
} from '@/lib/api/rapid'


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const match = await getMatchFromSlug(slug)
    if (!match) return { title: 'Match Not Found' }
    return {
        title: `${match.home_team.short_name} vs ${match.away_team.short_name} — ${match.match_format} | ${match.league.name}`,
        description: `${match.status_text}. Live scores, match info and commentary for ${match.home_team.name} vs ${match.away_team.name}.`,
    }
}

async function getMatchFromSlug(slug: string) {
    if (slug.startsWith('cricket-')) {
        const matchId = parseInt(slug.replace('cricket-', ''))
        if (isNaN(matchId)) return null
        return getCricketMatchDetail(matchId)
    }
    
    if (slug.startsWith('football-') || slug.startsWith('fb-')) {
        const matchId = parseInt(slug.replace('football-', '').replace('fb-', ''))
        if (isNaN(matchId)) return null
        return getFootballMatchDetail(matchId)
    }

    if (slug.startsWith('mma-')) {
        const matchId = parseInt(slug.replace('mma-', ''))
        if (isNaN(matchId)) return null
        return getMMAMatchDetail(matchId)
    }
    
    if (slug.startsWith('basketball-')) {
        const matchId = parseInt(slug.replace('basketball-', ''))
        if (isNaN(matchId)) return null
        return getBasketballMatchDetail(matchId)
    }

    if (slug.startsWith('baseball-')) {
        const matchId = parseInt(slug.replace('baseball-', ''))
        if (isNaN(matchId)) return null
        return getBaseballMatchDetail(matchId)
    }

    if (slug.startsWith('f1-')) {
        const matchId = parseInt(slug.replace('f1-', ''))
        if (isNaN(matchId)) return null
        return getF1MatchDetail(matchId)
    }
    if (slug.startsWith('rugby-')) {
        const matchId = slug.replace('rugby-', '')
        return getRugbyMatchDetail(matchId)
    }

    if (slug.startsWith('badminton-')) {
        const matchId = slug.replace('badminton-', '')
        return getBadmintonMatchDetail(matchId)
    }

    if (slug.startsWith('boxing-')) {
        const matchId = slug.replace('boxing-', '')
        return getBoxingMatchDetail(matchId)
    }

    if (slug.startsWith('tennis-')) {
        const matchId = slug.replace('tennis-', '')
        return getTennisMatchDetail(matchId)
    }
    
    return null

}


export const revalidate = 30

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const match = await getMatchFromSlug(slug)
    if (!match) notFound()

    const isLive = match.status === 'live'

    return (
        <div className="container-wide py-6 md:py-10">
            {/* Match Header */}
            <div className="score-card p-6 md:p-8 mb-6">
                {/* Series & Status */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <span className="text-xs text-muted-foreground">{match.league.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">• {match.match_desc}</span>
                    </div>
                    {isLive ? (
                        <span className="live-badge text-sm px-3 py-1">
                            <span className="live-dot" /> LIVE
                        </span>
                    ) : (
                        <span className="text-xs font-medium text-muted-foreground px-2 py-1 bg-muted rounded-full">
                            {match.state}
                        </span>
                    )}
                </div>

                {/* Teams & Score Summary */}
                <div className="flex items-center justify-between gap-6 mb-6">
                    {/* Team 1 */}
                    <div className="flex-1 text-center">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-lg font-bold text-muted-foreground">
                            {match.home_team.short_name.slice(0, 2)}
                        </div>
                        <h2 className="font-semibold text-sm md:text-base">{match.home_team.name}</h2>
                        <p className="text-xs text-muted-foreground">{match.home_team.short_name}</p>
                    </div>

                    {/* Score Summary */}
                    <div className="text-center px-4">
                        {match.scorecard.length > 0 ? (
                            <div className="space-y-1">
                                {match.scorecard.map((inn: any) => (
                                    <div key={inn.inningsId} className="text-sm">
                                        <span className="font-bold text-foreground">{inn.bat_team}</span>
                                        <span className="text-foreground ml-1">
                                            {inn.runs}/{inn.wickets}
                                        </span>
                                        <span className="text-muted-foreground text-xs ml-1">
                                            ({inn.overs} ov){inn.is_declared ? ' d' : ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (match as any).score ? (
                            <div className="flex items-center justify-center gap-4">
                                <span className="text-3xl font-bold text-foreground">{(match as any).score.home}</span>
                                <span className="text-muted-foreground font-medium">-</span>
                                <span className="text-3xl font-bold text-foreground">{(match as any).score.away}</span>
                            </div>
                        ) : (
                            <span className="text-lg font-bold text-muted-foreground">VS</span>
                        )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex-1 text-center">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-lg font-bold text-muted-foreground">
                            {match.away_team.short_name.slice(0, 2)}
                        </div>
                        <h2 className="font-semibold text-sm md:text-base">{match.away_team.name}</h2>
                        <p className="text-xs text-muted-foreground">{match.away_team.short_name}</p>
                    </div>
                </div>

                {/* Status text */}
                <div className="text-center text-sm font-medium text-primary bg-primary/10 rounded-lg py-2 px-4">
                    {match.status_text}
                </div>
            </div>

            {/* Match Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Scorecard */}
                    {match.scorecard.map((inn: any) => (
                        <div key={inn.inningsId} className="score-card overflow-hidden">
                            {/* Innings Header */}
                            <div className="bg-muted/50 px-5 py-3 border-b border-border flex justify-between items-center">
                                <h3 className="font-semibold text-sm">
                                    {inn.bat_team} Innings
                                </h3>
                                <span className="font-bold text-sm">
                                    {inn.runs}/{inn.wickets} ({inn.overs} ov)
                                    {inn.is_declared && <span className="text-muted-foreground ml-1">dec</span>}
                                    <span className="text-xs text-muted-foreground ml-2">RR: {inn.run_rate}</span>
                                </span>
                            </div>

                            {/* Batting */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground border-b border-border/50">
                                            <th className="text-left py-2 px-4 font-medium">Batter</th>
                                            <th className="text-right py-2 px-2 font-medium">R</th>
                                            <th className="text-right py-2 px-2 font-medium">B</th>
                                            <th className="text-right py-2 px-2 font-medium">4s</th>
                                            <th className="text-right py-2 px-2 font-medium">6s</th>
                                            <th className="text-right py-2 px-4 font-medium">SR</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {inn.batsmen.map((bat: any, i: number) => (
                                            <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                                <td className="py-2 px-4">
                                                    <div className="font-medium text-foreground">{bat.name}</div>
                                                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">{bat.out_desc || 'not out'}</div>
                                                </td>
                                                <td className={`text-right py-2 px-2 font-bold ${bat.runs >= 50 ? 'text-primary' : ''}`}>{bat.runs}</td>
                                                <td className="text-right py-2 px-2 text-muted-foreground">{bat.balls}</td>
                                                <td className="text-right py-2 px-2 text-muted-foreground">{bat.fours}</td>
                                                <td className="text-right py-2 px-2 text-muted-foreground">{bat.sixes}</td>
                                                <td className="text-right py-2 px-4 text-muted-foreground">{bat.sr.toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Bowling */}
                            <div className="border-t border-border">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-xs text-muted-foreground border-b border-border/50">
                                                <th className="text-left py-2 px-4 font-medium">Bowler</th>
                                                <th className="text-right py-2 px-2 font-medium">O</th>
                                                <th className="text-right py-2 px-2 font-medium">M</th>
                                                <th className="text-right py-2 px-2 font-medium">R</th>
                                                <th className="text-right py-2 px-2 font-medium">W</th>
                                                <th className="text-right py-2 px-4 font-medium">ECO</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {inn.bowlers.map((bowl: any, i: number) => (
                                                <tr key={i} className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                                    <td className="py-2 px-4 font-medium text-foreground">{bowl.name}</td>
                                                    <td className="text-right py-2 px-2 text-muted-foreground">{bowl.overs}</td>
                                                    <td className="text-right py-2 px-2 text-muted-foreground">{bowl.maidens}</td>
                                                    <td className="text-right py-2 px-2 text-muted-foreground">{bowl.runs}</td>
                                                    <td className={`text-right py-2 px-2 font-bold ${bowl.wickets >= 3 ? 'text-primary' : ''}`}>{bowl.wickets}</td>
                                                    <td className="text-right py-2 px-4 text-muted-foreground">{bowl.economy.toFixed(1)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ))}

                    {match.sport_type === 'cricket' && match.scorecard.length === 0 && (
                        <div className="score-card p-8 text-center">
                            <p className="text-muted-foreground">Scorecard will be available once the match starts.</p>
                        </div>
                    )}

                    {/* Baseball Innings Scoreboard */}
                    {match.sport_type === 'baseball' && (match as any).innings?.length > 0 && (
                        <div className="score-card overflow-hidden">
                            <div className="bg-muted/50 px-5 py-3 border-b border-border">
                                <h3 className="font-semibold text-sm">Box Score</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-muted-foreground border-b border-border/50">
                                            <th className="text-left py-2.5 px-4 font-medium w-40">Team</th>
                                            {(match as any).innings.map((inn: any) => (
                                                <th key={inn.inning} className="text-center py-2.5 px-2 font-medium min-w-[28px]">{inn.inning}</th>
                                            ))}
                                            <th className="text-center py-2.5 px-3 font-bold border-l border-border/50">R</th>
                                            <th className="text-center py-2.5 px-3 font-bold">H</th>
                                            <th className="text-center py-2.5 px-3 font-bold">E</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="border-b border-border/30 hover:bg-muted/30 transition-colors">
                                            <td className="py-2.5 px-4 font-semibold text-foreground">{match.away_team.short_name}</td>
                                            {(match as any).innings.map((inn: any) => (
                                                <td key={inn.inning} className="text-center py-2.5 px-2 text-muted-foreground font-mono">{inn.away}</td>
                                            ))}
                                            <td className="text-center py-2.5 px-3 font-bold border-l border-border/50">{(match as any).rhe?.away?.runs ?? 0}</td>
                                            <td className="text-center py-2.5 px-3 font-bold text-muted-foreground">{(match as any).rhe?.away?.hits ?? 0}</td>
                                            <td className="text-center py-2.5 px-3 font-bold text-muted-foreground">{(match as any).rhe?.away?.errors ?? 0}</td>
                                        </tr>
                                        <tr className="hover:bg-muted/30 transition-colors">
                                            <td className="py-2.5 px-4 font-semibold text-foreground">{match.home_team.short_name}</td>
                                            {(match as any).innings.map((inn: any) => (
                                                <td key={inn.inning} className="text-center py-2.5 px-2 text-muted-foreground font-mono">{inn.home}</td>
                                            ))}
                                            <td className="text-center py-2.5 px-3 font-bold border-l border-border/50">{(match as any).rhe?.home?.runs ?? 0}</td>
                                            <td className="text-center py-2.5 px-3 font-bold text-muted-foreground">{(match as any).rhe?.home?.hits ?? 0}</td>
                                            <td className="text-center py-2.5 px-3 font-bold text-muted-foreground">{(match as any).rhe?.home?.errors ?? 0}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                    
                    {match.sport_type !== 'cricket' && (
                        <div className="space-y-6">
                            {/* Incidents */}
                            {(match as any).incidents?.length > 0 && (
                                <div className="score-card p-5">
                                    <h3 className="font-semibold text-sm mb-4">Key Events</h3>
                                    <div className="space-y-3">
                                        {(match as any).incidents.slice().reverse().map((inc: any, i: number) => (
                                            <div key={i} className="flex items-start text-sm border-b border-border/40 pb-3 last:border-0 last:pb-0">
                                                <div className="w-12 text-muted-foreground font-medium flex-shrink-0">
                                                    {inc.time ? `${inc.time}'` : '-'}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-foreground capitalize">
                                                        {inc.incidentType === 'goal' ? '⚽ Goal' : 
                                                         inc.incidentType === 'card' ? '🟨 Card' : 
                                                         inc.incidentType === 'substitution' ? '🔄 Sub' :
                                                         inc.incidentType}
                                                    </div>
                                                    <div className="text-muted-foreground text-xs mt-0.5">
                                                        {inc.player?.name || inc.text}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Statistics */}
                            {(match as any).statistics?.length > 0 && (
                                <div className="score-card p-5">
                                    <h3 className="font-semibold text-sm mb-4">Match Statistics</h3>
                                    {(match as any).statistics[0]?.groups?.map((group: any, idx: number) => (
                                        <div key={idx} className="mb-6 last:mb-0">
                                            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">{group.groupName}</h4>
                                            <div className="space-y-4">
                                                {group.statisticsItems?.map((stat: any, i: number) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between text-xs mb-1.5">
                                                            <span className="font-medium text-foreground">{stat.home}</span>
                                                            <span className="text-muted-foreground font-medium">{stat.name}</span>
                                                            <span className="font-medium text-foreground">{stat.away}</span>
                                                        </div>
                                                        <div className="flex h-1.5 rounded-full overflow-hidden bg-muted gap-0.5">
                                                            {stat.homeValue !== undefined && stat.awayValue !== undefined ? (
                                                                <>
                                                                    <div className="bg-primary/80" style={{ width: `${(stat.homeValue / (stat.homeValue + stat.awayValue || 1)) * 100}%` }} />
                                                                    <div className="bg-foreground/40" style={{ width: `${(stat.awayValue / (stat.homeValue + stat.awayValue || 1)) * 100}%` }} />
                                                                </>
                                                            ) : (
                                                                <div className="bg-transparent w-full" />
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {(!((match as any).incidents?.length > 0) && !((match as any).statistics?.length > 0)) && (
                                <div className="score-card p-8 text-center bg-muted/20">
                                    {match.sport_type === 'badminton' ? (
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 rounded-full bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl">🏸</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">Tournament Information</h3>
                                            <p className="text-muted-foreground text-sm">
                                                This event is part of the <strong>{match.league.name}</strong>. 
                                                Detailed point-by-point statistics are typically available for live matches and major tournament finals.
                                            </p>
                                            {match.venue_country && (
                                                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-brand-500/10 text-brand-500 rounded-full text-xs font-bold">
                                                    📍 {match.venue_country}
                                                </div>
                                            )}
                                        </div>
                                    ) : match.sport_type === 'tennis' ? (
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 rounded-full bg-lime-500/10 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl">🎾</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">Tennis Match Info</h3>
                                            <p className="text-muted-foreground text-sm">
                                                Live point-by-point scoring and set details for <strong>{match.home_team.name} vs {match.away_team.name}</strong> will be updated as the match progresses.
                                            </p>
                                        </div>
                                    ) : match.sport_type === 'boxing' ? (
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl">🥊</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">Fight Information</h3>
                                            <p className="text-muted-foreground text-sm">
                                                Round-by-round statistics and punch counts will be available for major <strong>{match.league.name}</strong> bouts.
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground">Detailed match statistics are not available for this event yet.</p>
                                    )}
                                </div>
                            )}

                        </div>
                    )}
                </div>

                {/* Sidebar — Match Info */}
                <div className="space-y-4">
                    <div className="score-card p-5">
                        <h3 className="font-semibold text-sm mb-4 text-foreground">Match Info</h3>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Format</dt>
                                <dd className="font-medium">{match.match_format}</dd>
                            </div>
                            {match.venue && (
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Venue</dt>
                                    <dd className="font-medium text-right max-w-[180px]">{match.venue}</dd>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Date</dt>
                                <dd className="font-medium">{new Date(match.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</dd>
                            </div>
                            {match.toss && (
                                <div>
                                    <dt className="text-muted-foreground mb-1">Toss</dt>
                                    <dd className="font-medium text-xs">{match.toss}</dd>
                                </div>
                            )}
                            {(match.umpires?.length ?? 0) > 0 && (
                                <div>
                                    <dt className="text-muted-foreground mb-1">Umpires</dt>
                                    <dd className="font-medium text-xs">{match.umpires?.join(', ')}</dd>
                                </div>
                            )}
                            {match.referee && (
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Referee</dt>
                                    <dd className="font-medium text-xs">{match.referee}</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                </div>
            </div>
        </div>
    )
}
