'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Bell, User, Menu, X, ChevronDown,
    Zap, Trophy, Globe, Activity, Play, ShoppingBag, ShieldCheck, LogOut
} from 'lucide-react'
import { ThemeToggle } from '@/components/providers/ThemeToggle'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { NotificationsDropdown } from './NotificationsDropdown'
import { SearchModal } from './SearchModal'

const SPORTS_NAV = [
    { label: 'Football', href: '/sport/football', color: '#22c55e' },
    { label: 'Cricket', href: '/sport/cricket', color: '#f59e0b' },
    { label: 'Basketball', href: '/sport/basketball', color: '#f97316' },
    { label: 'Tennis', href: '/sport/tennis', color: '#84cc16' },
    { label: 'Baseball', href: '/sport/baseball', color: '#2563eb' },
    { label: 'Rugby', href: '/sport/rugby', color: '#ea580c' },
]

const MAIN_NAV = [
    { label: 'Home', href: '/', icon: Globe },
    { label: 'Highlights', href: '/highlights', icon: Play },
    // { label: 'Store', href: '/store', icon: ShoppingBag },
    // { label: 'Arbitrage', href: '/arbitrage', icon: Zap },
    { label: 'News', href: '/news', icon: Globe },
    // { label: 'Blog', href: '/blog', icon: Zap },
]


export function Header() {
    const pathname = usePathname()
    const { user, loading, isAdmin, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [sportsOpen, setSportsOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

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
                            Sports<span className="text-brand-400">LNV</span>
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
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="hidden sm:flex" 
                            aria-label="Search"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="w-4 h-4" />
                        </Button>
                        
                        <NotificationsDropdown />
                        
                        <ThemeToggle />
                        
                        {!loading && (
                            <>
                                {user ? (
                                    <div 
                                        className="relative"
                                        onMouseEnter={() => setProfileOpen(true)}
                                        onMouseLeave={() => setProfileOpen(false)}
                                    >
                                        <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-accent transition-colors border border-transparent hover:border-border">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-xs">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.username} className="w-full h-full object-cover rounded-full" />
                                                ) : (
                                                    (user.display_name || user.username)[0].toUpperCase()
                                                )}
                                            </div>
                                            <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform", profileOpen && "rotate-180")} />
                                        </button>

                                        <AnimatePresence>
                                            {profileOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute top-full right-0 mt-2 w-64 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden z-50"
                                                >
                                                    <div className="p-4 bg-muted/30 border-b border-border">
                                                        <p className="font-bold text-foreground truncate">{user.display_name || user.username}</p>
                                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                                    </div>
                                                    
                                                    <div className="p-2">
                                                        {isAdmin && (
                                                            <Link
                                                                href="/admin/dashboard"
                                                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-brand-500 hover:bg-brand-500/10 transition-colors"
                                                            >
                                                                <ShieldCheck className="w-4 h-4" />
                                                                Admin Dashboard
                                                            </Link>
                                                        )}
                                                        <div className="my-1 border-t border-border/50" />
                                                        <button
                                                            onClick={logout}
                                                            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left"
                                                        >
                                                            <LogOut className="w-4 h-4" />
                                                            Sign Out
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <>
                                        <Button asChild className="hidden sm:flex" size="sm" variant="ghost">
                                            <Link href="/login">Sign In</Link>
                                        </Button>
                                        <Button asChild className="hidden sm:flex" size="sm">
                                            <Link href="/register">Sign Up</Link>
                                        </Button>
                                    </>
                                )}
                            </>
                        )}

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

                            {!loading && (
                                <div className="pt-2 border-t border-border">
                                    {user ? (
                                        <div className="flex flex-col gap-1">
                                            <div className="px-4 py-3 bg-muted/20 rounded-xl border border-border/50 mb-2">
                                                <p className="font-bold text-foreground truncate">{user.display_name || user.username}</p>
                                                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                            </div>
                                            {isAdmin && (
                                                <Link
                                                    href="/admin/dashboard"
                                                    onClick={() => setMobileOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-brand-500 hover:bg-accent transition-colors"
                                                >
                                                    <ShieldCheck className="w-4 h-4" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => {
                                                    logout()
                                                    setMobileOpen(false)
                                                }}
                                                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors text-left w-full"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button variant="outline" className="flex-1" asChild>
                                                <Link href="/login" onClick={() => setMobileOpen(false)}>Sign In</Link>
                                            </Button>
                                            <Button className="flex-1" asChild>
                                                <Link href="/register" onClick={() => setMobileOpen(false)}>Sign Up</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </header>
    )
}