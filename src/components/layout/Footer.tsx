import Link from 'next/link'
import { Twitter, Youtube, Instagram, Facebook, Mail } from 'lucide-react'

const SOCIAL_LINKS = [
    { Icon: Facebook, href: 'https://facebook.com/sportslnv', label: 'Facebook' },
    { Icon: Twitter, href: 'https://twitter.com/sportslnv', label: 'Twitter' },
    { Icon: Instagram, href: 'https://instagram.com/sportslnv', label: 'Instagram' },
    { Icon: Youtube, href: 'https://youtube.com/sportslnv', label: 'YouTube' },
] as const

const QUICK_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'News', href: '/news' },
    { label: 'Blogs', href: '/blog' },
    { label: 'Highlights', href: '/highlights' },
] as const

const TOP_SPORTS = [
    { label: 'Football', href: '/sport/football' },
    { label: 'Basketball', href: '/sport/basketball' },
    { label: 'Cricket', href: '/sport/cricket' },
    { label: 'Tennis', href: '/sport/tennis' },
    { label: 'Formula 1', href: '/sport/f1' },
    { label: 'NFL', href: '/sport/nfl' },
    { label: 'NBA', href: '/sport/nba' },
    { label: 'Olympics', href: '/sport/olympics' },
] as const

const INFO_LINKS = [
    { label: 'Contact Us', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Use', href: '/terms' },
    { label: 'HTML Sitemap', href: '/sitemap' },
] as const

export function Footer() {
    return (
        <footer className="relative bg-slate-950 text-white shrink-0">
            {/* Red accent line */}
            <div className="h-1 bg-red-600" aria-hidden="true" />

            <div className="container-wide py-10 md:py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-4">
                        <Link href="/" className="inline-block group">
                            <span className="font-display font-black text-2xl tracking-tight text-white">
                                Sports<span className="text-red-500">LNV</span>
                            </span>
                            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-1 group-hover:text-slate-400 transition-colors">
                                Sports News &amp; Blogs
                            </p>
                        </Link>
                        <p className="text-sm text-slate-400 leading-relaxed mt-5 max-w-xs">
                            Your trusted source for sports news, expert analysis, player stories, match reports and premium sports blogs.
                        </p>
                        <div className="flex items-center gap-2.5 mt-6">
                            {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                                <a
                                    key={href}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-400 hover:bg-red-600 hover:border-red-600 hover:text-white transition-all duration-200"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="lg:col-span-2">
                        <h3 className="font-bold text-xs tracking-[0.2em] uppercase mb-5 text-white">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            {QUICK_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="text-sm text-slate-400 hover:text-white hover:translate-x-0.5 inline-block transition-all duration-150"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Top Sports */}
                    <div className="lg:col-span-3">
                        <h3 className="font-bold text-xs tracking-[0.2em] uppercase mb-5 text-white">
                            Top Sports
                        </h3>
                        <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                            {TOP_SPORTS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Information + Contact */}
                    <div className="lg:col-span-3">
                        <h3 className="font-bold text-xs tracking-[0.2em] uppercase mb-5 text-white">
                            Information
                        </h3>
                        <ul className="space-y-2.5 mb-6">
                            {INFO_LINKS.map(({ label, href }) => (
                                <li key={href}>
                                    <Link
                                        href={href}
                                        className="text-sm text-slate-400 hover:text-white transition-colors duration-150"
                                    >
                                        {label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link
                            href="/contact"
                            className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-red-500/40 hover:bg-slate-900 transition-all duration-200"
                        >
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider group-hover:text-red-400 transition-colors">
                                    Need Help or Feedback?
                                </p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Reach out via Contact Us →
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Copyright — dark bar, flush with page bottom */}
            <div className="border-t border-slate-800 bg-slate-950 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-0">
                <div className="container-wide py-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} SportsLNV. All Rights Reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                        {INFO_LINKS.map(({ label, href }, i) => (
                            <span key={href} className="flex items-center gap-4">
                                {i > 0 && <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>}
                                <Link href={href} className="hover:text-slate-300 transition-colors">
                                    {label}
                                </Link>
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    )
}
