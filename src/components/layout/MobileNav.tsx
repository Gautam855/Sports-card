'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Activity, Newspaper, Zap, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Live', href: '/live', icon: Activity, live: true },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Predict', href: '/predictions', icon: Zap },
    { label: 'Fantasy', href: '/fantasy', icon: Trophy },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-background/95 backdrop-blur-xl safe-area-pb">
            <div className="flex items-center justify-around h-16">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors min-w-[3rem]',
                                isActive ? 'text-primary' : 'text-muted-foreground'
                            )}
                        >
                            <div className="relative">
                                <item.icon className={cn('w-5 h-5', item.live && 'text-red-500')} />
                                {item.live && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                            {isActive && (
                                <span className="absolute bottom-0 w-1 h-1 bg-primary rounded-full" />
                            )}
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}