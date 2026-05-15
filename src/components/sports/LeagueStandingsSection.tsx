'use client'

export function LeagueStandingsSection() {
  return (
    <section className="container-wide py-16 border-t border-border">
      <div className="section-header">
        <h2 className="section-title">League Standings</h2>
      </div>
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="p-4 bg-muted/30 border-b border-border grid grid-cols-6 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <div className="col-span-3">Team</div>
          <div className="text-center">P</div>
          <div className="text-center">GD</div>
          <div className="text-center">Pts</div>
        </div>
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 grid grid-cols-6 items-center text-sm">
              <div className="col-span-3 flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4">{i}</span>
                <div className="w-6 h-6 rounded-full bg-muted" />
                <span className="font-medium truncate">Premier League Team {i}</span>
              </div>
              <div className="text-center text-muted-foreground">38</div>
              <div className="text-center text-muted-foreground">+24</div>
              <div className="text-center font-bold">89</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
