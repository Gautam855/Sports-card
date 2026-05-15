'use client'

import { NewsCard } from './NewsCard'
import type { News } from '@/lib/types'
import { TrendingUp } from 'lucide-react'

interface TrendingSectionProps {
  articles: News[]
}

export function TrendingSection({ articles }: TrendingSectionProps) {
  return (
    <div className="bg-card/50 rounded-2xl border border-border/50 p-6 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6 text-primary font-bold">
        <TrendingUp className="w-5 h-5" />
        <h2 className="uppercase tracking-widest text-xs">Trending Now</h2>
      </div>

      <div className="space-y-4">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} variant="horizontal" className="bg-transparent border-0 p-0 hover:translate-y-0" />
        ))}
      </div>
    </div>
  )
}
