'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { PredictedPlayer } from '@/lib/types'

// ─── Win Probability Chart ────────────────────────────────────────────────────

interface WinProbProps {
    home: { name: string; prob: number }
    away: { name: string; prob: number }
    draw?: number | null
}

export function WinProbabilityChart({ home, away, draw }: WinProbProps) {
    const total = home.prob + away.prob + (draw ?? 0)
    const hp = total > 0 ? (home.prob / total) * 100 : 33.3
    const ap = total > 0 ? (away.prob / total) * 100 : 33.3
    const dp = draw && total > 0 ? (draw / total) * 100 : 0

    const winner = hp > ap ? 'home' : ap > hp ? 'away' : 'draw'

    return (
        <div className="space-y-4">
            {/* Big probability display */}
            <div className="grid grid-cols-3 gap-2 text-center">
                <ProbCircle
                    label={home.name}
                    value={hp}
                    color="bg-green-500"
                    isWinner={winner === 'home'}
                />
                {dp > 0 && (
                    <ProbCircle label="Draw" value={dp} color="bg-yellow-500" isWinner={winner === 'draw'} />
                )}
                <ProbCircle
                    label={away.name}
                    value={ap}
                    color="bg-blue-500"
                    isWinner={winner === 'away'}
                    className={dp === 0 ? 'col-start-3' : ''}
                />
            </div>

            {/* Stacked bar */}
            <div>
                <div className="flex h-4 rounded-full overflow-hidden">
                    <div
                        className="bg-green-500 transition-all duration-1000 flex items-center justify-center"
                        style={{ width: `${hp}%` }}
                    />
                    {dp > 0 && (
                        <div className="bg-yellow-500 transition-all duration-1000" style={{ width: `${dp}%` }} />
                    )}
                    <div className="bg-blue-500 transition-all duration-1000 flex-1" />
                </div>
                <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                        {home.name}
                    </span>
                    {dp > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-yellow-500" />
                            Draw
                        </span>
                    )}
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        {away.name}
                    </span>
                </div>
            </div>

            {winner !== 'draw' && (
                <div className={cn(
                    'text-center py-2 px-4 rounded-lg text-sm font-semibold',
                    winner === 'home' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                )}>
                    {winner === 'home' ? home.name : away.name} predicted to win
                </div>
            )}
        </div>
    )
}

function ProbCircle({ label, value, color, isWinner, className }: {
    label: string; value: number; color: string; isWinner: boolean; className?: string
}) {
    return (
        <div className={cn('flex flex-col items-center gap-1', className)}>
            <div className={cn(
                'relative w-16 h-16 rounded-full flex items-center justify-center border-4',
                isWinner ? `border-current ${color.replace('bg-', 'text-')}` : 'border-muted text-muted-foreground'
            )}>
                <span className="text-lg font-bold tabular-nums">{value.toFixed(0)}%</span>
            </div>
            <span className="text-xs text-muted-foreground text-center line-clamp-1 max-w-[80px]">{label}</span>
        </div>
    )
}

// ─── Predicted XI ─────────────────────────────────────────────────────────────

interface PredictedXIProps {
    team: string
    logo?: string
    players: PredictedPlayer[]
}

export function PredictedXI({ team, logo, players }: PredictedXIProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                {logo && <Image src={logo} alt={team} width={24} height={24} className="object-contain" />}
                <span className="font-semibold text-sm">{team}</span>
            </div>
            <div className="space-y-1.5">
                {players.map((p, i) => (
                    <div key={i} className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-muted/40 hover:bg-muted/60 transition-colors">
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                            <span className={cn('text-sm font-medium', (p.is_captain || p.is_vc) && 'text-foreground')}>
                                {p.name}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {p.is_captain && (
                                <span className="bg-yellow-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded">C</span>
                            )}
                            {p.is_vc && (
                                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">VC</span>
                            )}
                            <span className="text-xs text-muted-foreground">{p.position}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}