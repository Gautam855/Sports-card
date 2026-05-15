'use client'

import { FantasyCard } from './FantasyCard'
import { ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export function FantasySection() {
  return (
    <section className="container-wide py-16">
      <div className="section-header">
        <h2 className="section-title">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          Fantasy Team Tips
        </h2>
        <Link href="/fantasy" className="text-primary text-sm font-semibold flex items-center hover:underline">
          More Tips <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="score-card aspect-[4/5] p-6 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent relative overflow-hidden">
             <div className="absolute inset-0 -z-10 bg-slate-800" />
             <span className="text-[10px] font-bold text-primary uppercase mb-2">Cricket</span>
             <h3 className="text-white font-bold text-lg mb-2 line-clamp-2">India vs Australia: 1st Test Dream11 Prediction</h3>
             <p className="text-white/60 text-xs mb-4">Captain picks: Virat Kohli, Steve Smith</p>
             <button className="text-white bg-primary py-2 rounded-lg text-sm font-bold">View Team</button>
          </div>
        ))}
      </div>
    </section>
  )
}
