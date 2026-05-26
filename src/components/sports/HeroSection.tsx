'use client'

import { motion } from 'framer-motion'
import { MatchCard } from './MatchCard'
import type { Match } from '@/lib/types'
import Link from 'next/link'

interface HeroSectionProps {
  liveMatches: Match[]
  featuredMatches: Match[]
}

export function HeroSection({ liveMatches, featuredMatches }: HeroSectionProps) {
  const displayMatches = liveMatches.length > 0 ? liveMatches.slice(0, 3) : featuredMatches.slice(0, 3)

  return (
    <section className="relative w-full py-12 md:py-20 overflow-hidden bg-slate-950">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="container-wide relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase mb-4 border border-primary/20">
              #1 Sports Destination
            </span>
            <h1 className="text-4xl md:text-6xl font-display font-extrabold text-white leading-tight mb-6">
              Every Score. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">
                Every Prediction.
              </span>
            </h1>
            <p className="text-slate-400 text-lg md:text-xl max-w-lg mb-8 leading-relaxed">
              Real-time updates, expert insights, and fantasy tips for every major sport. Never miss a moment with SportsLNV.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/live">
                <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold transition-all shadow-lg shadow-primary/25">
                  Go Live
                </button>
              </Link>
              <Link href="/matches">
                <button className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-bold transition-all border border-white/10 backdrop-blur-sm">
                  View Scores
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
              <div className="grid grid-cols-1 gap-4 relative z-10">
                {displayMatches.map((match, i) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <MatchCard match={match} className="bg-slate-900/50 border-white/5 backdrop-blur-md" />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
