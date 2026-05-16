import Link from 'next/link'
import { Zap, Twitter, Youtube, Instagram, Facebook } from 'lucide-react'

const SPORTS_LINKS = [
    { label: 'Football', href: '/sport/football' },
    { label: 'Cricket', href: '/sport/cricket' },
    { label: 'Basketball', href: '/sport/basketball' },
    { label: 'Tennis', href: '/sport/tennis' },
    { label: 'Baseball', href: '/sport/baseball' },
    { label: 'Rugby', href: '/sport/rugby' },
]

const CONTENT_LINKS = [
    { label: 'Live Scores', href: '/live' },
    { label: 'Football Highlights', href: '/highlights' },
    { label: 'Match Predictions', href: '/predictions' },
    { label: 'Betting Arbitrage', href: '/arbitrage' },
    { label: 'Fantasy Tips', href: '/fantasy' },
    { label: 'Sports News', href: '/news' },
    { label: 'Match Schedule', href: '/matches' },
]

const COMPANY_LINKS = [
    { label: 'About Us', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Advertise', href: '/advertise' },
    { label: 'Sitemap', href: '/sitemap.xml' },
]

export function Footer() {
    return (
        <footer className="border-t border-border bg-card/50 mt-16">
            <div className="container-wide py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                                <Zap className="w-5 h-5 text-white" fill="white" />
                            </div>
                            <span className="font-display font-bold text-lg">SportsPulse</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-[200px]">
                            Your go-to destination for live scores, predictions and fantasy sports.
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            {[
                                { Icon: Twitter, href: 'https://twitter.com/sportspulse' },
                                { Icon: Youtube, href: 'https://youtube.com/sportspulse' },
                                { Icon: Instagram, href: 'https://instagram.com/sportspulse' },
                                { Icon: Facebook, href: 'https://facebook.com/sportspulse' },
                            ].map(({ Icon, href }) => (
                                <a
                                    key={href}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                                >
                                    <Icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Sports */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">Sports</h3>
                        <ul className="space-y-2">
                            {SPORTS_LINKS.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Content */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">Content</h3>
                        <ul className="space-y-2">
                            {CONTENT_LINKS.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3">Company</h3>
                        <ul className="space-y-2">
                            {COMPANY_LINKS.map(l => (
                                <li key={l.href}>
                                    <Link href={l.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                                        {l.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">
                        © {new Date().getFullYear()} SportsPulse. All rights reserved.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Live scores, predictions & fantasy sports
                    </p>
                </div>
            </div>
        </footer>
    )
}