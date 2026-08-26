'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    X,
    Newspaper,
    PenLine,
    Play,
    Globe,
    Loader2,
    ArrowRight,
    Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SearchItem {
    id: string
    title: string
    slug?: string
    excerpt?: string
    cover_image?: string
    published_at?: string
    category?: { name: string; slug?: string; color?: string }
    competition?: string
    href: string
    external?: boolean
}

interface SearchResponse {
    news: SearchItem[]
    blogs: SearchItem[]
    highlights: SearchItem[]
    liveNews: SearchItem[]
}

const TRENDING = [
    'Cricket World Cup',
    'Premier League',
    'IPL 2026',
    'NBA Playoffs',
    'Champions League',
    'Tennis Grand Slam',
]

const QUICK_LINKS = [
    { label: 'Latest News', href: '/news', icon: Newspaper, desc: 'Breaking sports stories' },
    { label: 'Sports Blogs', href: '/blog', icon: PenLine, desc: 'Expert analysis & opinions' },
    { label: 'Video Highlights', href: '/highlights', icon: Play, desc: 'Goals & video recaps' },
]

function formatDate(date?: string) {
    if (!date) return ''
    try {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
        return ''
    }
}

function ResultRow({
    item,
    type,
    onClose,
}: {
    item: SearchItem
    type: 'news' | 'blog' | 'highlight' | 'live'
    onClose: () => void
}) {
    const config = {
        news: { icon: Newspaper, color: 'bg-red-50 text-red-600', label: 'News' },
        blog: { icon: PenLine, color: 'bg-blue-50 text-blue-600', label: 'Blog' },
        highlight: { icon: Play, color: 'bg-purple-50 text-purple-600', label: 'Highlight' },
        live: { icon: Globe, color: 'bg-green-50 text-green-600', label: 'Trending' },
    }[type]

    const Icon = config.icon
    const inner = (
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group cursor-pointer">
            <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-200">
                {item.cover_image ? (
                    <img src={item.cover_image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className={cn('w-full h-full flex items-center justify-center', config.color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={cn('text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded', config.color)}>
                        {config.label}
                    </span>
                    {item.category?.name && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.category.name}</span>
                    )}
                    {item.competition && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{item.competition}</span>
                    )}
                </div>
                <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors line-clamp-1">
                    {item.title}
                </h4>
                {item.excerpt && (
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.excerpt}</p>
                )}
                {item.published_at && (
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.published_at)}
                    </p>
                )}
            </div>
            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-red-500 transition-colors flex-shrink-0" />
        </div>
    )

    if (item.external) {
        return (
            <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={onClose}>
                {inner}
            </a>
        )
    }

    return (
        <Link href={item.href} onClick={onClose}>
            {inner}
        </Link>
    )
}

function ResultSection({
    title,
    items,
    type,
    onClose,
}: {
    title: string
    items: SearchItem[]
    type: 'news' | 'blog' | 'highlight' | 'live'
    onClose: () => void
}) {
    if (!items.length) return null
    return (
        <div className="mb-4">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 mb-2">{title}</h3>
            <div className="space-y-0.5">
                {items.map((item) => (
                    <ResultRow key={item.id} item={item} type={type} onClose={onClose} />
                ))}
            </div>
        </div>
    )
}

export function SearchModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)
    const searchIdRef = useRef(0)

    const handleSearch = useCallback(async (q: string) => {
        const trimmed = q.trim()

        if (trimmed.length < 2) {
            setResults(null)
            setLoading(false)
            setError(false)
            return
        }

        const requestId = ++searchIdRef.current
        setLoading(true)
        setError(false)

        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`)

            if (requestId !== searchIdRef.current) return

            if (!res.ok) {
                throw new Error(`Search failed: ${res.status}`)
            }

            const data: SearchResponse = await res.json()
            setResults(data)
        } catch (err) {
            if (requestId !== searchIdRef.current) return
            console.error('Search failed', err)
            setError(true)
            setResults({ news: [], blogs: [], highlights: [], liveNews: [] })
        } finally {
            if (requestId === searchIdRef.current) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        const timeoutId = setTimeout(() => handleSearch(query), 350)
        return () => clearTimeout(timeoutId)
    }, [query, handleSearch])

    useEffect(() => {
        if (!isOpen) {
            setQuery('')
            setResults(null)
            setLoading(false)
            setError(false)
            searchIdRef.current++
        }
    }, [isOpen])

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [onClose])

    const totalResults = results
        ? results.news.length + results.blogs.length + results.highlights.length + results.liveNews.length
        : 0

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -16 }}
                        transition={{ duration: 0.2 }}
                        className="relative w-full max-w-2xl bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden"
                    >
                        {/* Search input */}
                        <div className="p-4 flex items-center gap-3 border-b border-slate-100 bg-slate-50">
                            <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center flex-shrink-0">
                                <Search className="w-4 h-4 text-white" />
                            </div>
                            <input
                                autoFocus
                                placeholder="Search news, blogs, highlights..."
                                className="flex-1 bg-transparent border-none outline-none text-base text-slate-900 placeholder:text-slate-400 font-medium"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            {loading && <Loader2 className="w-4 h-4 text-red-500 animate-spin flex-shrink-0" />}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-slate-400 hover:text-slate-700 flex-shrink-0"
                                onClick={onClose}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Body */}
                        <div className="max-h-[62vh] overflow-y-auto p-4">
                            {loading && query.length >= 2 ? (
                                <div className="py-16 text-center">
                                    <Loader2 className="w-7 h-7 text-red-500 animate-spin mx-auto mb-3" />
                                    <p className="text-sm text-slate-500">Searching news, blogs &amp; highlights...</p>
                                </div>
                            ) : query.length < 2 ? (
                                <div className="space-y-6 py-2">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Trending Searches
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {TRENDING.map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => setQuery(tag)}
                                                    className="px-3 py-1.5 rounded-full bg-slate-50 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all text-sm font-semibold text-slate-700"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                                            Browse
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {QUICK_LINKS.map((link) => (
                                                <Link
                                                    key={link.href}
                                                    href={link.href}
                                                    onClick={onClose}
                                                    className="p-3 rounded-xl border border-slate-200 hover:border-red-200 hover:bg-red-50/50 transition-all group"
                                                >
                                                    <link.icon className="w-5 h-5 text-red-600 mb-2" />
                                                    <p className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">
                                                        {link.label}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">{link.desc}</p>
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="py-16 text-center">
                                    <p className="font-bold text-slate-900 mb-1">Search unavailable</p>
                                    <p className="text-sm text-slate-500 mb-4">Please try again in a moment.</p>
                                    <button
                                        onClick={() => handleSearch(query)}
                                        className="text-sm font-bold text-red-600 hover:underline"
                                    >
                                        Retry search
                                    </button>
                                </div>
                            ) : totalResults > 0 ? (
                                <div>
                                    <p className="text-xs text-slate-400 mb-4 px-1">
                                        {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                                    </p>
                                    <ResultSection title="News" items={results!.news} type="news" onClose={onClose} />
                                    <ResultSection title="Trending Headlines" items={results!.liveNews} type="live" onClose={onClose} />
                                    <ResultSection title="Blogs" items={results!.blogs} type="blog" onClose={onClose} />
                                    <ResultSection title="Highlights" items={results!.highlights} type="highlight" onClose={onClose} />
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                        <Search className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <p className="font-bold text-slate-900 mb-1">No results found</p>
                                    <p className="text-sm text-slate-500">
                                        Try &ldquo;football&rdquo;, &ldquo;cricket&rdquo;, or &ldquo;NBA highlights&rdquo;
                                    </p>
                                    <div className="flex justify-center gap-2 mt-5">
                                        <Link href="/news" onClick={onClose} className="text-xs font-bold text-red-600 hover:underline">
                                            Browse News
                                        </Link>
                                        <span className="text-slate-300">·</span>
                                        <Link href="/blog" onClick={onClose} className="text-xs font-bold text-red-600 hover:underline">
                                            Browse Blogs
                                        </Link>
                                        <span className="text-slate-300">·</span>
                                        <Link href="/highlights" onClick={onClose} className="text-xs font-bold text-red-600 hover:underline">
                                            Highlights
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[10px] text-slate-400">
                            <span>Search news · blogs · highlights</span>
                            <span>
                                Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 font-bold">ESC</kbd> to close
                            </span>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
