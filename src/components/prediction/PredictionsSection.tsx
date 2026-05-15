'use client'

import { PredictionCard } from './PredictionCard'
import { ChevronRight, BrainCircuit } from 'lucide-react'
import Link from 'next/link'

export function PredictionsSection() {
  return (
    <section className="bg-slate-900/50 py-16 border-y border-white/5">
      <div className="container-wide">
        <div className="section-header">
          <h2 className="section-title text-white">
            <BrainCircuit className="w-6 h-6 text-primary" />
            AI Expert Predictions
          </h2>
          <Link href="/predictions" className="text-primary text-sm font-semibold flex items-center hover:underline">
            View All Predictions <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PREDICTIONS.map((prediction) => (
            <PredictionCard key={prediction.id} prediction={prediction as any} />
          ))}
        </div>
      </div>
    </section>
  )
}

const MOCK_PREDICTIONS = [
  {
    id: 'pred-1',
    slug: 'man-city-vs-arsenal',
    home_win_prob: 48,
    away_win_prob: 32,
    draw_prob: 20,
    predicted_score: '2-1',
    views: 12500,
    match: {
      home_team: { name: 'Man City', logo_url: 'https://media.api-sports.io/football/teams/50.png' },
      away_team: { name: 'Arsenal', logo_url: 'https://media.api-sports.io/football/teams/42.png' },
      league: { name: 'Premier League' },
      scheduled_at: new Date().toISOString(),
    }
  },
  {
    id: 'pred-2',
    slug: 'real-madrid-vs-barcelona',
    home_win_prob: 42,
    away_win_prob: 38,
    draw_prob: 20,
    predicted_score: '3-2',
    views: 28400,
    match: {
      home_team: { name: 'Real Madrid', logo_url: 'https://media.api-sports.io/football/teams/541.png' },
      away_team: { name: 'Barcelona', logo_url: 'https://media.api-sports.io/football/teams/529.png' },
      league: { name: 'La Liga' },
      scheduled_at: new Date().toISOString(),
    }
  },
  {
    id: 'pred-3',
    slug: 'lakers-vs-warriors',
    home_win_prob: 55,
    away_win_prob: 45,
    draw_prob: 0,
    predicted_score: '112-108',
    views: 15600,
    match: {
      home_team: { name: 'LA Lakers', logo_url: 'https://media.api-sports.io/basketball/teams/145.png' },
      away_team: { name: 'GS Warriors', logo_url: 'https://media.api-sports.io/basketball/teams/141.png' },
      sport: { name: 'NBA' },
      scheduled_at: new Date().toISOString(),
    }
  }
]

