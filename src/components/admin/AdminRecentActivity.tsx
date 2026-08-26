'use client'

import Link from 'next/link'
import { Eye } from 'lucide-react'

interface ActivityItem {
  id: string
  title: string
  slug: string
  views?: number
  published_at?: string
  status?: string
}

interface AdminRecentActivityProps {
  title: string
  items: ActivityItem[]
  showViews?: boolean
}

export function AdminRecentActivity({ title, items, showViews }: AdminRecentActivityProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="font-semibold text-lg mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-sm">No items yet.</p>
        ) : (
          items.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="flex items-center justify-between gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.title}</p>
                {item.published_at && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(item.published_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {item.status && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    item.status === 'published' ? 'bg-green-500/10 text-green-500' : 'bg-yellow-500/10 text-yellow-500'
                  }`}>
                    {item.status}
                  </span>
                )}
                {showViews && item.views !== undefined && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Eye className="w-3 h-3" />
                    {item.views.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
