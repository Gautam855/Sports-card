import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { AdminStatsCards } from '@/components/admin/AdminStatsCards'
import { AdminRecentActivity } from '@/components/admin/AdminRecentActivity'
import { AdminCharts } from '@/components/admin/AdminCharts'
import { APIStatusPanel } from '@/components/admin/APIStatusPanel'

export const metadata: Metadata = { title: 'Dashboard' }

export default async function AdminDashboard() {
    const supabase = await createClient()

    const [
        { count: totalNews },
        { count: totalMatches },
        { count: totalUsers },
        { count: totalComments },
        { count: liveMatches },
        { data: recentNews },
        { data: topNews },
    ] = await Promise.all([
        supabase.from('news').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('matches').select('*', { count: 'exact', head: true }).in('status', ['live', 'half_time']),
        supabase.from('news').select('id,title,slug,views,published_at,status').order('created_at', { ascending: false }).limit(5),
        supabase.from('news').select('id,title,slug,views').eq('status', 'published').order('views', { ascending: false }).limit(5),
    ])

    const stats = {
        totalNews: totalNews ?? 0,
        totalMatches: totalMatches ?? 0,
        totalUsers: totalUsers ?? 0,
        totalComments: totalComments ?? 0,
        liveMatches: liveMatches ?? 0,
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
            </div>

            <AdminStatsCards stats={stats} />
            <APIStatusPanel />
            <AdminCharts />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AdminRecentActivity title="Recently Added" items={recentNews ?? []} type="news" />
                <AdminRecentActivity title="Most Viewed" items={topNews ?? []} type="news" showViews />
            </div>
        </div>
    )
}