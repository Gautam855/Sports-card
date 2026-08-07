'use client'

import { motion } from 'framer-motion'
import { Trophy, Tv, Target, Flame, Activity, Shield } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const categories = [
  { name: 'Football', icon: Trophy, href: '/sport/football', slug: 'football' },
  { name: 'Cricket', icon: Target, href: '/sport/cricket', slug: 'cricket' },
  { name: 'Basketball', icon: Tv, href: '/sport/basketball', slug: 'basketball' },
  { name: 'Tennis', icon: Flame, href: '/sport/tennis', slug: 'tennis' },
  { name: 'Rugby', icon: Shield, href: '/sport/rugby', slug: 'rugby' },
]

export function SportsCategoriesBar() {
  const pathname = usePathname()

  return (
    <div className="border-b border-border bg-card/30 backdrop-blur-md sticky top-[64px] z-40">
      <div className="container-wide">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
          {categories.map((cat) => {
            const isActive = pathname === cat.href
            
            return (
              <Link key={cat.name} href={cat.href}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted border border-transparent hover:border-border'
                  }`}
                >
                  <cat.icon className="w-4 h-4" />
                  {cat.name}
                </motion.button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
