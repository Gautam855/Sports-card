import { getTrendingStandings } from '@/lib/api/rapid'

export async function LeagueStandingsSection() {
  const trendingStandings = await getTrendingStandings()

  if (!trendingStandings || trendingStandings.length === 0) return null;

  return (
    <section className="container-wide py-16 border-t border-border">
      <div className="section-header mb-8">
        <h2 className="text-3xl font-black">Trending <span className="text-brand-500">Leagues</span></h2>
        <p className="text-muted-foreground mt-2 font-medium">Current standings across top sports</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {trendingStandings.slice(0, 4).map((trending, sportIdx) => (
            <div key={sportIdx} className="bg-card rounded-2xl border border-border overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="p-5 bg-muted/40 border-b border-border flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">{trending.league?.name || 'Top League'}</h3>
                    <span className="text-xs font-extrabold uppercase tracking-widest text-brand-500 bg-brand-500/10 px-3 py-1 rounded-full">
                        {trending.sport}
                    </span>
                </div>
                <div className="p-3 bg-muted/20 border-b border-border grid grid-cols-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-3 pl-2">Team</div>
                    <div className="text-center">P</div>
                    <div className="text-center">GD</div>
                    <div className="text-center pr-2">Pts</div>
                </div>
                <div className="divide-y divide-border">
                    {trending.standings.slice(0, 6).map((team: any, idx: number) => (
                        <div key={team.id} className="p-3 grid grid-cols-6 items-center text-sm hover:bg-muted/30 transition-colors">
                            <div className="col-span-3 flex items-center gap-3">
                                <span className="text-[11px] text-muted-foreground w-4 text-center font-mono font-bold">{idx + 1}</span>
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-muted flex-shrink-0 border border-border/50">
                                    <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="font-semibold truncate text-foreground text-xs">{team.name}</span>
                            </div>
                            <div className="text-center text-muted-foreground font-mono text-xs">{team.played}</div>
                            <div className="text-center text-muted-foreground font-mono text-xs">
                                {team.goal_diff > 0 ? `+${team.goal_diff}` : team.goal_diff}
                            </div>
                            <div className="text-center font-black text-foreground font-mono text-sm pr-2">{team.points}</div>
                        </div>
                    ))}
                </div>
            </div>
        ))}
      </div>
    </section>
  )
}
