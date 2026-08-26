import type { Metadata } from 'next'
import Link from 'next/link'
import {
    Trophy, Tv, Target, Flame, Activity, Shield, Globe, Circle, Star, Zap,
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'Explore Sports',
    description: 'Browse sports news and stories by category — football, cricket, basketball, tennis and more.',
}

const SPORTS = [
    { name: 'Football', icon: Trophy, href: '/sport/football' },
    { name: 'Basketball', icon: Tv, href: '/sport/basketball' },
    { name: 'Cricket', icon: Target, href: '/sport/cricket' },
    { name: 'Tennis', icon: Flame, href: '/sport/tennis' },
    { name: 'Formula 1', icon: Activity, href: '/sport/f1' },
    { name: 'NFL', icon: Shield, href: '/sport/nfl' },
    { name: 'MLB', icon: Circle, href: '/sport/mlb' },
    { name: 'Olympics', icon: Globe, href: '/sport/olympics' },
    { name: 'FIFA World Cup', icon: Star, href: '/sport/fifa' },
    { name: 'NBA', icon: Zap, href: '/sport/nba' },
    { name: 'Baseball', icon: Circle, href: '/sport/baseball' },
    { name: 'Rugby', icon: Shield, href: '/sport/rugby' },
]

export default function SportsHubPage() {
    return (
        <div className="container-wide py-10 md:py-14">
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
                    Explore Sports
                </h1>
                <p className="text-slate-500 text-sm md:text-base max-w-xl">
                    Pick a sport to read the latest news, analysis and stories from SportsLNV.
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {SPORTS.map((sport) => (
                    <Link
                        key={sport.href}
                        href={sport.href}
                        className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-slate-200 bg-white hover:border-red-500 hover:shadow-md transition-all"
                    >
                        <div className="w-14 h-14 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-50 transition-all">
                            <sport.icon className="w-6 h-6 text-slate-700 group-hover:text-red-600 transition-colors" />
                        </div>
                        <span className="text-xs font-bold text-center text-slate-700 group-hover:text-red-600 transition-colors leading-tight">
                            {sport.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
