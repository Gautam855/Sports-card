'use client'

import { motion } from 'framer-motion'
import { Trophy, Tv, Target, Flame, Activity } from 'lucide-react'

const categories = [
  { name: 'All Sports', icon: Activity, active: true },
  { name: 'Football', icon: Trophy, active: false },
  { name: 'Cricket', icon: Target, active: false },
  { name: 'Basketball', icon: Tv, active: false },
  { name: 'Tennis', icon: Flame, active: false },
  { name: 'MMA', icon: Activity, active: false },
  { name: 'F1', icon: Activity, active: false },
]

export function SportsCategoriesBar() {
  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-md sticky top-[64px] z-40">
      <div className="container-wide">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                cat.active 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}
