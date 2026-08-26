import Link from 'next/link'
import { ChevronLeft, ChevronRight, Trophy, Tv, Target, Flame, Activity, Shield, Globe, Circle, Star, Zap } from 'lucide-react'

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
]

export function ExploreSports() {
    return (
        <section className="home-section py-8 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-6">
                <span className="w-2.5 h-2.5 rounded-full border-2 border-red-600" />
                <h2 className="home-section-title">Explore Sports</h2>
            </div>

            <div className="relative">
                <button className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 text-slate-600 hidden md:flex">
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-8 h-8 rounded-full bg-white border border-slate-200 shadow flex items-center justify-center hover:bg-slate-50 text-slate-600 hidden md:flex">
                    <ChevronRight className="w-4 h-4" />
                </button>

                <div className="flex gap-5 overflow-x-auto no-scrollbar py-2 px-1 md:px-8">
                    {SPORTS.map((sport) => (
                        <Link
                            key={sport.name}
                            href={sport.href}
                            className="group flex flex-col items-center gap-2.5 min-w-[4.5rem] flex-shrink-0"
                        >
                            <div className="w-[4.5rem] h-[4.5rem] rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-red-500 group-hover:bg-red-50 transition-all bg-white">
                                <sport.icon className="w-6 h-6 text-slate-700 group-hover:text-red-600 transition-colors" />
                            </div>
                            <span className="text-[11px] font-bold text-center text-slate-700 group-hover:text-red-600 transition-colors leading-tight">
                                {sport.name}
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    )
}
