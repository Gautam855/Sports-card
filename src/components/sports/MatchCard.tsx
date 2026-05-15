'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Tv } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Match } from '@/lib/types'

interface MatchCardProps {
  match: Match
  className?: string
}

export function MatchCard({ match, className }: MatchCardProps) {
  const isLive = match.status === 'live' || match.status === 'half_time'
  const isCompleted = match.status === 'completed'
  const score = match.score

  return (
    <Link href={`/score/${match.slug}`}>
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className={cn('score-card p-4 cursor-pointer group transition-all', className)}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium truncate max-w-[120px]">
            {match.league?.name || (typeof match.sport === 'object' ? match.sport?.name : match.sport)}
          </span>
          {isLive ? (
            <span className="live-badge">
              <span className="live-dot" />
              LIVE {match.score?.current_minute ? `${match.score.current_minute}'` : ''}
            </span>
          ) : isCompleted ? (
            <span className="text-xs text-muted-foreground font-medium">FT</span>
          ) : (
            <span className="text-xs text-muted-foreground">
              {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        <div className="space-y-2.5">
          {[
            { team: match.home_team, score: score?.home_score, vs: score?.away_score },
            { team: match.away_team, score: score?.away_score, vs: score?.home_score },
          ].map(({ team, score: s, vs }, i) => (
            <div key={i} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                {team?.logo_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    width={24}
                    height={24}
                    className="w-6 h-6 object-contain flex-shrink-0 rounded-full"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden') }}
                  />
                ) : null}
                <div className={cn('w-6 h-6 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-muted-foreground', team?.logo_url && 'hidden')}>
                  {(team?.short_name ?? team?.name ?? '?').slice(0, 2)}
                </div>
                <span className={cn('text-sm truncate', isCompleted && s !== undefined && vs !== undefined && s > vs ? 'font-semibold text-foreground' : 'text-muted-foreground')}>
                  {team?.short_name ?? team?.name ?? 'TBD'}
                </span>
              </div>
              {s !== undefined && (
                <span className={cn('text-lg font-bold tabular-nums', isLive ? 'text-primary' : isCompleted && vs !== undefined && s > vs ? 'text-foreground' : 'text-muted-foreground')}>
                  {s}
                </span>
              )}
            </div>
          ))}
        </div>

        {match.venue && (
          <div className="mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground truncate">
            {match.venue}
          </div>
        )}
      </motion.div>
    </Link>
  )
}

export function MatchCardSkeleton() {
  return (
    <div className="score-card p-4">
      <div className="flex justify-between mb-3">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-4 w-12 rounded" />
      </div>
      <div className="space-y-2.5">
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="skeleton w-6 h-6 rounded-full" />
              <div className="skeleton h-4 w-24 rounded" />
            </div>
            <div className="skeleton h-6 w-8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
