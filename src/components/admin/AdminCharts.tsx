'use client'

import { useState, useMemo } from 'react'
import {
    TrendingUp, BarChart3, Users, Eye, ArrowUpRight,
    Calendar, Sparkles, Filter, Check, X
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'

interface ChartPoint {
    name: string
    views: number
    visitors: number
    blogs: number
}

// Hourly breakdown for Today
const TRAFFIC_DATA_TODAY: ChartPoint[] = [
    { name: '00:00', views: 320, visitors: 140, blogs: 90 },
    { name: '03:00', views: 180, visitors: 80, blogs: 50 },
    { name: '06:00', views: 450, visitors: 210, blogs: 130 },
    { name: '09:00', views: 1250, visitors: 580, blogs: 420 },
    { name: '12:00', views: 1840, visitors: 820, blogs: 610 },
    { name: '15:00', views: 2100, visitors: 940, blogs: 720 },
    { name: '18:00', views: 2850, visitors: 1290, blogs: 980 },
    { name: '21:00', views: 2400, visitors: 1080, blogs: 810 },
]

const TRAFFIC_DATA_7D: ChartPoint[] = [
    { name: 'Mon', views: 4200, visitors: 1850, blogs: 1200 },
    { name: 'Tue', views: 5800, visitors: 2420, blogs: 1650 },
    { name: 'Wed', views: 5200, visitors: 2100, blogs: 1400 },
    { name: 'Thu', views: 7400, visitors: 3100, blogs: 2150 },
    { name: 'Fri', views: 6800, visitors: 2850, blogs: 1900 },
    { name: 'Sat', views: 9800, visitors: 4200, blogs: 2900 },
    { name: 'Sun', views: 8900, visitors: 3750, blogs: 2600 },
]

const TRAFFIC_DATA_14D: ChartPoint[] = [
    { name: 'Day 1', views: 3800, visitors: 1600, blogs: 1100 },
    { name: 'Day 2', views: 4200, visitors: 1850, blogs: 1200 },
    { name: 'Day 3', views: 5800, visitors: 2420, blogs: 1650 },
    { name: 'Day 4', views: 5200, visitors: 2100, blogs: 1400 },
    { name: 'Day 5', views: 6100, visitors: 2600, blogs: 1750 },
    { name: 'Day 6', views: 7400, visitors: 3100, blogs: 2150 },
    { name: 'Day 7', views: 6800, visitors: 2850, blogs: 1900 },
    { name: 'Day 8', views: 7900, visitors: 3300, blogs: 2300 },
    { name: 'Day 9', views: 8400, visitors: 3600, blogs: 2500 },
    { name: 'Day 10', views: 9800, visitors: 4200, blogs: 2900 },
    { name: 'Day 11', views: 9100, visitors: 3900, blogs: 2700 },
    { name: 'Day 12', views: 8500, visitors: 3650, blogs: 2550 },
    { name: 'Day 13', views: 10400, visitors: 4600, blogs: 3200 },
    { name: 'Day 14', views: 11200, visitors: 4950, blogs: 3450 },
]

const TRAFFIC_DATA_30D: ChartPoint[] = [
    { name: 'Week 1', views: 28400, visitors: 12200, blogs: 8400 },
    { name: 'Week 2', views: 34600, visitors: 14900, blogs: 10500 },
    { name: 'Week 3', views: 42100, visitors: 18400, blogs: 13100 },
    { name: 'Week 4', views: 51200, visitors: 22100, blogs: 15800 },
]

const CATEGORY_DATA = [
    { name: 'Football', articles: 45, views: 38400 },
    { name: 'Cricket', articles: 40, views: 34200 },
    { name: 'Basketball', articles: 24, views: 18900 },
    { name: 'Tennis', articles: 18, views: 14200 },
    { name: 'Formula 1', articles: 14, views: 11600 },
    { name: 'NFL', articles: 10, views: 8400 },
]

/** Helper to generate realistic data points between custom dates */
function generateCustomRangeData(startStr: string, endStr: string): ChartPoint[] {
    const start = new Date(startStr)
    const end = new Date(endStr)

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
        return TRAFFIC_DATA_7D
    }

    const diffDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) + 1
    const points: ChartPoint[] = []

    // Cap points to max 30 for clean chart visualization
    const step = diffDays > 30 ? Math.ceil(diffDays / 20) : 1

    let current = new Date(start)
    let idx = 1
    while (current <= end) {
        const dateLabel = current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const baseViews = 4000 + Math.floor(Math.sin(idx * 0.8) * 2500) + Math.floor(Math.random() * 2000)
        const visitors = Math.floor(baseViews * 0.42)
        const blogs = Math.floor(baseViews * 0.3)

        points.push({
            name: dateLabel,
            views: Math.max(1200, baseViews),
            visitors: Math.max(500, visitors),
            blogs: Math.max(300, blogs),
        })

        current.setDate(current.getDate() + step)
        idx++
        if (points.length >= 30) break
    }

    return points
}

function CustomTooltip({ active, payload, label }: any) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl text-white text-xs space-y-1.5 min-w-[140px]">
                <p className="font-bold text-slate-300 border-b border-slate-700/60 pb-1 mb-1.5">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={`item-${index}`} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-1.5 text-slate-300">
                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            {entry.name}:
                        </span>
                        <span className="font-bold font-mono text-white">
                            {Number(entry.value).toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>
        )
    }
    return null
}

export function AdminCharts() {
    const [filterType, setFilterType] = useState<'today' | '7d' | '14d' | '30d' | 'custom'>('7d')
    const [showCustomPicker, setShowCustomPicker] = useState(false)
    
    // Default custom date range (last 10 days)
    const todayStr = new Date().toISOString().split('T')[0]
    const tenDaysAgoStr = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const [startDate, setStartDate] = useState(tenDaysAgoStr)
    const [endDate, setEndDate] = useState(todayStr)
    const [appliedCustomDates, setAppliedCustomDates] = useState<{ start: string; end: string }>({
        start: tenDaysAgoStr,
        end: todayStr,
    })

    const chartData = useMemo(() => {
        if (filterType === 'today') return TRAFFIC_DATA_TODAY
        if (filterType === '7d') return TRAFFIC_DATA_7D
        if (filterType === '14d') return TRAFFIC_DATA_14D
        if (filterType === '30d') return TRAFFIC_DATA_30D
        if (filterType === 'custom') {
            return generateCustomRangeData(appliedCustomDates.start, appliedCustomDates.end)
        }
        return TRAFFIC_DATA_7D
    }, [filterType, appliedCustomDates])

    const totalViews = chartData.reduce((acc, curr) => acc + curr.views, 0)
    const totalVisitors = chartData.reduce((acc, curr) => acc + curr.visitors, 0)

    const handleApplyCustomDate = () => {
        setAppliedCustomDates({ start: startDate, end: endDate })
        setFilterType('custom')
        setShowCustomPicker(false)
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Traffic Overview Chart */}
            <div className="lg:col-span-8 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-red-600" />
                                </div>
                                <h3 className="font-display font-bold text-lg text-foreground">Traffic Overview</h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {filterType === 'today' && 'Real-time hourly views and visitor activity today'}
                                {filterType === '7d' && 'Daily page views and unique visitors over the last 7 days'}
                                {filterType === '14d' && 'Daily traffic trend over the last 14 days'}
                                {filterType === '30d' && 'Weekly aggregated traffic overview for the last 30 days'}
                                {filterType === 'custom' && `Custom date range: ${appliedCustomDates.start} to ${appliedCustomDates.end}`}
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border text-xs font-semibold self-start sm:self-auto flex-wrap">
                            <button
                                onClick={() => {
                                    setFilterType('today')
                                    setShowCustomPicker(false)
                                }}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                                    filterType === 'today'
                                        ? 'bg-card text-foreground shadow-sm font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => {
                                    setFilterType('7d')
                                    setShowCustomPicker(false)
                                }}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                                    filterType === '7d'
                                        ? 'bg-card text-foreground shadow-sm font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                7D
                            </button>
                            <button
                                onClick={() => {
                                    setFilterType('14d')
                                    setShowCustomPicker(false)
                                }}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                                    filterType === '14d'
                                        ? 'bg-card text-foreground shadow-sm font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                14D
                            </button>
                            <button
                                onClick={() => {
                                    setFilterType('30d')
                                    setShowCustomPicker(false)
                                }}
                                className={`px-2.5 py-1.5 rounded-lg transition-all ${
                                    filterType === '30d'
                                        ? 'bg-card text-foreground shadow-sm font-bold'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                30D
                            </button>
                            <button
                                onClick={() => setShowCustomPicker(!showCustomPicker)}
                                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                                    filterType === 'custom' || showCustomPicker
                                        ? 'bg-red-600 text-white font-bold shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                Custom
                            </button>
                        </div>
                    </div>

                    {/* Custom Date Picker Bar */}
                    {showCustomPicker && (
                        <div className="mb-6 p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                                    <Filter className="w-3.5 h-3.5 text-red-500" />
                                    <span>Select Custom Date Range:</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                                        <span className="text-slate-400">From:</span>
                                        <input
                                            type="date"
                                            value={startDate}
                                            max={endDate || todayStr}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="bg-transparent text-white focus:outline-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
                                        <span className="text-slate-400">To:</span>
                                        <input
                                            type="date"
                                            value={endDate}
                                            min={startDate}
                                            max={todayStr}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="bg-transparent text-white focus:outline-none cursor-pointer"
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyCustomDate}
                                        className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors flex items-center gap-1 shadow-sm"
                                    >
                                        <Check className="w-3.5 h-3.5" />
                                        Apply
                                    </button>
                                    <button
                                        onClick={() => setShowCustomPicker(false)}
                                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Stat Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <Eye className="w-3.5 h-3.5 text-blue-500" /> Total Views
                            </span>
                            <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                {totalViews.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/60">
                            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-emerald-500" /> Unique Visitors
                            </span>
                            <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                {totalVisitors.toLocaleString()}
                            </p>
                        </div>
                        <div className="p-3 rounded-xl bg-muted/40 border border-border/60 col-span-2 sm:col-span-1">
                            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                <ArrowUpRight className="w-3.5 h-3.5 text-red-500" />
                                {filterType === 'today' ? 'Avg / Hour' : 'Avg / Day'}
                            </span>
                            <p className="text-lg font-bold font-mono text-foreground mt-0.5">
                                {Math.round(totalViews / chartData.length).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Chart */}
                <div className="w-full h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                                </linearGradient>
                                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#94a3b8', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="views"
                                name="Page Views"
                                stroke="#ef4444"
                                strokeWidth={2.5}
                                fill="url(#viewsGrad)"
                            />
                            <Area
                                type="monotone"
                                dataKey="visitors"
                                name="Unique Visitors"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#visitorsGrad)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sport / Category Distribution Chart */}
            <div className="lg:col-span-4 bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4 text-blue-600" />
                        </div>
                        <h3 className="font-display font-bold text-lg text-foreground">Top Sports</h3>
                    </div>
                    <p className="text-xs text-muted-foreground mb-6">
                        Articles &amp; readership distribution
                    </p>
                </div>

                <div className="w-full h-64 sm:h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={CATEGORY_DATA} layout="vertical" margin={{ top: 5, right: 15, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" horizontal={false} />
                            <XAxis
                                type="number"
                                tick={{ fill: '#94a3b8', fontSize: 10 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                dataKey="name"
                                type="category"
                                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                                axisLine={false}
                                tickLine={false}
                                width={75}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="articles"
                                name="Articles"
                                fill="#ef4444"
                                radius={[0, 6, 6, 0]}
                                barSize={14}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}
