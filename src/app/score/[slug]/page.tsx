import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Zap } from 'lucide-react'
import { 
    getBasketballMatchDetail, getFootballMatchDetail, 
    getBaseballMatchDetail, getRugbyMatchDetail,
    getTennisMatchDetail, getCricketMatchDetail
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
    if (slug.startsWith('cricket-') || slug.startsWith('cr-')) {
        const matchId = parseInt(slug.replace('cricket-', '').replace('cr-', ''))
        if (isNaN(matchId)) return null
        return getCricketMatchDetail(matchId)
    }
    
    if (slug.startsWith('football-') || slug.startsWith('fb-')) {
        let matchIdStr = slug.replace('football-', '').replace('fb-', '')
        // If it was just a number, it will parse. If it's f536-xxx, pass the string.
        if (!isNaN(parseInt(matchIdStr)) && !matchIdStr.startsWith('f536-')) {
            return getFootballMatchDetail(parseInt(matchIdStr))
        }
        return getFootballMatchDetail(matchIdStr)
    }

    
    if (slug.startsWith('basketball-') || slug.startsWith('bk-')) {
        // Detail page not allowed for basketball
        return null
    }

    if (slug.startsWith('baseball-') || slug.startsWith('bb-')) {
        const matchId = parseInt(slug.replace('baseball-', '').replace('bb-', ''))
        if (isNaN(matchId)) return null
        return getBaseballMatchDetail(matchId)
    }


    if (slug.startsWith('rugby-') || slug.startsWith('rg-')) {
        const matchId = parseInt(slug.replace('rugby-', '').replace('rg-', ''))
        if (isNaN(matchId)) return null
        return getRugbyMatchDetail(matchId)
    }


    if (slug.startsWith('tennis-') || slug.startsWith('tn-')) {
        const matchId = slug.replace('tennis-', '').replace('tn-', '')
        return getTennisMatchDetail(matchId)
    }
    
    // Removed fallback for mock data with '-vs-'
    return null

    return null

}


export const revalidate = 30

export default async function ScorePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const match = await getMatchFromSlug(slug)
    if (!match) notFound()

    const isLive = match.status === 'live'
    
    // Fetch standings for sidebar if baseball
    let baseballStandings = null
    if (match.sport_type === 'baseball') {
        const { getRealBaseballStandings } = await import('@/lib/api/rapid')
        baseballStandings = await getRealBaseballStandings()
    }

    return (
        <div className="container-wide py-6 md:py-10">
            {/* Match Header with Vibrant Gradient & Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl mb-8 p-1">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600/30 via-purple-600/20 to-blue-600/30 blur-2xl opacity-60 mix-blend-screen" />
                <div className="relative bg-card/60 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[22px] p-6 md:p-10 overflow-hidden">
                    
                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-purple-500 to-blue-500 opacity-50" />
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl" />

                    {/* Series & Status */}
                    <div className="relative z-10 flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-foreground/5 px-3 py-1 rounded-full border border-border/50 backdrop-blur-md">{match.league.name}</span>
                            <span className="text-xs text-muted-foreground hidden sm:inline-block">• {match.match_desc}</span>
                        </div>
                        {isLive ? (
                            <span className="flex items-center gap-2 text-sm font-bold text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" /> LIVE
                            </span>
                        ) : (
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-3 py-1 bg-foreground/5 rounded-full border border-border/50">
                                {match.state}
                            </span>
                        )}
                    </div>

                    {/* Teams & Score Summary */}
                    <div className="relative z-10 flex items-center justify-between gap-4 md:gap-8">
                        {/* Team 1 */}
                        <div className="flex-1 flex flex-col items-center group">
                            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4 border-2 border-border/50 shadow-xl group-hover:scale-105 group-hover:border-brand-500/50 transition-all duration-300 overflow-hidden">
                                {match.home_team.logo_url ? (
                                    <img src={match.home_team.logo_url} alt={match.home_team.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl md:text-2xl font-black text-muted-foreground">{match.home_team.short_name.slice(0, 2)}</span>
                                )}
                            </div>
                            <h2 className="font-bold text-sm md:text-xl text-center text-foreground group-hover:text-brand-400 transition-colors">{match.home_team.name}</h2>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">{match.home_team.short_name}</p>
                        </div>

                        {/* Score Summary */}
                        <div className="flex-1 flex flex-col items-center justify-center px-2">
                            {match.scorecard?.length > 0 ? (
                                <div className="space-y-2 text-center bg-background/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/5 shadow-inner">
                                    {match.scorecard.map((inn: any) => (
                                        <div key={inn.inningsId} className="flex items-center justify-center gap-3">
                                            <span className="font-extrabold text-foreground tracking-wide">{inn.bat_team}</span>
                                            <span className="text-lg font-black text-brand-500">
                                                {inn.runs}<span className="text-muted-foreground text-sm">/{inn.wickets}</span>
                                            </span>
                                            <span className="text-muted-foreground text-xs font-mono bg-muted/50 px-2 py-0.5 rounded">
                                                {inn.overs}v
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (match as any).score ? (
                                <div className="flex items-center justify-center gap-4 md:gap-6 bg-background/40 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/5 shadow-inner transform hover:scale-105 transition-transform duration-300">
                                    <span className="text-4xl md:text-6xl font-black text-foreground drop-shadow-md">{(match as any).score.home_score}</span>
                                    <span className="text-2xl text-muted-foreground/50 font-black">-</span>
                                    <span className="text-4xl md:text-6xl font-black text-foreground drop-shadow-md">{(match as any).score.away_score}</span>
                                </div>
                            ) : (
                                <div className="bg-background/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/5 shadow-inner">
                                    <span className="text-xl md:text-2xl font-black text-muted-foreground/40 italic tracking-widest">VS</span>
                                </div>
                            )}
                            
                            <div className="mt-6 text-sm font-semibold text-brand-400 bg-brand-500/10 px-4 py-1.5 rounded-full border border-brand-500/20 shadow-[0_0_15px_rgba(var(--brand-500-rgb),0.15)] text-center max-w-[250px] truncate">
                                {match.status_text}
                            </div>
                        </div>

                        {/* Team 2 */}
                        <div className="flex-1 flex flex-col items-center group">
                            <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4 border-2 border-border/50 shadow-xl group-hover:scale-105 group-hover:border-blue-500/50 transition-all duration-300 overflow-hidden">
                                {match.away_team.logo_url ? (
                                    <img src={match.away_team.logo_url} alt={match.away_team.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xl md:text-2xl font-black text-muted-foreground">{match.away_team.short_name.slice(0, 2)}</span>
                                )}
                            </div>
                            <h2 className="font-bold text-sm md:text-xl text-center text-foreground group-hover:text-blue-400 transition-colors">{match.away_team.name}</h2>
                            <p className="text-xs md:text-sm text-muted-foreground mt-1 font-medium">{match.away_team.short_name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Match Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Scorecard */}
                    {match.scorecard?.map((inn: any) => (
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
                            {((match as any).statistics?.length > 0 || (match.sport_type === 'baseball' && baseballStandings)) ? (
                                <div className="score-card p-5">
                                    <h3 className="font-semibold text-sm mb-4">Match & Season Statistics</h3>
                                    
                                    {/* Baseball Season Stats Fallback */}
                                    {match.sport_type === 'baseball' && baseballStandings && !((match as any).statistics?.length > 0) && (() => {
                                        const homeStats = baseballStandings.find((s: any) => s.name === match.home_team.name || s.short_name === match.home_team.short_name);
                                        const awayStats = baseballStandings.find((s: any) => s.name === match.away_team.name || s.short_name === match.away_team.short_name);
                                        
                                        if (!homeStats && !awayStats) return null;

                                        const groups = [
                                            {
                                                groupName: "Season Performance",
                                                statisticsItems: [
                                                    { name: "Season Wins", home: homeStats?.won ?? '-', away: awayStats?.won ?? '-', homeValue: homeStats?.won || 0, awayValue: awayStats?.won || 0 },
                                                    { name: "Season Losses", home: homeStats?.lost ?? '-', away: awayStats?.lost ?? '-', homeValue: homeStats?.lost || 0, awayValue: awayStats?.lost || 0 },
                                                    { name: "Win %", home: homeStats?.win_percentage ?? '-', away: awayStats?.win_percentage ?? '-', homeValue: (homeStats?.win_percentage || 0) * 100, awayValue: (awayStats?.win_percentage || 0) * 100 },
                                                    { name: "Runs Scored (Season)", home: homeStats?.scored ?? '-', away: awayStats?.scored ?? '-', homeValue: homeStats?.scored || 0, awayValue: awayStats?.scored || 0 },
                                                    { name: "Runs Against (Season)", home: homeStats?.against ?? '-', away: awayStats?.against ?? '-', homeValue: homeStats?.against || 0, awayValue: awayStats?.against || 0 },
                                                ]
                                            }
                                        ];

                                        return groups.map((group: any, idx: number) => (
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
                                                                <div className="bg-primary/80" style={{ width: `${(stat.homeValue / (stat.homeValue + stat.awayValue || 1)) * 100}%` }} />
                                                                <div className="bg-foreground/40" style={{ width: `${(stat.awayValue / (stat.homeValue + stat.awayValue || 1)) * 100}%` }} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}

                                    {/* Real Match Stats if available */}
                                    {(match as any).statistics?.[0]?.groups?.map((group: any, idx: number) => (
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
                            ) : null}

                            {/* Lineups / Squads */}
                            {(match as any).lineups?.length > 0 && (
                                <div className="score-card overflow-hidden">
                                    <div className="bg-muted/50 px-5 py-4 border-b border-border flex justify-between items-center">
                                        <h3 className="font-semibold text-sm">Team Squads</h3>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-border">
                                        {(match as any).lineups.map((lineup: any, idx: number) => (
                                            <div key={idx} className="p-0">
                                                <div className="bg-muted/30 px-4 py-2 text-xs font-semibold text-foreground text-center border-b border-border">
                                                    {lineup.team}
                                                </div>
                                                <div className="divide-y divide-border/50 max-h-[400px] overflow-y-auto">
                                                    {lineup.players?.length > 0 ? lineup.players.map((player: any, i: number) => (
                                                        <div key={i} className="px-4 py-2.5 flex justify-between items-center hover:bg-muted/30 transition-colors">
                                                            <span className="text-sm font-medium text-foreground truncate mr-2">{player.name}</span>
                                                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded-sm flex-shrink-0">{player.position?.slice(0, 3)}</span>
                                                        </div>
                                                    )) : (
                                                        <div className="px-4 py-6 text-center text-xs text-muted-foreground">Squad not announced yet</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!((match as any).incidents?.length > 0) && !((match as any).statistics?.length > 0) && match.sport_type !== 'baseball') && (
                                <div className="score-card p-8 text-center bg-muted/20">
                                    {match.sport_type === 'rugby' ? (
                                        <div className="max-w-md mx-auto">
                                            <div className="w-16 h-16 rounded-full bg-orange-600/10 flex items-center justify-center mx-auto mb-4">
                                                <span className="text-3xl">🏉</span>
                                            </div>
                                            <h3 className="font-bold text-lg mb-2">Rugby Match Insights</h3>
                                            <p className="text-muted-foreground text-sm">
                                                This match is part of the <strong>{match.league.name}</strong>. 
                                                Live score updates and phase details for {match.home_team.name} vs {match.away_team.name} will be updated in real-time.
                                            </p>
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
                            {match.forecast?.temp && (
                                <div className="flex justify-between">
                                    <dt className="text-muted-foreground">Weather</dt>
                                    <dd className="font-medium text-xs">{match.forecast.temp}°C, {match.forecast.weather}</dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    {/* Odds Section */}
                    {(match as any).odds && Object.keys((match as any).odds).length > 0 && (
                        <div className="score-card p-5">
                            <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Betting Markets
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {Object.entries((match as any).odds).slice(0, 15).map(([key, value]) => (
                                    <div key={key} className="bg-muted/30 p-2.5 rounded-xl border border-border/50 hover:border-brand-500/30 transition-colors">
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase truncate mb-1" title={key}>
                                            {key.replace(/-/g, ' ')}
                                        </div>
                                        <div className="font-black text-base text-foreground tabular-nums">
                                            {value as string}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {baseballStandings && (
                        <div className="score-card overflow-hidden">
                            <div className="bg-muted/50 px-5 py-3 border-b border-border flex justify-between items-center">
                                <h3 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">League Standings</h3>
                            </div>
                            <div className="divide-y divide-border/50">
                                {baseballStandings.slice(0, 6).map((team: any, i: number) => (
                                    <div key={team.id} className="px-4 py-2 flex items-center justify-between text-xs hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <span className="text-muted-foreground w-3">{i + 1}</span>
                                            <img src={team.logo_url} className="w-5 h-5 rounded-full" alt="" />
                                            <span className="font-semibold truncate max-w-[100px]">{team.name}</span>
                                        </div>
                                        <div className="flex gap-3 font-mono">
                                            <span>{team.won}-{team.lost}</span>
                                            <span className="text-muted-foreground">{team.win_percentage}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 bg-muted/20 text-center border-t border-border/50">
                                <span className="text-[10px] text-muted-foreground font-medium">{baseballStandings[0]?.league_name}</span>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </div>
    )
}
