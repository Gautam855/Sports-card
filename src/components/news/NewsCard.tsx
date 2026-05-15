'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { News } from '@/lib/types'
import { formatDistanceToNow } from 'date-fns'

interface NewsCardProps {
  article: News
  variant?: 'default' | 'featured' | 'compact' | 'horizontal'
  className?: string
}

export function NewsCard({ article, variant = 'default', className }: NewsCardProps) {
  const isRealTime = article.id.startsWith('serp-')
  const href = isRealTime ? (article as any).url : `/news/${article.slug}`
  const target = isRealTime ? "_blank" : undefined

  if (variant === 'horizontal') {
    return (
      <Link href={href} target={target} className={cn('news-card flex gap-3 p-3', className)}>

        {article.cover_image && (
          <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden">
            {article.id.startsWith('serp-') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={article.cover_image} alt={article.cover_alt ?? article.title} className="w-full h-full object-cover" />
            ) : (
              <Image src={article.cover_image} alt={article.cover_alt ?? article.title} fill className="object-cover" />
            )}
          </div>
        )}

        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: article.category.color ?? 'var(--primary)' }}>
              {article.category.name}
            </span>
          )}
          <h3 className="text-sm font-semibold line-clamp-2 mt-0.5 group-hover:text-primary transition-colors">
            {article.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {article.published_at ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true }) : ''}
          </p>
        </div>
      </Link>
    )
  }

  if (variant === 'featured') {
    return (
      <Link href={href} target={target} className={cn('news-card block overflow-hidden', className)}>
        <div className="relative h-56 md:h-72">
          {article.cover_image && (
            article.id.startsWith('serp-') ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={article.cover_image} alt={article.cover_alt ?? article.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <Image src={article.cover_image} alt={article.cover_alt ?? article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            )
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            {article.is_breaking && (
              <span className="inline-flex items-center gap-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded mb-2">
                BREAKING
              </span>
            )}
            {article.category && (
              <span className="block text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: article.category.color ?? '#60a5fa' }}>
                {article.category.name}
              </span>
            )}
            <h2 className="text-white font-display font-bold text-lg md:text-xl line-clamp-2">{article.title}</h2>
            <div className="flex items-center gap-3 mt-2 text-white/70 text-xs">
              {article.author && <span>{article.author.display_name ?? article.author.username}</span>}
              <span>{article.read_time_mins ? `${article.read_time_mins} min read` : ''}</span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} target={target} className={cn('news-card block', className)}>
            {article.cover_image && (
                <div className="relative h-44 overflow-hidden">
                    {article.id.startsWith('serp-') ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img 
                            src={article.cover_image} 
                            alt={article.cover_alt ?? article.title} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                    ) : (
                        <Image
                            src={article.cover_image}
                            alt={article.cover_alt ?? article.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    )}

          {article.is_breaking && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
              BREAKING
            </span>
          )}
          {article.category && (
            <span
              className="absolute top-2 right-2 text-white text-xs font-semibold px-2 py-0.5 rounded"
              style={{ backgroundColor: (article.category.color ?? '#2563eb') + 'cc' }}
            >
              {article.category.name}
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2">{article.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          {article.author && (
            <span className="font-medium text-foreground/70">
              {article.author.display_name ?? article.author.username}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.read_time_mins ? `${article.read_time_mins}m read` : article.published_at ? formatDistanceToNow(new Date(article.published_at), { addSuffix: true }) : ''}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Eye className="w-3 h-3" />
            {(article.views ?? 0).toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  )
}

export function NewsCardSkeleton() {
  return (
    <div className="score-card overflow-hidden">
      <div className="skeleton h-44 rounded-none" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="flex gap-3 mt-3">
          <div className="skeleton h-3 w-20 rounded" />
          <div className="skeleton h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}
