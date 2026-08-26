'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, Menu, X, ChevronDown,
    Zap, ShieldCheck, LogOut, Facebook, Twitter, Instagram, Youtube
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import { NotificationsDropdown } from './NotificationsDropdown'
import { SearchModal } from './SearchModal'

const MAIN_NAV = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: 'Blogs', href: '/blog' },
    { label: 'Football', href: '/sport/football' },
    { label: 'Basketball', href: '/sport/basketball' },
    { label: 'Cricket', href: '/sport/cricket' },
    { label: 'Tennis', href: '/sport/tennis' },
]

const MORE_NAV = [
    { label: 'Highlights', href: '/highlights' },
    { label: 'Formula 1', href: '/sport/f1' },
    { label: 'NFL', href: '/sport/nfl' },
    { label: 'NBA', href: '/sport/nba' },
    { label: 'Olympics', href: '/sport/olympics' },
]


export function Header() {
    const pathname = usePathname()
    const { user, loading, isAdmin, logout } = useAuth()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [sportsOpen, setSportsOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)
    const [searchOpen, setSearchOpen] = useState(false)

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setSearchOpen(true)
            }
        }
        document.addEventListener('keydown', onKeyDown)
        return () => document.removeEventListener('keydown', onKeyDown)
    }, [])

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-slate-200">
            {/* Top Breaking Bar */}
            <div className="hidden lg:block bg-slate-900 text-white w-full h-8 text-xs">
                <div className="container-wide h-full flex items-center justify-between">
                    <div className="flex items-center h-full overflow-hidden">
                        <div className="bg-red-600 h-full flex items-center px-3 font-black tracking-widest mr-3 flex-shrink-0 text-[10px]">
                            BREAKING
                        </div>
                        <Link href="/news" className="truncate hover:text-red-400 transition-colors font-medium">
                            Latest sports news, expert analysis &amp; in-depth blogs — SportsLNV
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 h-full pl-4 flex-shrink-0">
                        <div className="flex items-center gap-2.5">
                            {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                                <a key={i} href="#" className="text-white/60 hover:text-white transition-colors">
                                    <Icon className="w-3 h-3" />
                                </a>
                            ))}
                        </div>
                        <div className="w-px h-4 bg-white/20" />
                        <button
                            className="flex items-center gap-1.5 hover:text-red-400 transition-colors text-[11px] font-medium"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="w-3 h-3" />
                            Search
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-wide">
                <div className="flex h-[60px] items-center justify-between gap-4">
                    {/* Logo */}
                    <Link href="/" className="flex flex-col flex-shrink-0">
                        <span className="font-display font-black text-xl leading-none tracking-tight text-slate-900">
                            Sports<span className="text-red-600">LNV</span>
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium tracking-wide hidden sm:block">
                            Sports News &amp; Blogs
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden xl:flex items-center gap-0.5">
                        {MAIN_NAV.map((item) => {
                            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'relative px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors',
                                        isActive
                                            ? 'text-red-600'
                                            : 'text-slate-700 hover:text-red-600'
                                    )}
                                >
                                    {item.label}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-red-600 rounded-full" />
                                    )}
                                </Link>
                            )
                        })}

                        {/* More dropdown */}
                        <div
                            className="relative"
                            onMouseEnter={() => setSportsOpen(true)}
                            onMouseLeave={() => setSportsOpen(false)}
                        >
                            <button className="flex items-center gap-1 px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-700 hover:text-red-600 transition-colors">
                                More
                                <ChevronDown className={cn('w-3 h-3 transition-transform', sportsOpen && 'rotate-180')} />
                            </button>
                            <AnimatePresence>
                                {sportsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full right-0 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-xl p-1.5 z-50"
                                    >
                                        {MORE_NAV.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                                            >
                                                {item.label}
                                            </Link>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        <button
                            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-red-200 hover:bg-red-50 text-slate-500 hover:text-red-600 transition-all text-xs font-medium"
                            onClick={() => setSearchOpen(true)}
                        >
                            <Search className="w-3.5 h-3.5" />
                            Search news, blogs...
                            <kbd className="hidden md:inline text-[9px] font-bold bg-slate-100 border border-slate-200 rounded px-1 py-0.5 ml-1">⌘K</kbd>
                        </button>

                        <NotificationsDropdown />
                        
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
                            className="xl:hidden"
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
                        className="overflow-hidden border-t border-slate-200 xl:hidden"
                    >
                        <div className="container-wide py-4 space-y-1">
                            {MAIN_NAV.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileOpen(false)}
                                    className={cn(
                                        'block px-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide transition-colors',
                                        pathname === item.href
                                            ? 'text-red-600 bg-red-50'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-red-600'
                                    )}
                                >
                                    {item.label}
                                </Link>
                            ))}

                            <div className="pt-2 border-t border-slate-200">
                                <p className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">More</p>
                                <div className="grid grid-cols-2 gap-1">
                                    {MORE_NAV.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setMobileOpen(false)}
                                            className="px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-red-600 transition-colors"
                                        >
                                            {item.label}
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