import type { Metadata } from 'next'
import Link from 'next/link'
import { 
    Home, Newspaper, BookOpen, Trophy, Play, 
    Shield, FileText, Mail, ShoppingBag, ExternalLink,
    Compass
} from 'lucide-react'

export const metadata: Metadata = {
    title: 'HTML Sitemap — All Pages & Topics',
    description: 'Browse all categories, sports news, blogs, and legal pages on SportsLNV.',
    alternates: { canonical: '/sitemap' },
}

interface SitemapSection {
    title: string
    icon: any
    links: { label: string; href: string; description?: string }[]
}

const SITEMAP_SECTIONS: SitemapSection[] = [
    {
        title: 'Main Navigation',
        icon: Home,
        links: [
            { label: 'Home', href: '/', description: 'Latest sports news, top headlines & featured stories' },
            { label: 'News', href: '/news', description: 'Real-time breaking sports news and updates' },
            { label: 'Blogs & Editorials', href: '/blog', description: 'In-depth analysis and expert opinions' },
            { label: 'Video Highlights', href: '/highlights', description: 'Match recaps and video clips' },
            { label: 'Merchandise Store', href: '/store', description: 'Official sports gear and fan apparel' },
            { label: 'Community', href: '/community', description: 'Fan discussions and sports forum' },
        ],
    },
    {
        title: 'Sports Categories',
        icon: Trophy,
        links: [
            { label: 'Football / Soccer', href: '/sport/football', description: 'Premier League, Champions League, La Liga' },
            { label: 'Cricket', href: '/sport/cricket', description: 'IPL, ICC World Cup, Test Cricket, T20s' },
            { label: 'Basketball (NBA)', href: '/sport/basketball', description: 'NBA scores, standings, playoffs & trades' },
            { label: 'Tennis', href: '/sport/tennis', description: 'Grand Slams, ATP, WTA Tour news' },
            { label: 'Formula 1', href: '/sport/f1', description: 'Grand Prix races, driver standings & F1 news' },
            { label: 'NFL', href: '/sport/nfl', description: 'Super Bowl, touchdowns & draft analysis' },
            { label: 'MLB (Baseball)', href: '/sport/mlb', description: 'World Series, home runs & team stats' },
            { label: 'Olympics', href: '/sport/olympics', description: 'Olympic games, medal tallies & athletes' },
        ],
    },
    {
        title: 'Company & Support',
        icon: Compass,
        links: [
            { label: 'Contact Us', href: '/contact', description: 'Get in touch with our editorial and support team' },
            { label: 'About SportsLNV', href: '/about', description: 'Our mission, team and sports coverage' },
        ],
    },
    {
        title: 'Legal & Policies',
        icon: Shield,
        links: [
            { label: 'Privacy Policy', href: '/privacy', description: 'How we protect and manage your data' },
            { label: 'Terms of Use', href: '/terms', description: 'Rules and guidelines for using SportsLNV' },
        ],
    },
]

export default function HtmlSitemapPage() {
    return (
        <div className="container-wide py-12 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-10 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-2 mb-2">
                    <span className="w-1.5 h-6 bg-red-600 rounded-full" />
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-red-600">
                        Site Directory
                    </span>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
                    HTML Sitemap
                </h1>
                <p className="text-slate-600 text-sm md:text-base max-w-2xl">
                    Find quick access to all sections, categories, sports topics, and legal pages across SportsLNV.
                </p>
            </div>

            {/* Sitemap Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {SITEMAP_SECTIONS.map((section) => {
                    const Icon = section.icon
                    return (
                        <div
                            key={section.title}
                            className="bg-slate-50/70 border border-slate-200 rounded-2xl p-6 hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-200">
                                <div className="w-9 h-9 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-red-600" />
                                </div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    {section.title}
                                </h2>
                            </div>

                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="group flex flex-col p-2.5 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-200 transition-all duration-150"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-slate-800 group-hover:text-red-600 transition-colors">
                                                    {link.label}
                                                </span>
                                                <ExternalLink className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>
                                            {link.description && (
                                                <span className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                                    {link.description}
                                                </span>
                                            )}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
