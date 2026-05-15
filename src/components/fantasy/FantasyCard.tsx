'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Star, Users, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FantasyTip } from '@/lib/types'

interface FantasyCardProps {
    tip: FantasyTip & {
        captain_player?: { name: string; photo_url?: string; position?: string }
        vc_player?: { name: string; photo_url?: string; position?: string }
    }
    className?: string
}

export function FantasyCard({ tip, className }: FantasyCardProps) {
    const match = tip.match

    return (
        <Link href={`/fantasy/${tip.slug}`}>
            <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                className={cn('score-card p-5 cursor-pointer group', className)}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <span className="bg-orange-500/10 text-orange-400 text-xs font-bold px-2 py-0.5 rounded border border-orange-500/20">
                            {tip.platform ?? 'FANTASY'}
                        </span>
                    </div>
                    {match?.scheduled_at && (
                        <span className="text-xs text-muted-foreground">
                            {new Date(match.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    )}
                </div>

                {/* Title */}
                <h3 className="font-semibold text-sm line-clamp-2 mb-3 group-hover:text-primary transition-colors">
                    {tip.title}
                </h3>

                {/* Match teams */}
                {match && (
                    <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground">
                        {match.home_team?.logo_url && (
                            <Image src={match.home_team.logo_url} alt={match.home_team.name} width={16} height={16} className="object-contain" />
                        )}
                        <span>{match.home_team?.short_name ?? match.home_team?.name}</span>
                        <span className="text-muted-foreground/50">vs</span>
                        {match.away_team?.logo_url && (
                            <Image src={match.away_team.logo_url} alt={match.away_team.name} width={16} height={16} className="object-contain" />
                        )}
                        <span>{match.away_team?.short_name ?? match.away_team?.name}</span>
                    </div>
                )}

                {/* Captain & VC Picks */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    {tip.captain_player && (
                        <PlayerPick player={tip.captain_player} badge="C" badgeColor="bg-yellow-500 text-black" />
                    )}
                    {tip.vc_player && (
                        <PlayerPick player={tip.vc_player} badge="VC" badgeColor="bg-blue-500 text-white" />
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {tip.top_picks?.length ?? 0} top picks
                    </span>
                    <span className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        {(tip.views).toLocaleString()} views
                    </span>
                </div>
            </motion.div>
        </Link>
    )
}

function PlayerPick({
    player,
    badge,
    badgeColor,
}: {
    player: { name: string; photo_url?: string; position?: string }
    badge: string
    badgeColor: string
}) {
    return (
        <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-2.5 py-2">
            {player.photo_url ? (
                <Image src={player.photo_url} alt={player.name} width={28} height={28} className="rounded-full object-cover flex-shrink-0" />
            ) : (
                <div className="w-7 h-7 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-xs font-bold">
                    {player.name[0]}
                </div>
            )}
            <div className="min-w-0">
                <div className="flex items-center gap-1">
                    <span className={cn('text-[10px] font-bold px-1 rounded', badgeColor)}>{badge}</span>
                    <span className="text-xs font-medium truncate">{player.name.split(' ').pop()}</span>
                </div>
                {player.position && (
                    <span className="text-[10px] text-muted-foreground">{player.position}</span>
                )}
            </div>
        </div>
    )
}