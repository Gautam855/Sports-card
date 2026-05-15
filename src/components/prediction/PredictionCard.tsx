'use client'

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Users, BarChart2, CheckCircle2, Gavel } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Prediction } from '@/lib/types'

interface PredictionCardProps {
    prediction: Prediction
    className?: string
}

export function PredictionCard({ prediction, className }: PredictionCardProps) {
    const [userVote, setUserVote] = useState<'home' | 'draw' | 'away' | null>(null)
    const match = prediction.match
    
    // Community stats (simulated)
    const [homeVotes, setHomeVotes] = useState(prediction.home_win_prob ? Math.floor(prediction.home_win_prob * 1.2) : 45)
    const [awayVotes, setAwayVotes] = useState(prediction.away_win_prob ? Math.floor(prediction.away_win_prob * 0.8) : 35)
    const [drawVotes, setDrawVotes] = useState(prediction.draw_prob ? Math.floor(prediction.draw_prob * 0.5) : 20)
    
    const totalVotes = homeVotes + awayVotes + drawVotes
    const homePercent = Math.round((homeVotes / totalVotes) * 100)
    const awayPercent = Math.round((awayVotes / totalVotes) * 100)
    const drawPercent = 100 - homePercent - awayPercent

    const handleVote = (side: 'home' | 'draw' | 'away', e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (userVote) return
        
        setUserVote(side)
        if (side === 'home') setHomeVotes(v => v + 1)
        if (side === 'away') setAwayVotes(v => v + 1)
        if (side === 'draw') setDrawVotes(v => v + 1)
    }

    return (
        <div className={cn('score-card p-5 group flex flex-col h-full', className)}>
            <Link href={`/prediction/${prediction.slug}`} className="flex-1">
                {/* League */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">
                        {match?.league?.name ?? match?.sport?.name ?? 'Live Prediction'}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-bold animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        LIVE BIDS
                    </div>
                </div>

                {/* Teams */}
                <div className="flex items-center justify-between mb-6">
                    <TeamDisplay team={match?.home_team} side="home" />
                    <div className="flex flex-col items-center px-4">
                        <div className="text-[10px] font-black text-muted-foreground/50 mb-1 italic">VS</div>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                           <BrainCircuit className="w-4 h-4 text-primary" />
                        </div>
                    </div>
                    <TeamDisplay team={match?.away_team} side="away" />
                </div>

                {/* Win Probability Bar (Community Bids) */}
                <div className="mb-6">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-2 uppercase tracking-tighter">
                        <span className={cn(userVote === 'home' ? 'text-primary' : 'text-slate-400')}>
                            {match?.home_team?.name?.split(' ')[0]}: {homePercent}%
                        </span>
                        <span className={cn(userVote === 'draw' ? 'text-primary' : 'text-slate-500')}>DRAW: {drawPercent}%</span>
                        <span className={cn(userVote === 'away' ? 'text-primary' : 'text-blue-400')}>
                            {match?.away_team?.name?.split(' ')[0]}: {awayPercent}%
                        </span>
                    </div>
                    <div className="flex h-1.5 rounded-full overflow-hidden bg-slate-800 gap-0.5 p-0.5">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${homePercent}%` }} className="bg-primary rounded-l-full h-full" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${drawPercent}%` }} className="bg-slate-600 h-full" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${awayPercent}%` }} className="bg-blue-500 rounded-r-full h-full" />
                    </div>
                </div>
            </Link>

            {/* Bidding/Voting Area */}
            <div className="space-y-3 pt-4 border-t border-white/5 mt-auto">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center mb-3">Place Your Prediction Bid</p>
                <div className="grid grid-cols-3 gap-2">
                    <BidButton 
                        side="home" 
                        label="Home" 
                        active={userVote === 'home'} 
                        disabled={!!userVote} 
                        onClick={(e) => handleVote('home', e)} 
                    />
                    <BidButton 
                        side="draw" 
                        label="Draw" 
                        active={userVote === 'draw'} 
                        disabled={!!userVote} 
                        onClick={(e) => handleVote('draw', e)} 
                    />
                    <BidButton 
                        side="away" 
                        label="Away" 
                        active={userVote === 'away'} 
                        disabled={!!userVote} 
                        onClick={(e) => handleVote('away', e)} 
                    />
                </div>
                
                <div className="flex items-center justify-between pt-3 text-[10px] text-muted-foreground">
                   <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>{totalVotes.toLocaleString()} Bids Placed</span>
                   </div>
                   <div className="flex items-center gap-1">
                      <Gavel className="w-3 h-3" />
                      <span>Min Bid: 10 Tokens</span>
                   </div>
                </div>
            </div>
        </div>
    )
}

function BidButton({ side, label, active, disabled, onClick }: { side: string, label: string, active: boolean, disabled: boolean, onClick: (e: React.MouseEvent) => void }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={cn(
                'relative py-2 px-1 rounded-lg text-[10px] font-bold uppercase transition-all border',
                active 
                    ? 'bg-primary border-primary text-white' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:border-white/20',
                disabled && !active && 'opacity-50 cursor-not-allowed'
            )}
        >
            {active && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-emerald-500 text-white p-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                </motion.span>
            )}
            {label}
        </button>
    )
}

function BrainCircuit(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .52 8.105 4 4 0 0 0 7.914 1.154 3 3 0 0 0 .093-5.154" />
      <path d="M14.828 14.828a4 4 0 1 0-5.656-5.656" />
      <path d="M21 12a9 9 0 0 1-9 9" />
      <path d="M12 3a9 9 0 0 1 9 9" />
    </svg>
  )
}


function TeamDisplay({ team, side }: { team?: { name: string; logo_url?: string }; side: 'home' | 'away' }) {
    return (
        <div className={cn('flex flex-col items-center gap-1.5 flex-1', side === 'away' && 'order-last')}>
            {team?.logo_url ? (
                <Image src={team.logo_url} alt={team.name} width={40} height={40} className="object-contain" />
            ) : (
                <div className="w-10 h-10 rounded-full bg-muted" />
            )}
            <span className="text-xs font-semibold text-center line-clamp-1">{team?.name ?? 'TBD'}</span>
        </div>
    )
}

export function PredictionCardSkeleton() {
    return (
        <div className="score-card p-5">
            <div className="flex justify-between mb-4">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
            </div>
            <div className="flex items-center justify-between mb-5">
                {[0, 1].map(i => (
                    <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                        <div className="skeleton w-10 h-10 rounded-full" />
                        <div className="skeleton h-3 w-16 rounded" />
                    </div>
                ))}
                <div className="skeleton h-5 w-8 rounded" />
            </div>
            <div className="skeleton h-2 w-full rounded-full mb-4" />
            <div className="flex justify-between pt-3 border-t border-border/50">
                <div className="skeleton h-3 w-16 rounded" />
                <div className="skeleton h-3 w-12 rounded" />
            </div>
        </div>
    )
}