'use client'

import { Newspaper, Users, MessageSquare, TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

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

// ─── Charts ───────────────────────────────────────────────────────────────────

const trafficData = [
    { name: 'Mon', views: 4200, users: 1800 },
    { name: 'Tue', views: 5800, users: 2400 },
    { name: 'Wed', views: 5200, users: 2100 },
    { name: 'Thu', views: 7100, users: 3000 },
    { name: 'Fri', views: 6800, users: 2800 },
    { name: 'Sat', views: 9200, users: 4100 },
    { name: 'Sun', views: 8400, users: 3600 },
]

const contentData = [
    { name: 'Football', count: 42 },
    { name: 'Cricket', count: 38 },
    { name: 'Basketball', count: 18 },
    { name: 'Tennis', count: 12 },
    { name: 'F1', count: 8 },
    { name: 'UFC', count: 6 },
]

export function AdminCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Traffic Chart */}
            <div className="score-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-lg">Weekly Traffic</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={trafficData}>
                        <defs>
                            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="usersGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip
                            contentStyle={{ background: 'hsl(222.2 64% 8%)', border: '1px solid hsl(217.2 32.6% 17.5%)', borderRadius: '8px', color: '#f1f5f9' }}
                        />
                        <Area type="monotone" dataKey="views" stroke="#3b82f6" fill="url(#viewsGradient)" strokeWidth={2} name="Page Views" />
                        <Area type="monotone" dataKey="users" stroke="#22c55e" fill="url(#usersGradient)" strokeWidth={2} name="Unique Users" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Content by Sport */}
            <div className="score-card p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Newspaper className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-lg">Content by Sport</h3>
                </div>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={contentData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
                        <Tooltip
                            contentStyle={{ background: 'hsl(222.2 64% 8%)', border: '1px solid hsl(217.2 32.6% 17.5%)', borderRadius: '8px', color: '#f1f5f9' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Articles" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    )
}
