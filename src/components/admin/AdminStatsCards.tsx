'use client'

import { Newspaper, Users, MessageSquare } from 'lucide-react'

// ─── Stats Cards ──────────────────────────────────────────────────────────────

interface StatsCardsProps {
    stats: {
        totalNews: number
        totalUsers: number
        totalComments: number
    }
}

export function AdminStatsCards({ stats }: StatsCardsProps) {
    const cards = [
        { label: 'Total Users', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Published Articles', value: stats.totalNews.toLocaleString(), icon: Newspaper, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Comments', value: stats.totalComments.toLocaleString(), icon: MessageSquare, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {cards.map((card) => (
                <div key={card.label} className="score-card p-5">
                    <div className={`inline-flex p-2 rounded-lg mb-3 ${card.bg}`}>
                        <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold tabular-nums">{card.value}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{card.label}</p>
                </div>
            ))}
        </div>
    )
}
