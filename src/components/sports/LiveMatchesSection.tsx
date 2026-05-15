'use client'

import { MatchCard } from './MatchCard'
import type { Match } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface LiveMatchesSectionProps {
  matches: Match[]
}

export function LiveMatchesSection({ matches }: LiveMatchesSectionProps) {
  return (
    <section className="container-wide py-10">
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-accent" />
          Live Matches
        </h2>
        <Link href="/live" className="text-primary text-sm font-semibold flex items-center hover:underline">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </section>
  )
}
