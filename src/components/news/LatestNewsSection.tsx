'use client'

import { NewsCard } from './NewsCard'
import type { News } from '@/lib/types'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface LatestNewsSectionProps {
  articles: News[]
}

export function LatestNewsSection({ articles }: LatestNewsSectionProps) {
  const featured = articles[0]
  const others = articles.slice(1)

  return (
    <div>
      <div className="section-header">
        <h2 className="section-title">
          <span className="section-accent" />
          Latest News
        </h2>
        <Link href="/news" className="text-primary text-sm font-semibold flex items-center hover:underline">
          All News <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {featured && (
          <div className="md:col-span-2">
            <NewsCard article={featured} variant="featured" />
          </div>
        )}
        {others.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>
    </div>
  )
}
