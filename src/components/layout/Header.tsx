'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Bell, User, Menu, X, ChevronDown,
    Zap, Trophy, Globe, Activity
} from 'lucide-react'
import { ThemeToggle } from '@/components/providers/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const SPORTS_NAV = [
    { label: 'Football', href: '/sport/football', color: '#22c55e' },
    { label: 'Cricket', href: '/sport/cricket', color: '#f59e0b' },
    { label: 'Basketball', href: '/sport/basketball', color: '#f97316' },
    { label: 'Tennis', href: '/sport/tennis', color: '#84cc16' },
    { label: 'Formula 1', href: '/sport/formula-1', color: '#dc2626' },
    { label: 'UFC/MMA', href: '/sport/mma', color: '#7c3aed' },
    { label: 'Baseball', href: '/sport/baseball', color: '#2563eb' },
    { label: 'Boxing', href: '/sport/boxing', color: '#ef4444' },
    { label: 'Badminton', href: '/sport/badminton', color: '#06b6d4' },
]

const MAIN_NAV = [
    { label: 'Home', href: '/', icon: Globe },
    { label: 'Live', href: '/live', icon: Activity, badge: 'LIVE', badgeColor: 'bg-red-500' },
    { label: 'Scores', href: '/matches', icon: Trophy },
    { label: 'News', href: '/news', icon: Globe },
    { label: 'Blog', href: '/blog', icon: Zap },
]


export function Header() {
    const pathname = usePathname()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [sportsOpen, setSportsOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
            <div className="container-wide">
                <div className="flex h-16 items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 flex-shrink-0">
                        <div className="relative w-8 h-8">
                            <div className="absolute inset-0 bg-brand-500 rounded-lg rotate-6" />
                            <div className="absolute inset-0 bg-brand-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" fill="white" />
                            </div>
                        </div>
                        <span className="font-display font-bold text-xl hidden sm:block">
                            Sports<span className="text-brand-400">Pulse</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden lg:flex items-center gap-1">
                        {MAIN_NAV.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                                    pathname === item.href || pathname.startsWith(item.href + '/')
                                        ? 'text-primary bg-primary/10'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                )}
                            >
                                {item.badge && (
                                    <span className={cn('px-1.5 py-0.5 text-[10px] font-bold text-white rounded', item.badgeColor)}>
                                        {item.badge}
                                    </span>
                                )}
                                {item.label}
                            </Link>
                        ))}

                        {/* Sports dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setSportsOpen(true)}
                            onMouseLeave={() => setSportsOpen(false)}
                        >
                            <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                                Sports
                                <ChevronDown className={cn('w-3 h-3 transition-transform', sportsOpen && 'rotate-180')} />
                            </button>

                            <AnimatePresence>
                                {sportsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 mt-1 w-56 rounded-xl border border-border bg-card shadow-xl p-2"
                                    >
                                        {SPORTS_NAV.map((sport) => (
                                            <Link
                                                key={sport.href}
                                                href={sport.href}
                                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
                                            >
                                                <span
                                                    className="w-2 h-2 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: sport.color }}
                                                />
                                                {sport.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="hidden sm:flex" aria-label="Search">
                            <Search className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                        </Button>
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" className="hidden sm:flex" asChild>
                            <Link href="/profile"><User className="w-4 h-4" /></Link>
                        </Button>
                        <Button asChild className="hidden sm:flex" size="sm">
                            <Link href="/login">Sign In</Link>
                        </Button>

                        {/* Mobile menu toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden"
                            onClick={() => setMobileOpen(!mobileOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden border-t border-border lg:hidden"
                    >
                        <div className="container-wide py-4 space-y-1">
                            {MAIN_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                                        pathname === item.href
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                    {item.badge && (
                                        <span className={cn('ml-auto px-1.5 py-0.5 text-[10px] font-bold text-white rounded', item.badgeColor)}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            ))}

                            <div className="pt-2 border-t border-border">
                                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sports</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {SPORTS_NAV.map((sport) => (
                                        <Link
                                            key={sport.href}
                                            href={sport.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm hover:bg-accent transition-colors"
                                        >
                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sport.color }} />
                                            {sport.label}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2 border-t border-border flex gap-2">
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link href="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                                </Button>
                                <Button className="flex-1" asChild>
                                    <Link href="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}