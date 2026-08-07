import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: '404 — Page Not Found | SportsLNV',
    description: 'The page you are looking for does not exist or has been moved.',
}

export default function NotFound() {
    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
            {/* Glow effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
            </div>

            {/* 404 Number */}
            <h1
                className="text-[120px] md:text-[180px] font-black leading-none tracking-tighter bg-gradient-to-b from-foreground to-muted-foreground/30 bg-clip-text text-transparent select-none"
            >
                404
            </h1>

            {/* Message */}
            <h2 className="text-xl md:text-2xl font-bold mt-2 mb-3">
                Page Not Found
            </h2>
            <p className="text-muted-foreground max-w-md mb-8 text-sm md:text-base">
                Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved. 
                Let&apos;s get you back on track.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-primary/25"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                    Go Home
                </Link>
                <Link
                    href="/news"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/70 transition-all hover:scale-105 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
                    Browse News
                </Link>
            </div>

            {/* Helpful links */}
            <div className="mt-12 pt-8 border-t border-border w-full max-w-lg">
                <p className="text-xs text-muted-foreground mb-4">Popular pages you might be looking for:</p>
                <div className="flex flex-wrap justify-center gap-2">
                    {[
                        { href: '/sport/football', label: '⚽ Football' },
                        { href: '/sport/cricket', label: '🏏 Cricket' },
                        { href: '/predictions', label: '🎯 Predictions' },
                        { href: '/blog', label: '📝 Blog' },
                        { href: '/highlights', label: '🎬 Highlights' },
                    ].map(link => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="px-3 py-1.5 rounded-full text-xs font-medium bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
